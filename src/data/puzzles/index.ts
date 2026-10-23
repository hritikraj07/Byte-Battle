import patternShiftData from './pattern-shift.json';
import wordWeaveData from './word-weave.json';
import codeCrackerData from './code-cracker.json';
import gridTacticianData from './grid-tactician.json';
import { PatternShiftPuzzle, WordWeavePuzzle, CodeCrackerPuzzle, GridTacticianPuzzle, AnyPuzzle, GameId, Difficulty } from '@/types/puzzle';

export const PATTERN_SHIFT_PUZZLES = patternShiftData as unknown as PatternShiftPuzzle[];
export const WORD_WEAVE_PUZZLES = wordWeaveData as unknown as WordWeavePuzzle[];
export const CODE_CRACKER_PUZZLES = codeCrackerData as unknown as CodeCrackerPuzzle[];
export const GRID_TACTICIAN_PUZZLES = gridTacticianData as unknown as GridTacticianPuzzle[];

export const ALL_PUZZLES: AnyPuzzle[] = [
  ...PATTERN_SHIFT_PUZZLES,
  ...WORD_WEAVE_PUZZLES,
  ...CODE_CRACKER_PUZZLES,
  ...GRID_TACTICIAN_PUZZLES,
];

export function getPuzzlesByGame(gameId: GameId): AnyPuzzle[] {
  switch (gameId) {
    case 'pattern-shift':
      return PATTERN_SHIFT_PUZZLES;
    case 'word-weave':
      return WORD_WEAVE_PUZZLES;
    case 'code-cracker':
      return CODE_CRACKER_PUZZLES;
    case 'grid-tactician':
      return GRID_TACTICIAN_PUZZLES;
    default:
      return [];
  }
}

export function getPuzzlesByDifficulty(gameId: GameId, difficulty: Difficulty): AnyPuzzle[] {
  return getPuzzlesByGame(gameId).filter(p => p.difficulty === difficulty);
}

export function getPuzzleById(id: string): AnyPuzzle | undefined {
  return ALL_PUZZLES.find(p => p.id === id);
}

export function validatePuzzleCatalog() {
  const ids = new Set<string>();
  const duplicates: string[] = [];
  const missingFields: string[] = [];

  for (const p of ALL_PUZZLES) {
    if (ids.has(p.id)) {
      duplicates.push(p.id);
    }
    ids.add(p.id);

    if (!p.id || !p.title || !p.prompt || !p.hints || p.hints.length < 2 || !p.explanation) {
      missingFields.push(p.id);
    }
  }

  return {
    totalCount: ALL_PUZZLES.length,
    patternShiftCount: PATTERN_SHIFT_PUZZLES.length,
    wordWeaveCount: WORD_WEAVE_PUZZLES.length,
    codeCrackerCount: CODE_CRACKER_PUZZLES.length,
    gridTacticianCount: GRID_TACTICIAN_PUZZLES.length,
    duplicates,
    missingFields,
    isValid: duplicates.length === 0 && missingFields.length === 0 && ALL_PUZZLES.length >= 110,
  };
}
