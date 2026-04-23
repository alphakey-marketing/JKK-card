import Phaser from 'phaser';

/**
 * メニューシーン — 6キャラクター選択
 */
export class MenuScene extends Phaser.Scene {
  constructor() {
    super({ key: 'MenuScene' });
  }

  create(): void {
    const { width, height } = this.scale;
    const cx = width / 2;

    this.add.rectangle(cx, height / 2, width, height, 0x050510);
    this.createBackgroundEffects(width, height);

    // Title
    this.add.text(cx, 42, 'じゅじゅつかいせん', {
      fontSize: '13px', color: '#888888', fontFamily: "'Noto Serif JP', serif",
    }).setOrigin(0.5, 0.5);

    this.add.text(cx, 70, '呪術廻戦', {
      fontSize: '44px', color: '#ffffff', fontFamily: "'Noto Serif JP', serif",
      fontStyle: 'bold', stroke: '#8800cc', strokeThickness: 5,
    }).setOrigin(0.5, 0.5);

    this.add.text(cx, 104, 'かーどばとる', {
      fontSize: '11px', color: '#888888', fontFamily: "'Noto Serif JP', serif",
    }).setOrigin(0.5, 0.5);

    this.add.text(cx, 120, 'カードバトル', {
      fontSize: '22px', color: '#cc88ff', fontFamily: "'Noto Serif JP', serif",
    }).setOrigin(0.5, 0.5);

    const gfx = this.add.graphics();
    gfx.lineStyle(2, 0x8800cc, 0.8);
    gfx.lineBetween(cx - 240, 142, cx + 240, 142);

    this.add.text(cx, 158, 'ろくにんのきゃらくたーからえらんでください', {
      fontSize: '10px', color: '#aaaaaa', fontFamily: "'Noto Serif JP', serif",
    }).setOrigin(0.5, 0.5);

    this.add.text(cx, 173, '６人のキャラクターから選んでください', {
      fontSize: '14px', color: '#ffffff', fontFamily: "'Noto Serif JP', serif",
    }).setOrigin(0.5, 0.5);

    // 6 character buttons in 2 rows × 3 columns
    const btnW = 180;
    const btnH = 190;
    const colGap = 14;
    const rowGap = 12;
    const row1Y = 280;
    const row2Y = row1Y + btnH + rowGap;
    const startX = (width - btnW * 3 - colGap * 2) / 2 + btnW / 2;

    const chars = [
      {
        choice: 'yuji' as const,
        nameJa: '虎杖悠仁', nameFuri: 'いたどりゆうじ', nameEn: 'Yuji Itadori',
        desc: '攻撃特化デッキ\n超人的肉体と黒閃で圧倒！',
        bg: 0xcc3300, border: 0xff6600,
      },
      {
        choice: 'megumi' as const,
        nameJa: '伏黒恵', nameFuri: 'ふしぐろめぐみ', nameEn: 'Megumi Fushiguro',
        desc: '術式駆使デッキ\n十種影法術で多彩な戦術！',
        bg: 0x004488, border: 0x0088cc,
      },
      {
        choice: 'nobara' as const,
        nameJa: '釘崎野薔薇', nameFuri: 'くぎさきのばら', nameEn: 'Nobara Kugisaki',
        desc: '縛り特化デッキ\n釘と藁人形で全体攻撃！',
        bg: 0x993366, border: 0xff44aa,
      },
      {
        choice: 'gojo' as const,
        nameJa: '五条悟', nameFuri: 'ごじょうさとる', nameEn: 'Satoru Gojo',
        desc: '最強クラスデッキ\n無限と領域展開で圧倒！',
        bg: 0x440088, border: 0xaa44ff,
      },
      {
        choice: 'nanami' as const,
        nameJa: '七海建人', nameFuri: 'ななみけんと', nameEn: 'Kento Nanami',
        desc: '精密打撃デッキ\n七対三の理で急所を狙え！',
        bg: 0x443300, border: 0xcc9933,
      },
      {
        choice: 'toge' as const,
        nameJa: '狗巻棘', nameFuri: 'いぬまきとげ', nameEn: 'Toge Inumaki',
        desc: '呪言縛りデッキ\n言葉で敵を縛り倒す！',
        bg: 0x002233, border: 0x00aabb,
      },
    ];

    chars.forEach((ch, i) => {
      const col = i % 3;
      const row = Math.floor(i / 3);
      const x = startX + col * (btnW + colGap);
      const y = row === 0 ? row1Y : row2Y;
      this.createCharacterButton(x, y, btnW, btnH, ch.nameJa, ch.nameFuri, ch.nameEn, ch.desc, ch.bg, ch.border, ch.choice);
    });

    // Deck Builder button
    const dbBtnY = height - 42;
    const dbBtn = this.add.rectangle(cx, dbBtnY, 200, 34, 0x222222, 0.9);
    dbBtn.setInteractive({ useHandCursor: true });
    const dbGfx = this.add.graphics();
    dbGfx.lineStyle(2, 0xaaaaaa, 1);
    dbGfx.strokeRect(cx - 100, dbBtnY - 17, 200, 34);

    this.add.text(cx, dbBtnY - 5, 'でっきびるだー', {
      fontSize: '9px', color: '#888888', fontFamily: "'Noto Serif JP', serif",
    }).setOrigin(0.5, 0.5);
    this.add.text(cx, dbBtnY + 6, 'デッキビルダー', {
      fontSize: '14px', color: '#cccccc', fontFamily: "'Noto Serif JP', serif",
    }).setOrigin(0.5, 0.5);

    dbBtn.on('pointerover', () => { dbBtn.setFillStyle(0x444444, 1); });
    dbBtn.on('pointerout', () => { dbBtn.setFillStyle(0x222222, 0.9); });
    dbBtn.on('pointerdown', () => {
      this.cameras.main.fade(400, 0, 0, 0, false, (_: unknown, progress: number) => {
        if (progress === 1) this.scene.start('DeckBuilderScene');
      });
    });

    this.add.text(cx, height - 10, 'プロトタイプ v2.0 — ローカルプレイ（対AI）', {
      fontSize: '10px', color: '#555555', fontFamily: "'Noto Sans JP', monospace",
    }).setOrigin(0.5, 0.5);
  }

  private createCharacterButton(
    x: number, y: number, cardW: number, cardH: number,
    nameJa: string, nameFuri: string, nameEn: string,
    deckDesc: string,
    bgColor: number, borderColor: number,
    choice: 'yuji' | 'megumi' | 'nobara' | 'gojo' | 'nanami' | 'toge'
  ): void {
    const bg = this.add.rectangle(x, y, cardW, cardH, bgColor, 0.25);
    bg.setInteractive({ useHandCursor: true });

    const border = this.add.graphics();
    border.lineStyle(2, borderColor, 1);
    border.strokeRect(x - cardW / 2, y - cardH / 2, cardW, cardH);

    this.add.text(x, y - cardH / 2 + 14, nameFuri, {
      fontSize: '10px', color: '#aaaaaa', fontFamily: "'Noto Serif JP', serif",
    }).setOrigin(0.5, 0.5);

    this.add.text(x, y - cardH / 2 + 34, nameJa, {
      fontSize: nameJa.length <= 4 ? '22px' : '16px',
      color: '#ffffff', fontFamily: "'Noto Serif JP', serif", fontStyle: 'bold',
    }).setOrigin(0.5, 0.5);

    this.add.text(x, y - cardH / 2 + 54, nameEn, {
      fontSize: '9px', color: '#aaaaaa', fontFamily: "'Noto Sans JP', sans-serif",
    }).setOrigin(0.5, 0.5);

    this.add.text(x, y + 8, deckDesc, {
      fontSize: '11px', color: '#dddddd', fontFamily: "'Noto Serif JP', serif",
      align: 'center', lineSpacing: 4,
    }).setOrigin(0.5, 0.5);

    const btnY = y + cardH / 2 - 22;
    const btn = this.add.rectangle(x, btnY, cardW - 14, 28, borderColor, 0.7);
    btn.setInteractive({ useHandCursor: true });

    this.add.text(x, btnY - 6, 'このかーどでたたかう', {
      fontSize: '8px', color: '#ffffff88', fontFamily: "'Noto Serif JP', serif",
    }).setOrigin(0.5, 0.5);

    this.add.text(x, btnY + 5, 'このカードで戦う！', {
      fontSize: '11px', color: '#ffffff', fontFamily: "'Noto Serif JP', serif", fontStyle: 'bold',
    }).setOrigin(0.5, 0.5);

    const hoverOn = (): void => {
      this.tweens.add({ targets: bg, alpha: 0.6, duration: 150 });
      btn.setFillStyle(borderColor, 1);
    };
    const hoverOff = (): void => {
      this.tweens.add({ targets: bg, alpha: 0.25, duration: 150 });
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
        repeat: -1, yoyo: true,
        delay: Phaser.Math.Between(0, 2000),
      });
    }
  }
}
