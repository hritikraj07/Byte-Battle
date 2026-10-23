// Blacklist of forbidden / inappropriate words for school event friendly environment
const DISALLOWED_WORDS = [
  'admin', 'root', 'moderator', 'system', 'null', 'undefined',
  'fuck', 'shit', 'bitch', 'ass', 'bastard', 'crap', 'porn', 'sex', 'dick', 'pussy',
  'nigger', 'nigga', 'faggot', 'retard', 'cunt', 'hitler', 'nazi'
];

export interface ValidationResult {
  isValid: boolean;
  sanitized: string;
  errorMessage?: string;
}

export function sanitizeNickname(input: string): ValidationResult {
  if (!input || typeof input !== 'string') {
    return { isValid: false, sanitized: '', errorMessage: 'Nickname cannot be empty.' };
  }

  // Trim and collapse multiple spaces into one
  const cleaned = input.trim().replace(/\s+/g, ' ');

  if (cleaned.length < 2) {
    return { isValid: false, sanitized: cleaned, errorMessage: 'Nickname must be at least 2 characters.' };
  }

  if (cleaned.length > 15) {
    return { isValid: false, sanitized: cleaned, errorMessage: 'Nickname cannot exceed 15 characters.' };
  }

  // Only alphanumeric, hyphens, underscores, and single spaces
  const regex = /^[a-zA-Z0-9_\-\s]{2,15}$/;
  if (!regex.test(cleaned)) {
    return {
      isValid: false,
      sanitized: cleaned,
      errorMessage: 'Only letters, numbers, hyphens, underscores, and spaces are allowed.',
    };
  }

  // Profanity check
  const lower = cleaned.toLowerCase();
  for (const word of DISALLOWED_WORDS) {
    if (lower.includes(word)) {
      return {
        isValid: false,
        sanitized: cleaned,
        errorMessage: 'Please choose a respectful, school-friendly gamer tag.',
      };
    }
  }

  return { isValid: true, sanitized: cleaned };
}

/**
 * Defends against CSV / Excel Formula Injection (CVE-2014-3524)
 * Escapes characters =, +, -, @ by prefixing with a single apostrophe '
 */
export function sanitizeCsvCell(cell: string | number | boolean | null | undefined): string {
  if (cell === null || cell === undefined) return '""';
  const str = String(cell);
  if (/^[=+\-@]/.test(str)) {
    return `"'${str.replace(/"/g, '""')}"`;
  }
  return `"${str.replace(/"/g, '""')}"`;
}
