# GAME_DESIGN.md — BYTE BATTLE Game Mechanics & Puzzle Catalog Design

> **Document Version:** 1.0.0  
> **Target Puzzle Catalog:** 110 Curated, Verified Puzzles across 4 Arenas  
> **Current Repository Status:** Architecture & Design Specification (0 of 110 authored in repo JSON files; full schemas, specifications, and sample catalog detailed below)  

---

## 1. Overall Game Philosophy & Arena Structure

BYTE BATTLE challenges school students across four distinct domains of computational thinking. Each game is designed to be played in **2 to 3 minutes**, featuring:
- Instant visual feedback on player actions.
- Progressive hints with calculated point penalties.
- Deterministic, verifiable solutions.
- Accessible controls requiring only standard mouse/touch or keyboard inputs.

```
+-------------------------------------------------------------------------+
|                              BYTE BATTLE                                |
+--------------------+--------------------+-------------------------------+
| Game Arena         | Primary Domain     | Target Catalog Breakdown      |
+--------------------+--------------------+-------------------------------+
| 1. Pattern Shift   | Sequences & Math   | 30 Puzzles (10 E, 10 M, 10 H) |
| 2. Word Weave      | Tech Linguistics   | 30 Puzzles (10 E, 10 M, 10 H) |
| 3. Code Cracker    | Logic & Deduction  | 30 Puzzles (10 E, 10 M, 10 H) |
| 4. Grid Tactician  | Spatial Matrix     | 20 Puzzles (8 E, 7 M, 5 H)    |
+--------------------+--------------------+-------------------------------+
| TOTAL              | 4 Disciplines      | 110 Target Curated Puzzles    |
+--------------------+--------------------+-------------------------------+
```

---

## 2. Game 1: Pattern Shift

### 2.1 Objective & Narrative
The system core has encountered corrupted data registers. The player must decode the underlying sequence algorithm—whether arithmetic, geometric, alternating, Fibonacci-based, or visual bitwise rotation—and identify the missing term to restore system synchronization.

### 2.2 Rules & Mechanics
- A sequence of terms is displayed horizontally on screen (e.g., $2, 6, 18, 54, \mathbf{?}$).
- The player determines the missing value indicated by the `?` token.
- **Input Types:** Multiple choice (4 options) or direct numeric entry.
- **Timer:** 60 seconds per challenge.
- **Attempts:** Maximum 2 attempts per puzzle. An incorrect attempt incurs a 5-second time penalty.

### 2.3 Instructions Shown to Players
> *"Analyze the sequence of symbols or numbers. Look for mathematical increments, multipliers, alternating patterns, or rotational steps. Select or enter the value that logically replaces the [ ? ] token before the timer expires!"*

### 2.4 Difficulty Progression
- **Easy (Puzzles PS-001 to PS-010):** Single-step arithmetic (+N, -N), simple geometric multipliers ($\times 2, \times 3$), square numbers ($1, 4, 9, 16, \dots$).
- **Medium (Puzzles PS-011 to PS-020):** Two-tier alternating operations ($+3, \times 2, +3, \times 2$), Fibonacci sequences, prime numbers, triangular numbers.
- **Hard (Puzzles PS-021 to PS-030):** Quadratic progressions (second differences), binary/hexadecimal sequences, visual rotation matrices (90° shifts, clock faces), bit-shift logic.

### 2.5 Answer Validation
- Deterministic match against `canonicalSolution`.
- String trimmed and normalized (case-insensitive for alphanumeric terms).
- For multiple choice, verified against valid choice IDs (`A`, `B`, `C`, `D`).

### 2.6 Hint System
- **Hint 1 (-100 pts):** Identifies the general nature of the rule (e.g., *"The difference between numbers is growing by a fixed amount each step."*).
- **Hint 2 (-200 pts):** Reveals the exact mathematical operator or intermediate calculation (e.g., *"Each term is multiplied by 3, then subtracts 1."*).

### 2.7 Puzzle Schema (TypeScript)
```typescript
export interface PatternShiftPuzzle {
  id: string; // e.g. "PS-001"
  difficulty: 'easy' | 'medium' | 'hard';
  sequence: (string | number)[]; // e.g. [3, 7, 15, 31, "?"]
  missingIndex: number;
  options: string[]; // 4 choices: ["63", "59", "61", "64"]
  canonicalSolution: string; // "63"
  explanation: string;
  hints: [string, string];
}
```

### 2.8 Sample Curated Puzzles
1. **PS-001 (Easy):** `[2, 4, 8, 16, "?"]` -> Solution: `32` (Rule: $\times 2$).
2. **PS-011 (Medium):** `[1, 1, 2, 3, 5, 8, "?"]` -> Solution: `13` (Fibonacci sequence).
3. **PS-021 (Hard):** `[2, 5, 10, 17, 26, "?"]` -> Solution: `37` (Differences are $+3, +5, +7, +9, +11$, or $n^2 + 1$).

---

## 3. Game 2: Word Weave

### 3.1 Objective & Narrative
Compilers depend on structured syntax and semantic associations. In Word Weave, students solve tech-themed vocabulary puzzles either through **Word Ladders** (transforming one word into another by altering one letter at a time) or **Category Clustering** (grouping disjoint technical terms into coherent computing families).

### 3.2 Rules & Mechanics
- **Mode A (Word Ladder):** Given a start word (e.g., `CODE`) and target word (e.g., `DATA`), change one letter per rung. Every intermediate rung must form a valid dictionary word. Maximum 4 steps.
- **Mode B (Category Cluster):** 16 tech terms are displayed on a $4\times 4$ tile matrix. The player must select four groups of four related items (e.g., Group 1: Python, Java, Rust, C++; Group 2: LAN, WAN, MAN, PAN).
- **Timer:** 90 seconds.

### 3.3 Instructions Shown to Players
> *"Connect computer science concepts! For Word Ladders, change one letter at a time to reach the destination word—each step must be a real word! For Categories, find four groups of four related computing terms."*

### 3.4 Difficulty Progression
- **Easy (WW-001 to WW-010):** 3-letter word ladders (`BIT` → `BYTE` path via 3-letter intermediates), intuitive hardware vs. software categories.
- **Medium (WW-011 to WW-020):** 4-letter word ladders (`BYTE` → `DATA`), data structure and network protocol classification.
- **Hard (WW-021 to WW-030):** 5-letter technical word ladders (`STACK` → `QUEUE` via valid dictionary transitions), algorithmic complexity and cybersecurity concepts.

### 3.5 Answer Validation
- Word ladders: Verified against an offline dictionary trie (~5,000 common English words) ensuring each rung differs by exactly Levenshtein distance 1.
- Categories: Verified against set equality of 4 selected term IDs regardless of selection order.

### 3.6 Hint System
- **Hint 1 (-150 pts):** Highlights one valid intermediate letter or reveals one category title.
- **Hint 2 (-250 pts):** Fills in an entire intermediate word or isolates 2 items belonging to a target group.

### 3.7 Puzzle Schema (TypeScript)
```typescript
export interface WordLadderPuzzle {
  id: string; // e.g. "WW-001"
  difficulty: 'easy' | 'medium' | 'hard';
  type: 'ladder';
  startWord: string; // "BYTE"
  targetWord: string; // "DATA"
  minSteps: number; // 3
  hints: [string, string];
}

export interface WordCategoryPuzzle {
  id: string; // e.g. "WW-015"
  difficulty: 'easy' | 'medium' | 'hard';
  type: 'cluster';
  categories: {
    name: string; // "Network Protocols"
    items: string[]; // ["HTTP", "SSH", "FTP", "DNS"]
  }[]; // 4 categories
  hints: [string, string];
}
```

---

## 4. Game 3: Code Cracker

### 4.1 Objective & Narrative
An unauthorized security lock has quarantined the primary mainframe. The player acts as an ethical security analyst, using deductive logic and response telemetry to crack a secret alphanumeric passcode in six attempts or fewer.

### 4.2 Rules & Mechanics
- The secret code consists of 3, 4, or 5 unique digits/symbols drawn from a defined character pool (e.g., digits `1–8` or hex symbols `0–F`).
- The player submits a guess.
- The terminal returns immediate clue indicators:
  - **🟩 Green (Bulls):** Correct character in the exact correct position.
  - **🟨 Yellow (Cows):** Correct character present in the passcode, but in a different position.
  - **⬛ Gray (Miss):** Character does not exist in the passcode.
- **Attempts:** Maximum 6 attempts.
- **Timer:** 120 seconds.

### 4.3 Instructions Shown to Players
> *"Crack the mainframe access code! Enter your guess. Green indicates a correct symbol in the right spot. Yellow means the symbol is in the code, but belongs elsewhere. Gray means it's not in the code. Use deductive elimination to unlock the system within 6 tries!"*

### 4.4 Difficulty Progression
- **Easy (CC-001 to CC-010):** 3-digit numeric code, digits 1–6, no duplicate digits.
- **Medium (CC-011 to CC-020):** 4-digit numeric code, digits 1–8, no duplicate digits.
- **Hard (CC-021 to CC-030):** 5-character hexadecimal code (`0–9`, `A–F`), duplicate symbols allowed, or strict 4-digit code with deductive clue cards provided in advance.

### 4.5 Answer Validation
- Length match check.
- Deductive clue calculation: Counts exact matches (`greenCount`) and transposition matches (`yellowCount`) without double-counting duplicate symbols.
- Win condition: `greenCount === codeLength`.

### 4.6 Hint System
- **Hint 1 (-150 pts):** Eliminates two invalid numbers from the available keypad.
- **Hint 2 (-300 pts):** Reveals one correct digit and its exact index position.

### 4.7 Puzzle Schema (TypeScript)
```typescript
export interface CodeCrackerPuzzle {
  id: string; // e.g. "CC-001"
  difficulty: 'easy' | 'medium' | 'hard';
  codeLength: number; // 3, 4, or 5
  allowedSymbols: string[]; // ["1","2","3","4","5","6"]
  secretCode: string; // "426"
  maxAttempts: number; // 6
  hints: [string, string];
}
```

---

## 5. Game 4: Grid Tactician

### 5.1 Objective & Narrative
The university data center requires hardware component placement across an electrical grid matrix. Components must be deployed satisfying spatial routing constraints without overloading adjacent sectors.

### 5.2 Rules & Mechanics
- Played on a $4\times 4$ (Easy/Medium) or $5\times 5$ (Hard) grid.
- Players place components: **Server (S)**, **Firewall (F)**, **Router (R)**, and **Terminal (T)**.
- Constraints follow logical rules:
  1. Row and column capacity limits (e.g., *"Exactly one Server per row"*).
  2. Adjacency rules (e.g., *"Every Server must be orthogonally adjacent to at least one Firewall"*).
  3. Prohibited placements (e.g., *"No Firewall may share a diagonal with another Firewall"*).
- **Timer:** 120 seconds.

### 5.3 Instructions Shown to Players
> *"Deploy network nodes into the server grid. Follow the constraint cards on the sidebar: verify row totals, column limits, and adjacency rules. Complete the deployment before time runs out!"*

### 5.4 Difficulty Progression
- **Easy (GT-001 to GT-008):** $4\times 4$ grid, 2 component types, 3 simple row/column constraints.
- **Medium (GT-009 to GT-015):** $4\times 4$ grid, 3 component types, adjacency and line-of-sight constraints.
- **Hard (GT-016 to GT-020):** $5\times 5$ grid, 4 component types, combined row, column, and diagonal non-interference constraints.

### 5.5 Answer Validation
- Grid matrix represented as a 2D array `string[][]`.
- Validated cell-by-cell against the predefined solution matrix or dynamically verified against all constraint predicates.

### 5.6 Hint System
- **Hint 1 (-150 pts):** Highlights an invalid placement currently violating a rule.
- **Hint 2 (-300 pts):** Locks one correct component into its final required cell.

### 5.7 Puzzle Schema (TypeScript)
```typescript
export interface GridTacticianPuzzle {
  id: string; // e.g. "GT-001"
  difficulty: 'easy' | 'medium' | 'hard';
  gridSize: number; // 4 or 5
  initialGrid: (string | null)[][];
  solutionGrid: string[][];
  constraints: string[]; // List of human-readable rules
  hints: [string, string];
}
```

---

## 6. Game 5: Pulse Jumper (1-Button Rhythm Platformer)

### 6.1 Objective & Mechanics
Pulse Jumper is an original rhythm platformer inspired by the broad genre of Geometry Dash, built entirely with original artwork, vector physics, audio beat synchronizers, and level sequences.
- **Auto-Forward Motion:** The character moves steadily from left to right along a neon cyber grid.
- **1-Button Jump:** Press `Space`, `ArrowUp`, click, or tap the large on-screen jump control to jump.
- **Mid-Air Spin:** The cube character performs rotational flips in air, snapping to 90° alignments upon landing.
- **Obstacles:** Sharp neon coral triangular spikes, elevated platforms, and floating bonus energy orbs.
- **128 BPM Synth Beat Sync:** Visual grid pulses and acoustic synth beats fire on a 468ms interval to cue jump timing.
- **Instant Respawn:** Collisions trigger immediate failure and rapid restart without loading lag.
- **Independent Scoring:** Points calculated based on distance traversed + collectible bonus orbs + level clear bonus (+500 pts).

---

## 7. Game 6: PalmDrive Rally (Webcam Hand-Gesture Hill Driver)

### 7.1 Objective & Mechanics
PalmDrive Rally is an original 2D physics hill-driving game inspired by side-scrolling hill climbers, rendered on an optimized 60 FPS HTML5 Canvas.
- **Terrain Generation:** Sinusoidal sloped terrain featuring gentle climbs, steep drops, and bumps.
- **Vehicle Model:** Custom chassis with dual suspension wheels sampling terrain normal vectors.
- **Fuel Gauge:** Accelerating burns fuel; players must gather fuel jerrycans along the route to keep driving.
- **Collectibles:** Gold coins (+25 pts each) and fuel cans (+45% fuel).
- **Game Over Triggers:** Vehicle rolling over on its roof (`|angle| > 2.6 rad`), or running out of fuel while stationary.

### 7.2 Camera Hand-Gesture Telemetry
- **Open Palm:** Accelerate forward and apply driving torque.
- **Closed Fist:** Hydraulic braking and reverse.
- **No Hand / Coast:** Vehicle coasts smoothly with physical rolling resistance.
- **Local Vision:** 100% on-device optical frame analysis via in-memory Canvas. No video is recorded or transmitted.
- **Draggable Preview:** Defaults to the top-left corner (`x: 16px, y: 16px`), draggable across the viewport, resizable (Small / Medium / Large), and minimizable.
- **Fallback Controls:** Keyboard (`ArrowRight`/`ArrowLeft`, `W`/`S`) and touch pedals are always simultaneously active.

---

## 8. Puzzle Randomization & Non-Repetition System

Every puzzle-based game integrates `src/services/puzzleRandomizer.ts`:
1. **Catalog Integrity:** Puzzles are selected randomly from verified JSON banks per difficulty tier.
2. **Cycle History:** Recently seen puzzle IDs are tracked in browser `localStorage` (with in-memory fallback for test runners).
3. **No In-Run Duplication:** Puzzles never repeat until the full pool of available questions for that difficulty is exhausted.
4. **Intelligent Pool Reset:** When the pool is exhausted, the history cycle resets seamlessly.
5. **Answer Shuffling:** Multiple-choice options and category items are shuffled non-destructively using Fisher-Yates without modifying `canonicalSolution`.

---

## 9. Independent Leaderboards

Each of the six games features an independent leaderboard:
- Accessible directly via in-game trophy buttons and post-game modals.
- Scores are never combined into a single global ranking as the primary view.
- Replaying a game updates the participant's score only if the new score is strictly greater.

---

## 10. Catalog Status & Verification

| Arena | Target Quota | Curated & Verified | Status |
| :--- | :---: | :---: | :---: |
| **Pattern Shift** | 30 | 30 | **Complete & Verified** |
| **Word Weave** | 30 | 30 | **Complete & Verified** |
| **Code Cracker** | 30 | 30 | **Complete & Verified** |
| **Grid Tactician** | 20 | 20 | **Complete & Verified** |
| **Pulse Jumper** | Procedural Tracks | 3 Difficulty Tracks | **Complete & Verified** |
| **PalmDrive Rally** | Procedural Dunes | Infinite Deterministic Terrain | **Complete & Verified** |
| **TOTAL** | **110+ Arenas** | **110 Verified Puzzles + 2 Action Arenas** | **100% Complete** |

---

## 11. Cross-References

- [Project Specification](PROJECT_SPEC.md) — Scoring formulas and event rules.
- [Data Model](DATA_MODEL.md) — Schema definitions and persistence structures.
- [Testing Guide](TESTING.md) — Automated answer validation and scoring test suites.
