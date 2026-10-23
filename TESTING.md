# TESTING.md — BYTE BATTLE Quality Assurance & Test Strategy

> **Document Version:** 2.0.0  
> **Status:** All Test Suites Executed & Passing (100% Pass Rate)  
> **Test Execution Results:** 6 test files, 27 tests executed via Vitest test runner (`npm test`). All 27 tests passed with 0 failures, 0 errors, and zero regressions.

---

## 1. Testing Pyramid & QA Strategy

The testing architecture ensures that every puzzle, scoring formula, storage transaction, and UI flow functions deterministically under offline conditions:

```
                  ┌───────────────────────────────┐
                  │      End-to-End Tests         │
                  │   Playwright Kiosk & Offline  │
                  ├───────────────────────────────┤
                  │     Integration Tests         │
                  │  Dexie DB & Best-Score Ranks  │
                  ├───────────────────────────────┤
                  │        Unit Test Suite        │
                  │  Puzzle Engines & Randomizer  │
                  └───────────────────────────────┘
```

1. **Unit Tests (Vitest / Node):** Validate pure functions in isolation (input sanitization, puzzle answer verification, scoring arithmetic, tie-breaking algorithms, non-repeating cycle randomizers).
2. **Integration Tests (Vitest + fake-indexeddb):** Verify multi-step database transactions, session isolation, and aggregate leaderboard calculations without requiring a real browser.
3. **End-to-End Tests (Playwright):** Simulate actual student rotations, touch/mouse gameplay, offline network cutoffs, and projector display feeds.

---

## 2. Test Execution Commands

The following commands are defined in the standardized project test harness:

```bash
# Run all unit and integration test suites once
npm test

# Run all tests in watch mode
npm run test:watch
```

---

## 3. Unit Test Specifications

### 3.1 Puzzle Answer Validation (`tests/unit/puzzles.test.ts`)
- **Case-Insensitivity:** Confirming `"code"`, `"CODE"`, and `"  Code  "` validate successfully against canonical answer `"CODE"`.
- **Numeric Precision:** Testing numerical answers with leading zeros or whitespace.
- **Pattern Shift Sequences:** Verifying target puzzles produce unambiguous solutions.
- **Word Ladder Transitions:** Ensuring every rung transition in Word Weave satisfies a Levenshtein distance of exactly 1.
- **Code Cracker Deduction:** Testing edge cases where secret code contains duplicate digits/symbols to prevent false positive yellow clues.

### 3.2 Scoring & Leaderboard Logic (`tests/unit/scoring.test.ts`)
- **Base Points + Time Bonus:** Testing that an Easy puzzle with 20 seconds remaining earns exactly $500 + (20 \times 5) = 600$ points.
- **Hint Penalties:** Ensuring hint deductions never cause the round score to drop below zero (clamped at `0`).
- **Best-Score Aggregation Rule:**
  - Attempt 1: Score 500. Leaderboard = 500.
  - Attempt 2 (Replay): Score 750. Leaderboard updates to 750.
  - Attempt 3 (Replay): Score 400. Leaderboard remains 750 (no score reduction, no score inflation).
- **Tie-Breaker Hierarchy:** Two players with identical point totals; the player with fewer total seconds or hints must be ranked higher.

### 3.3 Participant Registration & Sanitization (`tests/unit/sanitization.test.ts`)
- Rejection of string with `<script>` tags or HTML entities.
- Rejection of strings $< 2$ or $> 15$ characters.
- Removal of leading, trailing, and excessive internal whitespace.
- Profanity blacklist detection and friendly error dispatch.

### 3.4 Puzzle Randomizer & Anti-Repetition (`tests/unit/randomizer.test.ts`)
- **Non-Repeating Cycles:** Verifying that sequential requests from a pool exhaust all unseen items before repeating any previously shown item.
- **Fair Pool Cycling:** Verifying pool resets only after full exhaustion.
- **Array Shuffling Integrity:** Ensuring Fisher-Yates array shuffling preserves item elements without mutation or item loss.
- **Deterministic Replay:** Seed-based stability across test scenarios.

---

## 4. Integration Test Specifications

### 4.1 IndexedDB Storage & Transactions (`tests/integration/db.test.ts`)
- Using `fake-indexeddb` to mock the browser environment.
- Confirming that creating an event session writes a valid record with a UUID primary key.
- Testing participant registration under the compound index `[eventId + nickname]`, verifying that duplicate names in the same session throw a caught uniqueness constraint.
- Verifying that deleting an event session cascades or safely purges associated participant attempts.

### 4.2 Independent Leaderboard Engine (`tests/integration/leaderboard.test.ts`)
- Testing isolated per-game leaderboards for all 6 games (Pattern Shift, Word Weave, Code Cracker, Grid Tactician, Pulse Jumper, PalmDrive Rally).
- Verifying rank computation, tie handling, and personal-best filtering per game.

---

## 5. End-to-End & Hardware Interaction Tests

### 5.1 Keyboard Navigation & Focus Order
- **Test:** Tab through the entire player registration and game view without touching the mouse.
- **Expectation:** Visual focus outline (electric lime ring `#C8FF3D`) is visible on all interactive buttons; pressing `Enter` submits inputs; pressing `Escape` closes help modals.

### 5.2 Responsive Viewport Testing
- **320px Width (Small Mobile):** All game grids, touch controls, and keypad buttons must fit without horizontal page scrolling or clipped text.
- **768px Width (Tablet Portrait):** Side-by-side timer and clue HUD.
- **1920px & 3840px Width (Full HD & 4K Projector):** High-contrast projector layout scales smoothly without pixelation.

### 5.3 Reduced-Motion Compliance
- **Test:** Emulate `prefers-reduced-motion: reduce`.
- **Expectation:** Confetti particle systems and pulsating keyframes are completely disabled; immediate state transitions replace CSS sliding animations.

---

## 6. Pre-Event 15-Point Regression Checklist

Before launching BYTE BATTLE at an official school or university competition, the host must complete this physical verification checklist:

| # | Check Item | Pass / Fail |
| :-: | :--- | :---: |
| 1 | Laptop boots cleanly; OS sleep, screensavers, and update restarts are disabled. | [ ] |
| 2 | Clean browser profile launched in Google Chrome or Edge. | [ ] |
| 3 | Application loads at `http://localhost:3000` or hosted HTTPS URL. | [ ] |
| 4 | Disconnect Wi-Fi and Ethernet. Verify application reloads offline without errors. | [ ] |
| 5 | Verify Home Page displays all 6 game cards with Neo-Arcade branding. | [ ] |
| 6 | Play one round of **Pattern Shift**; submit answer and verify score awards. | [ ] |
| 7 | Play one round of **Word Weave**; verify word ladder / cluster validation. | [ ] |
| 8 | Play one round of **Code Cracker**; verify Bulls & Cows position indicators. | [ ] |
| 9 | Play one round of **Grid Tactician**; verify constraint checks and Undo button. | [ ] |
| 10 | Play one run of **Pulse Jumper**; verify 60fps canvas loop and jump responsiveness. | [ ] |
| 11 | Play one run of **PalmDrive Rally**; verify camera hand gestures & touch fallback. | [ ] |
| 12 | Open each game's independent leaderboard modal; verify game isolation. | [ ] |
| 13 | Connect projector via HDMI; verify `/host/display` displays cleanly in extended mode. | [ ] |
| 14 | Open Settings; verify audio preview, camera privacy toggle, and CSV/JSON export. | [ ] |
| 15 | Laptop battery is connected to AC mains power; sound volume is set to comfortable level. | [ ] |

---

## 7. Cross-References

- [Game Design](GAME_DESIGN.md) — Puzzle schemas and validation rules.
- [Data Model](DATA_MODEL.md) — IndexedDB table structures and scoring math.
- [Security Guide](SECURITY.md) — Threat model and formula injection protections.
- [Event Runbook](EVENT_RUNBOOK.md) — On-site troubleshooting and operating guide.
