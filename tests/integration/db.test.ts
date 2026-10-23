import { describe, it, expect, beforeEach } from 'vitest';
import { db, createSession, getOrCreateParticipant, saveGameAttempt, clearAllEventData } from '@/services/db';
import { exportSessionToCsv, exportSessionToJson, importSessionFromJson } from '@/services/export';
import { GameAttempt } from '@/types/game';

describe('IndexedDB Persistence & Export Integration Tests', () => {
  beforeEach(async () => {
    await clearAllEventData();
  });

  it('creates an active event session and persists it in IndexedDB', async () => {
    const session = await createSession('Test Tech Fest 2026', '1234');
    expect(session.id).toBeTruthy();
    expect(session.status).toBe('active');

    const fromDb = await db.sessions.get(session.id);
    expect(fromDb?.title).toBe('Test Tech Fest 2026');
  });

  it('registers participant and prevents duplicate entries within the same event', async () => {
    const session = await createSession('Session Alpha');
    const p1 = await getOrCreateParticipant(session.id, 'MatrixCoder');
    expect(p1.nickname).toBe('MatrixCoder');

    // Register same nickname again -> should return existing record
    const p2 = await getOrCreateParticipant(session.id, 'MatrixCoder');
    expect(p2.id).toBe(p1.id);

    const count = await db.participants.where('eventId').equals(session.id).count();
    expect(count).toBe(1);
  });

  it('saves game attempts and generates valid CSV and JSON exports', async () => {
    const session = await createSession('Session Beta');
    const p = await getOrCreateParticipant(session.id, 'DataKnight');

    const attempt: GameAttempt = {
      id: 'att-test-1',
      eventId: session.id,
      participantId: p.id,
      nickname: p.nickname,
      gameId: 'pattern-shift',
      puzzleId: 'PS-001',
      difficulty: 'easy',
      isCorrect: true,
      score: 750,
      basePoints: 500,
      timeRemainingSeconds: 50,
      timeBonusPoints: 250,
      hintsUsed: 0,
      hintPenaltyPoints: 0,
      elapsedSeconds: 10,
      totalRoundSeconds: 60,
      completedAt: new Date().toISOString(),
      isPractice: false,
    };

    await saveGameAttempt(attempt);

    // Test CSV Export
    const csv = await exportSessionToCsv(session.id);
    expect(csv).toContain('DataKnight');
    expect(csv).toContain('750');

    // Test JSON Export
    const jsonStr = await exportSessionToJson(session.id);
    const parsed = JSON.parse(jsonStr);
    expect(parsed.session.id).toBe(session.id);
    expect(parsed.participants).toHaveLength(1);
    expect(parsed.attempts).toHaveLength(1);

    // Test JSON Restoration into clean DB
    await clearAllEventData();
    expect(await db.participants.count()).toBe(0);

    const importRes = await importSessionFromJson(jsonStr);
    expect(importRes.success).toBe(true);
    expect(await db.participants.count()).toBe(1);
    expect(await db.attempts.count()).toBe(1);
  });
});
