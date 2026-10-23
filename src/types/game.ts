import { GameId, Difficulty } from './puzzle';

export interface GameAttempt {
  id: string; // UUID v4
  eventId: string | null; // null for personal practice mode
  participantId: string; // Participant UUID or "practice-user"
  nickname: string;
  gameId: GameId;
  puzzleId: string;
  difficulty: Difficulty;
  isCorrect: boolean;
  score: number;
  basePoints: number;
  timeRemainingSeconds: number;
  timeBonusPoints: number;
  hintsUsed: number;
  hintPenaltyPoints: number;
  elapsedSeconds: number;
  totalRoundSeconds: number;
  completedAt: string; // ISO 8601 UTC
  isPractice: boolean;
  syncedToCloud?: boolean;
}

export interface RoundResultSummary {
  attemptId: string;
  gameId: GameId;
  score: number;
  isCorrect: boolean;
  timeTaken: number;
  hintsUsed: number;
  accuracy: number; // percentage
  rank?: number;
  isNewPersonalBest?: boolean;
}
