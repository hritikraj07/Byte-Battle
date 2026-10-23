# AGENTS.md — Developer and AI Agent Guidelines for BYTE BATTLE

> **Target Audience:** Future AI coding assistants, autonomous software agents, and human developers contributing to or maintaining the **BYTE BATTLE** codebase.

---

## 1. Project Philosophy & Core Directives

BYTE BATTLE is an interactive, gamified technology arena designed for school students participating in university outreach programs and educational hackathons. Because the application frequently runs in **resource-constrained, offline, single-laptop environments**, all agents modifying or extending this repository must adhere to the following core tenets:

1. **Zero External Dependencies for Core Gameplay:** Never introduce runtime libraries, fonts, or APIs that fail when an internet connection is absent.
2. **Honesty and Verification Over Speculation:** Never add placeholder mock logic that pretends to be a completed feature. Never claim a test has passed unless it was executed in the test runner. Clearly label planned vs. implemented features.
3. **Immutability and Pure Logic:** Keep game engines, puzzle validation algorithms, and scoring formulas as pure, deterministic functions separated from React UI components.
4. **Data Integrity & Best Score Policy:** Replaying a game must never inflate an overall leaderboard score. Only the highest valid score for each game contributes to the session aggregate.

---

## 2. Project Architecture & Directory Layout

The application follows a modular, feature-oriented structure. Future agents must maintain this directory hierarchy:

```
BYTE BATTLE/
├── .github/                      # CI/CD workflows and automated checks
├── public/                       # Static public assets
│   ├── favicon.ico
│   ├── manifest.webmanifest      # PWA Web App Manifest
│   ├── icons/                    # PWA launcher icons (192x192, 512x512, maskable)
│   └── audio/                    # Compressed sound effects (SFX)
├── src/
│   ├── assets/                   # Vector graphics, logos, and illustration SVGs
│   ├── components/               # Shared, reusable UI components
│   │   ├── common/               # Buttons, Inputs, Modals, Badges, Tooltips
│   │   ├── layout/               # Navbar, Footer, Fullscreen Shell, Kiosk Header
│   │   ├── leaderboard/          # Leaderboard tables, Rank badges, Podium displays
│   │   └── host/                 # Host controls, PIN auth, Session config, Data export
│   ├── data/                     # Static game data and puzzle catalogs
│   │   └── puzzles/
│   │       ├── pattern-shift.json# 30 curated Pattern Shift puzzles
│   │       ├── word-weave.json   # 30 curated Word Weave puzzles
│   │       ├── code-cracker.json # 30 curated Code Cracker puzzles
│   │       └── grid-tactician.json# 20 curated Grid Tactician puzzles
│   ├── games/                    # Mini-game implementations (isolated submodules)
│   │   ├── pattern-shift/        # Pattern Shift arena components & engine
│   │   ├── word-weave/           # Word Weave arena components & engine
│   │   ├── code-cracker/         # Code Cracker arena components & engine
│   │   ├── grid-tactician/       # Grid Tactician arena components & engine
│   │   ├── pulse-jumper/         # Pulse Jumper 1-button rhythm platformer
│   │   └── palmdrive-rally/      # PalmDrive Rally 2D physics & gesture camera
│   ├── hooks/                    # Custom React hooks (useTimer, useAudio, useIndexedDB)
│   ├── services/                 # Persistence, sync, and storage abstraction layers
│   │   ├── db.ts                 # Dexie.js IndexedDB schema and client
│   │   ├── storage.ts            # Local/Session storage helpers
│   │   ├── export.ts             # CSV and JSON export routines
│   │   └── supabase.ts           # Optional Supabase client (guarded fallback)
│   ├── styles/                   # Global CSS, theme tokens, animations
│   │   ├── index.css             # Base styles, Tailwind directives, font imports
│   │   └── animations.css        # Keyframes for arcade neon pulses, confetti
│   ├── types/                    # Shared TypeScript interfaces and type definitions
│   │   ├── event.ts              # Session, Participant, Host PIN types
│   │   ├── game.ts               # Game states, moves, validation results
│   │   ├── puzzle.ts             # Universal and game-specific puzzle schemas
│   │   └── leaderboard.ts        # Leaderboard entry, aggregation, ranking types
│   ├── utils/                    # Pure utility functions (sanitization, scoring, date)
│   ├── App.tsx                   # Main router / view switcher
│   └── main.tsx                  # Application bootstrap & Service Worker registration
├── tests/                        # Automated unit, integration, and e2e tests
│   ├── unit/                     # Logic tests for puzzle validators & scoring
│   ├── integration/              # IndexedDB persistence & leaderboard calculation tests
│   └── e2e/                      # Playwright browser automation tests
├── index.html                    # Single Page Application HTML root
├── package.json                  # Dependencies, scripts, and project metadata
├── tsconfig.json                 # TypeScript compiler configuration (strict mode)
├── vite.config.ts                # Vite build and PWA plugin configuration
└── [DOCUMENTATION FILES]          # Markdown documentation suite (10 root files)
```

---

## 3. Coding Conventions & Naming Rules

### 3.1 File & Directory Naming
- **Components:** PascalCase (e.g., `LeaderboardTable.tsx`, `KioskLayout.tsx`).
- **Hooks:** camelCase with `use` prefix (e.g., `useGameTimer.ts`, `useOfflineDB.ts`).
- **Services & Utilities:** camelCase (e.g., `scoreCalculator.ts`, `sanitizeInput.ts`).
- **Type Definitions:** camelCase with descriptive nouns (e.g., `puzzle.ts`, `leaderboard.ts`).
- **Data Files:** kebab-case (e.g., `pattern-shift.json`, `code-cracker.json`).

### 3.2 Symbol & Variable Naming
- **Interfaces & Types:** PascalCase, descriptive nouns (e.g., `ParticipantRecord`, `GameScoreAttempt`).
- **Variables & Functions:** camelCase (e.g., `calculateOverallScore`, `activeSessionId`).
- **Constants & Enums:** UPPER_SNAKE_CASE (e.g., `MAX_HINTS_PER_PUZZLE`, `DEFAULT_COUNTDOWN_SECONDS`).
- **Boolean Variables:** Prefix with `is`, `has`, `should`, or `can` (e.g., `isOfflineReady`, `hasSubmitted`).

---

## 4. TypeScript & React Guidelines

1. **Strict Type Checking:** `strict: true` is enforced in `tsconfig.json`. The use of `any` is strictly prohibited. Use `unknown` with type guards if dealing with dynamic external inputs.
2. **Component Separation:**
   - **Container / Screen Components:** Handle state, data fetching from IndexedDB, and event coordination.
   - **Presentational Components:** Pure, stateless, accepting props and emitting typed event callbacks.
3. **No Unhandled Promises:** All asynchronous storage operations (`Dexie` transactions) must be wrapped in `try/catch` blocks with graceful UI error boundaries.
4. **State Management:**
   - Use React local state (`useState`, `useReducer`) for intra-game move tracking.
   - Use React Context or lightweight Zustand stores for global tournament session state.
   - Never write transient game keystrokes to IndexedDB; only commit final round attempts or checkpoints to preserve disk I/O performance.

---

## 5. Game Engine & Puzzle Data Conventions

### 5.1 Pure Engine Logic
Every game in `src/games/<game-name>/` must have a dedicated `engine.ts` file containing pure functions:
- `validateAnswer(puzzle: Puzzle, userInput: string | object): ValidationResult`
- `calculateRoundScore(basePoints: number, timeRemainingSeconds: number, hintsUsed: number): number`
- `getNextPuzzle(catalog: Puzzle[], completedIds: string[]): Puzzle | null`

No React hooks or browser DOM references are permitted inside `engine.ts`. This allows 100% test coverage via Vitest/Node without browser mocking.

### 5.2 Puzzle Catalog Integrity
- All puzzle files must conform to the TypeScript schema defined in `src/types/puzzle.ts`.
- Every puzzle must possess:
  - Unique `id` (e.g., `PS-001`, `WW-014`).
  - Strict `difficulty` enum: `'easy' | 'medium' | 'hard'`.
  - Exactly one canonical, validated solution.
  - Exactly two progressive hints with predefined score deduction penalties.
- **Verification Rule:** Never invent puzzle solutions without programmatic verification.

---

## 6. Scoring & Leaderboard Rules

Agents implementing scoring or leaderboard algorithms must strictly follow this mathematical specification:

### 6.1 Individual Game Score Formula
$$\text{Score} = \max\Big(0, \text{BasePoints} + (\text{TimeRemainingSeconds} \times \text{TimeMultiplier}) - (\text{HintsUsed} \times \text{HintPenalty})\Big)$$

Standard defaults:
- `BasePoints`: Easy = 500, Medium = 800, Hard = 1200.
- `TimeMultiplier`: 5 points per second remaining.
- `HintPenalty`: 150 points for Hint 1; 250 points for Hint 2.

### 6.2 Overall Tournament Leaderboard Formula
$$\text{Participant Total} = \sum_{g \in \{\text{PS, WW, CC, GT, PJ, PDR}\}} \max(\text{Scores for Game } g \text{ in Current Session})$$

- **CRITICAL:** Replaying a game replaces the stored score **only if** the new score is strictly greater than the prior score.
- Replaying must **never** add cumulatively to the total.
- Attempts across different event sessions must remain isolated.

### 6.3 Independent Game Leaderboard Policy
Each of the 6 games (Pattern Shift, Word Weave, Code Cracker, Grid Tactician, Pulse Jumper, PalmDrive Rally) possesses an independent dedicated leaderboard displayed directly from that game's interface. Primary site navigation contains only Home, Games, and Settings.

---

## 7. Offline-First & Storage Requirements

1. **IndexedDB as Primary Source of Truth:**
   - `Dexie.js` must be initialized on app launch.
   - Tables: `participants`, `event_sessions`, `game_scores`, `puzzles`.
2. **Zero Network Assumption:**
   - Code must never execute an unconditional `fetch()` that crashes if offline.
   - External font stylesheets (`@import url(...)`) must not be used. Fonts must be bundled locally.
3. **PWA Service Worker:**
   - The Service Worker must cache all build outputs (`dist/`) using a `CacheFirst` strategy for assets and `StaleWhileRevalidate` for configuration.

---

## 8. Accessibility & Responsive Design Requirements

1. **Viewport Range:** The UI must render cleanly without horizontal scrollbars on viewports from **320px width** (small mobile) up to **3840px width** (4K event projectors).
2. **Keyboard Navigation:** All interactive game buttons and inputs must be operable using `Tab`, `Enter`, `Space`, and Arrow keys.
3. **High Contrast:** All text must meet WCAG 2.1 AA standards (minimum contrast ratio of 4.5:1 against dark backgrounds).
4. **Reduced Motion:** All animations (pulsing lights, confetti, card flips) must respect `prefers-reduced-motion: reduce`.

---

## 9. Security Rules & Secret Handling

1. **Never Commit Secrets:** `.env` files with actual keys must never be committed. Only `.env.example` belongs in Git.
2. **Client-Side Environment Variables:** All `VITE_*` variables are embedded into public JavaScript bundles. Never place administrative API keys (such as Supabase `service_role` keys) in the client.
3. **Input Sanitization:**
   - Participant nicknames must be sanitized using regex: `^[a-zA-Z0-9_\-\s]{2,15}$`.
   - All rendered text must be escaped to prevent Cross-Site Scripting (XSS).
   - CSV export routines must sanitize leading characters (`=`, `+`, `-`, `@`) to prevent CSV/Excel Formula Injection.

---

## 10. Rules Against Fabricated Claims & Unverified Code

When working on BYTE BATTLE:
- **Do not claim tests passed** unless you have run them using `npm test` or the appropriate test command and verified exit code 0.
- **Do not state that the 110-puzzle catalog is complete** until all 110 validated JSON items are placed into `src/data/puzzles/`.
- **Do not claim the app is production-ready** until full cross-browser PWA and offline tests have succeeded.
- Always communicate current progress accurately, identifying what is implemented vs. what remains in the design/specification phase.

---

## 11. Cross-References

- [Project Specification](PROJECT_SPEC.md) — Detailed feature requirements and user stories.
- [Game Design Document](GAME_DESIGN.md) — Mechanics, progression, and puzzle schemas.
- [Data Model & Storage](DATA_MODEL.md) — Database tables, schemas, and export formats.
- [Testing Standards](TESTING.md) — Comprehensive test runner and verification guide.
