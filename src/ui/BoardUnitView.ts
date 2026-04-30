import Phaser from 'phaser';
import { BoardUnit } from '../game/GameState';

export const UNIT_WIDTH = 100;
export const UNIT_HEIGHT = 115;

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
  private borderGfx: Phaser.GameObjects.Graphics;
  private attackText: Phaser.GameObjects.Text;
  private defText: Phaser.GameObjects.Text;
  private hpText: Phaser.GameObjects.Text;
  private nameText: Phaser.GameObjects.Text;
  private summonSickGfx: Phaser.GameObjects.Graphics;
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

    // Name (no furigana on board units — saves space; furigana available on hand cards)
    this.nameText = scene.add.text(0, -hh + 8, unit.card.nameJa, {
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
    div.lineBetween(-hw + 4, -hh + 42, hw - 4, -hh + 42);
    this.add(div);

    // Type / Taunt badge
    const typeLabel = scene.add.text(0, -hh + 46, this.getTypeLabel(unit.card.type as string, unit.hasTaunt), {
      fontSize: '10px',
      color: '#aaaaaa',
      fontFamily: "'Noto Serif JP', serif",
    });
    typeLabel.setOrigin(0.5, 0);
    this.add(typeLabel);

    // ── Stats row: ATK (left) | DEF (center) | HP (right) ───────────
    const labelY = hh - 28;
    const valueY = hh - 10;

    // Attack — orange, bottom-left
    const atkLabel = scene.add.text(-hw + 14, labelY, '攻', {
      fontSize: '10px', color: '#ff9900', fontFamily: "'Noto Serif JP', serif",
    });
    atkLabel.setOrigin(0.5, 0);
    this.add(atkLabel);

    this.attackText = scene.add.text(-hw + 14, valueY, String(unit.attack), {
      fontSize: '18px', color: '#ff9900', fontFamily: "'Noto Sans JP', monospace", fontStyle: 'bold',
    });
    this.attackText.setOrigin(0.5, 1);
    this.add(this.attackText);

    // Defense — blue, bottom-center
    const defLabel = scene.add.text(0, labelY, '防', {
      fontSize: '10px', color: '#4488ff', fontFamily: "'Noto Serif JP', serif",
    });
    defLabel.setOrigin(0.5, 0);
    this.add(defLabel);

    this.defText = scene.add.text(0, valueY, String(unit.card.defense), {
      fontSize: '14px', color: '#4488ff', fontFamily: "'Noto Sans JP', monospace", fontStyle: 'bold',
    });
    this.defText.setOrigin(0.5, 1);
    this.add(this.defText);

    // HP — green, bottom-right
    const hpLabel = scene.add.text(hw - 14, labelY, 'HP', {
      fontSize: '10px', color: '#00ff88', fontFamily: "'Noto Serif JP', serif",
    });
    hpLabel.setOrigin(0.5, 0);
    this.add(hpLabel);

    this.hpText = scene.add.text(hw - 14, valueY, String(unit.currentHp), {
      fontSize: '18px', color: '#00ff88', fontFamily: "'Noto Sans JP', monospace", fontStyle: 'bold',
    });
    this.hpText.setOrigin(0.5, 1);
    this.add(this.hpText);

    // Summoning-sickness indicator (yellow dot, top-right: !canAttack && !isExhausted = just deployed)
    this.summonSickGfx = scene.add.graphics();
    this.add(this.summonSickGfx);

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

    // HP colour by health ratio
    const maxHp = this.unit.card.hp || 10;
    const ratio = this.unit.currentHp / maxHp;
    if (ratio > 0.5) {
      this.hpText.setColor('#00ff88');
    } else if (ratio > 0.25) {
      this.hpText.setColor('#ffaa00');
    } else {
      this.hpText.setColor('#ff4444');
    }

    // Exhausted: dim whole unit and grey the name
    if (this.unit.isExhausted) {
      this.setAlpha(0.55);
      this.nameText.setColor('#888888');
    } else {
      this.setAlpha(1);
      this.nameText.setColor('#ffffff');
    }

    // Summoning-sickness indicator (yellow dot when just deployed)
    this.summonSickGfx.clear();
    if (!this.unit.canAttack && !this.unit.isExhausted) {
      const hw = UNIT_WIDTH / 2;
      const hh = UNIT_HEIGHT / 2;
      this.summonSickGfx.fillStyle(0xffdd44, 0.9);
      this.summonSickGfx.fillCircle(hw - 8, -hh + 8, 5);
      // Small tick marks inside the dot
      this.summonSickGfx.fillStyle(0x000000, 0.85);
      this.summonSickGfx.fillRect(hw - 11, -hh + 5, 6, 1);
      this.summonSickGfx.fillRect(hw - 11, -hh + 8, 6, 1);
      this.summonSickGfx.fillRect(hw - 11, -hh + 11, 6, 1);
    }
  }

  setSelected(selected: boolean): void {
    this.isSelected = selected;
    const hw = UNIT_WIDTH / 2;
    const hh = UNIT_HEIGHT / 2;
    this.borderGfx.clear();
    if (selected) {
      this.borderGfx.lineStyle(3, 0xffff00, 1);
    } else {
      const faction = this.unit.card.faction ?? 'NEUTRAL';
      const borderColor = FACTION_BORDER[faction] ?? 0x888888;
      this.borderGfx.lineStyle(2, borderColor, 1);
    }
    this.borderGfx.strokeRect(-hw, -hh, UNIT_WIDTH, UNIT_HEIGHT);
  }

  setAttackReady(ready: boolean): void {
    if (!this.isSelected) {
      const hw = UNIT_WIDTH / 2;
      const hh = UNIT_HEIGHT / 2;
      this.borderGfx.clear();
      const faction = this.unit.card.faction ?? 'NEUTRAL';
      const baseColor = FACTION_BORDER[faction] ?? 0x888888;
      const color = ready ? 0x00ff88 : baseColor;
      this.borderGfx.lineStyle(2, color, 1);
      this.borderGfx.strokeRect(-hw, -hh, UNIT_WIDTH, UNIT_HEIGHT);
    }
  }

  /** Highlight this unit as a valid attack target (persistent red border). */
  setAttackTarget(active: boolean): void {
    if (!this.isSelected) {
      const hw = UNIT_WIDTH / 2;
      const hh = UNIT_HEIGHT / 2;
      this.borderGfx.clear();
      if (active) {
        this.borderGfx.lineStyle(3, 0xff3333, 1);
      } else {
        const faction = this.unit.card.faction ?? 'NEUTRAL';
        const baseColor = FACTION_BORDER[faction] ?? 0x888888;
        this.borderGfx.lineStyle(2, baseColor, 1);
      }
      this.borderGfx.strokeRect(-hw, -hh, UNIT_WIDTH, UNIT_HEIGHT);
    }
  }
}
