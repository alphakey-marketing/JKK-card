import { DeckCard, buildDeck } from '../data/decks';
import { CardType, EffectType } from '../data/cards';

export interface PlayerState {
  id: 'player' | 'ai';
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
  activeSorcerer: DeckCard | null;
}

export type GamePhase =
  | 'DRAW'
  | 'MAIN'
  | 'END'
  | 'GAME_OVER';

export interface GameState {
  turn: number;
  phase: GamePhase;
  activePlayer: 'player' | 'ai';
  players: {
    player: PlayerState;
    ai: PlayerState;
  };
  log: string[];
  winner: 'player' | 'ai' | null;
  pendingEffects: string[];
}

const STARTING_HP = 30;
const MAX_CURSED_ENERGY = 10;
const HAND_SIZE = 5;
const ENERGY_PER_TURN = 3;

/**
 * デッキをシャッフルする
 */
function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/**
 * プレイヤーの初期状態を作成
 */
function createPlayer(
  id: 'player' | 'ai',
  nameJa: string,
  nameFurigana: string,
  deckIds: string[]
): PlayerState {
  const deck = shuffle(buildDeck(deckIds));
  return {
    id,
    nameJa,
    nameFurigana,
    hp: STARTING_HP,
    maxHp: STARTING_HP,
    cursedEnergy: ENERGY_PER_TURN,
    maxCursedEnergy: MAX_CURSED_ENERGY,
    shield: 0,
    attackBuff: 0,
    deck,
    hand: [],
    discardPile: [],
    activeSorcerer: null,
  };
}

/**
 * ゲームを初期化する
 */
export function initGame(
  yujiDeckIds: string[],
  megumiDeckIds: string[],
  playerChoose: 'yuji' | 'megumi' = 'yuji'
): GameState {
  const playerDeckIds = playerChoose === 'yuji' ? yujiDeckIds : megumiDeckIds;
  const aiDeckIds = playerChoose === 'yuji' ? megumiDeckIds : yujiDeckIds;
  const playerName = playerChoose === 'yuji'
    ? { ja: '虎杖悠仁', furi: 'いたどりゆうじ' }
    : { ja: '伏黒恵', furi: 'ふしぐろめぐみ' };
  const aiName = playerChoose === 'yuji'
    ? { ja: '伏黒恵', furi: 'ふしぐろめぐみ' }
    : { ja: '虎杖悠仁', furi: 'いたどりゆうじ' };

  const player = createPlayer('player', playerName.ja, playerName.furi, playerDeckIds);
  const ai = createPlayer('ai', aiName.ja, aiName.furi, aiDeckIds);

  // Draw initial hands
  for (let i = 0; i < HAND_SIZE; i++) {
    drawCard(player);
    drawCard(ai);
  }

  return {
    turn: 1,
    phase: 'DRAW',
    activePlayer: 'player',
    players: { player, ai },
    log: ['ゲーム開始！', `${playerName.ja}のターン`],
    winner: null,
    pendingEffects: [],
  };
}

/**
 * カードをデッキから手札へ引く
 */
export function drawCard(ps: PlayerState, count = 1): number {
  let drawn = 0;
  for (let i = 0; i < count; i++) {
    if (ps.hand.length >= 8) break; // Max hand size
    if (ps.deck.length === 0) {
      // Reshuffle discard
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

/**
 * ターン開始時の処理
 */
export function startTurn(state: GameState): void {
  const ap = state.players[state.activePlayer];
  state.phase = 'DRAW';

  // Restore cursed energy
  ap.cursedEnergy = Math.min(ap.maxCursedEnergy, ap.cursedEnergy + ENERGY_PER_TURN + Math.floor(state.turn / 3));

  // Draw 1 card at turn start
  const drawn = drawCard(ap);
  state.log.push(`【ドロー】${ap.nameJa}はカードを${drawn}枚引いた`);

  state.phase = 'MAIN';
}

/**
 * カードを使用する
 */
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

  // Cost check
  if (actor.cursedEnergy < card.cost) {
    return { success: false, message: `呪力が足りません（必要: ${card.cost}、現在: ${actor.cursedEnergy}）` };
  }

  // Pay cost
  actor.cursedEnergy -= card.cost;

  // Remove from hand
  actor.hand.splice(cardIndex, 1);

  // Apply effect
  let result = applyEffect(state, actor, target, card);

  // Domain expansion bonus: also draw 2 cards
  if (card.type === CardType.DOMAIN) {
    const drawn = drawCard(actor, 2);
    if (drawn > 0) result += `、${drawn}枚ドロー`;
  }

  state.log.push(`【${actor.nameJa}】${card.nameJa}を使用！ ${result}`);

  // Move to discard
  actor.discardPile.push(card);

  // If sorcerer card, set as active
  if (card.type === CardType.SORCERER) {
    actor.activeSorcerer = card;
  }

  // Check win condition
  checkWinCondition(state);

  return { success: true, message: result };
}

/**
 * カード効果を適用する
 */
function applyEffect(
  state: GameState,
  actor: PlayerState,
  target: PlayerState,
  card: DeckCard
): string {
  const effect = card.effect;
  let effectValue = effect.value + actor.attackBuff;

  switch (effect.type) {
    case EffectType.DAMAGE: {
      const dmg = Math.max(0, effectValue - target.shield);
      const shieldUsed = Math.min(target.shield, effectValue);
      target.shield = Math.max(0, target.shield - effectValue);
      target.hp = Math.max(0, target.hp - dmg);
      actor.attackBuff = 0;
      if (shieldUsed > 0) {
        return `${target.nameJa}に${dmg}ダメージ（シールド${shieldUsed}吸収）`;
      }
      return `${target.nameJa}に${dmg}ダメージ！`;
    }

    case EffectType.DOUBLE_DAMAGE: {
      const baseDmg = effect.value + actor.attackBuff;
      const dmg2 = Math.max(0, baseDmg - target.shield);
      target.shield = Math.max(0, target.shield - baseDmg);
      target.hp = Math.max(0, target.hp - dmg2);
      actor.attackBuff = 0;
      return `黒閃！${target.nameJa}に${dmg2}ダメージ！！`;
    }

    case EffectType.HEAL: {
      const healed = Math.min(effect.value, actor.maxHp - actor.hp);
      actor.hp += healed;
      return `${actor.nameJa}のHPが${healed}回復（${actor.hp}/${actor.maxHp}）`;
    }

    case EffectType.DRAW: {
      const drawn = drawCard(actor, effect.value);
      return `カードを${drawn}枚ドロー`;
    }

    case EffectType.ENERGY_GAIN: {
      const gain = Math.min(effect.value, actor.maxCursedEnergy - actor.cursedEnergy);
      actor.cursedEnergy += gain;
      return `呪力が${gain}増加（${actor.cursedEnergy}/${actor.maxCursedEnergy}）`;
    }

    case EffectType.SHIELD: {
      actor.shield += effect.value;
      return `シールド${effect.value}を獲得（合計: ${actor.shield}）`;
    }

    case EffectType.BUFF_ATTACK: {
      actor.attackBuff += effect.value;
      return `次の攻撃に+${effect.value}ダメージ`;
    }

    case EffectType.DEBUFF: {
      target.attackBuff = Math.max(0, target.attackBuff - effect.value);
      return `${target.nameJa}の攻撃力を${effect.value}下げた`;
    }

    default:
      return '効果を適用した';
  }
}

/**
 * ターン終了処理
 */
export function endTurn(state: GameState): void {
  const current = state.players[state.activePlayer];

  // Shield decays a bit at end of turn (not full removal)
  if (current.shield > 0) {
    current.shield = Math.max(0, current.shield - 2);
  }

  state.phase = 'END';

  // Switch active player
  const next = state.activePlayer === 'player' ? 'ai' : 'player';
  state.activePlayer = next;
  state.turn++;

  const nextPlayer = state.players[next];
  state.log.push(`--- ターン${state.turn}: ${nextPlayer.nameJa}のターン ---`);

  // Start next turn
  startTurn(state);
}

/**
 * 勝利条件チェック
 */
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

/**
 * AIのターンを実行する
 */
export function executeAITurn(state: GameState): string[] {
  const ai = state.players.ai;
  const actions: string[] = [];

  // Simple AI: play cards by priority
  // 1. If low HP, try to heal
  // 2. If high energy, play domain
  // 3. Play highest damage card affordable
  // 4. Gain energy if needed
  // 5. End turn

  let iterations = 0;
  while (iterations < 10) {
    iterations++;
    const currentPhase: GamePhase = state.phase;
    if (currentPhase !== 'MAIN') break;
    if (ai.cursedEnergy <= 0 || ai.hand.length === 0) break;

    const playable = ai.hand.filter(c => c.cost <= ai.cursedEnergy);
    if (playable.length === 0) break;

    // Sort by priority
    const sorted = [...playable].sort((a, b) => {
      // Prioritize heal if low HP
      if (ai.hp <= 10) {
        if (a.effect.type === EffectType.HEAL) return -1;
        if (b.effect.type === EffectType.HEAL) return 1;
      }
      // Prioritize domain if available
      if (a.type === CardType.DOMAIN) return -1;
      if (b.type === CardType.DOMAIN) return 1;
      // Prioritize damage
      if (a.effect.type === EffectType.DAMAGE || a.effect.type === EffectType.DOUBLE_DAMAGE) return -1;
      if (b.effect.type === EffectType.DAMAGE || b.effect.type === EffectType.DOUBLE_DAMAGE) return 1;
      // Then buff/shield
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

  return actions;
}
