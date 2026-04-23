import Phaser from 'phaser';
import {
  GameState,
  initGame,
  playCard,
  endTurn,
  executeAITurn,
  startTurn,
} from '../game/GameState';
import { YUJI_DECK_IDS, MEGUMI_DECK_IDS } from '../data/decks';
import { CardView, CARD_WIDTH, CARD_HEIGHT } from '../ui/CardView';
import { StatusBar } from '../ui/StatusBar';
import { DeckCard } from '../data/decks';

/**
 * メインゲームシーン
 */
export class GameScene extends Phaser.Scene {
  private gameState!: GameState;
  private playerStatusBar!: StatusBar;
  private aiStatusBar!: StatusBar;
  private handCardViews: CardView[] = [];
  private selectedCard: CardView | null = null;
  private logText!: Phaser.GameObjects.Text;
  private turnInfoText!: Phaser.GameObjects.Text;
  private endTurnBtn!: Phaser.GameObjects.Rectangle;
  private endTurnBtnText!: Phaser.GameObjects.Text;
  private phaseText!: Phaser.GameObjects.Text;
  private aiThinkingText!: Phaser.GameObjects.Text;
  private isProcessingAI = false;
  private playBtnText!: Phaser.GameObjects.Text;
  private playBtn!: Phaser.GameObjects.Rectangle;

  // AI hand visual (face-down cards)
  private aiHandCards: Phaser.GameObjects.Rectangle[] = [];

  constructor() {
    super({ key: 'GameScene' });
  }

  init(data: { playerChoice: 'yuji' | 'megumi' }): void {
    this.gameState = initGame(YUJI_DECK_IDS, MEGUMI_DECK_IDS, data.playerChoice || 'yuji');
  }

  create(): void {
    const { width, height } = this.scale;

    // Background
    this.createBackground(width, height);

    // Layout zones
    const aiZoneY = 90;
    const playerZoneY = height - 90;
    const handZoneY = height - 180;

    // Status bars
    this.aiStatusBar = new StatusBar(this, 20, aiZoneY - 60, this.gameState.players.ai);
    this.playerStatusBar = new StatusBar(this, 20, height - 240, this.gameState.players.player);

    // Turn / Phase info
    this.turnInfoText = this.add.text(width / 2, 20, '', {
      fontSize: '14px',
      color: '#ffffff',
      fontFamily: "'Noto Serif JP', serif",
      fontStyle: 'bold',
    }).setOrigin(0.5, 0);

    this.phaseText = this.add.text(width / 2, 40, '', {
      fontSize: '11px',
      color: '#cccccc',
      fontFamily: "'Noto Serif JP', serif",
    }).setOrigin(0.5, 0);

    // AI thinking indicator
    this.aiThinkingText = this.add.text(width / 2, height / 2, '', {
      fontSize: '20px',
      color: '#ffaa00',
      fontFamily: "'Noto Serif JP', serif",
      fontStyle: 'bold',
    }).setOrigin(0.5, 0.5);

    // Battle field center divider
    const divGfx = this.add.graphics();
    divGfx.lineStyle(1, 0x333333, 0.5);
    divGfx.lineBetween(0, height / 2, width, height / 2);

    // VS text
    this.add.text(width - 60, height / 2, 'VS', {
      fontSize: '24px',
      color: '#333333',
      fontFamily: "'Noto Serif JP', serif",
      fontStyle: 'bold',
    }).setOrigin(0.5, 0.5);

    // End turn button
    const btnX = width - 90;
    const btnY = height - 60;
    this.endTurnBtn = this.add.rectangle(btnX, btnY, 150, 44, 0x224422);
    this.endTurnBtn.setInteractive({ useHandCursor: true });
    this.endTurnBtn.setStrokeStyle(2, 0x44aa44);

    const endFuri = this.add.text(btnX, btnY - 12, 'たーんしゅうりょう', {
      fontSize: '8px', color: '#88aa88', fontFamily: "'Noto Serif JP', serif"
    }).setOrigin(0.5, 0.5);

    this.endTurnBtnText = this.add.text(btnX, btnY + 4, 'ターン終了', {
      fontSize: '15px',
      color: '#aaffaa',
      fontFamily: "'Noto Serif JP', serif",
      fontStyle: 'bold',
    }).setOrigin(0.5, 0.5);

    this.endTurnBtn.on('pointerdown', () => this.handleEndTurn());
    this.endTurnBtn.on('pointerover', () => this.endTurnBtn.setFillStyle(0x336633));
    this.endTurnBtn.on('pointerout', () => this.endTurnBtn.setFillStyle(0x224422));

    // Play card button
    const playBtnX = width - 90;
    const playBtnY = height - 115;
    this.playBtn = this.add.rectangle(playBtnX, playBtnY, 150, 44, 0x442200);
    this.playBtn.setInteractive({ useHandCursor: true });
    this.playBtn.setStrokeStyle(2, 0xaa6600);

    const playFuri = this.add.text(playBtnX, playBtnY - 12, 'かーどをつかう', {
      fontSize: '8px', color: '#aa8866', fontFamily: "'Noto Serif JP', serif"
    }).setOrigin(0.5, 0.5);

    this.playBtnText = this.add.text(playBtnX, playBtnY + 4, 'カードを使う', {
      fontSize: '15px',
      color: '#ffaa66',
      fontFamily: "'Noto Serif JP', serif",
      fontStyle: 'bold',
    }).setOrigin(0.5, 0.5);

    this.playBtn.on('pointerdown', () => this.handlePlayCard());
    this.playBtn.on('pointerover', () => this.playBtn.setFillStyle(0x663300));
    this.playBtn.on('pointerout', () => this.playBtn.setFillStyle(0x442200));

    // Log panel
    const logPanelX = 20;
    const logPanelY = height / 2 - 100;
    this.add.rectangle(logPanelX + 145, logPanelY + 95, 290, 200, 0x111111, 0.7);

    const logFuri = this.add.text(logPanelX, logPanelY, 'せんとうきろく', {
      fontSize: '9px', color: '#555555', fontFamily: "'Noto Serif JP', serif"
    });

    this.add.text(logPanelX, logPanelY + 12, '戦闘記録', {
      fontSize: '12px', color: '#888888', fontFamily: "'Noto Serif JP', serif"
    });

    this.logText = this.add.text(logPanelX, logPanelY + 28, '', {
      fontSize: '10px',
      color: '#cccccc',
      fontFamily: "'Noto Serif JP', serif",
      wordWrap: { width: 285 },
      lineSpacing: 3,
    });

    // AI hand display
    this.renderAIHand();

    // Player hand display
    this.renderPlayerHand();

    // Initial turn info
    this.updateUI();

    // Start the first turn
    startTurn(this.gameState);
    this.updateUI();
  }

  private createBackground(width: number, height: number): void {
    // Gradient-like dark background
    this.add.rectangle(width / 2, height / 2, width, height, 0x08080f);

    // Top player zone tint
    this.add.rectangle(width / 2, 120, width, 200, 0x0a0a20, 0.5);
    // Bottom player zone tint
    this.add.rectangle(width / 2, height - 120, width, 200, 0x100808, 0.5);
  }

  private renderAIHand(): void {
    // Clear existing
    this.aiHandCards.forEach(c => c.destroy());
    this.aiHandCards = [];

    const { width } = this.scale;
    const ai = this.gameState.players.ai;
    const handSize = ai.hand.length;
    const startX = width / 2 - (handSize * 30) / 2;

    for (let i = 0; i < handSize; i++) {
      const card = this.add.rectangle(startX + i * 30, 160, 22, 32, 0x1a1a3a);
      card.setStrokeStyle(1, 0x444488);
      this.aiHandCards.push(card);
    }
  }

  private renderPlayerHand(): void {
    // Clear existing
    this.handCardViews.forEach(c => c.destroy());
    this.handCardViews = [];
    this.selectedCard = null;

    const { width, height } = this.scale;
    const hand = this.gameState.players.player.hand;
    const totalW = hand.length * (CARD_WIDTH + 8);
    const startX = Math.max(CARD_WIDTH / 2 + 10, width / 2 - totalW / 2 + CARD_WIDTH / 2);
    const cardY = height - CARD_HEIGHT / 2 - 10;

    hand.forEach((card, i) => {
      const x = startX + i * (CARD_WIDTH + 8);
      const cardView = new CardView(this, x, cardY, card, true);
      cardView.setDepth(i);

      const playerEnergy = this.gameState.players.player.cursedEnergy;
      const isPlayerTurn = this.gameState.activePlayer === 'player';
      const isMainPhase = this.gameState.phase === 'MAIN';
      cardView.setPlayable(isPlayerTurn && isMainPhase && card.cost <= playerEnergy);

      cardView.on('pointerdown', () => this.handleCardClick(cardView));
      cardView.on('pointerover', () => {
        if (!cardView.isSelected) {
          this.tweens.add({ targets: cardView, y: cardY - 12, duration: 150 });
          cardView.setDepth(100);
        }
      });
      cardView.on('pointerout', () => {
        if (!cardView.isSelected) {
          this.tweens.add({ targets: cardView, y: cardY, duration: 150 });
          cardView.setDepth(i);
        }
      });

      this.handCardViews.push(cardView);
    });
  }

  private handleCardClick(cardView: CardView): void {
    if (this.gameState.activePlayer !== 'player') return;
    if (this.gameState.phase !== 'MAIN') return;

    const { height } = this.scale;
    const cardY = height - CARD_HEIGHT / 2 - 10;

    if (this.selectedCard === cardView) {
      // Deselect
      cardView.setSelected(false);
      this.tweens.add({ targets: cardView, y: cardY, duration: 150 });
      this.selectedCard = null;
    } else {
      // Deselect previous
      if (this.selectedCard) {
        this.selectedCard.setSelected(false);
        this.tweens.add({ targets: this.selectedCard, y: cardY, duration: 150 });
      }
      // Select new
      cardView.setSelected(true);
      this.tweens.add({ targets: cardView, y: cardY - 24, duration: 150 });
      this.selectedCard = cardView;
    }
  }

  private handlePlayCard(): void {
    if (!this.selectedCard) return;
    if (this.gameState.activePlayer !== 'player') return;
    if (this.gameState.phase !== 'MAIN') return;
    if (this.isProcessingAI) return;

    const card = this.selectedCard.card;
    const result = playCard(this.gameState, 'player', card.instanceId);

    if (result.success) {
      // Flash animation on the played card
      this.playCardAnimation(this.selectedCard);
      this.selectedCard = null;
      this.time.delayedCall(400, () => {
        this.renderPlayerHand();
        this.renderAIHand();
        this.updateUI();
        this.checkGameOver();
      });
    } else {
      // Show error
      this.showMessage(result.message, '#ff4444');
    }
  }

  private playCardAnimation(cardView: CardView): void {
    const { width, height } = this.scale;
    this.tweens.add({
      targets: cardView,
      x: width / 2,
      y: height / 2,
      scaleX: 1.5,
      scaleY: 1.5,
      alpha: 0,
      duration: 400,
      ease: 'Power2',
    });
  }

  private handleEndTurn(): void {
    if (this.gameState.activePlayer !== 'player') return;
    const currentPhase = this.gameState.phase;
    if (currentPhase === 'GAME_OVER') return;
    if (this.isProcessingAI) return;

    this.selectedCard = null;
    endTurn(this.gameState);
    this.renderPlayerHand();
    this.updateUI();

    const nextPhase = this.gameState.phase;
    if (nextPhase === 'GAME_OVER') {
      this.checkGameOver();
      return;
    }

    // AI turn
    this.isProcessingAI = true;
    this.aiThinkingText.setText('相手のターン...');
    this.endTurnBtn.disableInteractive();
    this.playBtn.disableInteractive();

    this.time.delayedCall(1000, () => {
      this.executeAITurnSteps();
    });
  }

  private executeAITurnSteps(): void {
    const actions = executeAITurn(this.gameState);
    this.renderAIHand();
    this.updateUI();

    if (this.gameState.phase === 'GAME_OVER') {
      this.isProcessingAI = false;
      this.aiThinkingText.setText('');
      this.checkGameOver();
      return;
    }

    // AI ends turn
    this.time.delayedCall(1500, () => {
      endTurn(this.gameState);
      this.isProcessingAI = false;
      this.aiThinkingText.setText('');
      this.endTurnBtn.setInteractive({ useHandCursor: true });
      this.playBtn.setInteractive({ useHandCursor: true });
      this.renderPlayerHand();
      this.renderAIHand();
      this.updateUI();
      this.checkGameOver();
    });
  }

  private updateUI(): void {
    const state = this.gameState;
    const turn = state.turn;
    const activePlayerName = state.players[state.activePlayer].nameJa;

    this.turnInfoText.setText(`ターン ${turn} — ${activePlayerName}のターン`);

    const phaseNames: Record<string, string> = {
      DRAW: 'ドローフェーズ',
      MAIN: 'メインフェーズ',
      END: 'エンドフェーズ',
      GAME_OVER: 'ゲーム終了',
    };
    this.phaseText.setText(phaseNames[state.phase] ?? state.phase);

    // Update status bars
    this.playerStatusBar.update(state.players.player);
    this.aiStatusBar.update(state.players.ai);

    // Update log
    const logLines = state.log.slice(-12);
    this.logText.setText(logLines.join('\n'));

    // Update card playability
    const isPlayerTurn = state.activePlayer === 'player';
    const isMainPhase = state.phase === 'MAIN';
    const playerEnergy = state.players.player.cursedEnergy;

    this.handCardViews.forEach(cv => {
      cv.setPlayable(isPlayerTurn && isMainPhase && cv.card.cost <= playerEnergy);
    });

    // Enable/disable buttons
    if (isPlayerTurn && isMainPhase && !this.isProcessingAI) {
      this.endTurnBtn.setInteractive({ useHandCursor: true });
      this.endTurnBtn.setFillStyle(0x224422);
      this.endTurnBtnText.setColor('#aaffaa');
    } else {
      this.endTurnBtn.disableInteractive();
      this.endTurnBtn.setFillStyle(0x111111);
      this.endTurnBtnText.setColor('#555555');
    }
  }

  private showMessage(text: string, color = '#ffffff'): void {
    const { width, height } = this.scale;
    const msg = this.add.text(width / 2, height / 2 - 40, text, {
      fontSize: '16px',
      color,
      fontFamily: "'Noto Serif JP', serif",
      backgroundColor: '#000000aa',
      padding: { x: 12, y: 8 },
    }).setOrigin(0.5, 0.5).setDepth(200);

    this.tweens.add({
      targets: msg,
      y: height / 2 - 80,
      alpha: 0,
      duration: 1800,
      ease: 'Power2',
      onComplete: () => msg.destroy(),
    });
  }

  private checkGameOver(): void {
    if (this.gameState.phase === 'GAME_OVER') {
      this.time.delayedCall(500, () => {
        this.cameras.main.fade(800, 0, 0, 0, false, (_: unknown, progress: number) => {
          if (progress === 1) {
            this.scene.start('GameOverScene', {
              winner: this.gameState.winner,
              players: this.gameState.players,
              turn: this.gameState.turn,
            });
          }
        });
      });
    }
  }
}
