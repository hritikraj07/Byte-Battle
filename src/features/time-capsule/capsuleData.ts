export interface TimeCapsule {
  id: string;
  title: string;
  content: string;
  category: 'prediction' | 'letter' | 'goal' | 'reflection';
  createdAt: string;
  unlockDate: string;
  isCustomLocked: boolean;
}

export const INITIAL_CAPSULES: TimeCapsule[] = [
  {
    id: 'cap-sample-01',
    title: 'A Message to My Future Mind',
    content:
      'Did the world solve clean fusion energy? Remember why you started coding: not just to build interfaces, but to create spaces where human beings feel curious, inspired, and capable of touching the future.',
    category: 'letter',
    createdAt: '2026-10-24T10:00:00Z',
    unlockDate: '2030-01-01T00:00:00Z',
    isCustomLocked: true,
  },
  {
    id: 'cap-sample-02',
    title: 'Planetary AI & Autonomous Code Forecast',
    content:
      'By 2032, personal agentic software will have decentralized software creation so profoundly that anyone can speak an idea into a functioning reality. I predict human intuition and taste will become our most valuable currency.',
    category: 'prediction',
    createdAt: '2026-10-24T10:00:00Z',
    unlockDate: '2036-10-24T00:00:00Z',
    isCustomLocked: true,
  },
];

export function getDaysRemaining(unlockIso: string): number {
  const target = new Date(unlockIso).getTime();
  const now = new Date().getTime();
  const diff = target - now;
  if (diff <= 0) return 0;
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}
