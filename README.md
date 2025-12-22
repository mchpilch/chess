# Chess ♟

Chess game implementation using **PIXI.js** and **TypeScript**.

> Project status: in early development 🚧

## Overview

Early-stage chess application built as an after-work hobby project, focused on **clean architecture** and **clear separation of responsibilities**.

The project is intentionally built **from scratch**, without external chess libraries, to deeply understand:
- chess rules and edge cases
- move generation
- game state management
- architectural design decisions

## Features (current)

- Chessboard rendering with PIXI.js ✅
- FEN parsing for initial board setup ✅
- Board and piece state management ✅
- Move generation for pieces ✅
- Drag & drop interaction ✅
- Highlighting of possible moves and captures ✅
- Turn management ✅

## Architecture

The codebase is structured to clearly separate concerns:
- 🧠 **Domain logic** – board state, rules, move generation
- 🎨 **Rendering layer** – PIXI.js views
- 🎮 **Controllers** – game flow and user interaction

The goal is to build a fully playable, customizable chess game and gradually extend it with advanced features.

## Tech Stack

- TypeScript
- PIXI.js
- Vite
- Custom event & state management
- No external chess libraries

## Running the project

Developed with Node.js `v22.19.0`.

Inside the `chess` directory:

```
npm install
npm run dev
```

Then open the local development server displayed in the console.

## Roadmap (todo)

### Core chess rules
- Implement full move legality (check, check avoidance)
- Castling, promotion, en passant

### Game features
- Game clocks
- Move history
- PGN/FEN import/export

### Advanced (long-term)
- Stockfish integration
- Online play
- Chess engine / AI opponent

## Author

[@MichalPilch](https://www.linkedin.com/in/mchpilch)  
More about me: https://mchpilch.github.io
