import Phaser from 'phaser';
import {
  GameState,
  initGame,
  playCard,
  endTurn,
  executeAIStep,
  startTurn,
  attackWithUnit,
  useHeroPower,
  BoardUnit,
} from '../game/GameState';
import { CardView, CARD_WIDTH, CARD_HEIGHT } from '../ui/CardView';
import { BoardUnitView, UNIT_WIDTH, UNIT_HEIGHT } from '../ui/BoardUnitView';
import { StatusBar } from '../ui/StatusBar';
import { DeckCard } from '../data/decks';
import { HERO_POWERS } from '../data/cards';

type InteractionMode = 'IDLE' | 'SELECTING_ATTACKER' | 'SELECTING_TARGET';

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
  private endTurnGlowRect!: Phaser.GameObjects.Rectangle;
  private endTurnPulseTween: Phaser.Tweens.Tween | null = null;
  private heroPowerBtn!: Phaser.GameObjects.Rectangle;
  private heroPowerBtnText!: Phaser.GameObjects.Text;
  private heroPowerBtnFuri!: Phaser.GameObjects.Text;
  private phaseText!: Phaser.GameObjects.Text;
  private aiThinkingText!: Phaser.GameObjects.Text;
  private isProcessingAI = false;
  private playBtn!: Phaser.GameObjects.Rectangle;
  private playBtnText!: Phaser.GameObjects.Text;
  private interactionModeText!: Phaser.GameObjects.Text;

  // Board unit views
  private boardUnitViews: { player: BoardUnitView[]; ai: BoardUnitView[] } = { player: [], ai: [] };
  private interactionMode: InteractionMode = 'IDLE';
  private selectedAttacker: BoardUnitView | null = null;

  // Empty-board placeholder texts
  private emptyBoardTexts: { player: Phaser.GameObjects.Text | null; ai: Phaser.GameObjects.Text | null } = {
    player: null,
    ai: null,
  };

  // AI hand visual (rectangles + pattern graphics)
  private aiHandCards: Phaser.GameObjects.Rectangle[] = [];
  private aiHandGfx: Phaser.GameObjects.Graphics[] = [];

  // Enemy hero clickable area
  private enemyHeroArea!: Phaser.GameObjects.Rectangle;

  // Layout constants (computed in create())
  private RIGHT_PANEL_X = 648;
  private AI_BOARD_Y = 145;
  private PLAYER_BOARD_Y = 268;
  private HAND_Y = 420;
  private midY = 0;

  constructor() {
    super({ key: 'GameScene' });
  }

  init(data: { playerChoice: 'yuji' | 'megumi' | 'nobara' | 'gojo' | 'nanami' | 'toge' }): void {
    this.gameState = initGame(data.playerChoice ?? 'yuji');
    this.interactionMode = 'IDLE';
    this.selectedAttacker = null;
    this.selectedCard = null;
    this.boardUnitViews = { player: [], ai: [] };
    this.emptyBoardTexts = { player: null, ai: null };
  }

  create(): void {
    const { width, height } = this.scale;
    // 70 / 30 split gives the play area more room and the log panel more width
    this.RIGHT_PANEL_X = Math.round(width * 0.72);
    this.AI_BOARD_Y = Math.round(height * 0.285);
    this.PLAYER_BOARD_Y = Math.round(height * 0.525);
    this.HAND_Y = Math.round(height * 0.822);
    this.midY = Math.round((this.AI_BOARD_Y + this.PLAYER_BOARD_Y) / 2);

    this.createBackground(width, height);

    // ── AI Status Bar (right panel, top) ─────────────────────────────
    this.aiStatusBar = new StatusBar(this, this.RIGHT_PANEL_X + 8, 5, this.gameState.players.ai);

    // Enemy hero clickable area (for direct attacks)
    this.enemyHeroArea = this.add.rectangle(this.RIGHT_PANEL_X / 2, 42, this.RIGHT_PANEL_X - 20, 84, 0xffffff, 0);
    this.enemyHeroArea.setInteractive({ useHandCursor: true });
    this.enemyHeroArea.on('pointerdown', () => this.handleEnemyHeroClick());
    this.enemyHeroArea.on('pointerover', () => {
      if (this.interactionMode === 'SELECTING_TARGET') {
        this.enemyHeroArea.setFillStyle(0xff4444, 0.2);
      }
    });
    this.enemyHeroArea.on('pointerout', () => {
      if (this.interactionMode !== 'SELECTING_TARGET') {
        this.enemyHeroArea.setFillStyle(0xffffff, 0);
      } else {
        // Stay at the target-mode tint
        this.enemyHeroArea.setFillStyle(0xff2222, 0.1);
      }
    });

    // ── AI Board Area ────────────────────────────────────────────────
    // Blue tint = enemy territory
    this.add.rectangle(this.RIGHT_PANEL_X / 2, this.AI_BOARD_Y, this.RIGHT_PANEL_X - 10, UNIT_HEIGHT + 14, 0x060c1a, 0.65);
    // Subtle colored border
    const aiBorderGfx = this.add.graphics();
    aiBorderGfx.lineStyle(1, 0x1133aa, 0.4);
    aiBorderGfx.strokeRect(5, this.AI_BOARD_Y - (UNIT_HEIGHT + 14) / 2, this.RIGHT_PANEL_X - 15, UNIT_HEIGHT + 14);
    // Zone label
    this.add.text(10, this.AI_BOARD_Y - (UNIT_HEIGHT + 14) / 2 + 4, '敵フィールド', {
      fontSize: '10px', color: '#334466', fontFamily: "'Noto Serif JP', serif",
    }).setAlpha(0.8);

    // ── Divider ──────────────────────────────────────────────────────
    const divGfx = this.add.graphics();
    divGfx.lineStyle(1, 0x555555, 0.7);
    divGfx.lineBetween(0, this.midY, this.RIGHT_PANEL_X - 5, this.midY);

    this.turnInfoText = this.add.text(this.RIGHT_PANEL_X / 2, this.midY - 12, '', {
      fontSize: '16px', color: '#ffffff', fontFamily: "'Noto Sans JP', sans-serif", fontStyle: 'bold',
    }).setOrigin(0.5, 0.5);

    this.phaseText = this.add.text(this.RIGHT_PANEL_X / 2, this.midY + 8, '', {
      fontSize: '13px', color: '#cccccc', fontFamily: "'Noto Serif JP', serif",
    }).setOrigin(0.5, 0.5);

    // Interaction mode hint — shown at the divider, above turn info (high depth so it's never hidden)
    this.interactionModeText = this.add.text(this.RIGHT_PANEL_X / 2, this.midY - 12, '', {
      fontSize: '13px', color: '#ffdd00', fontFamily: "'Noto Serif JP', serif",
      backgroundColor: '#000000cc', padding: { x: 8, y: 4 },
    }).setOrigin(0.5, 0.5).setDepth(10).setVisible(false);

    // ── Player Board Area ────────────────────────────────────────────
    // Warm red tint = player territory
    this.add.rectangle(this.RIGHT_PANEL_X / 2, this.PLAYER_BOARD_Y, this.RIGHT_PANEL_X - 10, UNIT_HEIGHT + 14, 0x1a0800, 0.65);
    const plBorderGfx = this.add.graphics();
    plBorderGfx.lineStyle(1, 0xaa3311, 0.4);
    plBorderGfx.strokeRect(5, this.PLAYER_BOARD_Y - (UNIT_HEIGHT + 14) / 2, this.RIGHT_PANEL_X - 15, UNIT_HEIGHT + 14);
    // Zone label
    this.add.text(10, this.PLAYER_BOARD_Y - (UNIT_HEIGHT + 14) / 2 + 4, '自フィールド', {
      fontSize: '10px', color: '#553322', fontFamily: "'Noto Serif JP', serif",
    }).setAlpha(0.8);

    // ── Player Hand Area ─────────────────────────────────────────────
    this.add.rectangle(this.RIGHT_PANEL_X / 2, this.HAND_Y, this.RIGHT_PANEL_X - 10, CARD_HEIGHT + 12, 0x080810, 0.5);

    // ── Bottom Controls ───────────────────────────────────────────────
    const ctrlY = height - 40;

    // Proportional positions across the play area
    const hpBtnX  = Math.round(this.RIGHT_PANEL_X * 0.20);
    const playBtnX = Math.round(this.RIGHT_PANEL_X * 0.53);
    const endBtnX  = Math.round(this.RIGHT_PANEL_X * 0.84);

    // Hero power button
    const hpInfo = HERO_POWERS[this.gameState.players.player.heroId];
    this.heroPowerBtn = this.add.rectangle(hpBtnX, ctrlY, 220, 46, 0x441166);
    this.heroPowerBtn.setInteractive({ useHandCursor: true });
    this.heroPowerBtn.setStrokeStyle(2, 0xcc44ff);

    this.heroPowerBtnFuri = this.add.text(hpBtnX, ctrlY - 13, hpInfo ? hpInfo.nameFurigana : 'ひーろーぱわー', {
      fontSize: '8px', color: '#cc88ff', fontFamily: "'Noto Serif JP', serif",
    }).setOrigin(0.5, 0.5);

    this.heroPowerBtnText = this.add.text(hpBtnX, ctrlY + 3, hpInfo ? `${hpInfo.nameJa} (呪:2)` : 'ヒーローパワー', {
      fontSize: '13px', color: '#cc88ff', fontFamily: "'Noto Serif JP', serif", fontStyle: 'bold',
    }).setOrigin(0.5, 0.5);

    this.heroPowerBtn.on('pointerdown', () => this.handleHeroPowerClick());
    this.heroPowerBtn.on('pointerover', () => this.heroPowerBtn.setFillStyle(0x661199));
    this.heroPowerBtn.on('pointerout', () => this.heroPowerBtn.setFillStyle(0x441166));

    // Play card button
    this.playBtn = this.add.rectangle(playBtnX, ctrlY, 160, 46, 0x442200);
    this.playBtn.setInteractive({ useHandCursor: true });
    this.playBtn.setStrokeStyle(2, 0xaa6600);

    this.add.text(playBtnX, ctrlY - 13, 'かーどをつかう', {
      fontSize: '8px', color: '#aa8866', fontFamily: "'Noto Serif JP', serif",
    }).setOrigin(0.5, 0.5);

    this.playBtnText = this.add.text(playBtnX, ctrlY + 3, 'カードを使う', {
      fontSize: '14px', color: '#ffaa66', fontFamily: "'Noto Serif JP', serif", fontStyle: 'bold',
    }).setOrigin(0.5, 0.5);

    this.playBtn.on('pointerdown', () => this.handlePlayCard());
    this.playBtn.on('pointerover', () => this.playBtn.setFillStyle(0x663300));
    this.playBtn.on('pointerout', () => this.playBtn.setFillStyle(0x442200));

    // End turn button — larger and visually dominant
    this.endTurnBtn = this.add.rectangle(endBtnX, ctrlY, 200, 54, 0x224422);
    this.endTurnBtn.setInteractive({ useHandCursor: true });
    this.endTurnBtn.setStrokeStyle(2, 0x44aa44);

    this.add.text(endBtnX, ctrlY - 16, 'たーんしゅうりょう', {
      fontSize: '8px', color: '#88aa88', fontFamily: "'Noto Serif JP', serif",
    }).setOrigin(0.5, 0.5);

    this.endTurnBtnText = this.add.text(endBtnX, ctrlY + 3, 'ターン終了', {
      fontSize: '15px', color: '#aaffaa', fontFamily: "'Noto Serif JP', serif", fontStyle: 'bold',
    }).setOrigin(0.5, 0.5);

    // Glow overlay for "no more actions" pulse
    this.endTurnGlowRect = this.add.rectangle(endBtnX, ctrlY, 204, 58, 0x44ff44);
    this.endTurnGlowRect.setAlpha(0).setDepth(1);

    this.endTurnBtn.on('pointerdown', () => this.handleEndTurn());
    this.endTurnBtn.on('pointerover', () => this.endTurnBtn.setFillStyle(0x336633));
    this.endTurnBtn.on('pointerout', () => this.endTurnBtn.setFillStyle(0x224422));

    // ── Right Panel (Log) ────────────────────────────────────────────
    this.add.rectangle(this.RIGHT_PANEL_X + (width - this.RIGHT_PANEL_X) / 2, height / 2, width - this.RIGHT_PANEL_X, height, 0x050510, 0.95);

    const logX = this.RIGHT_PANEL_X + 8;
    this.add.text(logX, 116, 'せんとうきろく', {
      fontSize: '11px', color: '#555555', fontFamily: "'Noto Serif JP', serif",
    });
    this.add.text(logX, 128, '戦闘記録', {
      fontSize: '14px', color: '#777777', fontFamily: "'Noto Serif JP', serif",
    });

    this.logText = this.add.text(logX, 148, '', {
      fontSize: '13px', color: '#cccccc', fontFamily: "'Noto Serif JP', serif",
      wordWrap: { width: width - this.RIGHT_PANEL_X - 16 },
      lineSpacing: 2,
    });

    // AI thinking indicator
    this.aiThinkingText = this.add.text(this.RIGHT_PANEL_X / 2, this.midY, '', {
      fontSize: '18px', color: '#ffaa00', fontFamily: "'Noto Serif JP', serif", fontStyle: 'bold',
      backgroundColor: '#000000cc', padding: { x: 10, y: 6 },
    }).setOrigin(0.5, 0.5).setDepth(50);

    // Player status bar (right panel, bottom)
    this.playerStatusBar = new StatusBar(this, this.RIGHT_PANEL_X + 8, height - 185, this.gameState.players.player);

    // ESC key to cancel any active selection
    this.input.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.ESC).on('down', () => {
      if (this.interactionMode !== 'IDLE') {
        this.cancelSelection();
      }
    });

    // Initial render
    this.renderAIHand();
    this.renderPlayerHand();
    this.renderBoard('player');
    this.renderBoard('ai');
    startTurn(this.gameState);
    this.updateUI();
  }

  private createBackground(width: number, height: number): void {
    this.add.rectangle(width / 2, height / 2, width, height, 0x08080f);
    this.add.rectangle(this.RIGHT_PANEL_X / 2, 80, this.RIGHT_PANEL_X, 175, 0x0a0a20, 0.4);
    this.add.rectangle(this.RIGHT_PANEL_X / 2, height - 120, this.RIGHT_PANEL_X, 200, 0x100808, 0.4);
  }

  // ── Board Rendering ──────────────────────────────────────────────

  private renderBoard(owner: 'player' | 'ai'): void {
    // Destroy old views
    this.boardUnitViews[owner].forEach(v => v.destroy());
    this.boardUnitViews[owner] = [];

    // Clear old empty-state text
    if (this.emptyBoardTexts[owner]) {
      this.emptyBoardTexts[owner]!.destroy();
      this.emptyBoardTexts[owner] = null;
    }

    const units = this.gameState.players[owner].board;
    const boardY = owner === 'ai' ? this.AI_BOARD_Y : this.PLAYER_BOARD_Y;

    if (units.length === 0) {
      // Show faded "no units" placeholder
      this.emptyBoardTexts[owner] = this.add.text(
        (this.RIGHT_PANEL_X - 10) / 2, boardY,
        'ユニットなし',
        { fontSize: '14px', color: '#2a2a44', fontFamily: "'Noto Serif JP', serif" }
      ).setOrigin(0.5, 0.5);
      return;
    }

    const availW = this.RIGHT_PANEL_X - 10;
    const spacing = Math.min(UNIT_WIDTH + 8, availW / units.length);
    const totalUsed = (units.length - 1) * spacing + UNIT_WIDTH;
    const sx = (availW - totalUsed) / 2 + UNIT_WIDTH / 2;

    units.forEach((unit, i) => {
      const x = sx + i * spacing;
      const view = new BoardUnitView(this, x, boardY, unit, owner === 'player');
      if (owner === 'player') {
        view.on('pointerdown', () => this.handleBoardUnitClick(view, 'player'));
        view.on('pointerover', () => {
          if (this.interactionMode === 'IDLE' && unit.canAttack) {
            view.setAttackReady(true);
          }
        });
        view.on('pointerout', () => {
          if (!view.isSelected) view.setAttackReady(false);
        });
      } else {
        // AI units are clickable as attack targets
        view.setInteractive(
          new Phaser.Geom.Rectangle(-UNIT_WIDTH / 2, -UNIT_HEIGHT / 2, UNIT_WIDTH, UNIT_HEIGHT),
          Phaser.Geom.Rectangle.Contains
        );
        view.on('pointerdown', () => this.handleBoardUnitClick(view, 'ai'));
        view.on('pointerover', () => {
          if (this.interactionMode === 'SELECTING_TARGET') {
            view.setSelected(true);
          }
        });
        view.on('pointerout', () => {
          if (this.interactionMode === 'SELECTING_TARGET') {
            view.setSelected(false);
            // Restore target-mode red border instead of default
            const tauntUnits = this.gameState.players.ai.board.filter(u => u.hasTaunt);
            const isValid = tauntUnits.length === 0 || view.unit.hasTaunt;
            view.setAttackTarget(isValid);
          }
        });
      }
      this.boardUnitViews[owner].push(view);
    });
  }

  private handleBoardUnitClick(view: BoardUnitView, owner: 'player' | 'ai'): void {
    if (this.gameState.activePlayer !== 'player') return;
    if (this.gameState.phase !== 'MAIN') return;
    if (this.isProcessingAI) return;

    if (owner === 'player') {
      if (this.interactionMode === 'IDLE' || this.interactionMode === 'SELECTING_ATTACKER') {
        if (!view.unit.canAttack) {
          this.showMessage('このユニットは攻撃できません', '#ff9900');
          return;
        }
        if (this.selectedAttacker) {
          this.selectedAttacker.setSelected(false);
        }
        if (this.selectedAttacker === view) {
          this.selectedAttacker = null;
          this.interactionMode = 'IDLE';
        } else {
          this.selectedAttacker = view;
          view.setSelected(true);
          this.interactionMode = 'SELECTING_TARGET';
          this.showMessage(`${view.unit.card.nameJa}で攻撃！対象を選んでください`, '#ffdd00');
        }
        this.updateInteractionUI();
      }
    } else if (owner === 'ai') {
      if (this.interactionMode === 'SELECTING_TARGET' && this.selectedAttacker) {
        const attacker = this.selectedAttacker;
        const result = attackWithUnit(
          this.gameState,
          'player',
          attacker.unit.instanceId,
          view.unit.instanceId
        );
        if (result.success) {
          this.selectedAttacker.setSelected(false);
          this.selectedAttacker = null;
          this.interactionMode = 'IDLE';
          this.refreshBoardsAndUI();
        } else {
          this.showMessage(result.message, '#ff4444');
        }
      }
    }
  }

  private handleEnemyHeroClick(): void {
    if (this.interactionMode !== 'SELECTING_TARGET' || !this.selectedAttacker) return;
    if (this.gameState.activePlayer !== 'player') return;
    if (this.isProcessingAI) return;

    const attacker = this.selectedAttacker;
    const result = attackWithUnit(
      this.gameState,
      'player',
      attacker.unit.instanceId,
      'hero'
    );
    if (result.success) {
      this.selectedAttacker.setSelected(false);
      this.selectedAttacker = null;
      this.interactionMode = 'IDLE';
      this.refreshBoardsAndUI();
    } else {
      this.showMessage(result.message, '#ff4444');
    }
  }

  private handleHeroPowerClick(): void {
    if (this.gameState.activePlayer !== 'player') return;
    if (this.gameState.phase !== 'MAIN') return;
    if (this.isProcessingAI) return;

    const result = useHeroPower(this.gameState, 'player');
    if (result.success) {
      this.showMessage(result.message, '#cc88ff');
      this.refreshBoardsAndUI();
    } else {
      this.showMessage(result.message, '#ff4444');
    }
  }

  private cancelSelection(): void {
    if (this.selectedAttacker) {
      this.selectedAttacker.setSelected(false);
      this.selectedAttacker = null;
    }
    if (this.selectedCard) {
      this.selectedCard.setSelected(false);
      this.tweens.add({ targets: this.selectedCard, y: this.HAND_Y, duration: 150 });
      this.selectedCard = null;
    }
    this.interactionMode = 'IDLE';
    this.updateInteractionUI();
  }

  private refreshBoardsAndUI(): void {
    this.renderBoard('player');
    this.renderBoard('ai');
    this.renderPlayerHand();
    this.renderAIHand();
    this.updateUI();
    this.checkGameOver();
  }

  // ── Hand Rendering ───────────────────────────────────────────────

  private renderAIHand(): void {
    this.aiHandCards.forEach(c => c.destroy());
    this.aiHandGfx.forEach(g => g.destroy());
    this.aiHandCards = [];
    this.aiHandGfx = [];

    const ai = this.gameState.players.ai;
    const handSize = ai.hand.length;
    const availW = this.RIGHT_PANEL_X - 10;
    const cardW = 24;
    const cardH = 34;
    const spacing = Math.min(30, (availW - cardW) / Math.max(1, handSize));
    const startX = (availW - (handSize - 1) * spacing - cardW) / 2 + cardW / 2;

    for (let i = 0; i < handSize; i++) {
      const cx = startX + i * spacing;
      // Card-back base
      const card = this.add.rectangle(cx, 95, cardW, cardH, 0x0d0d2a);
      card.setStrokeStyle(1, 0x5566bb);
      this.aiHandCards.push(card);

      // Card-back pattern: inner border + cross diagonals
      const gfx = this.add.graphics();
      const hw = Math.floor(cardW / 2) - 3;
      const hh = Math.floor(cardH / 2) - 3;
      gfx.lineStyle(1, 0x3344aa, 0.7);
      gfx.strokeRect(cx - hw, 95 - hh, hw * 2, hh * 2);
      gfx.lineStyle(1, 0x4455bb, 0.5);
      gfx.lineBetween(cx - hw, 95 - hh, cx + hw, 95 + hh);
      gfx.lineBetween(cx + hw, 95 - hh, cx - hw, 95 + hh);
      this.aiHandGfx.push(gfx);
    }
  }

  private renderPlayerHand(): void {
    this.handCardViews.forEach(c => c.destroy());
    this.handCardViews = [];
    this.selectedCard = null;

    const hand = this.gameState.players.player.hand;
    const availW = this.RIGHT_PANEL_X - 10;
    const maxCards = Math.min(hand.length, 7);
    const spacing = maxCards > 0 ? Math.min(CARD_WIDTH + 6, (availW - CARD_WIDTH) / Math.max(1, maxCards - 1)) : CARD_WIDTH + 6;
    const totalUsed = (maxCards - 1) * spacing + CARD_WIDTH;
    const startX = (availW - totalUsed) / 2 + CARD_WIDTH / 2;
    const cardY = this.HAND_Y;

    hand.slice(0, 7).forEach((card, i) => {
      const x = startX + i * spacing;
      const cardView = new CardView(this, x, cardY, card, true);
      cardView.setDepth(i);

      const playerEnergy = this.gameState.players.player.cursedEnergy;
      const isPlayerTurn = this.gameState.activePlayer === 'player';
      const isMainPhase = this.gameState.phase === 'MAIN';
      cardView.setPlayable(isPlayerTurn && isMainPhase && card.cost <= playerEnergy);

      cardView.on('pointerdown', () => this.handleCardClick(cardView));
      const capturedCard = card;
      let pressTimer: Phaser.Time.TimerEvent | null = null;
      cardView.on('pointerdown', () => {
        pressTimer = this.time.delayedCall(450, () => {
          pressTimer = null;
          this.showCardPreview(capturedCard);
        });
      });
      cardView.on('pointerup', () => {
        if (pressTimer) {
          pressTimer.remove();
          pressTimer = null;
        }
      });
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
    if (this.isProcessingAI) return;

    // Cancel board attack selection if any
    if (this.interactionMode === 'SELECTING_TARGET') {
      if (this.selectedAttacker) {
        this.selectedAttacker.setSelected(false);
        this.selectedAttacker = null;
      }
      this.interactionMode = 'IDLE';
      this.updateInteractionUI();
    }

    const cardY = this.HAND_Y;
    if (this.selectedCard === cardView) {
      cardView.setSelected(false);
      this.tweens.add({ targets: cardView, y: cardY, duration: 150 });
      this.selectedCard = null;
    } else {
      if (this.selectedCard) {
        this.selectedCard.setSelected(false);
        this.tweens.add({ targets: this.selectedCard, y: cardY, duration: 150 });
      }
      cardView.setSelected(true);
      this.tweens.add({ targets: cardView, y: cardY - 20, duration: 150 });
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
      this.playCardAnimation(this.selectedCard);
      this.selectedCard = null;
      this.time.delayedCall(420, () => {
        this.refreshBoardsAndUI();
      });
    } else {
      this.showMessage(result.message, '#ff4444');
    }
  }

  private playCardAnimation(cardView: CardView): void {
    const { width, height } = this.scale;
    this.tweens.add({
      targets: cardView,
      x: width / 2,
      y: height / 2,
      scaleX: 1.4,
      scaleY: 1.4,
      alpha: 0,
      duration: 380,
      ease: 'Power2',
    });
  }

  private handleEndTurn(): void {
    if (this.gameState.activePlayer !== 'player') return;
    if (this.gameState.phase === 'GAME_OVER') return;
    if (this.isProcessingAI) return;

    // Clear selection
    if (this.selectedAttacker) {
      this.selectedAttacker.setSelected(false);
      this.selectedAttacker = null;
    }
    this.interactionMode = 'IDLE';
    this.selectedCard = null;

    // Stop any end-turn pulse
    this.stopEndTurnPulse();

    endTurn(this.gameState);
    this.refreshBoardsAndUI();

    const phaseAfterEnd: string = this.gameState.phase;
    if (phaseAfterEnd === 'GAME_OVER') {
      this.checkGameOver();
      return;
    }

    // Show turn banner and start AI
    this.showTurnBanner(false);
    this.isProcessingAI = true;
    this.aiThinkingText.setText('思考中...');
    this.endTurnBtn.disableInteractive();
    this.playBtn.disableInteractive();
    this.heroPowerBtn.disableInteractive();

    this.time.delayedCall(900, () => {
      this.executeAIStepLoop();
    });
  }

  private executeAIStepLoop(maxSteps = 20): void {
    if (maxSteps <= 0 || this.gameState.phase !== 'MAIN') {
      this.finishAITurn();
      return;
    }
    const action = executeAIStep(this.gameState);
    this.renderAIHand();
    this.renderBoard('ai');
    this.renderBoard('player');
    this.updateUI();

    if (action !== null && this.gameState.winner === null) {
      this.time.delayedCall(600, () => {
        this.executeAIStepLoop(maxSteps - 1);
      });
    } else {
      this.finishAITurn();
    }
  }

  private finishAITurn(): void {
    if (this.gameState.phase === 'GAME_OVER') {
      this.isProcessingAI = false;
      this.aiThinkingText.setText('');
      this.checkGameOver();
      return;
    }

    this.time.delayedCall(800, () => {
      endTurn(this.gameState);
      this.isProcessingAI = false;
      this.aiThinkingText.setText('');
      this.endTurnBtn.setInteractive({ useHandCursor: true });
      this.playBtn.setInteractive({ useHandCursor: true });
      this.heroPowerBtn.setInteractive({ useHandCursor: true });
      this.refreshBoardsAndUI();
      this.showTurnBanner(true);
    });
  }

  // ── Turn Banner ───────────────────────────────────────────────────

  private showTurnBanner(isPlayer: boolean): void {
    const playX = this.RIGHT_PANEL_X / 2;
    const { height } = this.scale;
    const bannerText = isPlayer ? 'あなたのターン' : '相手のターン';
    const bannerColor = isPlayer ? '#aaffaa' : '#ffaaaa';

    const overlay = this.add.rectangle(playX, height / 2, this.RIGHT_PANEL_X, height, 0x000000, 0)
      .setDepth(150);
    const banner = this.add.text(playX, height / 2, bannerText, {
      fontSize: '34px', color: bannerColor,
      fontFamily: "'Noto Serif JP', serif", fontStyle: 'bold',
      backgroundColor: '#000000cc', padding: { x: 20, y: 12 },
    }).setOrigin(0.5, 0.5).setDepth(151).setAlpha(0);

    this.tweens.add({
      targets: overlay,
      alpha: 0.5,
      duration: 200,
      ease: 'Power2',
    });
    this.tweens.add({
      targets: banner,
      alpha: 1,
      duration: 200,
      ease: 'Power2',
      onComplete: () => {
        this.time.delayedCall(900, () => {
          this.tweens.add({
            targets: [overlay, banner],
            alpha: 0,
            duration: 300,
            ease: 'Power2',
            onComplete: () => { overlay.destroy(); banner.destroy(); },
          });
        });
      },
    });
  }

  // ── UI Update ─────────────────────────────────────────────────────

  private updateUI(): void {
    const state = this.gameState;
    const activePlayerName = state.players[state.activePlayer].nameJa;
    this.turnInfoText.setText(`ターン ${state.turn} — ${activePlayerName}のターン`);

    const phaseNames: Record<string, string> = {
      DRAW: 'ドローフェーズ',
      MAIN: 'メインフェーズ',
      END: 'エンドフェーズ',
      GAME_OVER: 'ゲーム終了',
    };
    this.phaseText.setText(phaseNames[state.phase] ?? state.phase);

    this.playerStatusBar.update(state.players.player);
    this.aiStatusBar.update(state.players.ai);

    const logLines = state.log.slice(-12);
    this.logText.setText(logLines.join('\n'));

    const isPlayerTurn = state.activePlayer === 'player';
    const isMainPhase = state.phase === 'MAIN';
    const playerEnergy = state.players.player.cursedEnergy;

    this.handCardViews.forEach(cv => {
      cv.setPlayable(isPlayerTurn && isMainPhase && cv.card.cost <= playerEnergy);
      cv.setAffordable(cv.card.cost <= playerEnergy);
    });

    // Update board unit attack-ready indicators
    if (isPlayerTurn && isMainPhase) {
      this.boardUnitViews.player.forEach(v => {
        if (this.interactionMode === 'IDLE') {
          v.setAttackReady(v.unit.canAttack);
        }
      });
    }

    // Button states
    const canInteract = isPlayerTurn && isMainPhase && !this.isProcessingAI;
    if (canInteract) {
      this.endTurnBtn.setInteractive({ useHandCursor: true });
      this.endTurnBtn.setFillStyle(0x224422);
      this.endTurnBtnText.setColor('#aaffaa');
      this.playBtn.setInteractive({ useHandCursor: true });
    } else {
      this.endTurnBtn.disableInteractive();
      this.endTurnBtn.setFillStyle(0x111111);
      this.endTurnBtnText.setColor('#555555');
    }

    // Hero power button
    const player = state.players.player;
    const hpUsed = player.heroPowerUsed;
    const hpAffordable = player.cursedEnergy >= 2;
    if (canInteract && !hpUsed && hpAffordable) {
      this.heroPowerBtn.setInteractive({ useHandCursor: true });
      this.heroPowerBtn.setFillStyle(0x441166);
      this.heroPowerBtnText.setColor('#cc88ff');
    } else {
      this.heroPowerBtn.setFillStyle(0x221133);
      this.heroPowerBtnText.setColor(hpUsed ? '#555555' : '#886699');
      if (!canInteract || hpUsed) {
        this.heroPowerBtn.disableInteractive();
      }
    }

    // Pulse End Turn button when no more player actions are available
    if (canInteract) {
      const hasPlayableCard = player.hand.some(c => c.cost <= playerEnergy);
      const hasAttackableUnit = player.board.some(u => u.canAttack);
      const canUseHeroPower = !hpUsed && hpAffordable;
      const hasActions = hasPlayableCard || hasAttackableUnit || canUseHeroPower;

      if (!hasActions) {
        this.startEndTurnPulse();
      } else {
        this.stopEndTurnPulse();
      }
    } else {
      this.stopEndTurnPulse();
    }

    this.updateInteractionUI();
  }

  private startEndTurnPulse(): void {
    if (!this.endTurnPulseTween) {
      this.endTurnBtn.setFillStyle(0x224422);
      this.endTurnPulseTween = this.tweens.add({
        targets: this.endTurnGlowRect,
        alpha: 0.25,
        duration: 500,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut',
      });
    }
  }

  private stopEndTurnPulse(): void {
    if (this.endTurnPulseTween) {
      this.endTurnPulseTween.stop();
      this.endTurnPulseTween = null;
      this.endTurnGlowRect.setAlpha(0);
    }
  }

  private updateInteractionUI(): void {
    switch (this.interactionMode) {
      case 'SELECTING_TARGET': {
        this.interactionModeText.setText('攻撃対象を選択（ESCでキャンセル）');
        this.interactionModeText.setVisible(true);
        this.turnInfoText.setAlpha(0.25);
        this.phaseText.setAlpha(0.25);
        // Persistent red border on valid targets
        const tauntUnits = this.gameState.players.ai.board.filter(u => u.hasTaunt);
        this.boardUnitViews.ai.forEach(v => {
          const isValid = tauntUnits.length === 0 || v.unit.hasTaunt;
          v.setAttackTarget(isValid);
        });
        // Subtle persistent tint on enemy hero area
        this.enemyHeroArea.setFillStyle(0xff2222, tauntUnits.length > 0 ? 0 : 0.1);
        break;
      }
      case 'SELECTING_ATTACKER':
        this.interactionModeText.setText('攻撃するユニットを選んでください（ESCでキャンセル）');
        this.interactionModeText.setVisible(true);
        this.turnInfoText.setAlpha(0.25);
        this.phaseText.setAlpha(0.25);
        break;
      default:
        this.interactionModeText.setVisible(false);
        this.turnInfoText.setAlpha(1);
        this.phaseText.setAlpha(1);
        // Reset all target highlights
        this.boardUnitViews.ai.forEach(v => v.setAttackTarget(false));
        this.enemyHeroArea.setFillStyle(0xffffff, 0);
    }
  }

  private showMessage(text: string, color = '#ffffff'): void {
    const { height } = this.scale;
    const msg = this.add.text(this.RIGHT_PANEL_X / 2, height / 2 - 40, text, {
      fontSize: '14px', color,
      fontFamily: "'Noto Serif JP', serif",
      backgroundColor: '#000000bb',
      padding: { x: 10, y: 6 },
    }).setOrigin(0.5, 0.5).setDepth(200);

    this.tweens.add({
      targets: msg,
      y: height / 2 - 90,
      alpha: 0,
      duration: 1600,
      ease: 'Power2',
      onComplete: () => msg.destroy(),
    });
  }

  private showCardPreview(card: DeckCard): void {
    const { width, height } = this.scale;
    const overlay = this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.75)
      .setDepth(300).setInteractive();

    const previewCard = new CardView(this, width / 2, height / 2, card);
    previewCard.setDepth(301).setScale(2.0);

    const closeText = this.add.text(width / 2, height / 2 + CARD_HEIGHT * 1.1, 'タップして閉じる', {
      fontSize: '14px', color: '#ffffff', fontFamily: "'Noto Serif JP', serif",
      backgroundColor: '#000000bb', padding: { x: 8, y: 4 },
    }).setOrigin(0.5, 0).setDepth(302);

    const closePreview = (): void => {
      overlay.destroy();
      previewCard.destroy();
      closeText.destroy();
    };
    overlay.on('pointerdown', closePreview);
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
