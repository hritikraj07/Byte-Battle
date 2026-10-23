import { describe, it, expect } from 'vitest';
import { sanitizeNickname, sanitizeCsvCell } from '@/services/sanitizer';

describe('Sanitizer & Security Utilities Suite', () => {
  it('accepts valid alphanumeric school-friendly nicknames', () => {
    const res1 = sanitizeNickname('CyberKnight');
    expect(res1.isValid).toBe(true);
    expect(res1.sanitized).toBe('CyberKnight');

    const res2 = sanitizeNickname('Pixel_Pilot-9');
    expect(res2.isValid).toBe(true);
    expect(res2.sanitized).toBe('Pixel_Pilot-9');

    const resWithSpaces = sanitizeNickname('   Code   Eagle   ');
    expect(resWithSpaces.isValid).toBe(true);
    expect(resWithSpaces.sanitized).toBe('Code Eagle');
  });

  it('rejects nicknames that are too short (< 2 chars) or too long (> 15 chars)', () => {
    expect(sanitizeNickname('A').isValid).toBe(false);
    expect(sanitizeNickname('').isValid).toBe(false);
    expect(sanitizeNickname('VeryLongNicknameThatExceedsLimit').isValid).toBe(false);
  });

  it('rejects HTML/Script injection attempts and illegal symbols', () => {
    expect(sanitizeNickname('<script>alert(1)</script>').isValid).toBe(false);
    expect(sanitizeNickname('Player; DROP TABLE').isValid).toBe(false);
    expect(sanitizeNickname('User@Domain!').isValid).toBe(false);
  });

  it('rejects profanity and inappropriate words', () => {
    expect(sanitizeNickname('admin').isValid).toBe(false);
    expect(sanitizeNickname('bitch_player').isValid).toBe(false);
  });

  it('protects CSV exports from Formula Injection (CSV Injection)', () => {
    // Cells starting with =, +, -, @ must be prefixed with single quote '
    expect(sanitizeCsvCell('=1+1')).toBe(`"'=1+1"`);
    expect(sanitizeCsvCell('+cmd|')).toBe(`"'+cmd|"`);
    expect(sanitizeCsvCell('-5')).toBe(`"'-5"`);
    expect(sanitizeCsvCell('@SUM(A1:A10)')).toBe(`"'@SUM(A1:A10)"`);
    expect(sanitizeCsvCell('NormalPlayer')).toBe(`"NormalPlayer"`);
  });
});
