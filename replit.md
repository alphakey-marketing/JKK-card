# JKK Card Game

## Overview
A web-based single-player collectible card game (CCG) inspired by Jujutsu Kaisen. Features turn-based battles against an AI opponent using characters from the anime/manga.

## Tech Stack
- **Language**: TypeScript
- **Game Engine**: Phaser 3 (v3.90.0)
- **Build Tool**: Vite (v8.0.9)
- **Package Manager**: npm

## Project Structure
```
src/
  data/       - Card and deck definitions
  game/       - Core game logic (GameState.ts)
  scenes/     - Phaser scenes (Menu, Game, GameOver)
  ui/         - Phaser UI components (CardView, BoardUnitView, StatusBar)
  utils/      - Helper utilities (furigana)
  main.ts     - Entry point
public/
  fonts/      - Custom Japanese fonts (NotoSansJP, NotoSerifJP)
```

## Development
- Run: `npm run dev` (serves on port 5000)
- Build: `npm run build`
- The Vite dev server is configured for Replit: host `0.0.0.0`, port `5000`, all hosts allowed.

## Game Mechanics
- Turn-based phases: DRAW -> MAIN -> END
- Resource: Cursed Energy (呪力), increases each turn
- Card types: SORCERER (units), TECHNIQUE/DOMAIN (one-time effects)
- Win condition: Reduce opponent HP (30) to 0
