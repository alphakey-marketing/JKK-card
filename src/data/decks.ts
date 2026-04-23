import { CardData, getCardById } from './cards';

/**
 * デッキ定義
 */

// ========== 虎杖悠仁デッキ (30枚) ==========
export const YUJI_DECK_IDS: string[] = [
  'yuji_base', 'yuji_base',
  'divergent_fist', 'divergent_fist',
  'black_flash',
  'mastered_ratio', 'mastered_ratio',
  'superhuman_body', 'superhuman_body',
  'sukuna_shrine',
  'yuji_punch', 'yuji_punch',
  'yuji_guard', 'yuji_guard',
  'yuji_draw', 'yuji_draw',
  'yuji_buff', 'yuji_buff',
  'soul_strike', 'soul_strike',
  'sukuna_power', 'sukuna_power',
  'fierce_punch', 'fierce_punch',
  'binding_courage', 'binding_courage',
  'cursed_blast', 'cursed_blast',
  'black_flash_training', 'black_flash_training',
];

// ========== 伏黒恵デッキ (30枚) ==========
export const MEGUMI_DECK_IDS: string[] = [
  'megumi_base', 'megumi_base',
  'divine_dog', 'divine_dog',
  'nue', 'nue',
  'toad', 'toad',
  'rabbit_escape', 'rabbit_escape',
  'chimera_shadow',
  'shadow_step', 'shadow_step',
  'max_elephant', 'max_elephant',
  'megumi_heal', 'megumi_heal',
  'ten_shadows', 'ten_shadows',
  'serpent_summon', 'serpent_summon',
  'shadow_bind', 'shadow_bind',
  'deer_summon', 'deer_summon',
  'shadow_shield', 'shadow_shield',
  'incomplete_domain',
  'megumi_energy', 'megumi_energy',
];

// ========== 釘崎野薔薇デッキ (30枚) ==========
export const NOBARA_DECK_IDS: string[] = [
  'nobara_base', 'nobara_base',
  'nail_strike', 'nail_strike',
  'resonance',
  'blood_mark', 'blood_mark',
  'straw_doll', 'straw_doll',
  'vow_of_blood', 'vow_of_blood',
  'rage_strike', 'rage_strike',
  'spirit_hammer', 'spirit_hammer',
  'nobara_draw', 'nobara_draw',
  'nobara_heal', 'nobara_heal',
  'maiden_domain',
  'iron_hammer', 'iron_hammer',
  'nail_rain', 'nail_rain',
  'vow_of_sacrifice', 'vow_of_sacrifice',
  'piercing_nail', 'piercing_nail',
  'nail_shield', 'nail_shield',
];

// ========== 五条悟デッキ (30枚) ==========
export const GOJO_DECK_IDS: string[] = [
  'gojo_base',
  'blue_technique', 'blue_technique',
  'red_technique', 'red_technique',
  'purple_technique',
  'infinity_shield', 'infinity_shield',
  'unlimited_void',
  'six_eyes', 'six_eyes',
  'reverse_technique', 'reverse_technique',
  'space_control', 'space_control',
  'student_bond', 'student_bond',
  'hollow_technique', 'hollow_technique',
  'strongest_vow',
  'limitless_boost', 'limitless_boost',
  'barrier_wall', 'barrier_wall',
  'gojo_draw', 'gojo_draw',
  'gojo_energy', 'gojo_energy',
  'cursed_technique_lapse', 'cursed_technique_lapse',
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
