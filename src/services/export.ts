import { db } from './db';
import { sanitizeCsvCell } from './sanitizer';
import { calculateOverallLeaderboard } from './leaderboard';
import { EventSession, Participant } from '../types/event';
import { GameAttempt } from '../types/game';

export interface ExportDataPayload {
  version: string;
  exportedAt: string;
  session: EventSession | null;
  participants: Participant[];
  attempts: GameAttempt[];
}

export async function exportSessionToJson(eventId: string): Promise<string> {
  const session = await db.sessions.get(eventId);
  const participants = await db.participants.where('eventId').equals(eventId).toArray();
  const attempts = await db.attempts.where('eventId').equals(eventId).toArray();

  const payload: ExportDataPayload = {
    version: '1.0.0',
    exportedAt: new Date().toISOString(),
    session: session ?? null,
    participants,
    attempts,
  };

  return JSON.stringify(payload, null, 2);
}

export async function exportAllLocalDataJson(): Promise<string> {
  const sessions = await db.sessions.toArray();
  const participants = await db.participants.toArray();
  const attempts = await db.attempts.toArray();
  const personalBests = await db.personalBests.toArray();

  const payload = {
    app: 'BYTE BATTLE',
    version: '2.0.0',
    exportedAt: new Date().toISOString(),
    sessions,
    participants,
    attempts,
    personalBests,
  };

  return JSON.stringify(payload, null, 2);
}

export async function exportSessionToCsv(eventId: string): Promise<string> {
  const participants = await db.participants.where('eventId').equals(eventId).toArray();
  const attempts = await db.attempts.where('eventId').equals(eventId).toArray();
  const leaderboard = calculateOverallLeaderboard(participants, attempts);

  const headers = [
    'Rank',
    'Nickname',
    'Overall_Score',
    'Pattern_Shift',
    'Word_Weave',
    'Code_Cracker',
    'Grid_Tactician',
    'Pulse_Jumper',
    'PalmDrive_Rally',
    'Total_Time_Seconds',
    'Hints_Used',
    'Last_Active_UTC'
  ];

  const rows = leaderboard.map(entry => [
    sanitizeCsvCell(entry.rank),
    sanitizeCsvCell(entry.nickname),
    sanitizeCsvCell(entry.overallScore),
    sanitizeCsvCell(entry.gameScores['pattern-shift']),
    sanitizeCsvCell(entry.gameScores['word-weave']),
    sanitizeCsvCell(entry.gameScores['code-cracker']),
    sanitizeCsvCell(entry.gameScores['grid-tactician']),
    sanitizeCsvCell(entry.gameScores['pulse-jumper']),
    sanitizeCsvCell(entry.gameScores['palmdrive-rally']),
    sanitizeCsvCell(entry.totalTimeSeconds),
    sanitizeCsvCell(entry.totalHintsUsed),
    sanitizeCsvCell(entry.lastActiveAt)
  ].join(','));

  return [headers.join(','), ...rows].join('\r\n');
}

export async function importSessionFromJson(jsonString: string): Promise<{ success: boolean; message: string; count: number }> {
  try {
    const data = JSON.parse(jsonString) as ExportDataPayload;
    if (!data || !Array.isArray(data.participants) || !Array.isArray(data.attempts)) {
      return { success: false, message: 'Invalid JSON format: missing participants or attempts array.', count: 0 };
    }

    await db.transaction('rw', [db.sessions, db.participants, db.attempts], async () => {
      if (data.session) {
        await db.sessions.put(data.session);
      }
      for (const p of data.participants) {
        await db.participants.put(p);
      }
      for (const a of data.attempts) {
        await db.attempts.put(a);
      }
    });

    return {
      success: true,
      message: `Successfully imported ${data.participants.length} participants and ${data.attempts.length} score attempts.`,
      count: data.attempts.length,
    };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Unknown JSON parse error';
    return { success: false, message: `Import error: ${msg}`, count: 0 };
  }
}
