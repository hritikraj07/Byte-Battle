import { GameId, Difficulty, AnyPuzzle, PatternShiftPuzzle, WordCategoryPuzzle } from '@/types/puzzle';
import { getPuzzlesByDifficulty } from '@/data/puzzles';

const HISTORY_KEY_PREFIX = 'byte_battle_seen_puzzles_';

// In-memory fallback for SSR and Vitest / Node test runners
const memorySeenStore = new Map<string, string[]>();

function getSeenPuzzleIds(gameId: GameId, difficulty: Difficulty): string[] {
  const key = `${HISTORY_KEY_PREFIX}${gameId}_${difficulty}`;
  if (typeof window === 'undefined') {
    return memorySeenStore.get(key) || [];
  }
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : (memorySeenStore.get(key) || []);
  } catch {
    return memorySeenStore.get(key) || [];
  }
}

function saveSeenPuzzleId(gameId: GameId, difficulty: Difficulty, puzzleId: string): void {
  const key = `${HISTORY_KEY_PREFIX}${gameId}_${difficulty}`;
  const seen = getSeenPuzzleIds(gameId, difficulty);
  if (!seen.includes(puzzleId)) {
    const updated = [...seen, puzzleId];
    memorySeenStore.set(key, updated);
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(key, JSON.stringify(updated));
      } catch {
        // ignore
      }
    }
  }
}

export function clearPuzzleHistory(gameId?: GameId): void {
  if (gameId) {
    (['easy', 'medium', 'hard'] as Difficulty[]).forEach((diff) => {
      const key = `${HISTORY_KEY_PREFIX}${gameId}_${diff}`;
      memorySeenStore.delete(key);
      if (typeof window !== 'undefined') {
        try {
          localStorage.removeItem(key);
        } catch {
          // ignore
        }
      }
    });
  } else {
    memorySeenStore.clear();
    if (typeof window !== 'undefined') {
      try {
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key && key.startsWith(HISTORY_KEY_PREFIX)) {
            localStorage.removeItem(key);
          }
        }
      } catch {
        // ignore
      }
    }
  }
}

/**
 * Fisher-Yates array shuffle (returns new shuffled array)
 */
export function shuffleArray<T>(items: readonly T[]): T[] {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

/**
 * Selects a non-repeating random puzzle from the catalog, cycling the pool when exhausted.
 */
export function getRandomPuzzle<T extends AnyPuzzle = AnyPuzzle>(
  gameId: GameId,
  difficulty: Difficulty,
  excludeIds: string[] = []
): T | null {
  const allCandidates = getPuzzlesByDifficulty(gameId, difficulty) as T[];
  if (!allCandidates || allCandidates.length === 0) return null;

  const seenIds = getSeenPuzzleIds(gameId, difficulty);
  const combinedExcludes = new Set([...seenIds, ...excludeIds]);

  // Available puzzles that haven't been seen in this cycle
  let available = allCandidates.filter((p) => !combinedExcludes.has(p.id));

  // If pool exhausted, reset history cycle
  if (available.length === 0) {
    clearPuzzleHistory(gameId);
    // Filter out only current run's excludeIds
    available = allCandidates.filter((p) => !excludeIds.includes(p.id));
    if (available.length === 0) {
      available = allCandidates;
    }
  }

  // Pick random puzzle from available pool
  const randomIndex = Math.floor(Math.random() * available.length);
  const selected = available[randomIndex];

  // Mark as seen
  saveSeenPuzzleId(gameId, difficulty, selected.id);

  // Return a cloned and option-shuffled copy so answer order is randomized
  return preparePuzzleForPlay(selected) as T;
}

/**
 * Shuffles interactive choices without modifying canonical solutions.
 */
export function preparePuzzleForPlay(puzzle: AnyPuzzle): AnyPuzzle {
  if (puzzle.gameId === 'pattern-shift') {
    const ps = puzzle as PatternShiftPuzzle;
    return {
      ...ps,
      options: shuffleArray(ps.options),
    };
  }

  if (puzzle.gameId === 'word-weave' && puzzle.type === 'category') {
    const cat = puzzle as WordCategoryPuzzle;
    return {
      ...cat,
      allShuffledItems: shuffleArray(cat.allShuffledItems),
    };
  }

  return puzzle;
}
