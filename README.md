<div align="center">

  <h1>AFTERHOURS</h1>
  <p><strong>A place for the unexpected. Explore beyond the ordinary.</strong></p>

  <p>
    AFTERHOURS is an immersive, multi-experience digital platform combining speculative futures, local AI laboratories, frontier intelligence radar, cyber identity synthesis, temporal time capsules, generative visual worlds, and a championship retro neon arcade.
  </p>

  <p>
    <a href="https://github.com/hritikraj07/AFTERHOURS/blob/main/LICENSE"><img src="https://img.shields.io/badge/License-MIT-A78BFA.svg?style=flat-square" alt="License: MIT" /></a>
    <a href="https://nextjs.org/"><img src="https://img.shields.io/badge/Next.js-14-black.svg?style=flat-square&logo=next.js" alt="Next.js 14" /></a>
    <a href="https://www.typescriptlang.org/"><img src="https://img.shields.io/badge/TypeScript-5.x-blue.svg?style=flat-square&logo=typescript" alt="TypeScript 5" /></a>
    <a href="https://tailwindcss.com/"><img src="https://img.shields.io/badge/Tailwind-CSS-38B2AC.svg?style=flat-square&logo=tailwind-css" alt="Tailwind CSS" /></a>
    <a href="https://dexie.com/"><img src="https://img.shields.io/badge/Storage-IndexedDB%20(Dexie)-purple.svg?style=flat-square" alt="Dexie.js IndexedDB" /></a>
    <a href="https://vitest.dev/"><img src="https://img.shields.io/badge/Tests-Vitest-green.svg?style=flat-square&logo=vitest" alt="Vitest Passed" /></a>
    <a href="#pwa-and-offline-architecture"><img src="https://img.shields.io/badge/PWA-100%25%20Offline-00F0FF.svg?style=flat-square" alt="Offline Ready" /></a>
  </p>

  <p>
    <strong>Built by <a href="https://github.com/hritikraj07" target="_blank" rel="noopener noreferrer">Hritik Raj</a></strong>
  </p>

  <p>
    <a href="#quick-start">Quick Start</a> •
    <a href="#platform-experiences">Platform Experiences</a> •
    <a href="#arcade-catalog">Arcade Catalog</a> •
    <a href="#technology-stack">Technology Stack</a> •
    <a href="#project-structure">Project Structure</a> •
    <a href="#pwa-and-offline-architecture">PWA & Offline</a> •
    <a href="#contributing">Contributing</a> •
    <a href="#license--credits">License & Credits</a>
  </p>

</div>

---

## Quick Start

Run AFTERHOURS locally in three simple steps:

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

Open [http://localhost:3000](http://localhost:3000) in your browser to experience the platform.

### Additional Build Commands
```bash
# Run unit and integration tests (Vitest)
npm test

# Type-check TypeScript without emitting output
npx tsc --noEmit

# Build the production bundle
npm run build

# Start the production server
npm start
```

---

## Platform Experiences

AFTERHOURS connects multiple distinct digital worlds under one cohesive, dark editorial umbrella:

1. **AFTERHOURS Command Center (`/`):** Central dark-editorial portal hub (`#090A0F`) with celestial navigation, feature discovery cards, curated exploration tracks, and direct access to every laboratory.
2. **Arcade Arena (`/games`):** The complete 12-game retro neon arcade. Fully offline-ready with persistent IndexedDB high scores, category filters, and keyboard shortcuts.
3. **Future Lab (`/future`):**
   - *Life in 2036:* Interactive forecasts across seven societal vectors (Smart Habitats, Skyways, Neural Learning, Decentralized Labor, Synthetic Realities, Companion AI, Digital Society).
   - *Future Simulator:* Deterministic scenario simulation engine balancing Biosphere, Stability, Tech Velocity, and Human Flourishing.
4. **AI Studio (`/ai-studio`):**
   - *Prompt Transformer:* Deterministic client-side semantic prompt expansion supporting 5 cinematic and analytical modes.
   - *Concept Weaver:* Cross-domain dialectic synthesis combining contrasting concepts into creative blueprints.
   - *Cognitive Spectrum:* Real-time syntactic density, emotional valence, and readability telemetry.
5. **Tomorrow Radar (`/discover`):**
   - Frontier technology intelligence scanning Quantum Computing, Clean Energy, Bipedal Robotics, Neuromorphic AI, and Digital Provenance.
   - Technology Readiness Level (TRL 1–9) indicator meters, search filtering, and brief bookmarking.
6. **Digital Identity Lab (`/identity`):**
   - Cybernetic ID badge generator with live tilt preview, customizable callsigns, holographic foil shaders, and avatar glyphs.
   - One-click local storage persistence and JSON credential export.
7. **Time Capsule (`/time-capsule`):**
   - Temporal vault for future predictions, personal milestones, and letters.
   - Countdown clocks, sealed encryption states, and local persistence.
8. **Neonverse (`/neonverse`):**
   - Fullscreen canvas visual environments: *The Synthwave Nebula*, *The Quantum Expanse* (n-body interactive gravity), and *The Chrono Spire*.
   - Live velocity and particle density controls.

---

## Arcade Catalog

The arcade subsystem (`/games` and `/play/[game]`) preserves the championship mini-games:

| Game | Category | Description | Primary Controls |
| :--- | :--- | :--- | :--- |
| **Pattern Shift** | Puzzle | Decode Grade 10–12 Board-level math/CS sequences with progressive hints & See Answer reveal drawer. | Mouse / Touch / Keys `1-4` |
| **Word Weave** | Puzzle | Linguistic logic challenge. Transform words via semantic cluster solving. | Mouse / Touch / Keyboard |
| **Pulse Jumper** | Arcade, Action | 60 FPS rhythm platformer running on HTML5 Canvas across 5 tuned difficulty tiers. | Spacebar / Arrow Up / Tap |
| **PalmDrive Rally** | Action | Gesture-controlled racing with real-time computer vision and keyboard arrow controls. | Arrow Keys / Webcam |
| **Memory Matrix** | Puzzle | Visual spatial pattern recall (Easy: 4×4, Medium: 5×5, Hard: 6×6). | Mouse / Touch |
| **Color Clash** | Action, Arcade | Stroop-effect reflex challenge testing semantic and color incongruence. | Keys `1-4` / Mouse / Touch |
| **Reflex Rush** | Action | Millisecond-precision reaction test measuring neural reaction speed. | Spacebar / Click / Tap |
| **Stack Sprint** | Arcade | High-speed isometric block-stacking accuracy challenge. | Spacebar / Click / Tap |
| **Orbit Dodge** | Arcade | Responsive celestial debris avoidance with mouse and touch tracking. | Pointer Movement |
| **Number Blitz** | Puzzle | Fast-paced mental arithmetic under countdown pressure. | Mouse / Touch / Keys |
| **Maze Runner** | Classic | Procedurally generated braided labyrinth navigation. | Arrow Keys / WASD / Swipe |
| **Pixel Invaders** | Shooter | Retro arcade space shooter with laser barrages and enemy motherships. | Arrow Keys / Mouse / Click |
| **2048 Neo** | Classic, Puzzle | 4×4 tile sliding puzzle. Merge matching values to reach the 2048 tile. | Arrow Keys / WASD / Swipe |

---

## Technology Stack

- **Framework:** [Next.js 14](https://nextjs.org/) (App Router with thin route containers)
- **Language:** [TypeScript 5](https://www.typescriptlang.org/) (Strict mode enabled)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/) with custom design tokens for each feature
- **Architecture:** Feature-Sliced modular design (`src/features/*`)
- **Local Persistence:** [Dexie.js](https://dexie.com/) (IndexedDB wrapper for arcade scores and offline vault)
- **Testing:** [Vitest](https://vitest.dev/) (Unit and integration test runner)
- **Visuals & Icons:** HTML5 Canvas 2D, SVG component artwork, and [Lucide Icons](https://lucide.dev/)
- **PWA & Offline:** Service Worker (`sw.js`) with cache-first strategy and Web App Manifest

---

## Project Structure

```
AFTERHOURS/
├── public/                       # Static assets & PWA configuration
│   ├── favicon.ico
│   ├── manifest.webmanifest      # PWA Web App Manifest (AFTERHOURS branding)
│   ├── sw.js                     # Offline caching service worker (afterhours-v1.0.0)
│   └── icons/                    # App launcher icons (192x192, 512x512, maskable)
├── src/
│   ├── app/                      # Next.js App Router route containers
│   │   ├── layout.tsx            # Global layout: AFTERHOURS metadata, fonts, Navbar & Footer
│   │   ├── page.tsx              # AFTERHOURS command center / homepage
│   │   ├── globals.css           # Global tokens, CRT scanlines, perspective grid
│   │   ├── future/               # Future Lab route container
│   │   ├── ai-studio/            # AI Studio route container
│   │   ├── discover/             # Tomorrow Radar route container
│   │   ├── identity/             # Digital Identity Lab route container
│   │   ├── time-capsule/         # Time Capsule route container
│   │   ├── neonverse/            # Neonverse canvas route container
│   │   ├── games/                # Protected mini-games catalog hub
│   │   ├── play/[game]/          # Fullscreen game arena container
│   │   ├── leaderboard/          # Global tournament leaderboard
│   │   ├── settings/             # Audio and system configuration
│   │   └── host/                 # Host tournament controls & live projector display
│   ├── features/                 # Modular feature-sliced domain implementations
│   │   ├── future/               # Future Lab data, LifeIn2036, FutureSimulator
│   │   ├── ai-studio/            # AI Studio data, PromptTransformer, ConceptWeaver, ToneAnalyzer
│   │   ├── discover/             # Tomorrow Radar data, RadarCard, RadarFeed
│   │   ├── identity/             # Digital Identity data, IdentityBadge, IdentityEditor
│   │   ├── time-capsule/         # Time Capsule data, CapsuleCard, CreateCapsuleModal
│   │   └── neonverse/            # Neonverse data, canvas rendering engine, WorldControls
│   ├── components/               # Reusable shared UI components
│   │   ├── artwork/              # Custom SVG game card artwork
│   │   ├── common/               # AfterhoursLogo, ByteBattleLogo, GameHUD, Modals
│   │   ├── layout/               # Navbar and Footer (Built by Hritik Raj)
│   │   └── leaderboard/          # Per-game leaderboard modal
│   ├── data/                     # Game definitions and curated puzzle catalogs
│   │   ├── gamesList.ts          # Registry of active games, categories, routes
│   │   └── puzzles/              # Curated JSON puzzle catalogs (Pattern Shift, Word Weave, etc.)
│   ├── games/                    # Protected mini-game engines and canvas arenas
│   ├── hooks/                    # Reusable React hooks (usePWA, useAudio, useTimer, etc.)
│   ├── services/                 # Persistence, sanitizer, scoring, and DB layers
│   └── types/                    # Shared TypeScript interfaces
├── tests/                        # Vitest automated test suite
│   ├── unit/                     # Logic, scoring, sanitizer, and puzzle tests
│   ├── integration/              # IndexedDB persistence tests
│   └── setup.ts                  # Test environment initialization (fake-indexeddb)
├── AGENTS.md                     # Architecture and developer guidelines
├── CONTRIBUTING.md               # Contributing guidelines
├── LICENSE                       # MIT License
├── package.json                  # Dependencies and scripts
├── tailwind.config.ts            # Tailwind configuration
├── tsconfig.json                 # TypeScript strict compiler configuration
└── vitest.config.ts              # Vitest test runner configuration
```

---

## PWA and Offline Architecture

AFTERHOURS is engineered for offline reliability:

- **Zero Runtime CDNs:** Local fonts and assets ensure seamless execution in offline and air-gapped environments.
- **Service Worker Shell:** Automatically caches JavaScript bundles, stylesheets, icons, and static assets on first visit.
- **IndexedDB Storage:** All personal bests, high scores, time capsule vaults, and digital identity personas persist locally in browser storage.
- **Cross-Platform Install:** Full PWA support with desktop Chrome installation prompts and guided iOS Safari "Add to Home Screen" instructions.

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
