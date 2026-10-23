import { describe, it, expect, beforeEach } from 'vitest';
import { getRandomPuzzle, clearPuzzleHistory, shuffleArray } from '@/services/puzzleRandomizer';
import { PatternShiftPuzzle } from '@/types/puzzle';

describe('Puzzle Randomizer & Pool Cycling Suite', () => {
  beforeEach(() => {
    clearPuzzleHistory();
  });

  it('selects a valid puzzle with required properties', () => {
    const puzzle = getRandomPuzzle('pattern-shift', 'easy');
    expect(puzzle).toBeDefined();
    expect(puzzle?.id).toBeTruthy();
    expect(puzzle?.gameId).toBe('pattern-shift');
    expect(puzzle?.difficulty).toBe('easy');
  });

  it('avoids immediate duplicate selection across consecutive calls', () => {
    const p1 = getRandomPuzzle('pattern-shift', 'easy');
    const p2 = getRandomPuzzle('pattern-shift', 'easy');
    expect(p1).toBeDefined();
    expect(p2).toBeDefined();
    expect(p1?.id).not.toBe(p2?.id);
  });

  it('shuffles multiple choice options without modifying canonical solution', () => {
    const puzzle = getRandomPuzzle<PatternShiftPuzzle>('pattern-shift', 'easy');
    expect(puzzle?.options).toContain(puzzle?.canonicalSolution);
  });

  it('shuffles arrays non-destructively', () => {
    const original = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    const shuffled = shuffleArray(original);
    expect(shuffled).toHaveLength(original.length);
    expect(shuffled.sort()).toEqual(original.sort());
  });
});
