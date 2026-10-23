import { GameId } from './puzzle';

export interface ParticipantGameScoreSummary {
  bestScore: number;
  attemptsCount: number;
  minTimeSeconds: number;
  hintsUsedInBest: number;
  bestCompletedAt: string | null;
}

export interface LeaderboardEntry {
  rank: number;
  participantId: string;
  nickname: string;
  avatarSeed: string;
  overallScore: number;
  gameScores: Record<GameId, number>; // best score per game
  gameAttemptsCount: Record<GameId, number>;
  totalTimeSeconds: number; // sum of elapsed seconds for best runs
  totalHintsUsed: number;
  lastActiveAt: string;
}

export interface GameSpecificLeaderboardEntry {
  rank: number;
  participantId: string;
  nickname: string;
  avatarSeed: string;
  gameId: GameId;
  bestScore: number;
  attemptsCount: number;
  timeSeconds: number;
  hintsUsed: number;
  completedAt: string;
}
