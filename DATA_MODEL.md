# DATA_MODEL.md — BYTE BATTLE Storage, Schemas & Integrity

> **Document Version:** 1.0.0  
> **Primary Storage Engine:** Browser IndexedDB via Dexie.js (Offline-First)  
> **Secondary Cloud Engine:** Supabase / PostgreSQL (Optional Cloud Sync)  

---

## 1. Architectural Overview & Entity Relationships

BYTE BATTLE operates on an **Offline-First Data Architecture**. The primary source of truth is the local browser's **IndexedDB** instance. When an active internet connection and Supabase credentials are configured, records are asynchronously replicated to a remote PostgreSQL database.

```
                    ┌────────────────────────────┐
                    │       EventSession         │
                    │ (id, title, hostPinHash)   │
                    └─────────────┬──────────────┘
                                  │ 1
                                  │
                                  │ *
                    ┌─────────────┴──────────────┐
                    │        Participant         │
                    │ (id, eventId, nickname)    │
                    └─────────────┬──────────────┘
                                  │ 1
                                  │
                                  │ *
                    ┌─────────────┴──────────────┐
                    │      GameScoreAttempt      │
                    │ (id, participantId, gameId,│
                    │  score, hints, duration)   │
                    └─────────────┬──────────────┘
                                  │ *
                                  │
                                  │ 1
                    ┌─────────────┴──────────────┐
                    │           Puzzle           │
                    │ (id, gameType, difficulty, │
                    │  solution, hints)          │
                    └────────────────────────────┘
```

---

## 2. Core Entity Definitions & Schemas

### 2.1 EventSession
Represents a structured competition or workshop event.
```typescript
export interface EventSession {
  id: string;               // UUID v4 (e.g. "550e8400-e29b-41d4-a716-446655440000")
  title: string;            // Human-readable title (e.g. "Tech Arena Fall 2026")
  hostPinHash: string;      // SHA-256 hash of the 4-6 digit host management PIN
  startedAt: string;        // ISO 8601 UTC timestamp
  endedAt: string | null;   // ISO 8601 UTC timestamp or null if session is active
  status: 'active' | 'paused' | 'completed';
  config: {
    allowedGames: ('pattern-shift' | 'word-weave' | 'code-cracker' | 'grid-tactician' | 'pulse-jumper' | 'palmdrive-rally')[];
    roundTimeLimitSeconds: number; // default: 120
    allowReplays: boolean;         // default: true (replays replace if higher)
    maxReplaysPerGame: number;     // default: 3
  };
}
```

### 2.2 Participant
Represents an individual student taking part in an event session.
```typescript
export interface Participant {
  id: string;               // UUID v4
  eventId: string;          // Foreign key referencing EventSession.id
  nickname: string;         // Unique, sanitized tag (e.g. "PixelRider_99")
  avatarSeed: string;       // Seed string for deterministic avatar generation
  createdAt: string;        // ISO 8601 UTC timestamp
  lastActiveAt: string;     // ISO 8601 UTC timestamp
}
```

### 2.3 GameScoreAttempt
Records a single, atomic game round completed by a participant.
```typescript
export interface GameScoreAttempt {
  id: string;               // UUID v4
  eventId: string;          // Foreign key referencing EventSession.id
  participantId: string;    // Foreign key referencing Participant.id
  gameId: 'pattern-shift' | 'word-weave' | 'code-cracker' | 'grid-tactician' | 'pulse-jumper' | 'palmdrive-rally';
  puzzleId: string;         // ID of the puzzle solved (e.g. "PS-014", "PJ-SURVIVE", "PDR-HILL")
  difficulty: 'easy' | 'medium' | 'hard';
  score: number;            // Final awarded points (>= 0)
  basePoints: number;       // Base tier points (e.g. 500, 800, 1200)
  timeRemainingSeconds: number; // Seconds left on round clock
  timeBonusPoints: number;  // Bonus awarded for remaining time
  hintsUsed: number;        // Count of hints revealed (0, 1, or 2)
  hintDeductionPoints: number; // Penalty deducted for hints
  durationSeconds: number;  // Total elapsed time taken
  completedAt: string;      // ISO 8601 UTC timestamp
  isValid: boolean;         // True if verified; false if flagged or aborted
}
```

### 2.4 Puzzle
Represents a static puzzle stored in the game catalog.
```typescript
export interface UniversalPuzzle {
  id: string;               // Unique string identifier (e.g. "CC-007")
  gameType: 'pattern-shift' | 'word-weave' | 'code-cracker' | 'grid-tactician';
  difficulty: 'easy' | 'medium' | 'hard';
  prompt: string;           // Instructions or visual scenario description
  payload: Record<string, unknown>; // Game-specific board/sequence/clues
  canonicalSolution: string | string[]; // Expected answer(s)
  hints: [string, string];  // Progressive hints
  tags: string[];           // Descriptive taxonomy (e.g. ["fibonacci", "math"])
}
```

---

## 3. Leaderboard Calculations & The Best Score Policy

BYTE BATTLE displays **five distinct leaderboards**: Overall, Pattern Shift, Word Weave, Code Cracker, and Grid Tactician.

### 3.1 Mathematical Aggregation Formula
The Overall Leaderboard calculates each participant's score using their **single best valid score from each game during the active event session**:

$$\text{Overall Score}(p) = \sum_{g \in \mathcal{G}} \max_{a \in \mathcal{A}(p, g)} (a.\text{score})$$

Where:
- $\mathcal{G} = \{\text{'pattern-shift'}, \text{'word-weave'}, \text{'code-cracker'}, \text{'grid-tactician'}\}$
- $\mathcal{A}(p, g)$ is the set of all valid attempts by participant $p$ in game $g$. If $\mathcal{A}(p, g) = \emptyset$, then $\max = 0$.

### 3.2 Anti-Inflation Replay Rule
- **Replay Submission:** If a participant finishes a replay round:
  - If $\text{NewScore} > \text{PriorBestScore}$, the new score becomes the active record.
  - If $\text{NewScore} \le \text{PriorBestScore}$, the prior record is retained.
- **Score Inflation Guarantee:** Points are **never accumulated additively** across multiple replays.

### 3.3 Tie-Breaking Hierarchy
When two or more participants share identical point totals, ranks are determined by:
1. **Total Active Solve Time:** Sum of `durationSeconds` for the contributing best attempts (lowest total time wins).
2. **Cumulative Hints Used:** Sum of `hintsUsed` across best attempts (fewest hints wins).
3. **Timestamp of Achievement:** Earliest `completedAt` timestamp of the final contributing score.

---

## 4. IndexedDB Implementation (Dexie.js)

The local client uses Dexie.js to declare schemas, manage versioned migrations, and enforce compound indexing for high-speed queries:

```typescript
import Dexie, { Table } from 'dexie';
import { EventSession, Participant, GameScoreAttempt, UniversalPuzzle } from '../types';

export class ByteBattleDatabase extends Dexie {
  sessions!: Table<EventSession, string>;
  participants!: Table<Participant, string>;
  scores!: Table<GameScoreAttempt, string>;
  puzzles!: Table<UniversalPuzzle, string>;

  constructor() {
    super('ByteBattleDB');
    this.version(1).stores({
      sessions: 'id, startedAt, status',
      participants: 'id, eventId, nickname, [eventId+nickname]',
      scores: 'id, eventId, participantId, gameId, completedAt, [eventId+gameId], [participantId+gameId]',
      puzzles: 'id, gameType, difficulty'
    });
  }
}

export const db = new ByteBattleDatabase();
```

---

## 5. Optional Supabase / PostgreSQL Schema

For events with active internet connectivity and multi-device requirements, the following PostgreSQL DDL script establishes the remote schema with Row Level Security (RLS):

```sql
-- 1. Create Event Sessions Table
CREATE TABLE public.event_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    host_pin_hash VARCHAR(64) NOT NULL,
    started_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    ended_at TIMESTAMPTZ,
    status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'paused', 'completed')),
    config JSONB NOT NULL DEFAULT '{}'::jsonb
);

-- 2. Create Participants Table
CREATE TABLE public.participants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID NOT NULL REFERENCES public.event_sessions(id) ON DELETE CASCADE,
    nickname VARCHAR(50) NOT NULL,
    avatar_seed VARCHAR(50) NOT NULL DEFAULT 'default',
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    last_active_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    CONSTRAINT unique_event_nickname UNIQUE (event_id, nickname)
);

-- 3. Create Game Scores Table
CREATE TABLE public.game_scores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID NOT NULL REFERENCES public.event_sessions(id) ON DELETE CASCADE,
    participant_id UUID NOT NULL REFERENCES public.participants(id) ON DELETE CASCADE,
    game_id VARCHAR(50) NOT NULL,
    puzzle_id VARCHAR(50) NOT NULL,
    difficulty VARCHAR(20) NOT NULL,
    score INTEGER NOT NULL CHECK (score >= 0),
    base_points INTEGER NOT NULL,
    time_remaining_seconds INTEGER NOT NULL,
    time_bonus_points INTEGER NOT NULL,
    hints_used INTEGER NOT NULL DEFAULT 0,
    hint_deduction_points INTEGER NOT NULL DEFAULT 0,
    duration_seconds INTEGER NOT NULL,
    completed_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    is_valid BOOLEAN NOT NULL DEFAULT true
);

-- 4. Enable Indexes
CREATE INDEX idx_scores_event_game ON public.game_scores(event_id, game_id);
CREATE INDEX idx_scores_participant ON public.game_scores(participant_id);
```

---

## 6. Import/Export Data Formats

BYTE BATTLE enables host exports to both `.json` and `.csv`.

### 6.1 JSON Export Specification
```json
{
  "version": "1.0.0",
  "exportedAt": "2026-10-23T15:00:00.000Z",
  "session": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "title": "Tech Arena Fall 2026",
    "startedAt": "2026-10-23T13:00:00.000Z",
    "endedAt": "2026-10-23T15:00:00.000Z"
  },
  "leaderboard": [
    {
      "rank": 1,
      "nickname": "CyberKnight",
      "overallScore": 3620,
      "gameScores": {
        "pattern-shift": 850,
        "word-weave": 920,
        "code-cracker": 900,
        "grid-tactician": 950
      },
      "totalDurationSeconds": 245,
      "totalHintsUsed": 1
    }
  ],
  "rawAttemptsCount": 68
}
```

### 6.2 CSV Export Specification & Formula Injection Protection
To prevent **CSV / Excel Formula Injection**, any cell starting with `=`, `+`, `-`, or `@` is prefixed with a single quotation mark `'`.

```csv
Rank,Nickname,Overall_Score,Pattern_Shift,Word_Weave,Code_Cracker,Grid_Tactician,Total_Time_Sec,Hints_Used
1,"CyberKnight",3620,850,920,900,950,245,1
2,"PixelCoder",3480,900,810,880,890,260,2
3,"QuantumByte",3340,780,850,910,800,280,0
```

---

## 7. Cross-References

- [Project Specification](PROJECT_SPEC.md) — Functional rules and acceptance criteria.
- [Security Guide](SECURITY.md) — Input sanitization and formula injection prevention.
- [Testing Standards](TESTING.md) — Leaderboard aggregation unit test specifications.
