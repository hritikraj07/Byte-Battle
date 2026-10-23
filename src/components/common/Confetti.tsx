'use client';

import confetti from 'canvas-confetti';

export function triggerConfetti() {
  try {
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#00F0FF', '#7000FF', '#10B981', '#F59E0B', '#3B82F6'],
    });
  } catch {
    // Canvas confetti gracefully falls back if canvas isn't supported
  }
}
