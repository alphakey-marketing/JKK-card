import Phaser from 'phaser';
import { DeckCard } from '../data/decks';
import { CardType } from '../data/cards';
import { cardTypeLabel, wrapText } from '../utils/furigana';

export const CARD_WIDTH = 110;
export const CARD_HEIGHT = 160;

/**
 * カードビュー - テキストベースのプレースホルダーカード表示
 */
export class CardView extends Phaser.GameObjects.Container {
  private bg: Phaser.GameObjects.Rectangle;
  private borderGfx: Phaser.GameObjects.Graphics;
  private nameText: Phaser.GameObjects.Text;
  private furiText: Phaser.GameObjects.Text;
  private typeText: Phaser.GameObjects.Text;
  private costText: Phaser.GameObjects.Text;
  private powerText: Phaser.GameObjects.Text;
  private effectText: Phaser.GameObjects.Text;
  private glowTween: Phaser.Tweens.Tween | null = null;

  public card: DeckCard;
  public isPlayable = false;
  public isSelected = false;

  constructor(scene: Phaser.Scene, x: number, y: number, card: DeckCard, interactive = false) {
    super(scene, x, y);
    this.card = card;

    const typeInfo = cardTypeLabel(card.type);

    // Background color by type
    const bgColors: Record<string, number> = {
      SORCERER: 0x1a1a3a,
      TECHNIQUE: 0x0a2a1a,
      DOMAIN: 0x2a0a0a,
    };
    const borderColors: Record<string, number> = {
      SORCERER: 0xFFD700,
      TECHNIQUE: 0x00BFFF,
      DOMAIN: 0xFF4500,
    };

    const bgColor = bgColors[card.type] ?? 0x1a1a1a;
    const borderColor = borderColors[card.type] ?? 0x888888;

    // Background
    this.bg = scene.add.rectangle(0, 0, CARD_WIDTH, CARD_HEIGHT, bgColor);
    this.bg.setOrigin(0.5, 0.5);
    this.add(this.bg);

    // Border
    this.borderGfx = scene.add.graphics();
    this.drawBorder(borderColor, 2);
    this.add(this.borderGfx);

    const halfW = CARD_WIDTH / 2;
    const halfH = CARD_HEIGHT / 2;

    // Type badge
    this.typeText = scene.add.text(-halfW + 4, -halfH + 4, typeInfo.ja, {
      fontSize: '9px',
      color: typeInfo.color,
      fontFamily: "'Noto Serif JP', serif",
    });
    this.add(this.typeText);

    // Cost badge (top right)
    this.costText = scene.add.text(halfW - 4, -halfH + 4, `呪:${card.cost}`, {
      fontSize: '9px',
      color: '#FFCC00',
      fontFamily: "'Noto Sans JP', monospace",
    });
    this.costText.setOrigin(1, 0);
    this.add(this.costText);

    // Card name (furigana style: small text above main)
    this.furiText = scene.add.text(0, -halfH + 20, card.nameFurigana, {
      fontSize: '8px',
      color: '#cccccc',
      fontFamily: "'Noto Serif JP', serif",
    });
    this.furiText.setOrigin(0.5, 0);
    this.add(this.furiText);

    this.nameText = scene.add.text(0, -halfH + 30, card.nameJa, {
      fontSize: '14px',
      color: '#ffffff',
      fontFamily: "'Noto Serif JP', serif",
      fontStyle: 'bold',
    });
    this.nameText.setOrigin(0.5, 0);
    this.add(this.nameText);

    // Divider line
    const divLine = scene.add.graphics();
    divLine.lineStyle(1, 0x444444, 1);
    divLine.lineBetween(-halfW + 5, -halfH + 52, halfW - 5, -halfH + 52);
    this.add(divLine);

    // Stats row (power / defense / hp)
    const statsY = -halfH + 58;
    if (card.type === CardType.SORCERER) {
      this.powerText = scene.add.text(0, statsY, `攻:${card.power}  防:${card.defense}  HP:${card.hp}`, {
        fontSize: '9px',
        color: '#aaffaa',
        fontFamily: "'Noto Sans JP', monospace",
      });
      this.powerText.setOrigin(0.5, 0);
    } else {
      this.powerText = scene.add.text(0, statsY, `威力: ${card.effect.value}`, {
        fontSize: '10px',
        color: '#aaffaa',
        fontFamily: "'Noto Sans JP', monospace",
      });
      this.powerText.setOrigin(0.5, 0);
    }
    this.add(this.powerText);

    // Effect description
    const effectLines = wrapText(card.effect.descriptionJa, 10);
    this.effectText = scene.add.text(0, statsY + 18, effectLines.join('\n'), {
      fontSize: '9px',
      color: '#ddddff',
      fontFamily: "'Noto Serif JP', serif",
      align: 'center',
    });
    this.effectText.setOrigin(0.5, 0);
    this.add(this.effectText);

    // Flavor text
    const flavorLines = wrapText(card.flavorTextJa, 10);
    const flavorY = halfH - 32;
    const flavorObj = scene.add.text(0, flavorY, flavorLines.join('\n'), {
      fontSize: '8px',
      color: '#888888',
      fontFamily: "'Noto Serif JP', serif",
      align: 'center',
    });
    flavorObj.setOrigin(0.5, 1);
    this.add(flavorObj);

    if (interactive) {
      this.setInteractive(
        new Phaser.Geom.Rectangle(-halfW, -halfH, CARD_WIDTH, CARD_HEIGHT),
        Phaser.Geom.Rectangle.Contains
      );
    }

    scene.add.existing(this);
  }

  private drawBorder(color: number, width: number): void {
    const halfW = CARD_WIDTH / 2;
    const halfH = CARD_HEIGHT / 2;
    this.borderGfx.clear();
    this.borderGfx.lineStyle(width, color, 1);
    this.borderGfx.strokeRect(-halfW, -halfH, CARD_WIDTH, CARD_HEIGHT);
  }

  setPlayable(playable: boolean): void {
    this.isPlayable = playable;
    if (playable) {
      this.drawBorder(0x00ff88, 2);
      if (!this.glowTween) {
        this.glowTween = this.scene.tweens.add({
          targets: this,
          y: this.y - 8,
          duration: 600,
          yoyo: true,
          repeat: -1,
          ease: 'Sine.easeInOut',
        });
      }
    } else {
      const borderColors: Record<string, number> = {
        SORCERER: 0xFFD700,
        TECHNIQUE: 0x00BFFF,
        DOMAIN: 0xFF4500,
      };
      this.drawBorder(borderColors[this.card.type] ?? 0x888888, 2);
      if (this.glowTween) {
        this.glowTween.stop();
        this.glowTween = null;
      }
    }
  }

  setSelected(selected: boolean): void {
    this.isSelected = selected;
    if (selected) {
      this.drawBorder(0xffff00, 3);
      this.scene.tweens.add({
        targets: this,
        scaleX: 1.08,
        scaleY: 1.08,
        duration: 150,
        ease: 'Power2',
      });
    } else {
      this.setPlayable(this.isPlayable);
      this.scene.tweens.add({
        targets: this,
        scaleX: 1,
        scaleY: 1,
        duration: 150,
        ease: 'Power2',
      });
    }
  }

  destroy(fromScene?: boolean): void {
    if (this.glowTween) {
      this.glowTween.stop();
    }
    super.destroy(fromScene);
  }
}
