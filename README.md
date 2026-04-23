# JJK Hearthstone-Like Card Game GDD

## 1. Game Overview
**Working Title:** Cursed Domain  
**Genre:** Mobile turn-based collectible card game  
**Platform:** iOS, Android  
**Perspective:** Portrait-first, one-thumb friendly  
**Audience:** Anime fans, card game players, mobile strategy players  

### High Concept
A tactical card battler inspired by Hearthstone, set in a JJK-themed world. Players build decks of sorcerers, cursed techniques, and domain cards to defeat enemies in short, strategic matches.

### Design Pillars
- Fast matches, usually under 5 minutes.
- Easy to learn, hard to master.
- Strong character identity and anime-style spectacle.
- Collection and deck-building as long-term progression.

---

## 2. Game Feel
The game should feel strategic, readable, and dramatic.  
Players should constantly make decisions about resource use, board control, and timing of signature abilities.  
Big moments like Domain Expansion should feel rare, powerful, and visually unforgettable.

---

## 3. Core Gameplay Loop
1. Enter battle with a 30-card deck.
2. Draw cards and gain Cursed Energy each turn.
3. Play units, cast techniques, and use special effects.
4. Reduce the enemy’s HP to zero.
5. Earn rewards, upgrade cards, and build stronger decks.

---

## 4. Match Structure
The game uses a Hearthstone-like turn system with alternating turns and increasing resource generation [web:50][web:46].

### Turn Flow
- Start of turn: draw 1 card, gain 1 Cursed Energy.
- Action phase: play cards, attack, trigger skills.
- End turn: resolve end-of-turn effects.

### Victory Condition
Reduce the opponent’s Sorcerer HP to 0.

### Match Length
Target 3 to 5 minutes per match.

---

## 5. Core Systems

### Cursed Energy
The main resource used to play cards.  
It increases by 1 per turn, up to a cap.  
High-cost cards represent powerful techniques and domains.

### Board
Each player can have a limited number of active units on the field.  
The board should encourage tempo control, combo timing, and removal decisions.

### Hero/Sorcerer Identity
Each player selects a main sorcerer leader that defines their deck style.  
Leaders may have passive effects or a signature skill, similar to a hero power structure [web:50][web:46].

---

## 6. Card Types

### Sorcerer Cards
Main combat units with attack, health, and passive traits.

### Technique Cards
One-time abilities such as damage, buffs, debuffs, healing, and control.

### Domain Cards
High-impact cards that create a major swing in battle.

### Binding Vow Cards
Risk-reward cards with strong effects and a drawback.

### Cursed Object Cards
Special modifiers or combo enablers tied to lore.

---

## 7. Deck Rules
- Deck size: 30 cards.
- Duplicate limit: 2 copies per card.
- Legendary cards: 1 copy only.
- Decks are built around a leader/sorcerer identity.
- Each deck should have a clear strategy, not random good cards.

---

## 8. Factions and Themes
Use JJK-inspired groups and playstyles:
- **Tokyo Students:** balanced, flexible decks.
- **Kyoto Students:** control and tempo.
- **Special Grade:** high-risk, high-power cards.
- **Cursed Spirits:** swarm, disruption, and degeneration.
- **Assassin/Hidden factions:** burst, stealth, and precision.

---

## 9. Key Mechanics
- **Board Control:** fight for tempo and field presence.
- **Combo Play:** chain techniques for bonus effects.
- **Energy Curve:** build decks with low, mid, and high cost balance.
- **Removal:** ways to eliminate enemy units.
- **Finisher Turns:** domain or burst turns that end games.

---

## 10. Signature JJK Mechanics

### Domain Expansion
A high-cost card that creates a powerful temporary battle state.  
It should feel like a game-defining moment and be highly animated.

### Binding Vow
Players may gain power by accepting a tradeoff, such as taking damage, discarding cards, or losing future tempo.

### Black Flash-like Critical State
Certain conditions allow boosted damage or bonus effects when timing and combo conditions are met.

### Cursed Technique Synergy
Cards should interact by character theme, such as team-ups, status chaining, or technique layering.

---

## 11. Game Modes

### Story Mode
Single-player progression through anime-inspired arcs.

### PvE Battles
Standard fights against cursed spirits and bosses.

### Challenge Mode
Short run-based encounters with random rewards.

### PvP
Asynchronous or live duel mode for competitive play.

### Event Mode
Limited-time content tied to special themes or story arcs.

---

## 12. Progression
- Card leveling and upgrades.
- Character unlocks through story or collection milestones.
- Rank progression in PvP.
- Daily and weekly rewards.
- Event rewards and limited banners.

---

## 13. Economy
### Soft Currency
Earned through normal play and used for upgrades.

### Premium Currency
Used for card pulls, cosmetics, and convenience items.

### Upgrade Materials
Used for enhancement, skill growth, or card evolution.

### Gacha / Pull System
Used to obtain new characters and rare cards.

### Pity System
Guarantees a high-rarity reward after a fixed number of pulls.

---

## 14. Monetization
- Character and card pulls.
- Cosmetic card backs, effects, and profile themes.
- Monthly pass with premium rewards.
- Seasonal events and limited banners.
- No direct power sales in competitive play.

---

## 15. UI / UX
- Portrait orientation.
- Clear card text and readable icons.
- Fast tap interactions.
- Strong visual response for play, damage, and ultimates.
- Simple deck builder with filters, sorting, and favorites.

---

## 16. Art Direction
- Dark anime style with cursed energy effects.
- Strong silhouettes and expressive character poses.
- Cinematic animations for special moves.
- UI with sharp contrast and glowing highlights.

---

## 17. Audio Direction
- Tense battle music.
- Distinct sounds for draws, plays, hits, and ultimates.
- Heavy impact audio for Domain Expansion.
- Clean UI sounds that do not become tiring.

---

## 18. MVP Scope
The first version should include:
- 1v1 battles.
- 3 to 4 characters.
- 20 to 30 cards.
- Basic AI opponent.
- Simple deck builder.
- One story chapter.
- No online PvP in the MVP.

---

## 19. Final Stage Scope
- Full card pool.
- Ranked PvP.
- Seasonal events.
- Full collection system.
- Cosmetic monetization.
- Live balance updates.
- Ongoing content expansion.

---

## 20. Success Criteria
The game is successful if:
- New players understand the rules in under 3 minutes.
- Matches feel tense and satisfying.
- Domain Expansion moments are memorable.
- Players want to build new decks and replay content.
- Progression keeps users returning over time.

# Cursed Domain — Development Roadmap
### Hearthstone-Inspired JJK Card Game
**Repository:** alphakey-marketing/JKK-card
**Stack:** Phaser 3 + TypeScript + Vite

---

## Current State (Pre-Phase 1)

What is already built and working:
- Phaser 3 scene pipeline: MenuScene → GameScene → GameOverScene
- Turn-based game loop: Draw → Main → End phases
- Cursed Energy resource system
- 4 playable heroes: Yuji, Megumi, Nobara, Gojo
- 4 pre-built 30-card decks with unique card IDs
- 5 card types: SORCERER, TECHNIQUE, DOMAIN, BINDING_VOW, CURSED_OBJECT
- Attack interaction state machine: IDLE → SELECTING_ATTACKER → SELECTING_TARGET
- Basic AI opponent
- Board unit rendering and hero power system
- Log panel for battle history

Known bugs to fix before proceeding:
- Blurry fonts due to missing `resolution: window.devicePixelRatio` in Phaser config
- Player StatusBar overlapping hand cards (z-depth and y-position conflict)
- AI StatusBar cramped with AI hand cards at top of screen
- Font sizes too small (9–11px) at current canvas resolution
- Hardcoded layout constants not mobile-safe

---

## Phase 1 — Bug Fixes & Polish (Week 1–2)

**Goal:** Make the existing game stable, readable, and presentable to testers.

### 1.1 Fix Rendering Quality
- Add `resolution: window.devicePixelRatio` to Phaser config in `main.ts`
- Increase all font sizes by 2–4px across `CardView.ts`, `StatusBar.ts`, and `GameScene.ts`
- Replace `'Noto Serif JP'` with `'Noto Sans JP'` for all numeric stat displays
- Test on at least one HDPI screen (MacBook Retina, iPhone)

### 1.2 Fix Layout Collisions
- Move `playerStatusBar` into the right log panel below log text
- Move `aiStatusBar` into the right log panel at the top
- Set explicit `.setDepth()` values for all persistent UI elements
- Add a safe zone buffer above `HAND_Y` so cards never overlap the status area

### 1.3 Convert Layout to Relative Positioning
- Replace hardcoded values like `RIGHT_PANEL_X = 715` and `HAND_Y = 420` with
  `width * 0.79` and `height * 0.70` style calculations
- Verify layout integrity at 375×812 (iPhone SE), 390×844 (iPhone 14), and 414×896 (Plus)

### 1.4 Card Readability Improvements
- Dim unaffordable cards in hand (alpha 0.45) when cost exceeds available Cursed Energy
- Fix `wrapText()` in `CardView.ts` to use `CARD_WIDTH`-relative character count
  instead of a hardcoded limit of 10
- Add a tap-to-preview modal that shows full-size card detail on long press

### 1.5 AI Timing
- Add staggered delays between individual AI card plays (currently all plays are instant)
- Show a per-action indicator when AI deploys a unit or uses its hero power

**Exit Criteria:** A stranger can read all card text, understand the board, and complete a full match without confusion.

---

## Phase 2 — Core Game Depth (Week 3–6)

**Goal:** Expand the card pool and game systems to create meaningful strategic decisions.

### 2.1 Expand Card Pool
- Add 2 new heroes: Nanami Kento, Toge Inumaki
- Build 30-card decks for each new hero in `decks.ts`
- Add new card entries to `cards.ts` for each hero's unique techniques
- Introduce at least 2 Legendary-rarity cards per hero (1 copy limit per deck)
- Aim for 120+ unique cards total across all heroes

### 2.2 Card Keywords System
Add a formal keyword system in `cards.ts` to replace plain text descriptions:

| Keyword | Effect |
|---|---|
| `Taunt` | Must be attacked first (existing mechanic, add taunt flag) |
| `Rush` | Can attack immediately on the turn it is played |
| `Lifesteal` | Damage dealt restores HP to the player |
| `Binding` | Prevents target from attacking next turn |
| `Cursed Surge` | Gains bonus effect if you have 7+ Cursed Energy |

### 2.3 Synergy Bond System
- Add a `synergyWith: string[]` field to `CardData`
- When two bonded cards are in play simultaneously, trigger a passive bonus
- Examples: Yuji + Nobara = +1 attack to all units, Megumi + Nue = flying unit gains +2 defense

### 2.4 Improve AI Difficulty
- Implement a basic scoring function in `GameState.ts` for AI card evaluation
- Replace random AI card selection with greedy best-play logic
- Add a second AI tier (Grade 1 difficulty) that calculates trade-offs

### 2.5 Deck Builder Screen
- Add a new `DeckBuilderScene.ts` scene
- Allow players to browse all cards, filter by type and hero, and build custom decks
- Enforce deck rules: 30 cards max, 2 copies per card, 1 Legendary per deck
- Save deck configurations to `localStorage`

**Exit Criteria:** Players can build a custom deck, battle an AI opponent with meaningful decisions, and feel distinct playstyle differences between all 6 heroes.

---

## Phase 3 — Mobile First & Visual Upgrade (Week 7–10)

**Goal:** Make the game feel native on mobile and elevate visual quality.

### 3.1 Portrait Mode Conversion
- Redesign game canvas from `900×600` landscape to `480×854` portrait layout
- Remap all scene coordinates to the new canvas ratio
- Hand area moves to the bottom third, board occupies the center, status at the very top
- Log panel becomes a collapsible overlay drawer (tap icon to open)

### 3.2 Card Artwork Integration
- Create a standard card art area in `CardView.ts` between the card name and stats row
- Load placeholder silhouette art for each character using color-coded shapes
- Prepare art slot specifications for a future illustrator handoff
  - Card art dimensions: 100×60px per card
  - File format: PNG with transparency, exported at 2x resolution

### 3.3 Domain Expansion Animation
- Implement a full-screen overlay animation for Domain card plays
- Sequence: screen flash → domain name text fills screen → environment tint for 2 turns
- Each domain card gets a unique background tint color
- Animate camera shake on impact using Phaser's camera effects

### 3.4 Sound Design Integration
- Add Phaser audio manager setup in `main.ts`
- Assign audio cue slots: card draw, card play, attack hit, block, domain activation, win, lose
- Implement with free-license audio placeholders initially (e.g., freesound.org sources)
- Audio settings toggle in MenuScene

### 3.5 Animate Battle Events
- Add floating damage numbers when units take damage
- Add a brief shake tween to units when they are hit
- Add a death dissolve animation when a unit HP reaches zero
- Show `BLACK FLASH` critical text overlay when a bonus effect triggers

**Exit Criteria:** The game runs smoothly at 60fps on a mid-range Android device and feels visually comparable to a beta-quality mobile card game.

---

## Phase 4 — Progression & Accounts (Week 11–16)

**Goal:** Build the infrastructure that turns a single playable game into a returning experience.

### 4.1 User Accounts and Cloud Save
- Integrate Firebase Authentication (anonymous login first, then Google/Apple sign-in)
- Store player profile, card collection, deck configs, and rank in Firestore
- Sync progress across devices

### 4.2 Collection System
- Every card has an `owned` count tracked in the player profile
- Players start with a base starter set (one full deck of their chosen hero)
- Cards outside the starter set must be earned or pulled
- Collection screen shows all cards, greys out unowned cards with lock icon

### 4.3 Progression Currency
- Introduce Cursed Tokens (soft currency) earned from story missions and daily quests
- Introduce Jujutsu Coins (premium currency) as IAP or small daily rewards
- Both currencies stored server-side in Firebase

### 4.4 Gacha Pull System
- Standard Banner: 100 Cursed Tokens per pull, standard card pool
- Featured Banner: Jujutsu Coins only, new limited character featured
- Pity counter: Guaranteed Legendary at 90 pulls, resets per banner
- Pull history screen showing last 90 pulls

### 4.5 Daily & Weekly Quest System
- Daily: Win 3 matches, play 10 Technique cards, deal 30 damage with hero power
- Weekly: Complete a story chapter, win 10 ranked matches, collect a new card
- Quest rewards: Cursed Tokens, card packs, hero cosmetics

### 4.6 Player Grade Ranking
- Grades: Grade 4 → Grade 3 → Grade 2 → Grade 1 → Special Grade
- Grade advances through accumulated ranked PvP wins
- Each grade unlocks a cosmetic reward and a lore flavor text

**Exit Criteria:** Players have a reason to return every day and a progression path visible for at least 30 days.

---

## Phase 5 — PvP and Soft Launch (Week 17–22)

**Goal:** Introduce real human competition and release to a limited audience.

### 5.1 Asynchronous PvP
- Record player deck and decision sequence during a match
- Match new players against recorded "ghost" sessions of real players
- Requires no real-time server infrastructure, compatible with Firebase
- Display opponent's hero and deck name as if they are live

### 5.2 Live PvP (If Retention Justifies Cost)
- Implement WebSocket matchmaking using a lightweight Node.js server or Colyseus
- Match players within the same grade tier
- 60-second turn timer with auto-end-turn on timeout
- Reconnection support (game state stored server-side)

### 5.3 Ranked Season System
- Season length: 30 days
- End-of-season rewards based on peak rank: card packs, exclusive cosmetics, avatar frames
- Season leaderboard showing top 100 players

### 5.4 Story Mode
- Build `StoryScene.ts` with 5 chapters mapped to JJK-inspired arcs
  - Chapter 1: Orientation Arc — tutorial and first battles
  - Chapter 2: Vs. Finger Bearer Arc — introduce Technique cards
  - Chapter 3: Exchange Event Arc — full 30-card deck battles
  - Chapter 4: Vs. Mahito Arc — introduce Domain Expansion
  - Chapter 5: Shibuya Incident Arc — boss-level AI encounters
- Story missions reward cards outside the starter set
- Story completion unlocks a permanent bonus card for the player's account

### 5.5 Soft Launch
- Release on Google Play in a single region (Hong Kong, Taiwan, or Southeast Asia)
- Limit to 5,000–10,000 installs for performance and balance testing
- Monitor: Day 1 retention target >40%, Day 7 target >20%, average session >8 minutes

**Exit Criteria:** Real players are completing matches, retention targets are met, and at least one monetization loop is generating revenue.

---

## Phase 6 — Full Monetization & Live Service (Week 23+)

**Goal:** Run the game as a sustainable live service product.

### 6.1 Monetization Stack
- IAP: Jujutsu Coins in bundles ($0.99 to $49.99)
- Monthly Pass ($4.99/month): daily Cursed Token bonus, exclusive card back, premium quest rewards
- Cosmetic Shop: card backs, animated Domain borders, profile avatars, board skins
- Limited Event Banners: new characters tied to seasonal or anime-release windows
- No direct power sale — competitive decks must be buildable via free play

### 6.2 Event System
- Monthly limited events with unique game rules (e.g., Domain-only matches, 1-life battles)
- Events award limited cosmetics and exclusive cards not available in standard banners
- Events are announced 7 days in advance with in-game notifications

### 6.3 Balance Update Cadence
- Bi-weekly card balance patches based on win-rate data
- Overpowered cards receive cost increases or effect nerfs
- Underpowered cards receive buffs or new synergies
- Balance notes published in-game and on Discord

### 6.4 Expansion Sets
- Every 3 months, release a new card set of 40–60 cards
- Each set introduces a new arc theme (e.g., Culling Game set, Hidden Inventory set)
- New sets add 1–2 new hero characters
- Old cards remain in the standard format for 12 months, then rotate to a Classic mode

### 6.5 Community and Marketing
- Discord server for deck sharing and meta discussion
- Content creator program (share replay links, deck codes)
- Monthly tournament with in-game prize distribution
- Localization: Traditional Chinese first (HK/TW priority), then Japanese and English

---

## Milestone Summary

| Phase | Timeline | Key Deliverable |
|---|---|---|
| Pre-Phase 1 | Done | Working 1v1 engine, 4 heroes, basic AI |
| Phase 1 | Week 1–2 | Bug-free, readable, stable game |
| Phase 2 | Week 3–6 | 6 heroes, 120+ cards, deck builder, keyword system |
| Phase 3 | Week 7–10 | Portrait mobile layout, card art slots, animations |
| Phase 4 | Week 11–16 | Accounts, collection, gacha, daily quests |
| Phase 5 | Week 17–22 | PvP, story mode, soft launch |
| Phase 6 | Week 23+ | Full monetization, live events, expansion sets |

---

## Technical Debt to Resolve Before Phase 4

These structural issues in the current codebase will block scaling if not fixed early:

- `cards.ts` is a single 30KB file — split into `cards/sorcerers.ts`, `cards/techniques.ts`, etc.
- All layout values in `GameScene.ts` are hardcoded — move to a `layout.config.ts` constants file
- `GameState.ts` handles AI logic inline — extract to a dedicated `AIEngine.ts`
- No unit tests exist — add at minimum tests for `playCard`, `attackWithUnit`, and `endTurn`
- No error boundary for missing card IDs in `buildDeck()` — currently throws, should degrade gracefully
