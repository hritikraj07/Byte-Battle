<div align="center">

  <h1>BYTE BATTLE</h1>
  <p><strong>Retro Neon Arcade — An interactive gamified technology arena. Works 100% offline.</strong></p>

  <p>
    BYTE BATTLE is a retro-neon browser arcade inspired by GH-Arcade, built with Next.js 14, Tailwind CSS, HTML5 Canvas, and Dexie.js (IndexedDB). It features 12 playable retro games, authentic CRT scanlines, 3D pixel headings, progressive category filters, dedicated leaderboards, and instant offline PWA installation.
  </p>

  <p>
    <a href="https://github.com/hritikraj07/AFTERHOURS/blob/main/LICENSE"><img src="https://img.shields.io/badge/License-MIT-00F0FF.svg?style=flat-square" alt="License: MIT" /></a>
    <a href="https://nextjs.org/"><img src="https://img.shields.io/badge/Next.js-14-black.svg?style=flat-square&logo=next.js" alt="Next.js 14" /></a>
    <a href="https://www.typescriptlang.org/"><img src="https://img.shields.io/badge/TypeScript-5.x-blue.svg?style=flat-square&logo=typescript" alt="TypeScript 5" /></a>
    <a href="https://tailwindcss.com/"><img src="https://img.shields.io/badge/Tailwind-CSS-38B2AC.svg?style=flat-square&logo=tailwind-css" alt="Tailwind CSS" /></a>
    <a href="https://dexie.com/"><img src="https://img.shields.io/badge/Storage-IndexedDB%20(Dexie)-purple.svg?style=flat-square" alt="Dexie.js IndexedDB" /></a>
    <a href="https://vitest.dev/"><img src="https://img.shields.io/badge/Tests-28%2F28%20Passed-green.svg?style=flat-square&logo=vitest" alt="Vitest Passed" /></a>
    <a href="#pwa-and-offline-architecture"><img src="https://img.shields.io/badge/PWA-100%25%20Offline-00F0FF.svg?style=flat-square" alt="Offline Ready" /></a>
  </p>

  <p>
    <strong>Built by <a href="https://github.com/hritikraj07" target="_blank" rel="noopener noreferrer">Hritik Raj</a></strong>
  </p>

  <p>
    <a href="#quick-start">Quick Start</a> •
    <a href="#arcade-games-catalog">Arcade Games</a> •
    <a href="#visual-design--gh-arcade-aesthetic">Arcade Design</a> •
    <a href="#technology-stack">Technology Stack</a> •
    <a href="#project-structure">Project Structure</a> •
    <a href="#pwa-and-offline-architecture">PWA & Offline</a> •
    <a href="#contributing">Contributing</a> •
    <a href="#license--credits">License & Credits</a>
  </p>

</div>

---

## Quick Start

Run BYTE BATTLE locally in three simple steps:

### 1. Clone the Repository
```bash
git clone https://github.com/hritikraj07/AFTERHOURS.git
cd AFTERHOURS
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Start the Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to experience the retro arcade.

### Verification & Test Commands
```bash
# Run the complete test suite (28 unit and integration tests)
npm test

# Type-check TypeScript codebase
npx tsc --noEmit

# Build production bundle
npm run build
```

---

## Visual Design & GH-Arcade Aesthetic

- **Atmosphere:** Deep black palette (`#05050D`, `#0D0D22`, `#101023`) with cyan (`#00F0FF`) and hot-pink (`#FF2E97`) neon glows.
- **CRT Scanlines:** Subtle hardware-style scanline overlay with `pointer-events: none` across the viewport.
- **Perspective Grid Floor:** CSS perspective grid floor expanding under the hero section.
- **Typography:** *Press Start 2P* pixel font for headlines, game titles, and labels, paired with clean *Space Grotesk* for readable body text.
- **One-Click PWA Install:** Prominent cyan-outlined `Install the arcade — plays offline` button above the game catalog.
- **Category Filters:** Dynamic category pills (`All`, `2-Player`, `Action`, `Arcade`, `Classic`, `Endless`, `Puzzle`, `Shooter`).
- **Keyboard Shortcuts:** Press `/` to search, `Esc` to close modals, `R` for a random game run.

---

## Arcade Games Catalog

BYTE BATTLE features 12 playable browser games:

| Game | Category | Description | Primary Controls |
| :--- | :--- | :--- | :--- |
| **Pattern Shift** | Puzzle | Decode Grade 10–12 Board-level math/CS sequences with progressive hints & See Answer reveal drawer. | Mouse / Touch / Keys `1-4` |
| **Word Weave** | Puzzle | Linguistic logic challenge. Transform words via semantic cluster solving. | Mouse / Touch / Keyboard |
| **Pulse Jumper** | Arcade, Action | 60 FPS rhythm platformer running on HTML5 Canvas across 5 tuned difficulty tiers. | Spacebar / Arrow Up / Tap |
| **Reflex Rush** | Action | Millisecond-precision reaction test measuring neural reaction speed. | Spacebar / Click / Tap |
| **Memory Matrix** | Puzzle | Visual spatial pattern recall (Easy: 4×4, Medium: 5×5, Hard: 6×6). | Mouse / Touch |
| **Color Clash** | Action, Arcade | Stroop-effect reflex challenge testing semantic and color incongruence. | Keys `1-4` / Mouse / Touch |
| **Orbit Dodge** | Arcade | Responsive celestial debris avoidance with smooth mouse and touch tracking. | Pointer Movement |
| **Stack Sprint** | Arcade | High-speed isometric block-stacking accuracy challenge. | Spacebar / Click / Tap |
| **Number Blitz** | Puzzle | Fast-paced mental arithmetic equations under countdown pressure. | Mouse / Touch / Keys |
| **Maze Runner** | Classic | Procedurally generated braided labyrinth navigation. | Arrow Keys / WASD / Swipe |
| **Pixel Invaders** | Shooter | Retro arcade space shooter with laser barrages and enemy motherships. | Arrow Keys / Space / Touch |
| **2048 Neo** | Classic, Puzzle | 4×4 cybernetic tile sliding puzzle. Merge matching values to reach the 2048 tile. | Arrow Keys / WASD / Swipe |

---

## Technology Stack

- **Framework:** [Next.js 14](https://nextjs.org/) (App Router)
- **Language:** [TypeScript 5](https://www.typescriptlang.org/) (Strict mode enabled)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/) with neon arcade design tokens
- **Storage:** [Dexie.js](https://dexie.com/) (IndexedDB wrapper for personal bests & high scores)
- **Testing:** [Vitest](https://vitest.dev/) (Unit and integration test runner)
- **Visuals & Icons:** HTML5 Canvas 2D, SVG component artwork, and [Lucide Icons](https://lucide.dev/)
- **PWA & Offline:** Service Worker (`sw.js`) with cache-first strategy and Web App Manifest

---

## PWA and Offline Architecture

BYTE BATTLE is built offline-first:
- **Zero External Dependencies for Gameplay:** Fonts, sounds, and assets are bundled locally.
- **Service Worker Shell:** Automatically caches JavaScript bundles, stylesheets, icons, and static assets.
- **IndexedDB Storage:** All personal best scores and attempt history persist locally in browser storage.
- **Cross-Platform Install:** Native browser installation prompt on desktop and mobile.

---

## License & Credits

- **Author & Maintainer:** Built by [Hritik Raj](https://github.com/hritikraj07)
- **License:** Distributed under the [MIT License](LICENSE).
- **Fonts:**
  - *Press Start 2P* by CodeMan38 (SIL Open Font License 1.1)
  - *Space Grotesk* by Florian Karsten (SIL Open Font License 1.1)
