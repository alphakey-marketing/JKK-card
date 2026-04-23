/**
 * カードタイプ定義
 * Card type definitions
 */
export enum CardType {
  SORCERER = 'SORCERER',   // 呪術師
  TECHNIQUE = 'TECHNIQUE', // 術式
  DOMAIN = 'DOMAIN',       // 領域
}

/**
 * カード効果タイプ
 */
export enum EffectType {
  DAMAGE = 'DAMAGE',             // ダメージ
  HEAL = 'HEAL',                 // 回復
  DRAW = 'DRAW',                 // ドロー
  ENERGY_GAIN = 'ENERGY_GAIN',   // 呪力増加
  SHIELD = 'SHIELD',             // 防御
  BUFF_ATTACK = 'BUFF_ATTACK',   // 攻撃バフ
  DEBUFF = 'DEBUFF',             // デバフ
  DOUBLE_DAMAGE = 'DOUBLE_DAMAGE', // ダメージ×2
}

/**
 * カード効果
 */
export interface CardEffect {
  type: EffectType;
  value: number;
  description: string;
  descriptionJa: string;
}

/**
 * カード定義インターフェース
 */
export interface CardData {
  id: string;
  nameJa: string;           // 日本語名
  nameFurigana: string;     // ふりがな
  nameEn: string;           // English name
  type: CardType;
  cost: number;             // 呪力コスト
  power: number;            // 攻撃力 (for Sorcerers)
  defense: number;          // 防御力 (for Sorcerers)
  hp: number;               // HP (for Sorcerers, 0 for others)
  effect: CardEffect;
  flavorTextJa: string;     // フレーバーテキスト
}

/**
 * 全カードデータ
 */
export const ALL_CARDS: CardData[] = [
  // ========== 虎杖悠仁デッキ ==========
  {
    id: 'yuji_base',
    nameJa: '虎杖悠仁',
    nameFurigana: 'いたどりゆうじ',
    nameEn: 'Yuji Itadori',
    type: CardType.SORCERER,
    cost: 3,
    power: 5,
    defense: 3,
    hp: 20,
    effect: {
      type: EffectType.DAMAGE,
      value: 5,
      description: 'Deal 5 damage',
      descriptionJa: '敵に5ダメージ',
    },
    flavorTextJa: '俺は人を助けるために戦う',
  },
  {
    id: 'divergent_fist',
    nameJa: '発散拳',
    nameFurigana: 'はっさんけん',
    nameEn: 'Divergent Fist',
    type: CardType.TECHNIQUE,
    cost: 2,
    power: 0,
    defense: 0,
    hp: 0,
    effect: {
      type: EffectType.DAMAGE,
      value: 7,
      description: 'Deal 7 damage',
      descriptionJa: '敵に7ダメージ',
    },
    flavorTextJa: '黒閃の前兆、遅延する呪力',
  },
  {
    id: 'black_flash',
    nameJa: '黒閃',
    nameFurigana: 'こくせん',
    nameEn: 'Black Flash',
    type: CardType.TECHNIQUE,
    cost: 3,
    power: 0,
    defense: 0,
    hp: 0,
    effect: {
      type: EffectType.DOUBLE_DAMAGE,
      value: 12,
      description: 'Deal 12 damage',
      descriptionJa: '敵に12ダメージ（超高火力）',
    },
    flavorTextJa: '呪力と物理の同時衝突',
  },
  {
    id: 'mastered_ratio',
    nameJa: '呪力操作',
    nameFurigana: 'じゅりょくそうさ',
    nameEn: 'Cursed Energy Control',
    type: CardType.TECHNIQUE,
    cost: 1,
    power: 0,
    defense: 0,
    hp: 0,
    effect: {
      type: EffectType.ENERGY_GAIN,
      value: 3,
      description: 'Gain 3 cursed energy',
      descriptionJa: '呪力を3回復',
    },
    flavorTextJa: '呪力の流れを自在に操る',
  },
  {
    id: 'superhuman_body',
    nameJa: '超人的肉体',
    nameFurigana: 'ちょうじんてきにくたい',
    nameEn: 'Superhuman Body',
    type: CardType.TECHNIQUE,
    cost: 2,
    power: 0,
    defense: 0,
    hp: 0,
    effect: {
      type: EffectType.HEAL,
      value: 8,
      description: 'Heal 8 HP',
      descriptionJa: '自分のHPを8回復',
    },
    flavorTextJa: '宿儺の肉体はあらゆる傷を癒す',
  },
  {
    id: 'sukuna_shrine',
    nameJa: '千年の呪い',
    nameFurigana: 'せんねんのろい',
    nameEn: 'Curse of a Thousand Years',
    type: CardType.DOMAIN,
    cost: 5,
    power: 0,
    defense: 0,
    hp: 0,
    effect: {
      type: EffectType.DAMAGE,
      value: 20,
      description: 'Deal 20 damage to all enemies',
      descriptionJa: '敵全体に20ダメージ',
    },
    flavorTextJa: '宿儺の領域、炎と斬撃が支配する',
  },
  {
    id: 'yuji_punch',
    nameJa: '渾身の一撃',
    nameFurigana: 'こんしんのいちげき',
    nameEn: 'Full Power Strike',
    type: CardType.TECHNIQUE,
    cost: 2,
    power: 0,
    defense: 0,
    hp: 0,
    effect: {
      type: EffectType.DAMAGE,
      value: 9,
      description: 'Deal 9 damage',
      descriptionJa: '敵に9ダメージ',
    },
    flavorTextJa: '全力で正面から叩きつける',
  },
  {
    id: 'yuji_guard',
    nameJa: '鉄壁の守り',
    nameFurigana: 'てっぺきのまもり',
    nameEn: 'Iron Wall Guard',
    type: CardType.TECHNIQUE,
    cost: 2,
    power: 0,
    defense: 0,
    hp: 0,
    effect: {
      type: EffectType.SHIELD,
      value: 10,
      description: 'Gain 10 shield',
      descriptionJa: 'シールド10獲得',
    },
    flavorTextJa: '動じない心、鋼の体',
  },
  {
    id: 'yuji_draw',
    nameJa: '戦意高揚',
    nameFurigana: 'せんいこうよう',
    nameEn: 'Battle Resolve',
    type: CardType.TECHNIQUE,
    cost: 1,
    power: 0,
    defense: 0,
    hp: 0,
    effect: {
      type: EffectType.DRAW,
      value: 2,
      description: 'Draw 2 cards',
      descriptionJa: 'カードを2枚ドロー',
    },
    flavorTextJa: '諦めない心が力を呼ぶ',
  },
  {
    id: 'yuji_buff',
    nameJa: '呪力強化',
    nameFurigana: 'じゅりょくきょうか',
    nameEn: 'Cursed Power Boost',
    type: CardType.TECHNIQUE,
    cost: 2,
    power: 0,
    defense: 0,
    hp: 0,
    effect: {
      type: EffectType.BUFF_ATTACK,
      value: 3,
      description: 'Next attack +3 damage',
      descriptionJa: '次の攻撃に+3ダメージ',
    },
    flavorTextJa: '呪力を全身に巡らせる',
  },

  // ========== 伏黒恵デッキ ==========
  {
    id: 'megumi_base',
    nameJa: '伏黒恵',
    nameFurigana: 'ふしぐろめぐみ',
    nameEn: 'Megumi Fushiguro',
    type: CardType.SORCERER,
    cost: 3,
    power: 4,
    defense: 4,
    hp: 18,
    effect: {
      type: EffectType.DAMAGE,
      value: 4,
      description: 'Deal 4 damage',
      descriptionJa: '敵に4ダメージ',
    },
    flavorTextJa: '十種影法術の使い手',
  },
  {
    id: 'divine_dog',
    nameJa: '玉犬',
    nameFurigana: 'ぎょくけん',
    nameEn: 'Divine Dog',
    type: CardType.TECHNIQUE,
    cost: 2,
    power: 0,
    defense: 0,
    hp: 0,
    effect: {
      type: EffectType.DAMAGE,
      value: 6,
      description: 'Deal 6 damage',
      descriptionJa: '敵に6ダメージ',
    },
    flavorTextJa: '十種影法術・玉犬',
  },
  {
    id: 'nue',
    nameJa: '鵺',
    nameFurigana: 'ぬえ',
    nameEn: 'Nue',
    type: CardType.TECHNIQUE,
    cost: 2,
    power: 0,
    defense: 0,
    hp: 0,
    effect: {
      type: EffectType.DAMAGE,
      value: 8,
      description: 'Deal 8 damage',
      descriptionJa: '敵に8ダメージ',
    },
    flavorTextJa: '空を舞う鵺の電撃',
  },
  {
    id: 'toad',
    nameJa: '蟾蜍',
    nameFurigana: 'ひきがえる',
    nameEn: 'Great Toad',
    type: CardType.TECHNIQUE,
    cost: 3,
    power: 0,
    defense: 0,
    hp: 0,
    effect: {
      type: EffectType.SHIELD,
      value: 12,
      description: 'Gain 12 shield',
      descriptionJa: 'シールド12獲得',
    },
    flavorTextJa: '大きな蟾蜍で身を守る',
  },
  {
    id: 'rabbit_escape',
    nameJa: '兎跳び',
    nameFurigana: 'うさぎとび',
    nameEn: 'Rabbit Escape',
    type: CardType.TECHNIQUE,
    cost: 1,
    power: 0,
    defense: 0,
    hp: 0,
    effect: {
      type: EffectType.DRAW,
      value: 3,
      description: 'Draw 3 cards',
      descriptionJa: 'カードを3枚ドロー',
    },
    flavorTextJa: '無数の兎が逃げ場を作る',
  },
  {
    id: 'chimera_shadow',
    nameJa: '嵌合暗翳庭',
    nameFurigana: 'かんごうあんえいてい',
    nameEn: 'Chimera Shadow Garden',
    type: CardType.DOMAIN,
    cost: 5,
    power: 0,
    defense: 0,
    hp: 0,
    effect: {
      type: EffectType.DAMAGE,
      value: 18,
      description: 'Deal 18 damage and draw 2 cards',
      descriptionJa: '敵に18ダメージ＋カード2枚ドロー',
    },
    flavorTextJa: '影の領域が全てを飲み込む',
  },
  {
    id: 'shadow_step',
    nameJa: '影の足捌き',
    nameFurigana: 'かげのあしさばき',
    nameEn: 'Shadow Step',
    type: CardType.TECHNIQUE,
    cost: 1,
    power: 0,
    defense: 0,
    hp: 0,
    effect: {
      type: EffectType.ENERGY_GAIN,
      value: 2,
      description: 'Gain 2 cursed energy',
      descriptionJa: '呪力を2回復',
    },
    flavorTextJa: '影を踏み台に移動する',
  },
  {
    id: 'max_elephant',
    nameJa: '満象',
    nameFurigana: 'まんぞう',
    nameEn: 'Max Elephant',
    type: CardType.TECHNIQUE,
    cost: 4,
    power: 0,
    defense: 0,
    hp: 0,
    effect: {
      type: EffectType.DAMAGE,
      value: 14,
      description: 'Deal 14 damage',
      descriptionJa: '敵に14ダメージ',
    },
    flavorTextJa: '巨象の水流で押し潰す',
  },
  {
    id: 'megumi_heal',
    nameJa: '影の回復',
    nameFurigana: 'かげのかいふく',
    nameEn: 'Shadow Recovery',
    type: CardType.TECHNIQUE,
    cost: 2,
    power: 0,
    defense: 0,
    hp: 0,
    effect: {
      type: EffectType.HEAL,
      value: 6,
      description: 'Heal 6 HP',
      descriptionJa: '自分のHPを6回復',
    },
    flavorTextJa: '影の中で傷を癒す',
  },
  {
    id: 'ten_shadows',
    nameJa: '十種影法術',
    nameFurigana: 'とおかのかげほうじゅつ',
    nameEn: 'Ten Shadows Technique',
    type: CardType.TECHNIQUE,
    cost: 3,
    power: 0,
    defense: 0,
    hp: 0,
    effect: {
      type: EffectType.BUFF_ATTACK,
      value: 4,
      description: 'Next attack +4 damage',
      descriptionJa: '次の攻撃に+4ダメージ',
    },
    flavorTextJa: '十種の影の使い魔を操る',
  },
];

/**
 * IDでカードを検索
 */
export function getCardById(id: string): CardData | undefined {
  return ALL_CARDS.find(c => c.id === id);
}
