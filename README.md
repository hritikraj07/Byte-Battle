<div align="center">

  <h1>BYTE BATTLE</h1>
  <p><strong>Enter the arcade. Master the challenge. Beat your best.</strong></p>

  <p>
    BYTE BATTLE is a neon-inspired browser arcade featuring interactive mini-games, puzzle challenges, reflex tests, and retro-style gameplay. Choose a challenge, set your difficulty, and chase your personal best.
  </p>

  <p>
    <a href="https://github.com/hritikraj07/BYTE-BATTLE/blob/main/LICENSE"><img src="https://img.shields.io/badge/License-MIT-00F0FF.svg?style=flat-square" alt="License: MIT" /></a>
    <a href="https://nextjs.org/"><img src="https://img.shields.io/badge/Next.js-14-black.svg?style=flat-square&logo=next.js" alt="Next.js 14" /></a>
    <a href="https://www.typescriptlang.org/"><img src="https://img.shields.io/badge/TypeScript-5.x-blue.svg?style=flat-square&logo=typescript" alt="TypeScript 5" /></a>
    <a href="https://tailwindcss.com/"><img src="https://img.shields.io/badge/Tailwind-CSS-38B2AC.svg?style=flat-square&logo=tailwind-css" alt="Tailwind CSS" /></a>
    <a href="https://dexie.com/"><img src="https://img.shields.io/badge/Storage-IndexedDB%20(Dexie)-purple.svg?style=flat-square" alt="Dexie.js IndexedDB" /></a>
    <a href="https://vitest.dev/"><img src="https://img.shields.io/badge/Tests-Vitest-green.svg?style=flat-square&logo=vitest" alt="Vitest Passed" /></a>
    <a href="#pwa-and-offline-architecture"><img src="https://img.shields.io/badge/PWA-100%25%20Offline-FF2E97.svg?style=flat-square" alt="Offline Ready" /></a>
  </p>

  <p>
    <strong>Built by <a href="https://github.com/hritikraj07">Hritik Raj</a></strong>
  </p>

  <p>
    <a href="#quick-start">Quick Start</a> •
    <a href="#features">Features</a> •
    <a href="#game-catalog">Game Catalog</a> •
    <a href="#category-filtering--gameplay-flow">Gameplay Flow</a> •
    <a href="#technology-stack">Technology Stack</a> •
    <a href="#project-structure">Project Structure</a> •
    <a href="#pwa-and-offline-architecture">PWA & Offline</a> •
    <a href="#contributing">Contributing</a> •
    <a href="#license">License</a>
  </p>

</div>

---

## Quick Start

Run BYTE BATTLE locally in three simple steps:

### 1. Clone the Repository
```bash
git clone https://github.com/hritikraj07/BYTE-BATTLE.git
cd BYTE-BATTLE
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Start the Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to experience the arcade.

### Additional Build Commands
```bash
# Run unit and integration tests (Vitest)
npm test

# Build the production bundle
npm run build

# Start the production server
npm start
```

---

## Features

- **Retro-Arcade Visual Atmosphere:** Authentic CRT horizontal scanlines overlay, 3D perspective floor grid, and glowing cyan and hot-pink pixel typography with physical drop-shadow offsets.
- **11 Interactive Mini-Games:** Spanning logic deduction, linguistic clustering, spatial agility, 60 FPS rhythm platforming, mental arithmetic, and arcade space defense.
- **Random Game Selector:** Quick-launch button selecting a random eligible arcade game with pre-run nickname confirmation and difficulty customization.
- **Scoped Run Setup:** Confirm your player handle and pick game-specific difficulty tiers before every session with distinct color accents:
  - **Easy:** `#3B82F6` (Electric Blue)
  - **Medium:** `#22C55E` (Arcade Green)
  - **Hard:** `#EF4444` (Laser Red)
- **100% Offline-First Architecture:** Complete client-side functionality using browser-native IndexedDB (`Dexie.js`) and Service Worker asset caching.
- **Progressive Web App (PWA):** Installable on desktop and mobile browsers via a glowing cyan install button with cross-platform prompt handling.
- **Per-Game Leaderboards:** Isolated personal best scores and top run history stored locally without account requirements.
- **Category Filter Pills:** Rapidly filter games across `All`, `2-Player`, `Action`, `Arcade`, `Classic`, `Endless`, `Puzzle`, and `Shooter`.
- **Fixed Viewport Arena Layout:** Active gameplay locks to a full-height `100dvh` stage with disabled page scrolling and responsive HUD controls.
- **Sound Control Center:** Fine-tune master volume, sound effects, and music channels with instant persistence.

---

## Game Catalog

| Game | Category | Description | Primary Controls |
| :--- | :--- | :--- | :--- |
| **Pattern Shift** | Puzzle | Decode corrupted register sequences: Fibonacci series, quadratic deltas, alternating logic, and visual rotations. Progressive hints available. | Mouse / Touch / Keys `1-4` |
| **Word Weave** | Puzzle | Linguistic logic challenge. Transform words via semantic cluster solving and category matching. | Mouse / Touch / Keyboard |
| **Pulse Jumper** | Arcade, Action | 60 FPS rhythm platformer running on HTML5 Canvas. Leap over spikes and gaps across 5 tuned difficulty tiers. | Spacebar / Arrow Up / Tap |
| **Reflex Rush** | Action, Arcade | Test human reaction speed against randomized visual cues with millisecond accuracy telemetry. | Spacebar / Mouse Click / Touch |
| **Memory Matrix** | Puzzle | Simon-says style grid pattern recall that scales in grid size and flash velocity. | Mouse / Touch |
| **Color Clash** | Arcade, Action | Cognitive Stroop-effect challenge. Match color meanings against ink colors under time pressure. | Click / Keyboard Shortcuts |
| **Orbit Dodge** | Action, Endless | Circular physics arena. Rotate your ship around a central gravity well to dodge radial debris. | Left/Right Arrows / Touch |
| **Stack Sprint** | Arcade, Classic | Precision vertical block stacking. Align oscillating neon slabs to construct the highest tower. | Spacebar / Click / Tap |
| **Number Blitz** | Puzzle, Arcade | Mental arithmetic time-attack. Rapidly compute target numbers using operators and number cards. | Numpad / Click / Touch |
| **Maze Runner** | Puzzle, Classic | Procedural neon labyrinth. Navigate through the dark maze to reach the terminal beacon before energy expires. | Arrow Keys / WASD / Swipe |
| **Pixel Invaders** | Shooter, Classic | Retro arcade space shooter. Defend your sector against descending extraterrestrial waves. | Left/Right Arrows / Space / Touch |

---

## Category Filtering & Gameplay Flow

### Category Filter Pills
The catalog toolbar features real-time category filtering:
- **All:** Displays the complete arcade lineup.
- **2-Player:** Displays multiplayer titles (graceful empty state if none are currently active).
- **Action:** High-energy reflex and obstacle navigation games.
- **Arcade:** Fast-paced arcade score chasers.
- **Classic:** Retro-inspired homages to iconic arcade mechanics.
- **Endless:** Survival and stamina challenges.
- **Puzzle:** Computational, linguistic, and memory reasoning arenas.
- **Shooter:** Target acquisition and projectile combat games.

### Pre-Run Setup Flow
Before any game launches, a modal prompts the player to:
1. Confirm or enter their arcade nickname (sanitized and remembered in local storage).
2. Select the difficulty for that specific run:
   - Standard 3-tier: **Easy** (`#3B82F6`), **Medium** (`#22C55E`), **Hard** (`#EF4444`).
   - Extended 5-tier for Pulse Jumper: **Easy**, **Normal**, **Hard**, **Expert**, **Insane**.
3. Launch directly into the dedicated viewport (`/play/[game]?diff=[difficulty]`).

---

## Technology Stack

- **Framework:** [Next.js 14](https://nextjs.org/) (App Router, Server Components & Client Arenas)
- **Language:** [TypeScript 5](https://www.typescriptlang.org/) (Strict mode enabled)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/) with custom neon tokens and keyframe animations
- **Local Persistence:** [Dexie.js](https://dexie.com/) (IndexedDB wrapper for offline scores and history)
- **Testing:** [Vitest](https://vitest.dev/) (Unit and integration test runner)
- **Audio & Visuals:** Web Audio API synth oscillators, HTML5 Canvas 2D, and [Lucide Icons](https://lucide.dev/)
- **PWA & Offline:** Service Worker (`sw.js`) with cache-first static shell strategy and Web App Manifest

---

## Project Structure

```
BYTE BATTLE/
├── public/                       # Static public assets & PWA configuration
│   ├── favicon.ico
│   ├── manifest.webmanifest      # PWA Web App Manifest
│   ├── sw.js                     # Service Worker offline caching strategy
│   └── icons/                    # App icons (192x192, 512x512, maskable)
├── src/
│   ├── app/                      # Next.js App Router pages
│   │   ├── layout.tsx            # Root layout, fonts, scanlines overlay, navbar & footer
│   │   ├── page.tsx              # Home arcade: Hero, PWA install, Random Game, Catalog
│   │   ├── globals.css           # Neon tokens, perspective grid, 3D text glow styles
│   │   ├── games/                # Searchable arcade catalog hub
│   │   ├── play/[game]/          # Fullscreen fixed gameplay viewport & HUD
│   │   ├── leaderboard/          # High scores and rankings
│   │   └── settings/             # Audio and display configuration
│   ├── components/               # Reusable React components
│   │   ├── artwork/              # Custom SVG pixel artwork for game cards
│   │   ├── common/               # Install button, Setup modal, HUD, Logo
│   │   ├── layout/               # Navbar and Footer (Built by Hritik Raj)
│   │   └── leaderboard/          # Per-game leaderboard modal
│   ├── data/                     # Game catalogs and puzzle registries
│   │   └── gamesList.ts          # Registry of active games, categories, and metadata
│   ├── games/                    # Isolated mini-game engines and canvas renderers
│   ├── hooks/                    # usePWA, useAudio, useTimer, useLeaderboard
│   ├── services/                 # Dexie.js database schemas and score calculators
│   └── types/                    # TypeScript interfaces for games, puzzles, and scores
├── tests/                        # Vitest automated test suite
│   ├── unit/                     # Logic, scoring, sanitization, and puzzle validators
│   └── integration/              # IndexedDB persistence and leaderboards
├── CONTRIBUTING.md               # Guide for open-source contributors
├── LICENSE                       # MIT License
├── package.json                  # Dependencies and build scripts
├── tailwind.config.ts            # Theme palette, retro fonts, and animations
└── tsconfig.json                 # TypeScript strict compiler configuration
```

---

## PWA and Offline Architecture

BYTE BATTLE is built to run anywhere—even in air-gapped classrooms or offline laptops:

- **Zero Runtime CDNs:** Fonts (`Press Start 2P` and `Space Grotesk`) are bundled locally during the Next.js build.
- **Service Worker Shell:** Automatically caches JavaScript bundles, stylesheets, icons, and assets on first visit.
- **IndexedDB Storage:** All personal bests, nicknames, and gameplay records persist locally in browser storage.
- **Installation Flow:**
  - **Chromium / Android:** Native one-click installation prompt.
  - **iOS Safari:** Interactive guide for adding to Home Screen.
  - **Standalone Mode:** Automatically detects installed state and adjusts interface accordingly.

---

## Contributing

Contributions are welcome! Please read [CONTRIBUTING.md](CONTRIBUTING.md) for details on code guidelines, local setup, and testing before submitting a Pull Request.

---

## License & Credits

- **Author & Maintainer:** Built by [Hritik Raj](https://github.com/hritikraj07)
- **License:** Distributed under the [MIT License](LICENSE).
- **Fonts:**
  - *Press Start 2P* by CodeMan38 (SIL Open Font License 1.1)
  - *Space Grotesk* by Florian Karsten (SIL Open Font License 1.1)
