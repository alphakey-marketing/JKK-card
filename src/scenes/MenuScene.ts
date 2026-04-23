import Phaser from 'phaser';

/**
 * メニューシーン
 * Main menu with deck selection
 */
export class MenuScene extends Phaser.Scene {
  constructor() {
    super({ key: 'MenuScene' });
  }

  create(): void {
    const { width, height } = this.scale;
    const cx = width / 2;

    // Dark background
    this.add.rectangle(cx, height / 2, width, height, 0x050510);

    // Animated background particles
    this.createBackgroundEffects(width, height);

    // Title
    const titleFuri = this.add.text(cx, 50, 'じゅじゅつかいせん', {
      fontSize: '14px',
      color: '#888888',
      fontFamily: "'Noto Serif JP', serif",
    });
    titleFuri.setOrigin(0.5, 0.5);

    const titleText = this.add.text(cx, 80, '呪術廻戦', {
      fontSize: '52px',
      color: '#ffffff',
      fontFamily: "'Noto Serif JP', serif",
      fontStyle: 'bold',
      stroke: '#8800cc',
      strokeThickness: 6,
    });
    titleText.setOrigin(0.5, 0.5);

    const subtitleFuri = this.add.text(cx, 122, 'かーどばとる', {
      fontSize: '12px',
      color: '#888888',
      fontFamily: "'Noto Serif JP', serif",
    });
    subtitleFuri.setOrigin(0.5, 0.5);

    const subtitleText = this.add.text(cx, 140, 'カードバトル', {
      fontSize: '28px',
      color: '#cc88ff',
      fontFamily: "'Noto Serif JP', serif",
    });
    subtitleText.setOrigin(0.5, 0.5);

    // Decorative line
    const gfx = this.add.graphics();
    gfx.lineStyle(2, 0x8800cc, 0.8);
    gfx.lineBetween(cx - 200, 165, cx + 200, 165);

    // Select hero text
    const selectFuri = this.add.text(cx, 190, 'きゃらくたーをえらんでください', {
      fontSize: '11px',
      color: '#aaaaaa',
      fontFamily: "'Noto Serif JP', serif",
    });
    selectFuri.setOrigin(0.5, 0.5);

    const selectText = this.add.text(cx, 210, 'キャラクターを選んでください', {
      fontSize: '16px',
      color: '#ffffff',
      fontFamily: "'Noto Serif JP', serif",
    });
    selectText.setOrigin(0.5, 0.5);

    // Yuji button
    this.createCharacterButton(
      cx - 150, 330,
      '虎杖悠仁',
      'いたどりゆうじ',
      'Yuji Itadori',
      '攻撃特化デッキ\nHP: 30 / 呪力: 10\n超人的肉体と黒閃で\n相手を圧倒する！',
      0xcc4400,
      0xff6600,
      'yuji'
    );

    // Megumi button
    this.createCharacterButton(
      cx + 150, 330,
      '伏黒恵',
      'ふしぐろめぐみ',
      'Megumi Fushiguro',
      '術式駆使デッキ\nHP: 30 / 呪力: 10\n十種影法術で\n多彩な戦術を駆使！',
      0x004488,
      0x0066cc,
      'megumi'
    );

    // Version text
    this.add.text(cx, height - 20, 'プロトタイプ v1.0 — ローカルプレイ（対AI）', {
      fontSize: '10px',
      color: '#555555',
      fontFamily: "'Noto Sans JP', monospace",
    }).setOrigin(0.5, 0.5);
  }

  private createCharacterButton(
    x: number, y: number,
    nameJa: string, nameFuri: string, nameEn: string,
    deckDesc: string,
    bgColor: number, borderColor: number,
    choice: 'yuji' | 'megumi'
  ): void {
    const cardW = 220;
    const cardH = 240;

    const bg = this.add.rectangle(x, y, cardW, cardH, bgColor, 0.3);
    bg.setInteractive({ useHandCursor: true });

    const border = this.add.graphics();
    border.lineStyle(2, borderColor, 1);
    border.strokeRect(x - cardW / 2, y - cardH / 2, cardW, cardH);

    // Character furigana
    this.add.text(x, y - cardH / 2 + 18, nameFuri, {
      fontSize: '11px',
      color: '#aaaaaa',
      fontFamily: "'Noto Serif JP', serif",
    }).setOrigin(0.5, 0.5);

    // Character name
    this.add.text(x, y - cardH / 2 + 38, nameJa, {
      fontSize: '28px',
      color: '#ffffff',
      fontFamily: "'Noto Serif JP', serif",
      fontStyle: 'bold',
    }).setOrigin(0.5, 0.5);

    // English name
    this.add.text(x, y - cardH / 2 + 64, nameEn, {
      fontSize: '11px',
      color: '#aaaaaa',
      fontFamily: "'Noto Sans JP', sans-serif",
    }).setOrigin(0.5, 0.5);

    // Deck description
    this.add.text(x, y, deckDesc, {
      fontSize: '13px',
      color: '#dddddd',
      fontFamily: "'Noto Serif JP', serif",
      align: 'center',
      lineSpacing: 4,
    }).setOrigin(0.5, 0.5);

    // Play button
    const btnY = y + cardH / 2 - 28;
    const btn = this.add.rectangle(x, btnY, cardW - 20, 36, borderColor, 0.8);
    btn.setInteractive({ useHandCursor: true });

    const btnFuri = this.add.text(x, btnY - 8, 'このかーどでたたかう', {
      fontSize: '9px',
      color: '#ffffff88',
      fontFamily: "'Noto Serif JP', serif",
    }).setOrigin(0.5, 0.5);

    const btnText = this.add.text(x, btnY + 4, 'このカードで戦う！', {
      fontSize: '14px',
      color: '#ffffff',
      fontFamily: "'Noto Serif JP', serif",
      fontStyle: 'bold',
    }).setOrigin(0.5, 0.5);

    // Hover effects
    const hoverOn = (): void => {
      this.tweens.add({ targets: [bg, border], alpha: 1, duration: 150 });
      btn.setFillStyle(borderColor, 1);
    };
    const hoverOff = (): void => {
      this.tweens.add({ targets: [bg, border], alpha: 0.8, duration: 150 });
    };
    const onClick = (): void => {
      this.cameras.main.fade(500, 0, 0, 0, false, (_: unknown, progress: number) => {
        if (progress === 1) {
          this.scene.start('GameScene', { playerChoice: choice });
        }
      });
    };

    bg.on('pointerover', hoverOn);
    bg.on('pointerout', hoverOff);
    bg.on('pointerdown', onClick);
    btn.on('pointerover', hoverOn);
    btn.on('pointerout', hoverOff);
    btn.on('pointerdown', onClick);
  }

  private createBackgroundEffects(width: number, height: number): void {
    // Subtle particle-like dots
    for (let i = 0; i < 30; i++) {
      const x = Phaser.Math.Between(0, width);
      const y = Phaser.Math.Between(0, height);
      const r = Phaser.Math.Between(1, 3);
      const dot = this.add.circle(x, y, r, 0x6600aa, 0.3);
      this.tweens.add({
        targets: dot,
        alpha: { from: 0.1, to: 0.6 },
        y: y - Phaser.Math.Between(20, 80),
        duration: Phaser.Math.Between(2000, 5000),
        repeat: -1,
        yoyo: true,
        delay: Phaser.Math.Between(0, 2000),
      });
    }
  }
}
