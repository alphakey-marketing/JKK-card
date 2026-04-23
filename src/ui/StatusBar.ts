import Phaser from 'phaser';
import { PlayerState } from '../game/GameState';
import { HERO_POWERS } from '../data/cards';

/**
 * プレイヤーのステータスバー表示
 */
export class StatusBar extends Phaser.GameObjects.Container {
  private nameFuriText: Phaser.GameObjects.Text;
  private nameMainText: Phaser.GameObjects.Text;
  private hpBar: Phaser.GameObjects.Rectangle;
  private hpBarBg: Phaser.GameObjects.Rectangle;
  private hpText: Phaser.GameObjects.Text;
  private energyBar: Phaser.GameObjects.Rectangle;
  private energyBarBg: Phaser.GameObjects.Rectangle;
  private energyText: Phaser.GameObjects.Text;
  private shieldText: Phaser.GameObjects.Text;
  private deckText: Phaser.GameObjects.Text;
  private handText: Phaser.GameObjects.Text;
  private heroPowerText: Phaser.GameObjects.Text;

  private readonly BAR_WIDTH = 160;
  private readonly BAR_HEIGHT = 14;

  constructor(scene: Phaser.Scene, x: number, y: number, player: PlayerState) {
    super(scene, x, y);

    // Name with furigana
    this.nameFuriText = scene.add.text(0, 0, player.nameFurigana, {
      fontSize: '10px',
      color: '#aaaaaa',
      fontFamily: "'Noto Serif JP', serif",
    });
    this.nameFuriText.setOrigin(0, 0);
    this.add(this.nameFuriText);

    this.nameMainText = scene.add.text(0, 12, player.nameJa, {
      fontSize: '18px',
      color: '#ffffff',
      fontFamily: "'Noto Serif JP', serif",
      fontStyle: 'bold',
    });
    this.nameMainText.setOrigin(0, 0);
    this.add(this.nameMainText);

    // HP Bar
    const hpLabel = scene.add.text(0, 36, 'HP', {
      fontSize: '11px',
      color: '#ff6666',
      fontFamily: "'Noto Sans JP', monospace",
    });
    this.add(hpLabel);

    this.hpBarBg = scene.add.rectangle(28, 42, this.BAR_WIDTH, this.BAR_HEIGHT, 0x440000);
    this.hpBarBg.setOrigin(0, 0.5);
    this.add(this.hpBarBg);

    this.hpBar = scene.add.rectangle(28, 42, this.BAR_WIDTH, this.BAR_HEIGHT, 0xff3333);
    this.hpBar.setOrigin(0, 0.5);
    this.add(this.hpBar);

    this.hpText = scene.add.text(28 + this.BAR_WIDTH / 2, 42, `${player.hp}/${player.maxHp}`, {
      fontSize: '10px',
      color: '#ffffff',
      fontFamily: "'Noto Sans JP', monospace",
    });
    this.hpText.setOrigin(0.5, 0.5);
    this.add(this.hpText);

    // Cursed Energy Bar
    const energyLabel = scene.add.text(0, 54, '呪力', {
      fontSize: '11px',
      color: '#6699ff',
      fontFamily: "'Noto Serif JP', serif",
    });
    this.add(energyLabel);

    this.energyBarBg = scene.add.rectangle(28, 60, this.BAR_WIDTH, this.BAR_HEIGHT, 0x001133);
    this.energyBarBg.setOrigin(0, 0.5);
    this.add(this.energyBarBg);

    this.energyBar = scene.add.rectangle(28, 60, this.BAR_WIDTH, this.BAR_HEIGHT, 0x3366ff);
    this.energyBar.setOrigin(0, 0.5);
    this.add(this.energyBar);

    this.energyText = scene.add.text(28 + this.BAR_WIDTH / 2, 60, `${player.cursedEnergy}/${player.maxCursedEnergy}`, {
      fontSize: '10px',
      color: '#ffffff',
      fontFamily: "'Noto Sans JP', monospace",
    });
    this.energyText.setOrigin(0.5, 0.5);
    this.add(this.energyText);

    // Shield & Deck info
    this.shieldText = scene.add.text(0, 74, `🛡 ${player.shield}`, {
      fontSize: '11px',
      color: '#88ffff',
      fontFamily: "'Noto Sans JP', monospace",
    });
    this.add(this.shieldText);

    this.deckText = scene.add.text(60, 74, `デッキ:${player.deck.length}`, {
      fontSize: '11px',
      color: '#aaaaaa',
      fontFamily: "'Noto Sans JP', monospace",
    });
    this.add(this.deckText);

    this.handText = scene.add.text(140, 74, `手札:${player.hand.length}`, {
      fontSize: '11px',
      color: '#aaaaaa',
      fontFamily: "'Noto Sans JP', monospace",
    });
    this.add(this.handText);

    // Hero power indicator
    const power = HERO_POWERS[player.heroId];
    const powerName = power ? power.nameJa : '—';
    this.heroPowerText = scene.add.text(0, 90, `必:${powerName}(2)`, {
      fontSize: '10px',
      color: '#cc88ff',
      fontFamily: "'Noto Serif JP', serif",
    });
    this.add(this.heroPowerText);

    scene.add.existing(this);
    this.update(player);
  }

  update(player: PlayerState): void {
    const hpRatio = Math.max(0, player.hp / player.maxHp);
    const energyRatio = Math.max(0, player.cursedEnergy / Math.max(1, player.maxCursedEnergy));

    this.hpBar.setScale(hpRatio, 1);
    this.hpText.setText(`${player.hp}/${player.maxHp}`);

    if (hpRatio > 0.5) {
      this.hpBar.setFillStyle(0x33cc33);
    } else if (hpRatio > 0.25) {
      this.hpBar.setFillStyle(0xffaa00);
    } else {
      this.hpBar.setFillStyle(0xff3333);
    }

    this.energyBar.setScale(energyRatio, 1);
    this.energyText.setText(`${player.cursedEnergy}/${player.maxCursedEnergy}`);

    this.shieldText.setText(`🛡 ${player.shield}`);
    this.deckText.setText(`デッキ:${player.deck.length}`);
    this.handText.setText(`手札:${player.hand.length}`);

    // Hero power availability
    const power = HERO_POWERS[player.heroId];
    const powerName = power ? power.nameJa : '—';
    if (player.heroPowerUsed) {
      this.heroPowerText.setText(`必:${powerName}（使用済）`);
      this.heroPowerText.setColor('#666666');
    } else if (player.cursedEnergy >= 2) {
      this.heroPowerText.setText(`必:${powerName}(2) ✓`);
      this.heroPowerText.setColor('#cc88ff');
    } else {
      this.heroPowerText.setText(`必:${powerName}(2)`);
      this.heroPowerText.setColor('#886699');
    }
  }
}
