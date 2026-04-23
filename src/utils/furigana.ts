import Phaser from 'phaser';

/**
 * ふりがな付きテキストを描画するユーティリティ
 * Renders Japanese text with small furigana on top
 */
export function drawFuriganaText(
  scene: Phaser.Scene,
  x: number,
  y: number,
  mainText: string,
  furigana: string,
  mainStyle: Phaser.Types.GameObjects.Text.TextStyle,
  furiganaScale = 0.55
): Phaser.GameObjects.Container {
  const container = scene.add.container(x, y);

  const mainObj = scene.add.text(0, 0, mainText, mainStyle);
  mainObj.setOrigin(0.5, 0);

  const furiStyle: Phaser.Types.GameObjects.Text.TextStyle = {
    ...mainStyle,
    fontSize: `${Math.round(parseInt(String(mainStyle.fontSize ?? '16')) * furiganaScale)}px`,
    color: mainStyle.color ?? '#ffffff',
  };
  const furiObj = scene.add.text(0, -(parseInt(String(furiStyle.fontSize ?? '10')) + 2), furigana, furiStyle);
  furiObj.setOrigin(0.5, 0);

  container.add([furiObj, mainObj]);
  return container;
}

/**
 * カードタイプの日本語表示名を返す
 */
export function cardTypeLabel(type: string): { ja: string; furigana: string; color: string } {
  switch (type) {
    case 'SORCERER':
      return { ja: '呪術師', furigana: 'じゅじゅつし', color: '#FFD700' };
    case 'TECHNIQUE':
      return { ja: '術式', furigana: 'じゅつしき', color: '#00BFFF' };
    case 'DOMAIN':
      return { ja: '領域展開', furigana: 'りょういきてんかい', color: '#FF4500' };
    default:
      return { ja: '不明', furigana: 'ふめい', color: '#FFFFFF' };
  }
}

/**
 * テキストを折り返して配列に変換する
 */
export function wrapText(text: string, maxChars: number): string[] {
  const lines: string[] = [];
  let current = '';
  for (const ch of text) {
    current += ch;
    if (current.length >= maxChars) {
      lines.push(current);
      current = '';
    }
  }
  if (current) lines.push(current);
  return lines;
}
