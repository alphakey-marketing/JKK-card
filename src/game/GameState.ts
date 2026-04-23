import { DeckCard, buildDeck, YUJI_DECK_IDS, MEGUMI_DECK_IDS, NOBARA_DECK_IDS, GOJO_DECK_IDS } from '../data/decks';
import { CardType, EffectType, HERO_POWERS } from '../data/cards';

export interface BoardUnit {
  card: DeckCard;
  instanceId: string;
  currentHp: number;
  attack: number;
  canAttack: boolean;
  isExhausted: boolean;
}

export interface PlayerState {
  id: 'player' | 'ai';
  heroId: string;
  nameJa: string;
  nameFurigana: string;
  hp: number;
  maxHp: number;
  cursedEnergy: number;
  maxCursedEnergy: number;
  shield: number;
  attackBuff: number;
  deck: DeckCard[];
  hand: DeckCard[];
  discardPile: DeckCard[];
  board: BoardUnit[];
  heroPowerUsed: boolean;
  maxBoardSize: number;
}

export type GamePhase = 'DRAW' | 'MAIN' | 'END' | 'GAME_OVER';

export interface GameState {
  turn: number;
  phase: GamePhase;
  activePlayer: 'player' | 'ai';
  players: { player: PlayerState; ai: PlayerState };
  log: string[];
  winner: 'player' | 'ai' | null;
  pendingEffects: string[];
}

const STARTING_HP = 30;
const HAND_SIZE = 4;

const CHARACTER_INFO: Record<string, {
  nameJa: string;
  nameFurigana: string;
  deckIds: string[];
  heroId: string;
}> = {
  yuji: { nameJa: '虎杖悠仁', nameFurigana: 'いたどりゆうじ', deckIds: YUJI_DECK_IDS, heroId: 'yuji' },
  megumi: { nameJa: '伏黒恵', nameFurigana: 'ふしぐろめぐみ', deckIds: MEGUMI_DECK_IDS, heroId: 'megumi' },
  nobara: { nameJa: '釘崎野薔薇', nameFurigana: 'くぎさきのばら', deckIds: NOBARA_DECK_IDS, heroId: 'nobara' },
  gojo: { nameJa: '五条悟', nameFurigana: 'ごじょうさとる', deckIds: GOJO_DECK_IDS, heroId: 'gojo' },
};

const AI_OPPONENT: Record<string, string> = {
  yuji: 'megumi',
  megumi: 'yuji',
  nobara: 'gojo',
  gojo: 'nobara',
};

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function createPlayer(id: 'player' | 'ai', charKey: string): PlayerState {
  const info = CHARACTER_INFO[charKey];
  if (!info) throw new Error(`Unknown character: ${charKey}`);
  const deck = shuffle(buildDeck(info.deckIds));
  return {
    id,
    heroId: info.heroId,
    nameJa: info.nameJa,
    nameFurigana: info.nameFurigana,
    hp: STARTING_HP,
    maxHp: STARTING_HP,
    cursedEnergy: 1,
    maxCursedEnergy: 1,
    shield: 0,
    attackBuff: 0,
    deck,
    hand: [],
    discardPile: [],
    board: [],
    heroPowerUsed: false,
    maxBoardSize: 4,
  };
}

export function initGame(
  playerChoice: 'yuji' | 'megumi' | 'nobara' | 'gojo' = 'yuji'
): GameState {
  const aiChoice = (AI_OPPONENT[playerChoice] ?? 'megumi') as 'yuji' | 'megumi' | 'nobara' | 'gojo';

  const player = createPlayer('player', playerChoice);
  const ai = createPlayer('ai', aiChoice);

  for (let i = 0; i < HAND_SIZE; i++) {
    drawCard(player);
    drawCard(ai);
  }

  const playerName = CHARACTER_INFO[playerChoice]?.nameJa ?? playerChoice;
  return {
    turn: 1,
    phase: 'MAIN',
    activePlayer: 'player',
    players: { player, ai },
    log: ['ゲーム開始！', `${playerName}のターン`],
    winner: null,
    pendingEffects: [],
  };
}

export function drawCard(ps: PlayerState, count = 1): number {
  let drawn = 0;
  for (let i = 0; i < count; i++) {
    if (ps.hand.length >= 8) break;
    if (ps.deck.length === 0) {
      if (ps.discardPile.length === 0) break;
      ps.deck = shuffle([...ps.discardPile]);
      ps.discardPile = [];
    }
    const card = ps.deck.pop()!;
    ps.hand.push(card);
    drawn++;
  }
  return drawn;
}

export function startTurn(state: GameState): void {
  const ap = state.players[state.activePlayer];
  state.phase = 'DRAW';

  // Hearthstone-style energy: turn 1 = 1 max, turn 2 = 2 max, ..., capped at 10
  ap.maxCursedEnergy = Math.min(state.turn, 10);
  ap.cursedEnergy = ap.maxCursedEnergy;

  // Refresh board units
  ap.board.forEach(unit => {
    unit.canAttack = true;
    unit.isExhausted = false;
  });
  ap.heroPowerUsed = false;

  const drawn = drawCard(ap);
  state.log.push(`【ドロー】${ap.nameJa}はカードを${drawn}枚引いた（呪力: ${ap.cursedEnergy}/${ap.maxCursedEnergy}）`);

  state.phase = 'MAIN';
}

export function playCard(
  state: GameState,
  actorId: 'player' | 'ai',
  cardInstanceId: string
): { success: boolean; message: string } {
  const actor = state.players[actorId];
  const target = state.players[actorId === 'player' ? 'ai' : 'player'];

  const cardIndex = actor.hand.findIndex(c => c.instanceId === cardInstanceId);
  if (cardIndex === -1) return { success: false, message: 'カードが見つかりません' };

  const card = actor.hand[cardIndex];

  if (actor.cursedEnergy < card.cost) {
    return { success: false, message: `呪力が足りません（必要: ${card.cost}、現在: ${actor.cursedEnergy}）` };
  }

  actor.cursedEnergy -= card.cost;
  actor.hand.splice(cardIndex, 1);

  // Sorcerer: place on board
  if (card.type === CardType.SORCERER) {
    if (actor.board.length < actor.maxBoardSize) {
      const unit: BoardUnit = {
        card,
        instanceId: card.instanceId + '_unit',
        currentHp: card.hp > 0 ? card.hp : 10,
        attack: card.power > 0 ? card.power : 1,
        canAttack: false,
        isExhausted: false,
      };
      actor.board.push(unit);
      const msg = `${card.nameJa}をフィールドに召喚！（攻:${unit.attack} HP:${unit.currentHp}）`;
      state.log.push(`【${actor.nameJa}】${msg}`);
      checkWinCondition(state);
      return { success: true, message: msg };
    } else {
      // Board full: apply card effect as technique
      const result = applyEffect(state, actor, target, card);
      state.log.push(`【${actor.nameJa}】フィールド満員！${card.nameJa}の効果発動 ${result}`);
      actor.discardPile.push(card);
      checkWinCondition(state);
      return { success: true, message: result };
    }
  }

  let result = applyEffect(state, actor, target, card);

  // Domain expansion bonus draw
  if (card.type === CardType.DOMAIN) {
    const drawn = drawCard(actor, 2);
    if (drawn > 0) result += `、${drawn}枚ドロー`;
  }

  state.log.push(`【${actor.nameJa}】${card.nameJa}を使用！ ${result}`);
  actor.discardPile.push(card);

  checkWinCondition(state);
  return { success: true, message: result };
}

function applyEffect(
  state: GameState,
  actor: PlayerState,
  target: PlayerState,
  card: DeckCard
): string {
  const effect = card.effect;
  const effectValue = effect.value + actor.attackBuff;
  let result = '';

  switch (effect.type) {
    case EffectType.DAMAGE: {
      const dmg = Math.max(0, effectValue - target.shield);
      const shieldUsed = Math.min(target.shield, effectValue);
      target.shield = Math.max(0, target.shield - effectValue);
      target.hp = Math.max(0, target.hp - dmg);
      actor.attackBuff = 0;
      result = shieldUsed > 0
        ? `${target.nameJa}に${dmg}ダメージ（シールド${shieldUsed}吸収）`
        : `${target.nameJa}に${dmg}ダメージ！`;
      break;
    }

    case EffectType.DOUBLE_DAMAGE: {
      const base = effect.value + actor.attackBuff;
      const dmg2 = Math.max(0, base - target.shield);
      target.shield = Math.max(0, target.shield - base);
      target.hp = Math.max(0, target.hp - dmg2);
      actor.attackBuff = 0;
      result = `黒閃！${target.nameJa}に${dmg2}ダメージ！！`;
      break;
    }

    case EffectType.AOE_DAMAGE: {
      const units = [...target.board];
      let removed = 0;
      for (const unit of units) {
        unit.currentHp -= effect.value;
        if (unit.currentHp <= 0) {
          const idx = target.board.findIndex(u => u.instanceId === unit.instanceId);
          if (idx !== -1) {
            target.board.splice(idx, 1);
            target.discardPile.push(unit.card);
            removed++;
          }
        }
      }
      actor.attackBuff = 0;
      result = `全体に${effect.value}ダメージ（${units.length}体攻撃、${removed}体撃破）`;
      break;
    }

    case EffectType.HEAL: {
      const healed = Math.min(effect.value, actor.maxHp - actor.hp);
      actor.hp += healed;
      result = `${actor.nameJa}のHPが${healed}回復（${actor.hp}/${actor.maxHp}）`;
      break;
    }

    case EffectType.DRAW: {
      const drawn = drawCard(actor, effect.value);
      result = `カードを${drawn}枚ドロー`;
      break;
    }

    case EffectType.ENERGY_GAIN: {
      const gain = Math.min(effect.value, actor.maxCursedEnergy - actor.cursedEnergy);
      actor.cursedEnergy += gain;
      result = `呪力が${gain}増加（${actor.cursedEnergy}/${actor.maxCursedEnergy}）`;
      break;
    }

    case EffectType.SHIELD: {
      actor.shield += effect.value;
      result = `シールド${effect.value}を獲得（合計: ${actor.shield}）`;
      break;
    }

    case EffectType.BUFF_ATTACK: {
      actor.attackBuff += effect.value;
      result = `次の攻撃に+${effect.value}ダメージ`;
      break;
    }

    case EffectType.DEBUFF: {
      target.attackBuff = Math.max(0, target.attackBuff - effect.value);
      result = `${target.nameJa}の攻撃力を${effect.value}下げた`;
      break;
    }

    default:
      result = '効果を適用した';
  }

  // Self-damage for BINDING_VOW cards
  if (card.selfDamage && card.selfDamage > 0) {
    actor.hp = Math.max(0, actor.hp - card.selfDamage);
    result += `（自分${card.selfDamage}ダメージ）`;
  }

  return result;
}

function applyHeroPower(
  state: GameState,
  actor: PlayerState,
  target: PlayerState,
  effect: { type: EffectType; value: number }
): string {
  switch (effect.type) {
    case EffectType.DAMAGE: {
      const dmg = Math.max(0, effect.value - target.shield);
      target.shield = Math.max(0, target.shield - effect.value);
      target.hp = Math.max(0, target.hp - dmg);
      return `${target.nameJa}に${dmg}ダメージ`;
    }
    case EffectType.DRAW: {
      const drawn = drawCard(actor, effect.value);
      return `カード${drawn}枚ドロー`;
    }
    case EffectType.AOE_DAMAGE: {
      const units = [...target.board];
      let removed = 0;
      for (const unit of units) {
        unit.currentHp -= effect.value;
        if (unit.currentHp <= 0) {
          const idx = target.board.findIndex(u => u.instanceId === unit.instanceId);
          if (idx !== -1) {
            target.board.splice(idx, 1);
            target.discardPile.push(unit.card);
            removed++;
          }
        }
      }
      return `全体に${effect.value}ダメージ（${removed}体撃破）`;
    }
    case EffectType.SHIELD: {
      actor.shield += effect.value;
      return `シールド${effect.value}獲得`;
    }
    default:
      return '効果発動';
  }
}

export function attackWithUnit(
  state: GameState,
  actorId: 'player' | 'ai',
  attackerInstanceId: string,
  targetInstanceId: string | 'hero'
): { success: boolean; message: string } {
  const actor = state.players[actorId];
  const target = state.players[actorId === 'player' ? 'ai' : 'player'];

  const attacker = actor.board.find(u => u.instanceId === attackerInstanceId);
  if (!attacker) return { success: false, message: '攻撃ユニットが見つかりません' };
  if (!attacker.canAttack) return { success: false, message: 'このユニットは攻撃できません' };

  attacker.canAttack = false;
  attacker.isExhausted = true;

  if (targetInstanceId === 'hero') {
    const dmg = Math.max(0, attacker.attack - target.shield);
    target.shield = Math.max(0, target.shield - attacker.attack);
    target.hp = Math.max(0, target.hp - dmg);
    const msg = `${attacker.card.nameJa}が${target.nameJa}に${dmg}ダメージ！`;
    state.log.push(`【${actor.nameJa}】${msg}`);
    checkWinCondition(state);
    return { success: true, message: msg };
  } else {
    const enemyUnit = target.board.find(u => u.instanceId === targetInstanceId);
    if (!enemyUnit) return { success: false, message: '対象ユニットが見つかりません' };

    enemyUnit.currentHp -= attacker.attack;
    attacker.currentHp -= enemyUnit.attack;

    let msg = `${attacker.card.nameJa}（攻:${attacker.attack}）vs ${enemyUnit.card.nameJa}（攻:${enemyUnit.attack}）`;

    // Remove dead units
    if (enemyUnit.currentHp <= 0) {
      const idx = target.board.findIndex(u => u.instanceId === enemyUnit.instanceId);
      if (idx !== -1) {
        target.board.splice(idx, 1);
        target.discardPile.push(enemyUnit.card);
        msg += `、${enemyUnit.card.nameJa}を撃破`;
      }
    }
    if (attacker.currentHp <= 0) {
      const idx = actor.board.findIndex(u => u.instanceId === attacker.instanceId);
      if (idx !== -1) {
        actor.board.splice(idx, 1);
        actor.discardPile.push(attacker.card);
        msg += `、${attacker.card.nameJa}が倒れた`;
      }
    }

    state.log.push(`【${actor.nameJa}】${msg}`);
    checkWinCondition(state);
    return { success: true, message: msg };
  }
}

export function useHeroPower(
  state: GameState,
  actorId: 'player' | 'ai'
): { success: boolean; message: string } {
  const actor = state.players[actorId];
  const target = state.players[actorId === 'player' ? 'ai' : 'player'];

  if (actor.heroPowerUsed) return { success: false, message: 'ヒーローパワーは既に使用済みです' };
  if (actor.cursedEnergy < 2) return { success: false, message: '呪力が不足しています（必要: 2）' };

  const power = HERO_POWERS[actor.heroId];
  if (!power) return { success: false, message: 'ヒーローパワーが見つかりません' };

  actor.cursedEnergy -= 2;
  actor.heroPowerUsed = true;

  const result = applyHeroPower(state, actor, target, power.effect);
  state.log.push(`【${actor.nameJa}】ヒーローパワー「${power.nameJa}」発動！ ${result}`);

  checkWinCondition(state);
  return { success: true, message: result };
}

export function endTurn(state: GameState): void {
  const current = state.players[state.activePlayer];

  if (current.shield > 0) {
    current.shield = Math.max(0, current.shield - 2);
  }

  state.phase = 'END';

  const next = state.activePlayer === 'player' ? 'ai' : 'player';
  state.activePlayer = next;
  state.turn++;

  const nextPlayer = state.players[next];
  state.log.push(`--- ターン${state.turn}: ${nextPlayer.nameJa}のターン ---`);

  startTurn(state);
}

function checkWinCondition(state: GameState): void {
  if (state.players.player.hp <= 0) {
    state.winner = 'ai';
    state.phase = 'GAME_OVER';
    state.log.push(`${state.players.ai.nameJa}の勝利！`);
  } else if (state.players.ai.hp <= 0) {
    state.winner = 'player';
    state.phase = 'GAME_OVER';
    state.log.push(`${state.players.player.nameJa}の勝利！`);
  }
}

export function executeAITurn(state: GameState): string[] {
  const ai = state.players.ai;
  const player = state.players.player;
  const actions: string[] = [];

  let iterations = 0;
  while (iterations < 15) {
    iterations++;
    if (state.phase !== 'MAIN') break;
    if (ai.cursedEnergy <= 0 && ai.hand.length === 0) break;

    const playable = ai.hand.filter(c => c.cost <= ai.cursedEnergy);
    if (playable.length === 0) break;

    const sorted = [...playable].sort((a, b) => {
      // Heal if low HP
      if (ai.hp <= 12) {
        if (a.effect.type === EffectType.HEAL) return -1;
        if (b.effect.type === EffectType.HEAL) return 1;
      }
      // Sorcerers on empty board
      if (ai.board.length < ai.maxBoardSize) {
        if (a.type === CardType.SORCERER) return -1;
        if (b.type === CardType.SORCERER) return 1;
      }
      // Domain
      if (a.type === CardType.DOMAIN) return -1;
      if (b.type === CardType.DOMAIN) return 1;
      // Damage
      if (a.effect.type === EffectType.DAMAGE || a.effect.type === EffectType.DOUBLE_DAMAGE) return -1;
      if (b.effect.type === EffectType.DAMAGE || b.effect.type === EffectType.DOUBLE_DAMAGE) return 1;
      return b.cost - a.cost;
    });

    const card = sorted[0];
    const result = playCard(state, 'ai', card.instanceId);
    if (result.success) {
      actions.push(result.message);
    } else {
      break;
    }
  }

  // Attack with board units
  for (const unit of [...ai.board]) {
    if (state.phase === 'GAME_OVER') break;
    if (!unit.canAttack) continue;

    if (player.board.length > 0) {
      // Attack weakest enemy unit
      const weakest = player.board.reduce((min, u) => u.currentHp < min.currentHp ? u : min, player.board[0]);
      const result = attackWithUnit(state, 'ai', unit.instanceId, weakest.instanceId);
      actions.push(result.message);
    } else {
      const result = attackWithUnit(state, 'ai', unit.instanceId, 'hero');
      actions.push(result.message);
    }
  }

  // Use hero power if beneficial
  if (state.phase !== 'GAME_OVER' && !ai.heroPowerUsed && ai.cursedEnergy >= 2) {
    const power = HERO_POWERS[ai.heroId];
    if (power) {
      const shouldUse =
        (power.effect.type === EffectType.DAMAGE && player.hp <= 20) ||
        (power.effect.type === EffectType.AOE_DAMAGE && player.board.length > 0) ||
        (power.effect.type === EffectType.SHIELD && ai.hp <= 15) ||
        (power.effect.type === EffectType.DRAW && ai.hand.length <= 2);
      if (shouldUse) {
        const result = useHeroPower(state, 'ai');
        actions.push(result.message);
      }
    }
  }

  return actions;
}
