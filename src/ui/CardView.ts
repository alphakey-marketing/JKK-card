import Phaser from 'phaser';
import { DeckCard } from '../data/decks';
import { CardType, Keyword } from '../data/cards';
import { cardTypeLabel, wrapText } from '../utils/furigana';

export const CARD_WIDTH = 110;
export const CARD_HEIGHT = 160;

/**
 * カードビュー - テキストベースのプレースホルダーカード表示
 */
export class CardView extends Phaser.GameObjects.Container {
  private glowRect: Phaser.GameObjects.Rectangle;
  private bg: Phaser.GameObjects.Rectangle;
  private borderGfx: Phaser.GameObjects.Graphics;
  private nameText: Phaser.GameObjects.Text;
  private glowTween: Phaser.Tweens.Tween | null = null;

  public card: DeckCard;
  public isPlayable = false;
  public isSelected = false;

  constructor(scene: Phaser.Scene, x: number, y: number, card: DeckCard, interactive = false) {
    super(scene, x, y);
    this.card = card;

    const typeInfo = cardTypeLabel(card.type);

    // Background colour by card type
    const bgColors: Record<string, number> = {
      SORCERER: 0x1a1a3a,
      TECHNIQUE: 0x0a2a1a,
      DOMAIN: 0x2a0a0a,
      BINDING_VOW: 0x2a0a18,
      CURSED_OBJECT: 0x1a0a2a,
    };
    const borderColors: Record<string, number> = {
      SORCERER: 0xFFD700,
      TECHNIQUE: 0x00BFFF,
      DOMAIN: 0xFF4500,
      BINDING_VOW: 0xFF69B4,
      CURSED_OBJECT: 0x9370DB,
    };
    // Slightly lighter shade used for the art strip
    const artColors: Record<string, number> = {
      SORCERER: 0x2a2a5a,
      TECHNIQUE: 0x0e3a26,
      DOMAIN: 0x3a1212,
      BINDING_VOW: 0x3a1228,
      CURSED_OBJECT: 0x281040,
    };

    const bgColor = bgColors[card.type] ?? 0x1a1a1a;
    const borderColor = borderColors[card.type] ?? 0x888888;
    const artColor = artColors[card.type] ?? 0x222222;

    const halfW = CARD_WIDTH / 2;
    const halfH = CARD_HEIGHT / 2;

    // ── Outer glow rect (behind bg, extends 3 px per side) ──────────
    // Pulses alpha when the card is playable, replacing the old y-bob tween.
    this.glowRect = scene.add.rectangle(0, 0, CARD_WIDTH + 6, CARD_HEIGHT + 6, borderColor);
    this.glowRect.setOrigin(0.5, 0.5);
    this.glowRect.setAlpha(0);
    this.add(this.glowRect);

    // Background
    this.bg = scene.add.rectangle(0, 0, CARD_WIDTH, CARD_HEIGHT, bgColor);
    this.bg.setOrigin(0.5, 0.5);
    this.add(this.bg);

    // Border
    this.borderGfx = scene.add.graphics();
    this.drawBorder(borderColor, 2);
    this.add(this.borderGfx);

    // ── Layout constants ─────────────────────────────────────────────
    // y=-halfH+4  : type badge / cost
    // y=-halfH+17 : furigana
    // y=-halfH+27 : name (13 px bold)
    // art strip   : center y=-halfH+50 (height 22 px)
    // y=-halfH+64 : divider line
    // y=-halfH+70 : stats (statsY)
    // effectText  : statsY + offset (capped to 2 lines)

    // Type badge (top-left)
    const typeText = scene.add.text(-halfW + 4, -halfH + 4, typeInfo.ja, {
      fontSize: '13px',
      color: typeInfo.color,
      fontFamily: "'Noto Serif JP', serif",
    });
    this.add(typeText);

    // Cost badge (top-right)
    const costText = scene.add.text(halfW - 4, -halfH + 4, `呪:${card.cost}`, {
      fontSize: '13px',
      color: '#FFCC00',
      fontFamily: "'Noto Sans JP', monospace",
    });
    costText.setOrigin(1, 0);
    this.add(costText);

    // Furigana
    const furiText = scene.add.text(0, -halfH + 17, card.nameFurigana, {
      fontSize: '10px',
      color: '#cccccc',
      fontFamily: "'Noto Serif JP', serif",
    });
    furiText.setOrigin(0.5, 0);
    this.add(furiText);

    // Card name
    this.nameText = scene.add.text(0, -halfH + 27, card.nameJa, {
      fontSize: '13px',
      color: '#ffffff',
      fontFamily: "'Noto Serif JP', serif",
      fontStyle: 'bold',
    });
    this.nameText.setOrigin(0.5, 0);
    this.add(this.nameText);

    // ── Art strip (card-type colour placeholder) ─────────────────────
    const artCenterY = -halfH + 50;
    const artRect = scene.add.rectangle(0, artCenterY, CARD_WIDTH - 10, 22, artColor);
    artRect.setOrigin(0.5, 0.5);
    artRect.setStrokeStyle(1, borderColor, 0.4);
    this.add(artRect);

    // Divider line
    const divLine = scene.add.graphics();
    divLine.lineStyle(1, 0x444444, 1);
    divLine.lineBetween(-halfW + 5, -halfH + 64, halfW - 5, -halfH + 64);
    this.add(divLine);

    // ── Stats ────────────────────────────────────────────────────────
    const statsY = -halfH + 70;

    if (card.type === CardType.SORCERER) {
      // Three coloured columns: ATK | DEF | HP
      const colPositions = [-35, 0, 35];
      const labels = ['攻', '防', 'HP'];
      const values = [String(card.power), String(card.defense), String(card.hp)];
      const colours = ['#ff6666', '#4488ff', '#00cc66'];

      colPositions.forEach((cx, idx) => {
        const lbl = scene.add.text(cx, statsY, labels[idx], {
          fontSize: '10px', color: colours[idx], fontFamily: "'Noto Serif JP', serif",
        });
        lbl.setOrigin(0.5, 0);
        this.add(lbl);

        const val = scene.add.text(cx, statsY + 11, values[idx], {
          fontSize: '12px', color: colours[idx], fontFamily: "'Noto Sans JP', monospace", fontStyle: 'bold',
        });
        val.setOrigin(0.5, 0);
        this.add(val);
      });
    } else {
      const powerText = scene.add.text(0, statsY, `威力: ${card.effect.value}`, {
        fontSize: '12px',
        color: '#aaffaa',
        fontFamily: "'Noto Sans JP', monospace",
      });
      powerText.setOrigin(0.5, 0);
      this.add(powerText);
    }

    // ── Effect description (capped to 2 lines) ───────────────────────
    const wrapWidth = Math.floor((CARD_WIDTH - 10) / 9);
    const allEffectLines = wrapText(card.effect.descriptionJa, wrapWidth);
    const cappedLines = allEffectLines.slice(0, 2);
    if (allEffectLines.length > 2) {
      const last = cappedLines[cappedLines.length - 1];
      cappedLines[cappedLines.length - 1] =
        last.length >= wrapWidth - 1 ? last.slice(0, wrapWidth - 2) + '…' : last + '…';
    }

    const effectStartY = card.type === CardType.SORCERER ? statsY + 24 : statsY + 16;
    const effectText = scene.add.text(0, effectStartY, cappedLines.join('\n'), {
      fontSize: '11px',
      color: '#ddddff',
      fontFamily: "'Noto Serif JP', serif",
      align: 'center',
    });
    effectText.setOrigin(0.5, 0);
    this.add(effectText);

    // Keyword badges
    if (card.keywords && card.keywords.length > 0) {
      const kwLabels: Record<string, string> = {
        [Keyword.TAUNT]: '【挑発】',
        [Keyword.RUSH]: '【突撃】',
        [Keyword.LIFESTEAL]: '【吸収】',
        [Keyword.BINDING]: '【縛り】',
        [Keyword.CURSED_SURGE]: '【呪力増幅】',
      };
      const kwText = card.keywords.map(k => kwLabels[k] ?? k).join(' ');
      const kwObj = scene.add.text(0, effectStartY + cappedLines.length * 14 + 4, kwText, {
        fontSize: '9px',
        color: '#ffcc44',
        fontFamily: "'Noto Serif JP', serif",
        align: 'center',
      });
      kwObj.setOrigin(0.5, 0);
      this.add(kwObj);
    }

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
        this.glowRect.setFillStyle(0x00ff88);
        this.glowRect.setAlpha(0);
        this.glowTween = this.scene.tweens.add({
          targets: this.glowRect,
          alpha: 0.3,
          duration: 700,
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
        BINDING_VOW: 0xFF69B4,
        CURSED_OBJECT: 0x9370DB,
      };
      this.drawBorder(borderColors[this.card.type] ?? 0x888888, 2);
      if (this.glowTween) {
        this.glowTween.stop();
        this.glowTween = null;
        this.glowRect.setAlpha(0);
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

  setAffordable(affordable: boolean): void {
    if (!this.isSelected && !this.isPlayable) {
      if (!affordable) {
        this.bg.setAlpha(0.5);
        this.setAlpha(0.7);
      } else {
        this.bg.setAlpha(1);
        this.setAlpha(1);
      }
    }
  }

  destroy(fromScene?: boolean): void {
    if (this.glowTween) {
      this.glowTween.stop();
    }
    super.destroy(fromScene);
  }
}
