import { describe, it, expect } from 'vitest';
import { calculateOverallLeaderboard, calculateGameLeaderboard } from '@/services/leaderboard';
import { Participant } from '@/types/event';
import { GameAttempt } from '@/types/game';

describe('Leaderboard Calculations & Best Score Policy Suite', () => {
  const participants: Participant[] = [
    {
      id: 'p1',
      eventId: 'sess1',
      nickname: 'CyberKnight',
      avatarSeed: 'seed1',
      createdAt: '2026-10-23T10:00:00Z',
      lastActiveAt: '2026-10-23T10:30:00Z',
    },
    {
      id: 'p2',
      eventId: 'sess1',
      nickname: 'PixelPilot',
      avatarSeed: 'seed2',
      createdAt: '2026-10-23T10:05:00Z',
      lastActiveAt: '2026-10-23T10:35:00Z',
    },
    {
      id: 'p3',
      eventId: 'sess1',
      nickname: 'ZeroPointsPlayer',
      avatarSeed: 'seed3',
      createdAt: '2026-10-23T10:10:00Z',
      lastActiveAt: '2026-10-23T10:10:00Z',
    },
  ];

  it('aggregates overall score as the sum of best score in each of the 4 games', () => {
    const attempts: GameAttempt[] = [
      // p1 plays Pattern Shift: attempt 1 = 600, replay = 850
      {
        id: 'a1', eventId: 'sess1', participantId: 'p1', nickname: 'CyberKnight',
        gameId: 'pattern-shift', puzzleId: 'PS-001', difficulty: 'easy',
        isCorrect: true, score: 600, basePoints: 500, timeRemainingSeconds: 20,
        timeBonusPoints: 100, hintsUsed: 0, hintPenaltyPoints: 0, elapsedSeconds: 40,
        totalRoundSeconds: 60, completedAt: '2026-10-23T10:15:00Z', isPractice: false,
      },
      {
        id: 'a2', eventId: 'sess1', participantId: 'p1', nickname: 'CyberKnight',
        gameId: 'pattern-shift', puzzleId: 'PS-002', difficulty: 'easy',
        isCorrect: true, score: 850, basePoints: 500, timeRemainingSeconds: 70,
        timeBonusPoints: 350, hintsUsed: 0, hintPenaltyPoints: 0, elapsedSeconds: 30,
        totalRoundSeconds: 60, completedAt: '2026-10-23T10:20:00Z', isPractice: false,
      },
      // p1 plays Word Weave: score 700
      {
        id: 'a3', eventId: 'sess1', participantId: 'p1', nickname: 'CyberKnight',
        gameId: 'word-weave', puzzleId: 'WW-001', difficulty: 'easy',
        isCorrect: true, score: 700, basePoints: 500, timeRemainingSeconds: 40,
        timeBonusPoints: 200, hintsUsed: 0, hintPenaltyPoints: 0, elapsedSeconds: 50,
        totalRoundSeconds: 90, completedAt: '2026-10-23T10:25:00Z', isPractice: false,
      },
    ];

    const leaderboard = calculateOverallLeaderboard(participants, attempts);

    const p1Entry = leaderboard.find((e) => e.participantId === 'p1');
    expect(p1Entry).toBeDefined();
    // Best PS = 850, Best WW = 700, CC = 0, GT = 0. Overall = 850 + 700 = 1550
    expect(p1Entry?.gameScores['pattern-shift']).toBe(850);
    expect(p1Entry?.gameScores['word-weave']).toBe(700);
    expect(p1Entry?.overallScore).toBe(1550);
    expect(p1Entry?.rank).toBe(1);
  });

  it('guarantees replays never inflate scores if new score is lower', () => {
    const attempts: GameAttempt[] = [
      {
        id: 'a1', eventId: 'sess1', participantId: 'p1', nickname: 'CyberKnight',
        gameId: 'pattern-shift', puzzleId: 'PS-001', difficulty: 'easy',
        isCorrect: true, score: 900, basePoints: 500, timeRemainingSeconds: 80,
        timeBonusPoints: 400, hintsUsed: 0, hintPenaltyPoints: 0, elapsedSeconds: 20,
        totalRoundSeconds: 60, completedAt: '2026-10-23T10:15:00Z', isPractice: false,
      },
      // Replay attempt with lower score (500)
      {
        id: 'a2', eventId: 'sess1', participantId: 'p1', nickname: 'CyberKnight',
        gameId: 'pattern-shift', puzzleId: 'PS-001', difficulty: 'easy',
        isCorrect: true, score: 500, basePoints: 500, timeRemainingSeconds: 0,
        timeBonusPoints: 0, hintsUsed: 0, hintPenaltyPoints: 0, elapsedSeconds: 60,
        totalRoundSeconds: 60, completedAt: '2026-10-23T10:20:00Z', isPractice: false,
      },
    ];

    const leaderboard = calculateOverallLeaderboard(participants, attempts);
    const p1Entry = leaderboard.find((e) => e.participantId === 'p1');
    expect(p1Entry?.overallScore).toBe(900);
  });

  it('includes every participant even those with 0 points', () => {
    const leaderboard = calculateOverallLeaderboard(participants, []);
    expect(leaderboard).toHaveLength(3);
    const p3Entry = leaderboard.find((e) => e.participantId === 'p3');
    expect(p3Entry?.overallScore).toBe(0);
    expect(p3Entry?.rank).toBeDefined();
  });

  it('breaks ties using fewer hints and lower elapsed time', () => {
    const attempts: GameAttempt[] = [
      // p1: 800 pts, 1 hint, 30 sec
      {
        id: 'a1', eventId: 'sess1', participantId: 'p1', nickname: 'CyberKnight',
        gameId: 'pattern-shift', puzzleId: 'PS-001', difficulty: 'easy',
        isCorrect: true, score: 800, basePoints: 500, timeRemainingSeconds: 60,
        timeBonusPoints: 300, hintsUsed: 1, hintPenaltyPoints: 100, elapsedSeconds: 30,
        totalRoundSeconds: 60, completedAt: '2026-10-23T10:15:00Z', isPractice: false,
      },
      // p2: 800 pts, 0 hints, 35 sec -> p2 wins tie-breaker because 0 hints < 1 hint
      {
        id: 'a2', eventId: 'sess1', participantId: 'p2', nickname: 'PixelPilot',
        gameId: 'pattern-shift', puzzleId: 'PS-001', difficulty: 'easy',
        isCorrect: true, score: 800, basePoints: 500, timeRemainingSeconds: 60,
        timeBonusPoints: 300, hintsUsed: 0, hintPenaltyPoints: 0, elapsedSeconds: 35,
        totalRoundSeconds: 60, completedAt: '2026-10-23T10:16:00Z', isPractice: false,
      },
    ];

    const leaderboard = calculateOverallLeaderboard(participants, attempts);
    expect(leaderboard[0].participantId).toBe('p2');
    expect(leaderboard[1].participantId).toBe('p1');
  });

  it('only includes participants who actually played the specific game in game leaderboard', () => {
    const attempts: GameAttempt[] = [
      {
        id: 'a1', eventId: 'sess1', participantId: 'p1', nickname: 'CyberKnight',
        gameId: 'pattern-shift', puzzleId: 'PS-001', difficulty: 'easy',
        isCorrect: true, score: 800, basePoints: 500, timeRemainingSeconds: 60,
        timeBonusPoints: 300, hintsUsed: 0, hintPenaltyPoints: 0, elapsedSeconds: 30,
        totalRoundSeconds: 60, completedAt: '2026-10-23T10:15:00Z', isPractice: false,
      },
    ];

    // Only p1 played pattern-shift; p2 and p3 never played
    const psLeaderboard = calculateGameLeaderboard('pattern-shift', participants, attempts);
    expect(psLeaderboard).toHaveLength(1);
    expect(psLeaderboard[0].participantId).toBe('p1');

    // Nobody played word-weave
    const wwLeaderboard = calculateGameLeaderboard('word-weave', participants, attempts);
    expect(wwLeaderboard).toHaveLength(0);
  });
});
