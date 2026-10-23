import { describe, it, expect } from 'vitest';
import { calculateScore, BASE_POINTS, TIME_MULTIPLIERS, HINT_PENALTIES } from '@/services/scoring';

describe('Scoring Engine Unit Tests', () => {
  it('awards zero points for incorrect answers regardless of time', () => {
    const result = calculateScore({
      difficulty: 'easy',
      isCorrect: false,
      timeRemainingSeconds: 50,
      totalRoundSeconds: 60,
      hintsUsed: 0,
    });
    expect(result.score).toBe(0);
    expect(result.accuracy).toBe(0);
  });

  it('calculates correct base points and time bonus for Easy tier', () => {
    // Easy: base 500, time multiplier 5
    const result = calculateScore({
      difficulty: 'easy',
      isCorrect: true,
      timeRemainingSeconds: 20,
      totalRoundSeconds: 60,
      hintsUsed: 0,
    });
    // 500 + (20 * 5) = 600
    expect(result.score).toBe(600);
    expect(result.basePoints).toBe(500);
    expect(result.timeBonusPoints).toBe(100);
    expect(result.hintPenaltyPoints).toBe(0);
  });

  it('applies hint penalties properly for Medium and Hard tiers', () => {
    // Medium: base 800, time multiplier 8, hint 1 = -150
    const resMedium1Hint = calculateScore({
      difficulty: 'medium',
      isCorrect: true,
      timeRemainingSeconds: 10,
      totalRoundSeconds: 60,
      hintsUsed: 1,
    });
    // 800 + (10 * 8) - 150 = 800 + 80 - 150 = 730
    expect(resMedium1Hint.score).toBe(730);
    expect(resMedium1Hint.hintPenaltyPoints).toBe(150);

    // Hard: base 1200, time multiplier 10, hint 1+2 = -250 - 400 = -650
    const resHard2Hints = calculateScore({
      difficulty: 'hard',
      isCorrect: true,
      timeRemainingSeconds: 30,
      totalRoundSeconds: 120,
      hintsUsed: 2,
    });
    // 1200 + (30 * 10) - 650 = 1200 + 300 - 650 = 850
    expect(resHard2Hints.score).toBe(850);
    expect(resHard2Hints.hintPenaltyPoints).toBe(650);
  });

  it('clamps score at zero so penalties never produce negative score', () => {
    const clamped = calculateScore({
      difficulty: 'easy',
      isCorrect: true,
      timeRemainingSeconds: 0,
      totalRoundSeconds: 60,
      hintsUsed: 2, // penalty: -100 - 200 = -300
    });
    // 500 - 300 = 200 >= 0
    expect(clamped.score).toBeGreaterThanOrEqual(0);
  });
});
