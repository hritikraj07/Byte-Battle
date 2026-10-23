import { GameId } from '../types/puzzle';
import { GameAttempt } from '../types/game';
import { Participant } from '../types/event';
import { LeaderboardEntry, GameSpecificLeaderboardEntry } from '../types/leaderboard';

export const ALL_GAMES: GameId[] = [
  'pattern-shift',
  'word-weave',
  'pulse-jumper',
  'reflex-rush',
  'memory-matrix',
  'color-clash',
  'orbit-dodge',
  'stack-sprint',
  'number-blitz',
  'maze-runner',
  'pixel-invaders',
];

const createEmptyGameRecords = <T>(defaultValue: T): Record<GameId, T> => ({
  'pattern-shift': defaultValue,
  'word-weave': defaultValue,
  'pulse-jumper': defaultValue,
  'reflex-rush': defaultValue,
  'memory-matrix': defaultValue,
  'color-clash': defaultValue,
  'orbit-dodge': defaultValue,
  'stack-sprint': defaultValue,
  'number-blitz': defaultValue,
  'maze-runner': defaultValue,
  'pixel-invaders': defaultValue,
  'code-cracker': defaultValue,
  'grid-tactician': defaultValue,
  'palmdrive-rally': defaultValue,
  'neon-ridge-rally': defaultValue,
});

/**
 * Calculates the Overall Leaderboard:
 * For each participant in the session, takes their single HIGHEST valid score from each game.
 * Replays never accumulate; only higher score replaces the best.
 */
export function calculateOverallLeaderboard(
  participants: Participant[],
  attempts: GameAttempt[]
): LeaderboardEntry[] {
  const participantMap = new Map<string, Participant>();
  for (const p of participants) {
    participantMap.set(p.id, p);
  }

  // Group attempts by participantId and gameId
  const scoreMap = new Map<string, {
    bestScores: Record<GameId, number>;
    attemptsCount: Record<GameId, number>;
    bestTimeSeconds: Record<GameId, number>;
    hintsInBest: Record<GameId, number>;
    bestCompletedAt: Record<GameId, string | null>;
  }>();

  for (const p of participants) {
    scoreMap.set(p.id, {
      bestScores: createEmptyGameRecords(0),
      attemptsCount: createEmptyGameRecords(0),
      bestTimeSeconds: createEmptyGameRecords(0),
      hintsInBest: createEmptyGameRecords(0),
      bestCompletedAt: createEmptyGameRecords<string | null>(null),
    });
  }

  // Iterate attempts
  for (const a of attempts) {
    if (!a.isCorrect && a.score === 0) {
      // Track attempt count even for failed rounds
      const pEntry = scoreMap.get(a.participantId);
      if (pEntry && ALL_GAMES.includes(a.gameId)) {
        pEntry.attemptsCount[a.gameId] += 1;
      }
      continue;
    }

    let pEntry = scoreMap.get(a.participantId);
    if (!pEntry) {
      // In case participant wasn't pre-registered in list
      pEntry = {
        bestScores: createEmptyGameRecords(0),
        attemptsCount: createEmptyGameRecords(0),
        bestTimeSeconds: createEmptyGameRecords(0),
        hintsInBest: createEmptyGameRecords(0),
        bestCompletedAt: createEmptyGameRecords<string | null>(null),
      };
      scoreMap.set(a.participantId, pEntry);
    }

    if (!ALL_GAMES.includes(a.gameId)) continue;

    pEntry.attemptsCount[a.gameId] += 1;

    // Best Score Policy: Replace only if strictly higher, or if score matches but time is lower
    const currentBest = pEntry.bestScores[a.gameId];
    if (a.score > currentBest) {
      pEntry.bestScores[a.gameId] = a.score;
      pEntry.bestTimeSeconds[a.gameId] = a.elapsedSeconds;
      pEntry.hintsInBest[a.gameId] = a.hintsUsed;
      pEntry.bestCompletedAt[a.gameId] = a.completedAt;
    } else if (a.score === currentBest && currentBest > 0) {
      // Tie within same game attempt: prefer lower time
      if (a.elapsedSeconds < pEntry.bestTimeSeconds[a.gameId]) {
        pEntry.bestTimeSeconds[a.gameId] = a.elapsedSeconds;
        pEntry.hintsInBest[a.gameId] = a.hintsUsed;
        pEntry.bestCompletedAt[a.gameId] = a.completedAt;
      }
    }
  }

  // Build entries
  const entries: LeaderboardEntry[] = [];
  for (const [pId, pData] of Array.from(scoreMap.entries())) {
    const participant = participantMap.get(pId) ?? {
      id: pId,
      eventId: '',
      nickname: attempts.find(a => a.participantId === pId)?.nickname || 'Player',
      avatarSeed: 'seed',
      createdAt: new Date().toISOString(),
      lastActiveAt: new Date().toISOString(),
    };

    let overallScore = 0;
    let totalTimeSeconds = 0;
    let totalHintsUsed = 0;
    let latestTimestamp = participant.createdAt;

    for (const g of ALL_GAMES) {
      overallScore += pData.bestScores[g];
      totalTimeSeconds += pData.bestTimeSeconds[g];
      totalHintsUsed += pData.hintsInBest[g];
      const stamp = pData.bestCompletedAt[g];
      if (stamp && stamp > latestTimestamp) {
        latestTimestamp = stamp;
      }
    }

    entries.push({
      rank: 0,
      participantId: pId,
      nickname: participant.nickname,
      avatarSeed: participant.avatarSeed,
      overallScore,
      gameScores: pData.bestScores,
      gameAttemptsCount: pData.attemptsCount,
      totalTimeSeconds,
      totalHintsUsed,
      lastActiveAt: latestTimestamp,
    });
  }

  // Sort by tie-breaking hierarchy:
  // 1. Higher overall score
  // 2. Fewer total hints
  // 3. Lower total time
  // 4. Earlier timestamp
  entries.sort((a, b) => {
    if (b.overallScore !== a.overallScore) return b.overallScore - a.overallScore;
    if (a.totalHintsUsed !== b.totalHintsUsed) return a.totalHintsUsed - b.totalHintsUsed;
    if (a.totalTimeSeconds !== b.totalTimeSeconds) return a.totalTimeSeconds - b.totalTimeSeconds;
    return a.lastActiveAt.localeCompare(b.lastActiveAt);
  });

  // Assign ranks (1-indexed)
  for (let i = 0; i < entries.length; i++) {
    entries[i].rank = i + 1;
  }

  return entries;
}

/**
 * Calculates a Game-Specific Leaderboard for a single game.
 */
export function calculateGameLeaderboard(
  gameId: GameId,
  participants: Participant[],
  attempts: GameAttempt[]
): GameSpecificLeaderboardEntry[] {
  const participantMap = new Map<string, Participant>();
  for (const p of participants) {
    participantMap.set(p.id, p);
  }

  const pGameMap = new Map<string, {
    bestScore: number;
    attemptsCount: number;
    timeSeconds: number;
    hintsUsed: number;
    completedAt: string;
  }>();

  for (const p of participants) {
    pGameMap.set(p.id, {
      bestScore: 0,
      attemptsCount: 0,
      timeSeconds: 0,
      hintsUsed: 0,
      completedAt: p.createdAt,
    });
  }

  for (const a of attempts) {
    const isTargetGame =
      a.gameId === gameId ||
      ((gameId === 'neon-ridge-rally' || gameId === 'palmdrive-rally') &&
        (a.gameId === 'neon-ridge-rally' || a.gameId === 'palmdrive-rally'));
    if (!isTargetGame) continue;

    let pEntry = pGameMap.get(a.participantId);
    if (!pEntry) {
      pEntry = { bestScore: 0, attemptsCount: 0, timeSeconds: 0, hintsUsed: 0, completedAt: a.completedAt };
      pGameMap.set(a.participantId, pEntry);
    }

    pEntry.attemptsCount += 1;

    if (a.score > pEntry.bestScore) {
      pEntry.bestScore = a.score;
      pEntry.timeSeconds = a.elapsedSeconds;
      pEntry.hintsUsed = a.hintsUsed;
      pEntry.completedAt = a.completedAt;
    } else if (a.score === pEntry.bestScore && pEntry.bestScore > 0) {
      if (a.elapsedSeconds < pEntry.timeSeconds) {
        pEntry.timeSeconds = a.elapsedSeconds;
        pEntry.hintsUsed = a.hintsUsed;
        pEntry.completedAt = a.completedAt;
      }
    }
  }

  const entries: GameSpecificLeaderboardEntry[] = [];
  for (const [pId, pData] of Array.from(pGameMap.entries())) {
    const participant = participantMap.get(pId) ?? {
      id: pId,
      eventId: '',
      nickname: attempts.find(a => a.participantId === pId)?.nickname || 'Player',
      avatarSeed: 'seed',
      createdAt: new Date().toISOString(),
      lastActiveAt: new Date().toISOString(),
    };

    entries.push({
      rank: 0,
      participantId: pId,
      nickname: participant.nickname,
      avatarSeed: participant.avatarSeed,
      gameId,
      bestScore: pData.bestScore,
      attemptsCount: pData.attemptsCount,
      timeSeconds: pData.timeSeconds,
      hintsUsed: pData.hintsUsed,
      completedAt: pData.completedAt,
    });
  }

  // Sort
  entries.sort((a, b) => {
    if (b.bestScore !== a.bestScore) return b.bestScore - a.bestScore;
    if (a.hintsUsed !== b.hintsUsed) return a.hintsUsed - b.hintsUsed;
    if (a.timeSeconds !== b.timeSeconds) return a.timeSeconds - b.timeSeconds;
    return a.completedAt.localeCompare(b.completedAt);
  });

  for (let i = 0; i < entries.length; i++) {
    entries[i].rank = i + 1;
  }

  return entries;
}
