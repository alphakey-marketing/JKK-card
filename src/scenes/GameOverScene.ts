import Phaser from 'phaser';
import { PlayerState } from '../game/GameState';

interface GameOverData {
  winner: 'player' | 'ai' | null;
  players: { player: PlayerState; ai: PlayerState };
  turn: number;
}

/**
 * ゲームオーバーシーン
 */
export class GameOverScene extends Phaser.Scene {
  constructor() {
    super({ key: 'GameOverScene' });
  }

  init(data: GameOverData): void {
    this.data.set('gameOverData', data);
  }

  create(): void {
    const { width, height } = this.scale;
    const cx = width / 2;
    const data = this.data.get('gameOverData') as GameOverData;
    const { winner, players, turn } = data;

    const isPlayerWin = winner === 'player';

    // Background
    const bgColor = isPlayerWin ? 0x001100 : 0x110000;
    this.add.rectangle(cx, height / 2, width, height, bgColor);

    // Animated effects
    this.createWinEffect(width, height, isPlayerWin);

    // Result title
    const resultFuri = this.add.text(cx, 80, isPlayerWin ? 'しょうり！' : 'はいぼく...', {
      fontSize: '18px',
      color: '#888888',
      fontFamily: "'Noto Serif JP', serif",
    }).setOrigin(0.5, 0.5);

    const resultText = this.add.text(cx, 120, isPlayerWin ? '勝利！' : '敗北...', {
      fontSize: '64px',
      color: isPlayerWin ? '#00ff88' : '#ff4444',
      fontFamily: "'Noto Serif JP', serif",
      fontStyle: 'bold',
      stroke: isPlayerWin ? '#006633' : '#660000',
      strokeThickness: 8,
    }).setOrigin(0.5, 0.5);

    // Flash animation on result
    this.tweens.add({
      targets: resultText,
      scaleX: { from: 0.5, to: 1 },
      scaleY: { from: 0.5, to: 1 },
      alpha: { from: 0, to: 1 },
      duration: 800,
      ease: 'Back.easeOut',
    });

    // Winner name
    const winnerPlayer = winner === 'player' ? players.player : players.ai;
    if (winnerPlayer) {
      this.add.text(cx, 172, winnerPlayer.nameFurigana, {
        fontSize: '12px',
        color: '#aaaaaa',
        fontFamily: "'Noto Serif JP', serif",
      }).setOrigin(0.5, 0.5);

      this.add.text(cx, 192, `${winnerPlayer.nameJa}の勝利！`, {
        fontSize: '24px',
        color: '#ffffff',
        fontFamily: "'Noto Serif JP', serif",
        fontStyle: 'bold',
      }).setOrigin(0.5, 0.5);
    }

    // Stats panel
    const statsY = 240;
    this.add.rectangle(cx, statsY + 70, 400, 150, 0x111111, 0.8);

    const statsFuri = this.add.text(cx, statsY, 'たいせんせいせき', {
      fontSize: '10px',
      color: '#555555',
      fontFamily: "'Noto Serif JP', serif",
    }).setOrigin(0.5, 0.5);

    this.add.text(cx, statsY + 16, '対戦成績', {
      fontSize: '16px',
      color: '#888888',
      fontFamily: "'Noto Serif JP', serif",
    }).setOrigin(0.5, 0.5);

    // Player stats
    const pHP = players.player.hp;
    const aHP = players.ai.hp;
    const statsText = [
      `ターン数: ${turn}`,
      `${players.player.nameJa} HP: ${pHP}/${players.player.maxHp}`,
      `${players.ai.nameJa} HP: ${aHP}/${players.ai.maxHp}`,
    ].join('\n');

    this.add.text(cx, statsY + 80, statsText, {
      fontSize: '14px',
      color: '#cccccc',
      fontFamily: "'Noto Sans JP', monospace",
      align: 'center',
      lineSpacing: 6,
    }).setOrigin(0.5, 0.5);

    // Buttons
    this.createButton(cx - 110, height - 90, 'もう一度遊ぶ', 'もういちどあそぶ', 0x224422, 0x44aa44, () => {
      this.cameras.main.fade(500, 0, 0, 0, false, (_: unknown, progress: number) => {
        if (progress === 1) {
          this.scene.start('MenuScene');
        }
      });
    });

    this.createButton(cx + 110, height - 90, '同じキャラで再戦', 'おなじきゃらでさいせん', 0x222244, 0x4444aa, () => {
      // Restart with same player choice
      const playerName = players.player.nameJa;
      const choice = playerName === '虎杖悠仁' ? 'yuji' : 'megumi';
      this.cameras.main.fade(500, 0, 0, 0, false, (_: unknown, progress: number) => {
        if (progress === 1) {
          this.scene.start('GameScene', { playerChoice: choice });
        }
      });
    });
  }

  private createButton(
    x: number, y: number,
    label: string, furigana: string,
    bgColor: number, borderColor: number,
    onClick: () => void
  ): void {
    const btn = this.add.rectangle(x, y, 190, 52, bgColor);
    btn.setStrokeStyle(2, borderColor);
    btn.setInteractive({ useHandCursor: true });

    this.add.text(x, y - 10, furigana, {
      fontSize: '9px',
      color: '#888888',
      fontFamily: "'Noto Serif JP', serif",
    }).setOrigin(0.5, 0.5);

    this.add.text(x, y + 6, label, {
      fontSize: '14px',
      color: '#ffffff',
      fontFamily: "'Noto Serif JP', serif",
      fontStyle: 'bold',
    }).setOrigin(0.5, 0.5);

    btn.on('pointerdown', onClick);
    btn.on('pointerover', () => btn.setFillStyle(borderColor, 0.5));
    btn.on('pointerout', () => btn.setFillStyle(bgColor));
  }

  private createWinEffect(width: number, height: number, isWin: boolean): void {
    const color = isWin ? 0x00ff88 : 0xff4444;
    for (let i = 0; i < 20; i++) {
      const x = Phaser.Math.Between(0, width);
      const y = Phaser.Math.Between(0, height);
      const circle = this.add.circle(x, y, Phaser.Math.Between(2, 8), color, 0.2);
      this.tweens.add({
        targets: circle,
        alpha: { from: 0, to: 0.4 },
        scaleX: { from: 0, to: 3 },
        scaleY: { from: 0, to: 3 },
        duration: Phaser.Math.Between(1000, 3000),
        repeat: -1,
        yoyo: true,
        delay: Phaser.Math.Between(0, 1500),
      });
    }
  }
}
