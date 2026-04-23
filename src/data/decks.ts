import { CardData, getCardById } from './cards';

/**
 * デッキ定義
 * Each deck has 20 cards with duplicates
 */

/**
 * 虎杖悠仁デッキ (Yuji Itadori Deck)
 */
export const YUJI_DECK_IDS: string[] = [
  'yuji_base',
  'divergent_fist',
  'divergent_fist',
  'divergent_fist',
  'black_flash',
  'black_flash',
  'mastered_ratio',
  'mastered_ratio',
  'mastered_ratio',
  'superhuman_body',
  'superhuman_body',
  'sukuna_shrine',
  'yuji_punch',
  'yuji_punch',
  'yuji_punch',
  'yuji_guard',
  'yuji_guard',
  'yuji_draw',
  'yuji_draw',
  'yuji_buff',
];

/**
 * 伏黒恵デッキ (Megumi Fushiguro Deck)
 */
export const MEGUMI_DECK_IDS: string[] = [
  'megumi_base',
  'divine_dog',
  'divine_dog',
  'divine_dog',
  'nue',
  'nue',
  'toad',
  'toad',
  'rabbit_escape',
  'rabbit_escape',
  'rabbit_escape',
  'chimera_shadow',
  'shadow_step',
  'shadow_step',
  'shadow_step',
  'max_elephant',
  'max_elephant',
  'megumi_heal',
  'megumi_heal',
  'ten_shadows',
];

/**
 * IDリストからカードデータ配列を作成（ユニークIDを付与）
 */
export function buildDeck(ids: string[]): (CardData & { instanceId: string })[] {
  return ids.map((id, index) => {
    const card = getCardById(id);
    if (!card) throw new Error(`Card not found: ${id}`);
    return { ...card, instanceId: `${id}_${index}` };
  });
}

export type DeckCard = CardData & { instanceId: string };
