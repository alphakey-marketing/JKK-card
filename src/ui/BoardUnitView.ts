import Phaser from 'phaser';
import { BoardUnit } from '../game/GameState';

export const UNIT_WIDTH = 90;
export const UNIT_HEIGHT = 105;

const FACTION_COLORS: Record<string, number> = {
  TOKYO: 0x1a2a3a,
  KYOTO: 0x2a1a3a,
  SPECIAL_GRADE: 0x2a1a2a,
  CURSED_SPIRIT: 0x1a2a1a,
  NEUTRAL: 0x1a1a1a,
};

const FACTION_BORDER: Record<string, number> = {
  TOKYO: 0x4488cc,
  KYOTO: 0x8844cc,
  SPECIAL_GRADE: 0xcc44cc,
  CURSED_SPIRIT: 0x44cc44,
  NEUTRAL: 0x888888,
};

/**
 * フィールドユニット表示コンポーネント
 */
export class BoardUnitView extends Phaser.GameObjects.Container {
  public unit: BoardUnit;
  private bg: Phaser.GameObjects.Rectangle;
  private exhaustedOverlay: Phaser.GameObjects.Rectangle;
  private borderGfx: Phaser.GameObjects.Graphics;
  private attackText: Phaser.GameObjects.Text;
  private hpText: Phaser.GameObjects.Text;
  private nameText: Phaser.GameObjects.Text;
  private furiText: Phaser.GameObjects.Text;
  public isSelected = false;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    unit: BoardUnit,
    interactive = false
  ) {
    super(scene, x, y);
    this.unit = unit;

    const faction = unit.card.faction ?? 'NEUTRAL';
    const bgColor = FACTION_COLORS[faction] ?? 0x1a1a1a;
    const borderColor = FACTION_BORDER[faction] ?? 0x888888;

    const hw = UNIT_WIDTH / 2;
    const hh = UNIT_HEIGHT / 2;

    // Background
    this.bg = scene.add.rectangle(0, 0, UNIT_WIDTH, UNIT_HEIGHT, bgColor);
    this.bg.setOrigin(0.5, 0.5);
    this.add(this.bg);

    // Border
    this.borderGfx = scene.add.graphics();
    this.borderGfx.lineStyle(2, borderColor, 1);
    this.borderGfx.strokeRect(-hw, -hh, UNIT_WIDTH, UNIT_HEIGHT);
    this.add(this.borderGfx);

    // Furigana
    this.furiText = scene.add.text(0, -hh + 5, unit.card.nameFurigana, {
      fontSize: '9px',
      color: '#aaaaaa',
      fontFamily: "'Noto Serif JP', serif",
    });
    this.furiText.setOrigin(0.5, 0);
    this.add(this.furiText);

    // Name
    this.nameText = scene.add.text(0, -hh + 14, unit.card.nameJa, {
      fontSize: '13px',
      color: '#ffffff',
      fontFamily: "'Noto Serif JP', serif",
      fontStyle: 'bold',
      wordWrap: { width: UNIT_WIDTH - 8 },
    });
    this.nameText.setOrigin(0.5, 0);
    this.add(this.nameText);

    // Divider
    const div = scene.add.graphics();
    div.lineStyle(1, 0x444444, 0.8);
    div.lineBetween(-hw + 4, -hh + 45, hw - 4, -hh + 45);
    this.add(div);

    // Card type badge
    const typeLabel = scene.add.text(0, -hh + 49, this.getTypeLabel(unit.card.type as string, unit.hasTaunt), {
      fontSize: '10px',
      color: '#aaaaaa',
      fontFamily: "'Noto Serif JP', serif",
    });
    typeLabel.setOrigin(0.5, 0);
    this.add(typeLabel);

    // Attack (bottom-left)
    this.attackText = scene.add.text(-hw + 6, hh - 8, String(unit.attack), {
      fontSize: '18px',
      color: '#ff9900',
      fontFamily: "'Noto Sans JP', monospace",
      fontStyle: 'bold',
    });
    this.attackText.setOrigin(0, 1);
    this.add(this.attackText);

    // Attack label
    const atkLabel = scene.add.text(-hw + 6, hh - 22, '攻', {
      fontSize: '10px',
      color: '#ff9900',
      fontFamily: "'Noto Serif JP', serif",
    });
    atkLabel.setOrigin(0, 1);
    this.add(atkLabel);

    // HP (bottom-right)
    this.hpText = scene.add.text(hw - 6, hh - 8, String(unit.currentHp), {
      fontSize: '18px',
      color: '#00ff88',
      fontFamily: "'Noto Sans JP', monospace",
      fontStyle: 'bold',
    });
    this.hpText.setOrigin(1, 1);
    this.add(this.hpText);

    // HP label
    const hpLabel = scene.add.text(hw - 6, hh - 22, 'HP', {
      fontSize: '10px',
      color: '#00ff88',
      fontFamily: "'Noto Serif JP', serif",
    });
    hpLabel.setOrigin(1, 1);
    this.add(hpLabel);

    // Exhausted overlay
    this.exhaustedOverlay = scene.add.rectangle(0, 0, UNIT_WIDTH, UNIT_HEIGHT, 0x000000, 0);
    this.exhaustedOverlay.setOrigin(0.5, 0.5);
    this.add(this.exhaustedOverlay);

    if (interactive) {
      this.setInteractive(
        new Phaser.Geom.Rectangle(-hw, -hh, UNIT_WIDTH, UNIT_HEIGHT),
        Phaser.Geom.Rectangle.Contains
      );
    }

    scene.add.existing(this);
    this.updateStats();
  }

  private getTypeLabel(type: string, hasTaunt = false): string {
    const tauntStr = hasTaunt ? '【挑発】' : '';
    switch (type) {
      case 'SORCERER': return `呪術師${tauntStr}`;
      default: return tauntStr;
    }
  }

  updateStats(): void {
    this.attackText.setText(String(this.unit.attack));
    this.hpText.setText(String(this.unit.currentHp));
    this.exhaustedOverlay.setAlpha(this.unit.isExhausted ? 0.55 : 0);

    const maxHp = this.unit.card.hp || 10;
    const ratio = this.unit.currentHp / maxHp;
    if (ratio > 0.5) {
      this.hpText.setColor('#00ff88');
    } else if (ratio > 0.25) {
      this.hpText.setColor('#ffaa00');
    } else {
      this.hpText.setColor('#ff4444');
    }
  }

  setSelected(selected: boolean): void {
    this.isSelected = selected;
    this.borderGfx.clear();
    if (selected) {
      this.borderGfx.lineStyle(3, 0xffff00, 1);
      this.borderGfx.strokeRect(-UNIT_WIDTH / 2, -UNIT_HEIGHT / 2, UNIT_WIDTH, UNIT_HEIGHT);
    } else {
      const faction = this.unit.card.faction ?? 'NEUTRAL';
      const borderColor = FACTION_BORDER[faction] ?? 0x888888;
      this.borderGfx.lineStyle(2, borderColor, 1);
      this.borderGfx.strokeRect(-UNIT_WIDTH / 2, -UNIT_HEIGHT / 2, UNIT_WIDTH, UNIT_HEIGHT);
    }
  }

  setAttackReady(ready: boolean): void {
    if (!this.isSelected) {
      this.borderGfx.clear();
      const faction = this.unit.card.faction ?? 'NEUTRAL';
      const baseColor = FACTION_BORDER[faction] ?? 0x888888;
      const color = ready ? 0x00ff88 : baseColor;
      this.borderGfx.lineStyle(ready ? 2 : 2, color, 1);
      this.borderGfx.strokeRect(-UNIT_WIDTH / 2, -UNIT_HEIGHT / 2, UNIT_WIDTH, UNIT_HEIGHT);
    }
  }
}
