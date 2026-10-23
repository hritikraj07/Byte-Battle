import { GameId } from './puzzle';

export interface EventSession {
  id: string; // UUID v4
  title: string;
  hostPinHash: string;
  startedAt: string; // ISO 8601 UTC
  endedAt: string | null;
  status: 'active' | 'paused' | 'completed';
  config: {
    roundDurationSeconds: number; // default 120
    allowedGames: GameId[];
    attemptsPerParticipant: number; // default 3, or unlimited
    showImmediateResult: boolean; // default true
    showLeaderboardAfterRound: boolean; // default true
    isOpenForNewParticipants: boolean; // default true
  };
}

export interface Participant {
  id: string; // UUID v4
  eventId: string; // Foreign key referencing EventSession.id
  nickname: string; // Sanitized nickname (2-15 chars)
  avatarSeed: string;
  createdAt: string; // ISO 8601 UTC
  lastActiveAt: string;
}

export interface HostSettings {
  defaultPin: string;
  theme: 'cyber-dark' | 'neon-contrast';
  soundEnabled: boolean;
  projectorAutoScroll: boolean;
  projectorCycleSeconds: number;
}
