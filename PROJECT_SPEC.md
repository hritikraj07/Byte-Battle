# PROJECT_SPEC.md — BYTE BATTLE Functional & Non-Functional Specifications

> **Document Version:** 1.0.0  
> **Status:** Architecture & Specification Baseline  
> **Target Audience:** Product Managers, Software Engineers, Event Organizers, QA Engineers  

---

## 1. Executive Summary & Goals

**BYTE BATTLE** is a high-energy, gamified web application built to engage school students (ages 11–18, Grades 6–12) in computer science fundamentals, algorithmic thinking, and computational logic. 

### 1.1 Core Problems Solved
1. **The Technology Divide in School Outreach:** University outreach events, science fairs, and school tech expos often host students who do not carry personal smartphones, or whose mobile devices are prohibited by school policy.
2. **Network Unreliability:** Institutional guest Wi-Fi networks frequently throttle traffic, require captive portal authentications, or block WebSocket ports, causing traditional web-based quiz tools (e.g., Kahoot, Quizizz) to fail.
3. **Single-Device Queue Bottlenecks:** Most digital competition platforms assume every student has their own screen. BYTE BATTLE is specifically engineered to run seamlessly on **a single laptop**, enabling smooth, rapid player turn-taking with live spectator viewing on a connected projector or TV.

---

## 2. Modes of Operation

BYTE BATTLE supports two distinct operating modes:

### 2.1 Personal Practice Mode (Single User / Self-Paced)
- **Target User:** Individual students exploring puzzles at home, in a computer lab, or between tournament rounds.
- **Characteristics:**
  - No host PIN or session administration required.
  - Puzzles can be played sequentially or selected freely from difficulty tiers.
  - Scores and achievements persist locally in the user's browser storage.
  - Hints are freely available (with educational explanations).
  - Practice scores do not contaminate competitive event leaderboards.

### 2.2 Event Mode (Competitive Arena / Tournament Kiosk)
- **Target User:** Event hosts, workshop leads, and rotating student competitors.
- **Characteristics:**
  - Password/PIN-protected **Host Control Panel**.
  - Structured **Event Sessions** (e.g., `Session ID: TECH-ARENA-2026`).
  - Rapid student registration via sanitized nicknames.
  - Timed rounds with competitive scoring penalties.
  - Automatic updates to all **Five Event Leaderboards**.
  - Dual-screen support: Host/Player laptop screen + Fullscreen Projector leaderboard.
  - One-click **"Next Player"** transition that clears active player memory while preserving session standings.
  - Secure data export to CSV and JSON formats upon event conclusion.

---

## 3. Participant Registration & Identity Management

Because the software interacts with school-age minors, participant identity is managed under strict **Privacy by Design** principles:

```
[Student Approaches Laptop]
           │
           ▼
[Enter Creative Nickname] ───────► [Validation Engine]
                                            │
               ┌────────────────────────────┴────────────────────────────┐
               ▼                                                         ▼
       [Matches Regex & Safe]                                 [Invalid / Profane]
               │                                                         │
               ▼                                                         ▼
  [Check Session Collisions]                                    [Display Friendly Error]
     │                    │                                     ("Pick another tag!")
[Unique]              [Taken]
     │                    │
     ▼                    ▼
[Assign ID]       [Suggest Suffix (e.g. "Volt_2")]
```

### 3.1 Nickname Rules
- **Length:** 2 to 15 characters.
- **Allowed Characters:** Alphanumeric (`a-z`, `A-Z`, `0-9`), underscores (`_`), hyphens (`-`), and spaces.
- **Automated Sanitization:** Leading/trailing whitespace is trimmed; multiple spaces collapsed to one.
- **Profanity & Safety Filter:** Submissions are checked against a client-side blacklist of disallowed words. Offending entries are rejected with a helpful suggestion.
- **Collision Resolution:** If a nickname exists within the active event session, the UI automatically appends an incremental numeric suffix (e.g., `MatrixCoder_2`) or invites the student to customize it.
- **Zero PII:** No email addresses, phone numbers, real names, or school IDs are collected.

---

## 4. The Six Core Game Arenas

Each arena targets a distinct computational thinking or reflexive challenge pillar. *(For complete specifications, see [Game Design Document](GAME_DESIGN.md)).*

```
                                  ┌───────────────────────────────┐
                                  │          BYTE BATTLE          │
                                  └───────────────┬───────────────┘
                                                  │
         ┌──────────────────┬─────────────────────┼─────────────────────┬──────────────────┐
         ▼                  ▼                     ▼                     ▼                  ▼
 ┌───────────────┐  ┌───────────────┐     ┌───────────────┐     ┌───────────────┐  ┌───────────────┐  ┌──────────────────┐
 │ Pattern Shift │  │  Word Weave   │     │ Code Cracker  │     │ Grid Tactician│  │ Pulse Jumper  │  │ PalmDrive Rally  │
 │ (Sequences)   │  │ (Linguistics) │     │  (Deduction)  │     │  (Constraint) │  │(Rhythm Hop)   │  │ (Camera Physics) │
 └───────────────┘  └───────────────┘     └───────────────┘     └───────────────┘  └───────────────┘  └──────────────────┘
```

### 4.1 Arena 1: Pattern Shift
- **Domain:** Sequences, bit-shifts, Fibonacci variants, ASCII codes, and matrix progressions.
- **Gameplay:** Interactive sequence strip with missing registers (`?`), keyboard hotkeys (1–4), instant visual feedback, and cycle-based non-repeating puzzle selection.
- **Timer:** 60 seconds per puzzle.
- **Puzzle Bank:** Curated randomized catalog across Easy, Medium, and Hard difficulty tiers.

### 4.2 Arena 2: Word Weave
- **Domain:** Computational vocabulary, semantic clustering, word ladders, and protocol grouping.
- **Gameplay:** Word ladders with one-letter step mutations and category grouping clusters with interactive selection cards and live verification.
- **Timer:** 90 seconds per puzzle.
- **Puzzle Bank:** Curated randomized catalog across Easy, Medium, and Hard difficulty tiers.

### 4.3 Arena 3: Code Cracker
- **Domain:** Cryptanalysis, Bulls & Cows telemetry, and Mastermind secret code deduction.
- **Gameplay:** 4-digit code breaking with live history ledger, position indicators (exact position, present in key, absent), on-screen numpad, and keyboard typing.
- **Attempts:** Up to 6 deductive attempts per round.
- **Timer:** 120 seconds per round.

### 4.4 Arena 4: Grid Tactician
- **Domain:** Spatial constraints, matrix optimization, and node placement rules.
- **Gameplay:** $4\times 4$ interactive network grid with multi-step Undo stack, live rule compliance checklist, and automated constraint validator.
- **Timer:** 120 seconds per puzzle.

### 4.5 Arena 5: Pulse Jumper
- **Domain:** One-button rhythm platformer, reaction time, and spatial synchronization.
- **Gameplay:** 60 FPS Canvas rendering loop. Character automatically glides forward; tap, click, or press Space to jump over neon spikes, gaps, and tiered platforms. Audio synchronized with a 128 BPM synthesizer beat.
- **Timer / Run:** Continuous arcade survival run with instant retry on collision.

### 4.6 Arena 6: PalmDrive Rally
- **Domain:** 2D hill-climbing physics simulation with browser-based computer vision.
- **Gameplay:** Vehicle balances torque, gravity, suspension, and momentum over undulating sine hills, collecting energy fuel canisters.
- **Camera Hand Gestures:**
  - **Open Palm:** Accelerate forward.
  - **Closed Fist:** Apply brakes and reverse torque.
  - **No Hand Detected:** Safely coast.
- **Camera Controls:** Draggable, resizable top-left preview with privacy badge, mirror toggle, and instant keyboard / touch pedal fallbacks.

---

## 5. Scoring & Six Independent Leaderboards

### 5.1 Scoring Formula
Every puzzle round calculates score based on accuracy, time efficiency, and independence from hints:
$$\text{Round Score} = \max\Big(0, \text{BasePoints} + (\text{SecondsLeft} \times \text{Multiplier}) - (\text{Hints} \times \text{Penalty})\Big)$$

| Difficulty Tier | Base Points | Time Multiplier | Hint 1 Penalty | Hint 2 Penalty |
| :--- | :---: | :---: | :---: | :---: |
| **Easy** | 500 pts | 5 pts / sec | -100 pts | -200 pts |
| **Medium** | 800 pts | 8 pts / sec | -150 pts | -250 pts |
| **Hard** | 1,200 pts | 10 pts / sec | -250 pts | -400 pts |

### 5.2 Six Dedicated Independent Leaderboards
BYTE BATTLE maintains **one independent leaderboard per game**. Leaderboard entries are accessible directly within each game interface and on the dedicated leaderboards page:
1. **Pattern Shift Leaderboard:** Top sequence recognition scores.
2. **Word Weave Leaderboard:** Top linguistics and word ladder scores.
3. **Code Cracker Leaderboard:** Top cryptanalysis scores.
4. **Grid Tactician Leaderboard:** Top matrix constraint scores.
5. **Pulse Jumper Leaderboard:** Top survival distances and jump scores.
6. **PalmDrive Rally Leaderboard:** Top hill-climb distances and coin scores.

**Architectural Rule:** There is no single global leaderboard used as the primary ranking system. Each game celebrates its own specialized mechanics and top performers.

### 5.3 Best Score & Anti-Inflation Rule
- **Rule:** A participant's entry in each game's leaderboard is strictly their **single highest valid score** recorded during that session.
- Replaying a game replaces the stored score only if the new score is strictly greater than the prior score.
- Replaying never accumulates points additively.
- **Tie-Breakers:**
  1. Lowest total elapsed time across best runs.
  2. Smallest cumulative hints used across best runs.
  3. Earliest timestamp of record creation.

---

## 6. Host Controls & Projector Display

### 6.1 Host Control Panel (PIN Protected)
Accessible via top navigation or shortcut `Ctrl + Shift + H`.
- **PIN Verification:** Default PIN `1234` or custom PIN hashed in local session storage.
- **Session Controls:** Start Session, Pause Session, End Session, Clear Session Data.
- **Active Player Override:** Force-abort an abandoned game round; reset player state.
- **Data Export:** Instant download of session records in `.json` and `.csv` formats.
- **Display Launcher:** Button to open secondary projector window (`/projector`).

### 6.2 Dual Display & Projector View
- Accessible at route `/projector` or `/leaderboard?view=projector`.
- **Spectator Layout:** Clean, high-contrast, uncluttered view showing:
  - Top 10 Overall Leaders with podium highlights (Gold, Silver, Bronze).
  - Ticker showing recently submitted game scores.
  - QR Code or link to public tournament standings (when connected).
  - Auto-scrolling carousel cycling between the Overall board and the four individual game boards every 15 seconds.

---

## 7. Non-Functional Requirements

### 7.1 Accessibility (WCAG 2.1 AA)
- High contrast color schemes (minimum 4.5:1 ratio for normal text, 7:1 for headings).
- Full keyboard operability (Tab order, Enter to submit, Escape to dismiss modals).
- Screen-reader friendly semantic HTML (`<main>`, `<nav>`, `<article>`, `<button aria-label="...">`).
- Respect for user system settings: `prefers-reduced-motion` suppresses particle confetti and aggressive pulsing.

### 7.2 Performance & Responsiveness
- **Initial Load Time:** $< 1.5$ seconds on broadband; $< 2.5$ seconds on simulated 3G.
- **FPS Stability:** Steady 60 frames per second during game interactions and timer countdowns.
- **Bundle Footprint:** $< 500$ KB compressed JavaScript/CSS app shell.
- **Screen Support:** Responsive layout fluidly adapting from **320px** (iPhone SE) to **3840px** (4K presentation display).

### 7.3 Reliability & Crash Recovery
- **Zero Network Dependency:** The app shell, assets, logic, and puzzles are 100% accessible offline via Workbox service worker.
- **Power Failure Resilience:** Game scores are committed synchronously to IndexedDB upon round completion. A sudden power loss or browser crash loses at most the currently active, uncompleted turn.

---

## 8. Feature Acceptance Criteria

### Feature AC-01: Nickname Validation
- **Given** a student is on the Player Entry screen,
- **When** they enter a nickname containing special symbols like `<script>` or profanity,
- **Then** the system displays a clear inline error and disables the "Enter Arena" button.
- **When** they enter a valid nickname (e.g., `Pixel_Pro`),
- **Then** the "Enter Arena" button becomes active and navigates to Game Selection.

### Feature AC-02: Best-Score Leaderboard Update
- **Given** participant `CyberDoc` has a recorded score of 600 in Pattern Shift,
- **When** they replay Pattern Shift and achieve a score of 850,
- **Then** their Pattern Shift score updates to 850, and Overall score increases by 250.
- **When** they replay Pattern Shift again and achieve 500,
- **Then** their scores remain unchanged at 850.

### Feature AC-03: Offline Air-Gap Operation
- **Given** the application has been loaded once in Chrome or installed as a PWA,
- **When** the laptop is placed in Airplane Mode and the browser refreshed,
- **Then** the application reloads immediately without a network error screen.
- **When** games are played and completed,
- **Then** scores are written to IndexedDB and appear on local leaderboards.

### Feature AC-04: Host Data Export
- **Given** an active event session with 25 completed game attempts,
- **When** the host enters their PIN and clicks "Export to CSV",
- **Then** the browser downloads a valid `.csv` file containing participant nicknames, individual game scores, timestamps, and overall ranks.

---

## 9. Implementation Status Tracker

| Specification Section | Target Status | Current Implementation Status |
| :--- | :--- | :--- |
| **Theme & UX** | Neo-Arcade Visual Design | **Complete & Verified** (Deep charcoal `#101116`, electric lime `#C8FF3D`, purple, coral) |
| **Navigation** | Minimal: Home, Games, Settings | **Complete & Verified** (All 6 games on homepage, practice renamed to Games) |
| **Six Game Arenas** | 4 Puzzles + Pulse Jumper + PalmDrive | **Complete & Verified** (All 6 games fully playable with touch/keyboard/vision) |
| **Camera Gesture Controls** | Open Palm Accel / Fist Brake | **Complete & Verified** (Local vision tracking, top-left draggable, zero frame storage) |
| **Six Leaderboards** | Independent Leaderboards | **Complete & Verified** (One dedicated board per game, no primary global board) |
| **Puzzle Randomization** | Non-repeating Cycle Engine | **Complete & Verified** (`src/services/puzzleRandomizer.ts` with history memory) |
| **IndexedDB Persistence** | Dexie.js Schema | **Complete & Verified** (`src/services/db.ts`) |
| **PWA & Offline Worker** | Native Browser Installation | **Complete & Verified** (No in-site install banner; browser 3-dot / Share install) |

---

## 10. Related Documents

- [README.md](README.md) — Project overview, installation, and quickstart.
- [AGENTS.md](AGENTS.md) — Coding conventions and AI agent rules.
- [GAME_DESIGN.md](GAME_DESIGN.md) — In-depth game rules and puzzle schemas.
- [DATA_MODEL.md](DATA_MODEL.md) — Schemas, IndexedDB tables, and export structures.
- [EVENT_RUNBOOK.md](EVENT_RUNBOOK.md) — Event-day operations guide for single-laptop venues.
