import Phaser from 'phaser';
import { ALL_CARDS, CardType, CardData } from '../data/cards';
import { CardView, CARD_WIDTH, CARD_HEIGHT } from '../ui/CardView';

const STORAGE_KEY = 'jkk_custom_decks';
const CARDS_PER_PAGE = 15;
const MAX_DECK_SIZE = 30;
const MAX_COPIES = 2;

type HeroId = 'yuji' | 'megumi' | 'nobara' | 'gojo' | 'nanami' | 'toge';

export class DeckBuilderScene extends Phaser.Scene {
  private selectedHero: HeroId = 'yuji';
  private currentPage = 0;
  private filterType: string | null = null;
  private cardGridViews: CardView[] = [];
  private deckListTexts: Phaser.GameObjects.Text[] = [];
  private deck: Map<string, number> = new Map();
  private deckCountText!: Phaser.GameObjects.Text;
  private pageText!: Phaser.GameObjects.Text;
  private statusText!: Phaser.GameObjects.Text;
  private filteredCards: CardData[] = [];

  constructor() {
    super({ key: 'DeckBuilderScene' });
  }

  create(): void {
    const { width, height } = this.scale;

    // Background
    this.add.rectangle(width / 2, height / 2, width, height, 0x060612);

    // Title
    this.add.text(width / 2, 24, 'デッキビルダー', {
      fontSize: '26px', color: '#ffffff', fontFamily: "'Noto Serif JP', serif", fontStyle: 'bold',
    }).setOrigin(0.5, 0.5);

    this.add.text(width / 2, 44, 'でっきびるだー', {
      fontSize: '11px', color: '#888888', fontFamily: "'Noto Serif JP', serif",
    }).setOrigin(0.5, 0.5);

    // Hero selector row
    this.createHeroSelector(width);

    // Filter bar
    this.createFilterBar(width);

    // Card grid area (left side)
    this.add.rectangle(width * 0.38, height / 2 + 20, width * 0.76 - 10, height - 130, 0x0a0a1a, 0.6);

    // Deck panel (right side)
    this.add.rectangle(width * 0.88, height / 2 + 20, width * 0.24 - 10, height - 130, 0x100808, 0.8);
    const deckPanelX = width - (width * 0.24) / 2;

    this.add.text(deckPanelX, 100, 'デッキ', {
      fontSize: '16px', color: '#ffffff', fontFamily: "'Noto Serif JP', serif", fontStyle: 'bold',
    }).setOrigin(0.5, 0.5);

    this.deckCountText = this.add.text(deckPanelX, 118, '0 / 30', {
      fontSize: '13px', color: '#aaaaaa', fontFamily: "'Noto Sans JP', monospace",
    }).setOrigin(0.5, 0.5);

    // Deck list container
    this.deckListTexts = [];

    // Pagination buttons
    const gridBottom = height - 60;
    const prevBtn = this.add.rectangle(80, gridBottom, 100, 30, 0x222244);
    prevBtn.setInteractive({ useHandCursor: true });
    const prevGfx = this.add.graphics();
    prevGfx.lineStyle(1, 0x4444aa, 1);
    prevGfx.strokeRect(30, gridBottom - 15, 100, 30);
    this.add.text(80, gridBottom, '◀ 前ページ', {
      fontSize: '12px', color: '#aaaaff', fontFamily: "'Noto Serif JP', serif",
    }).setOrigin(0.5, 0.5);
    prevBtn.on('pointerdown', () => this.changePage(-1));
    prevBtn.on('pointerover', () => prevBtn.setFillStyle(0x444488));
    prevBtn.on('pointerout', () => prevBtn.setFillStyle(0x222244));

    this.pageText = this.add.text(200, gridBottom, '', {
      fontSize: '12px', color: '#888888', fontFamily: "'Noto Sans JP', monospace",
    }).setOrigin(0.5, 0.5);

    const nextBtn = this.add.rectangle(330, gridBottom, 100, 30, 0x222244);
    nextBtn.setInteractive({ useHandCursor: true });
    const nextGfx = this.add.graphics();
    nextGfx.lineStyle(1, 0x4444aa, 1);
    nextGfx.strokeRect(280, gridBottom - 15, 100, 30);
    this.add.text(330, gridBottom, '次ページ ▶', {
      fontSize: '12px', color: '#aaaaff', fontFamily: "'Noto Serif JP', serif",
    }).setOrigin(0.5, 0.5);
    nextBtn.on('pointerdown', () => this.changePage(1));
    nextBtn.on('pointerover', () => nextBtn.setFillStyle(0x444488));
    nextBtn.on('pointerout', () => nextBtn.setFillStyle(0x222244));

    // Save button
    const saveBtn = this.add.rectangle(deckPanelX, height - 80, width * 0.22, 32, 0x225522);
    saveBtn.setInteractive({ useHandCursor: true });
    this.add.text(deckPanelX, height - 80, 'デッキを保存', {
      fontSize: '13px', color: '#aaffaa', fontFamily: "'Noto Serif JP', serif", fontStyle: 'bold',
    }).setOrigin(0.5, 0.5);
    saveBtn.on('pointerdown', () => this.saveDeck());
    saveBtn.on('pointerover', () => saveBtn.setFillStyle(0x336633));
    saveBtn.on('pointerout', () => saveBtn.setFillStyle(0x225522));

    // Clear button
    const clearBtn = this.add.rectangle(deckPanelX, height - 44, width * 0.22, 28, 0x552222);
    clearBtn.setInteractive({ useHandCursor: true });
    this.add.text(deckPanelX, height - 44, 'クリア', {
      fontSize: '12px', color: '#ffaaaa', fontFamily: "'Noto Serif JP', serif",
    }).setOrigin(0.5, 0.5);
    clearBtn.on('pointerdown', () => this.clearDeck());
    clearBtn.on('pointerover', () => clearBtn.setFillStyle(0x773333));
    clearBtn.on('pointerout', () => clearBtn.setFillStyle(0x552222));

    // Back button
    const backBtn = this.add.rectangle(60, height - 18, 100, 26, 0x221122);
    backBtn.setInteractive({ useHandCursor: true });
    this.add.text(60, height - 18, '◀ 戻る', {
      fontSize: '12px', color: '#cc88ff', fontFamily: "'Noto Serif JP', serif",
    }).setOrigin(0.5, 0.5);
    backBtn.on('pointerdown', () => {
      this.cameras.main.fade(400, 0, 0, 0, false, (_: unknown, p: number) => {
        if (p === 1) this.scene.start('MenuScene');
      });
    });

    // Status text
    this.statusText = this.add.text(width / 2, height - 18, '', {
      fontSize: '12px', color: '#ffcc44', fontFamily: "'Noto Serif JP', serif",
    }).setOrigin(0.5, 0.5);

    // Load existing deck
    this.loadDeck();
    this.refreshFilteredCards();
    this.renderCardGrid();
    this.renderDeckPanel();
  }

  private createHeroSelector(width: number): void {
    const heroes: { id: HeroId; nameJa: string; color: number }[] = [
      { id: 'yuji', nameJa: '虎杖', color: 0xcc3300 },
      { id: 'megumi', nameJa: '伏黒', color: 0x004488 },
      { id: 'nobara', nameJa: '釘崎', color: 0x993366 },
      { id: 'gojo', nameJa: '五条', color: 0x440088 },
      { id: 'nanami', nameJa: '七海', color: 0x443300 },
      { id: 'toge', nameJa: '狗巻', color: 0x002233 },
    ];

    const btnW = 80;
    const gap = 6;
    const totalW = heroes.length * (btnW + gap) - gap;
    const startX = (width - totalW) / 2 + btnW / 2;

    heroes.forEach((h, i) => {
      const x = startX + i * (btnW + gap);
      const btn = this.add.rectangle(x, 65, btnW, 26, h.color, 0.5);
      btn.setInteractive({ useHandCursor: true });
      const border = this.add.graphics();
      const drawBorder = (alpha: number): void => {
        border.clear();
        border.lineStyle(h.id === this.selectedHero ? 2 : 1, h.color, alpha);
        border.strokeRect(x - btnW / 2, 65 - 13, btnW, 26);
      };
      drawBorder(1);

      const txt = this.add.text(x, 65, h.nameJa, {
        fontSize: '13px', color: '#ffffff', fontFamily: "'Noto Serif JP', serif",
      }).setOrigin(0.5, 0.5);

      btn.on('pointerdown', () => {
        this.selectedHero = h.id;
        this.currentPage = 0;
        this.deck = new Map();
        this.loadDeck();
        this.refreshFilteredCards();
        this.renderCardGrid();
        this.renderDeckPanel();
        // Update all borders
        this.scene.restart();
        // Simpler: just reload the scene data (restart not ideal; just redraw)
      });
      btn.on('pointerover', () => { btn.setAlpha(0.8); txt.setColor('#ffff88'); });
      btn.on('pointerout', () => { btn.setAlpha(0.5); txt.setColor('#ffffff'); });
    });
  }

  private createFilterBar(width: number): void {
    const filters: { label: string; value: string | null }[] = [
      { label: 'すべて', value: null },
      { label: '術師', value: CardType.SORCERER },
      { label: '術式', value: CardType.TECHNIQUE },
      { label: '領域', value: CardType.DOMAIN },
      { label: '縛り', value: CardType.BINDING_VOW },
      { label: '呪具', value: CardType.CURSED_OBJECT },
    ];

    const btnW = 68;
    const gap = 5;
    const totalW = filters.length * (btnW + gap) - gap;
    const startX = Math.min(20 + btnW / 2, (width * 0.76 - totalW) / 2 + btnW / 2);

    filters.forEach((f, i) => {
      const x = startX + i * (btnW + gap);
      const btn = this.add.rectangle(x, 90, btnW, 22, 0x222233);
      btn.setInteractive({ useHandCursor: true });
      const txt = this.add.text(x, 90, f.label, {
        fontSize: '12px', color: '#aaaacc', fontFamily: "'Noto Serif JP', serif",
      }).setOrigin(0.5, 0.5);
      btn.on('pointerdown', () => {
        this.filterType = f.value;
        this.currentPage = 0;
        this.refreshFilteredCards();
        this.renderCardGrid();
      });
      btn.on('pointerover', () => { btn.setFillStyle(0x333355); txt.setColor('#ffffff'); });
      btn.on('pointerout', () => { btn.setFillStyle(0x222233); txt.setColor('#aaaacc'); });
    });
  }

  private refreshFilteredCards(): void {
    this.filteredCards = ALL_CARDS.filter(c => {
      if (this.filterType && c.type !== this.filterType) return false;
      return true;
    });
  }

  private renderCardGrid(): void {
    this.cardGridViews.forEach(v => v.destroy());
    this.cardGridViews = [];

    const { width } = this.scale;
    const cols = 5;
    const startX = 16 + CARD_WIDTH / 2;
    const startY = 116 + CARD_HEIGHT / 2;
    const spacingX = (width * 0.76 - CARD_WIDTH) / (cols - 1);
    const spacingY = CARD_HEIGHT + 8;

    const pageCards = this.filteredCards.slice(
      this.currentPage * CARDS_PER_PAGE,
      (this.currentPage + 1) * CARDS_PER_PAGE
    );

    const totalPages = Math.max(1, Math.ceil(this.filteredCards.length / CARDS_PER_PAGE));
    this.pageText.setText(`${this.currentPage + 1} / ${totalPages}`);

    pageCards.forEach((card, i) => {
      const col = i % cols;
      const row = Math.floor(i / cols);
      const x = startX + col * spacingX;
      const y = startY + row * spacingY;

      const cardView = new CardView(this, x, y, card as any, true);
      const count = this.deck.get(card.id) ?? 0;
      if (count >= MAX_COPIES || (card.isLegendary && count >= 1)) {
        cardView.setAlpha(0.4);
      }

      cardView.on('pointerdown', () => this.addCardToDeck(card));
      cardView.on('pointerover', () => {
        if ((this.deck.get(card.id) ?? 0) < (card.isLegendary ? 1 : MAX_COPIES)) {
          this.tweens.add({ targets: cardView, y: y - 8, duration: 120 });
        }
      });
      cardView.on('pointerout', () => {
        this.tweens.add({ targets: cardView, y, duration: 120 });
      });

      this.cardGridViews.push(cardView);
    });
  }

  private renderDeckPanel(): void {
    this.deckListTexts.forEach(t => t.destroy());
    this.deckListTexts = [];

    const { width } = this.scale;
    const panelX = width - (width * 0.24) / 2;
    const startY = 135;
    const lineH = 16;

    let totalCards = 0;
    let i = 0;
    this.deck.forEach((count, cardId) => {
      const card = ALL_CARDS.find(c => c.id === cardId);
      if (!card) return;
      totalCards += count;
      const label = `${card.nameJa} ×${count}`;
      const txt = this.add.text(panelX - (width * 0.24) / 2 + 4, startY + i * lineH, label, {
        fontSize: '10px', color: '#dddddd', fontFamily: "'Noto Serif JP', serif",
      });
      txt.setInteractive({ useHandCursor: true });
      txt.on('pointerdown', () => this.removeCardFromDeck(cardId));
      txt.on('pointerover', () => txt.setColor('#ff8888'));
      txt.on('pointerout', () => txt.setColor('#dddddd'));
      this.deckListTexts.push(txt);
      i++;
    });

    this.deckCountText.setText(`${totalCards} / ${MAX_DECK_SIZE}`);
    const color = totalCards === MAX_DECK_SIZE ? '#aaffaa' : totalCards > MAX_DECK_SIZE ? '#ff4444' : '#aaaaaa';
    this.deckCountText.setColor(color);
  }

  private addCardToDeck(card: CardData): void {
    const current = this.deck.get(card.id) ?? 0;
    const maxCopies = card.isLegendary ? 1 : MAX_COPIES;
    const total = Array.from(this.deck.values()).reduce((a, b) => a + b, 0);

    if (current >= maxCopies) {
      this.showStatus(`${card.nameJa}は最大${maxCopies}枚まで`);
      return;
    }
    if (total >= MAX_DECK_SIZE) {
      this.showStatus('デッキは30枚まで');
      return;
    }
    this.deck.set(card.id, current + 1);
    this.renderDeckPanel();
    this.renderCardGrid();
  }

  private removeCardFromDeck(cardId: string): void {
    const current = this.deck.get(cardId) ?? 0;
    if (current <= 1) {
      this.deck.delete(cardId);
    } else {
      this.deck.set(cardId, current - 1);
    }
    this.renderDeckPanel();
    this.renderCardGrid();
  }

  private saveDeck(): void {
    const total = Array.from(this.deck.values()).reduce((a, b) => a + b, 0);
    if (total !== MAX_DECK_SIZE) {
      this.showStatus(`デッキは${MAX_DECK_SIZE}枚必要です（現在: ${total}枚）`);
      return;
    }
    const stored = this.loadStoredDecks();
    const deckArray: string[] = [];
    this.deck.forEach((count, cardId) => {
      for (let i = 0; i < count; i++) deckArray.push(cardId);
    });
    stored[this.selectedHero] = deckArray;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stored));
    this.showStatus('デッキを保存しました！');
  }

  private clearDeck(): void {
    this.deck = new Map();
    this.renderDeckPanel();
    this.renderCardGrid();
    this.showStatus('デッキをクリアしました');
  }

  private loadDeck(): void {
    const stored = this.loadStoredDecks();
    const saved = stored[this.selectedHero];
    this.deck = new Map();
    if (saved) {
      saved.forEach(id => {
        this.deck.set(id, (this.deck.get(id) ?? 0) + 1);
      });
    }
  }

  private loadStoredDecks(): Record<string, string[]> {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) return JSON.parse(raw) as Record<string, string[]>;
    } catch {
      // ignore parse errors
    }
    return {};
  }

  private changePage(delta: number): void {
    const totalPages = Math.max(1, Math.ceil(this.filteredCards.length / CARDS_PER_PAGE));
    this.currentPage = Math.max(0, Math.min(totalPages - 1, this.currentPage + delta));
    this.renderCardGrid();
  }

  private showStatus(msg: string): void {
    this.statusText.setText(msg);
    this.time.delayedCall(2500, () => {
      if (this.statusText.active) this.statusText.setText('');
    });
  }
}
