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
