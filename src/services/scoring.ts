import { Difficulty, GameId } from '../types/puzzle';

export interface ScoringParams {
  difficulty: Difficulty;
  isCorrect: boolean;
  timeRemainingSeconds: number;
  totalRoundSeconds: number;
  hintsUsed: number; // 0, 1, or 2
}

export interface ScoreBreakdown {
  score: number;
  basePoints: number;
  timeBonusPoints: number;
  hintPenaltyPoints: number;
  elapsedSeconds: number;
  accuracy: number;
}

export const BASE_POINTS: Record<Difficulty, number> = {
  easy: 500,
  medium: 800,
  hard: 1200,
};

export const TIME_MULTIPLIERS: Record<Difficulty, number> = {
  easy: 5,
  medium: 8,
  hard: 10,
};

export const HINT_PENALTIES: Record<Difficulty, [number, number]> = {
  easy: [100, 200],    // 1 hint = -100, 2 hints = -100 - 200 = -300
  medium: [150, 250],  // 1 hint = -150, 2 hints = -400
  hard: [250, 400],    // 1 hint = -250, 2 hints = -650
};

export function calculateScore(params: ScoringParams): ScoreBreakdown {
  const { difficulty, isCorrect, timeRemainingSeconds, totalRoundSeconds, hintsUsed } = params;

  const elapsedSeconds = Math.max(0, totalRoundSeconds - Math.max(0, timeRemainingSeconds));

  if (!isCorrect) {
    return {
      score: 0,
      basePoints: 0,
      timeBonusPoints: 0,
      hintPenaltyPoints: 0,
      elapsedSeconds,
      accuracy: 0,
    };
  }

  const basePoints = BASE_POINTS[difficulty] ?? 500;
  const timeMultiplier = TIME_MULTIPLIERS[difficulty] ?? 5;
  const clampedTimeRemaining = Math.max(0, timeRemainingSeconds);
  const timeBonusPoints = Math.round(clampedTimeRemaining * timeMultiplier);

  let hintPenaltyPoints = 0;
  const penalties = HINT_PENALTIES[difficulty] ?? [100, 200];
  if (hintsUsed >= 1) hintPenaltyPoints += penalties[0];
  if (hintsUsed >= 2) hintPenaltyPoints += penalties[1];

  const rawScore = basePoints + timeBonusPoints - hintPenaltyPoints;
  const score = Math.max(0, rawScore);

  return {
    score,
    basePoints,
    timeBonusPoints,
    hintPenaltyPoints,
    elapsedSeconds,
    accuracy: 100,
  };
}
