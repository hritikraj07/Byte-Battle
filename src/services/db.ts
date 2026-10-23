import Dexie, { Table } from 'dexie';
import { EventSession, Participant } from '../types/event';
import { GameAttempt } from '../types/game';
import { GameId } from '../types/puzzle';

export interface PersonalBestRecord {
  id?: number;
  participantId: string;
  gameId: GameId;
  bestScore: number;
  updatedAt: string;
}

export interface AppSettingRecord {
  key: string;
  value: unknown;
}

export class ByteBattleDB extends Dexie {
  sessions!: Table<EventSession, string>;
  participants!: Table<Participant, string>;
  attempts!: Table<GameAttempt, string>;
  personalBests!: Table<PersonalBestRecord, number>;
  settings!: Table<AppSettingRecord, string>;

  constructor() {
    super('ByteBattleDB');
    this.version(1).stores({
      sessions: 'id, startedAt, status',
      participants: 'id, eventId, nickname, [eventId+nickname]',
      attempts: 'id, eventId, participantId, gameId, completedAt, isPractice, [eventId+gameId], [participantId+gameId]',
      personalBests: '++id, participantId, gameId, [participantId+gameId]',
      settings: 'key',
    });
  }
}

// Singleton database instance
export const db = new ByteBattleDB();

// Storage helper functions
export async function getActiveSession(): Promise<EventSession | null> {
  try {
    const active = await db.sessions.where('status').equals('active').first();
    if (active) return active;
    // Fallback: check most recently started session
    const lastSession = await db.sessions.orderBy('startedAt').reverse().first();
    return lastSession ?? null;
  } catch (err) {
    console.error('Failed to get active session from IndexedDB:', err);
    return null;
  }
}

export async function createSession(title: string, pin: string = '1234'): Promise<EventSession> {
  const newSession: EventSession = {
    id: `sess-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`,
    title: title || 'University Tech Battle',
    hostPinHash: pin, // In local mode, store pin for quick verification
    startedAt: new Date().toISOString(),
    endedAt: null,
    status: 'active',
    config: {
      roundDurationSeconds: 120,
      allowedGames: ['pattern-shift', 'word-weave', 'code-cracker', 'grid-tactician'],
      attemptsPerParticipant: 5,
      showImmediateResult: true,
      showLeaderboardAfterRound: true,
      isOpenForNewParticipants: true,
    },
  };

  // Close previous active sessions
  await db.sessions.where('status').equals('active').modify({ status: 'completed', endedAt: new Date().toISOString() });
  await db.sessions.add(newSession);
  return newSession;
}

export async function getOrCreateParticipant(eventId: string, nickname: string): Promise<Participant> {
  const existing = await db.participants
    .where(['eventId', 'nickname'])
    .equals([eventId, nickname])
    .first();

  if (existing) {
    await db.participants.update(existing.id, { lastActiveAt: new Date().toISOString() });
    return existing;
  }

  const newParticipant: Participant = {
    id: `p-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    eventId,
    nickname,
    avatarSeed: nickname.toLowerCase(),
    createdAt: new Date().toISOString(),
    lastActiveAt: new Date().toISOString(),
  };

  await db.participants.add(newParticipant);
  return newParticipant;
}

export async function saveGameAttempt(attempt: GameAttempt): Promise<void> {
  await db.attempts.put(attempt);

  // If this is personal practice, also update personal best
  if (attempt.isPractice) {
    const existing = await db.personalBests
      .where(['participantId', 'gameId'])
      .equals([attempt.participantId, attempt.gameId])
      .first();

    if (!existing) {
      await db.personalBests.add({
        participantId: attempt.participantId,
        gameId: attempt.gameId,
        bestScore: attempt.score,
        updatedAt: attempt.completedAt,
      });
    } else if (attempt.score > existing.bestScore) {
      await db.personalBests.update(existing.id!, {
        bestScore: attempt.score,
        updatedAt: attempt.completedAt,
      });
    }
  }
}

export async function getEventData(eventId: string) {
  const participants = await db.participants.where('eventId').equals(eventId).toArray();
  const attempts = await db.attempts.where('eventId').equals(eventId).toArray();
  return { participants, attempts };
}

export async function clearAllEventData(): Promise<void> {
  await db.transaction('rw', [db.sessions, db.participants, db.attempts], async () => {
    await db.sessions.clear();
    await db.participants.clear();
    await db.attempts.clear();
  });
}
