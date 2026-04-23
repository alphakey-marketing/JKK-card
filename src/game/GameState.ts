import { DeckCard, buildDeck, YUJI_DECK_IDS, MEGUMI_DECK_IDS, NOBARA_DECK_IDS, GOJO_DECK_IDS, NANAMI_DECK_IDS, TOGE_DECK_IDS } from '../data/decks';
import { CardType, EffectType, Keyword, HERO_POWERS, SYNERGY_BONDS } from '../data/cards';

export interface BoardUnit {
  card: DeckCard;
  instanceId: string;
  currentHp: number;
  attack: number;
  canAttack: boolean;
  isExhausted: boolean;
  hasTaunt: boolean;
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
  boundUntilNextTurn: string[];
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
  nanami: { nameJa: '七海建人', nameFurigana: 'ななみけんと', deckIds: NANAMI_DECK_IDS, heroId: 'nanami' },
  toge: { nameJa: '狗巻棘', nameFurigana: 'いぬまきとげ', deckIds: TOGE_DECK_IDS, heroId: 'toge' },
};

const AI_OPPONENT: Record<string, string> = {
  yuji: 'megumi',
  megumi: 'yuji',
  nobara: 'gojo',
  gojo: 'nobara',
  nanami: 'yuji',
  toge: 'megumi',
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
    boundUntilNextTurn: [],
  };
}

export function initGame(
  playerChoice: 'yuji' | 'megumi' | 'nobara' | 'gojo' | 'nanami' | 'toge' = 'yuji'
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
  // Re-apply binding: units bound last turn cannot attack this turn
  if (ap.boundUntilNextTurn.length > 0) {
    ap.board.forEach(unit => {
      if (ap.boundUntilNextTurn.includes(unit.instanceId)) {
        unit.canAttack = false;
        unit.isExhausted = true;
      }
    });
    ap.boundUntilNextTurn = [];
  }
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
      const hasRush = card.keywords?.includes(Keyword.RUSH) ?? false;
      const hasTaunt = card.keywords?.includes(Keyword.TAUNT) ?? false;
      const unit: BoardUnit = {
        card,
        instanceId: card.instanceId + '_unit',
        currentHp: card.hp > 0 ? card.hp : 10,
        attack: card.power > 0 ? card.power : 1,
        canAttack: hasRush,
        isExhausted: false,
        hasTaunt,
      };
      actor.board.push(unit);

      // Synergy bonds
      const existingIds = actor.board.map(u => u.card.id);
      for (const bond of SYNERGY_BONDS) {
        const isNewCardA = card.id === bond.cardA;
        const isNewCardB = card.id === bond.cardB;
        const partnerPresent = isNewCardA
          ? existingIds.filter(id => id === bond.cardB).length > 1 || (existingIds.includes(bond.cardB) && card.id !== bond.cardB)
          : isNewCardB
            ? existingIds.filter(id => id === bond.cardA).length > 1 || (existingIds.includes(bond.cardA) && card.id !== bond.cardA)
            : false;
        if ((isNewCardA || isNewCardB) && partnerPresent) {
          const partnerId = isNewCardA ? bond.cardB : bond.cardA;
          if (bond.effect.type === EffectType.BUFF_ALL_ATTACK) {
            actor.board.forEach(u => { u.attack += bond.effect.value; });
            state.log.push(`【シナジー】${bond.descriptionJa}`);
          } else if (bond.effect.type === EffectType.BUFF_UNIT_HP) {
            const partnerUnit = actor.board.find(u => u.card.id === partnerId && u.instanceId !== unit.instanceId);
            if (partnerUnit) {
              partnerUnit.currentHp += bond.effect.value;
              state.log.push(`【シナジー】${bond.descriptionJa}`);
            }
          }
        }
      }

      const msg = `${card.nameJa}をフィールドに召喚！（攻:${unit.attack} HP:${unit.currentHp}${hasTaunt ? ' 挑発' : ''}${hasRush ? ' 突撃' : ''}）`;
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

    case EffectType.BUFF_ALL_ATTACK: {
      actor.board.forEach(u => { u.attack += effect.value; });
      result = `全味方の攻撃力+${effect.value}`;
      break;
    }

    case EffectType.BUFF_UNIT_HP: {
      if (actor.board.length > 0) {
        const strongest = actor.board.reduce((max, u) => u.currentHp > max.currentHp ? u : max, actor.board[0]);
        strongest.currentHp += effect.value;
        result = `${strongest.card.nameJa}のHPが+${effect.value}`;
      } else {
        result = '対象なし';
      }
      break;
    }

    case EffectType.DEBUFF: {
      target.attackBuff = Math.max(0, target.attackBuff - effect.value);
      // Also debuff board units
      if (target.board.length > 0) {
        const weakest = target.board.reduce((min, u) => u.attack < min.attack ? u : min, target.board[0]);
        weakest.attack = Math.max(0, weakest.attack - effect.value);
        result = `${target.nameJa}の${weakest.card.nameJa}の攻撃力を${effect.value}下げた`;
      } else {
        result = `${target.nameJa}の攻撃力を${effect.value}下げた`;
      }
      break;
    }

    default:
      result = '効果を適用した';
  }

  // BINDING keyword: bind all enemy board units for next turn
  if (card.keywords?.includes(Keyword.BINDING)) {
    target.board.forEach(u => {
      if (!target.boundUntilNextTurn.includes(u.instanceId)) {
        target.boundUntilNextTurn.push(u.instanceId);
      }
    });
    if (target.board.length > 0) result += '（敵全体を縛った）';
  }

  // LIFESTEAL: heal actor for damage dealt
  if (card.keywords?.includes(Keyword.LIFESTEAL) && effect.type === EffectType.DAMAGE) {
    const healed = Math.min(effect.value, actor.maxHp - actor.hp);
    actor.hp += healed;
    result += `（ライフスティール+${healed}HP）`;
  }

  // CURSED_SURGE: gain energy equal to damage dealt
  if (card.keywords?.includes(Keyword.CURSED_SURGE) && effect.type === EffectType.DAMAGE) {
    const gain = Math.min(2, actor.maxCursedEnergy - actor.cursedEnergy);
    actor.cursedEnergy += gain;
    result += `（呪力サージ+${gain}）`;
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
    case EffectType.DEBUFF: {
      if (target.board.length > 0) {
        const weakest = target.board.reduce((min, u) => u.attack < min.attack ? u : min, target.board[0]);
        weakest.attack = Math.max(0, weakest.attack - effect.value);
        return `${target.nameJa}の${weakest.card.nameJa}の攻撃力を${effect.value}下げた`;
      }
      target.attackBuff = Math.max(0, target.attackBuff - effect.value);
      return `${target.nameJa}の攻撃力を${effect.value}下げた`;
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
    // If any enemy unit has Taunt, hero cannot be targeted
    const tauntUnits = target.board.filter(u => u.hasTaunt);
    if (tauntUnits.length > 0) {
      return { success: false, message: '挑発ユニットを先に倒してください' };
    }
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

    // Enforce Taunt: if any enemy unit has Taunt and this isn't one, deny
    const tauntUnits = target.board.filter(u => u.hasTaunt);
    if (tauntUnits.length > 0 && !enemyUnit.hasTaunt) {
      return { success: false, message: '挑発ユニットを先に攻撃してください' };
    }

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
  const actions: string[] = [];
  for (let i = 0; i < 20; i++) {
    if (state.phase !== 'MAIN') break;
    const action = executeAIStep(state);
    if (action === null) break;
    actions.push(action);
  }
  return actions;
}

function scoreCard(card: DeckCard, ai: PlayerState, player: PlayerState): number {
  let score = card.cost;
  const ef = card.effect.type;
  if (ai.hp <= 12 && ef === EffectType.HEAL) score += 10;
  if (ef === EffectType.DAMAGE || ef === EffectType.DOUBLE_DAMAGE) score += card.effect.value * 0.5;
  if (ef === EffectType.AOE_DAMAGE && player.board.length > 1) score += player.board.length * 2;
  if (card.type === CardType.SORCERER && ai.board.length < ai.maxBoardSize) score += 5;
  if (card.type === CardType.DOMAIN) score += 8;
  if (ef === EffectType.SHIELD && ai.hp <= 15) score += 5;
  if (ef === EffectType.DRAW && ai.hand.length <= 2) score += 4;
  return score;
}

export function executeAIStep(state: GameState): string | null {
  const ai = state.players.ai;
  const player = state.players.player;

  // Try to play the best card
  const playable = ai.hand.filter(c => c.cost <= ai.cursedEnergy);
  if (playable.length > 0) {
    const best = playable.reduce((a, b) => scoreCard(b, ai, player) > scoreCard(a, ai, player) ? b : a, playable[0]);
    const result = playCard(state, 'ai', best.instanceId);
    if (result.success) return result.message;
  }

  // Attack with a unit that can attack
  for (const unit of [...ai.board]) {
    if (state.phase === 'GAME_OVER') return null;
    if (!unit.canAttack) continue;

    const tauntUnits = player.board.filter(u => u.hasTaunt);
    const targets = tauntUnits.length > 0 ? tauntUnits : player.board;
    if (targets.length > 0) {
      const weakest = targets.reduce((min, u) => u.currentHp < min.currentHp ? u : min, targets[0]);
      const result = attackWithUnit(state, 'ai', unit.instanceId, weakest.instanceId);
      if (result.success) return result.message;
    } else {
      const result = attackWithUnit(state, 'ai', unit.instanceId, 'hero');
      if (result.success) return result.message;
    }
  }

  // Use hero power if beneficial
  if (!ai.heroPowerUsed && ai.cursedEnergy >= 2) {
    const power = HERO_POWERS[ai.heroId];
    if (power) {
      const ef = power.effect.type;
      const shouldUse =
        (ef === EffectType.DAMAGE && player.hp <= 20) ||
        (ef === EffectType.AOE_DAMAGE && player.board.length > 0) ||
        (ef === EffectType.SHIELD && ai.hp <= 15) ||
        (ef === EffectType.DRAW && ai.hand.length <= 2) ||
        (ef === EffectType.DEBUFF && player.board.length > 0);
      if (shouldUse) {
        const result = useHeroPower(state, 'ai');
        if (result.success) return result.message;
      }
    }
  }

  return null;
}
