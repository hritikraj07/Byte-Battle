export type GameId =
  | 'pattern-shift'
  | 'word-weave'
  | 'pulse-jumper'
  | 'reflex-rush'
  | 'memory-matrix'
  | 'color-clash'
  | 'orbit-dodge'
  | 'stack-sprint'
  | 'number-blitz'
  | 'maze-runner'
  | 'pixel-invaders'
  | 'game-2048'
  // Legacy identifiers retained for data compatibility
  | 'code-cracker'
  | 'grid-tactician'
  | 'palmdrive-rally'
  | 'neon-ridge-rally';

export type Difficulty = 'easy' | 'medium' | 'hard';
export type PulseJumperDifficulty = 'easy' | 'normal' | 'hard' | 'expert' | 'insane';

// Base Puzzle Schema
export interface BasePuzzle {
  id: string;
  gameId: GameId;
  difficulty: Difficulty;
  title: string;
  prompt: string;
  hints: [string, string];
  explanation: string;
}

// 1. Pattern Shift
export interface PatternShiftPuzzle extends BasePuzzle {
  gameId: 'pattern-shift';
  sequence: (string | number)[];
  missingIndex: number;
  options: string[];
  canonicalSolution: string;
  patternType: 'arithmetic' | 'geometric' | 'alternating' | 'fibonacci' | 'visual-rotation' | 'bit-shift';
}

// 2. Word Weave
export interface WordLadderPuzzle extends BasePuzzle {
  gameId: 'word-weave';
  type: 'ladder';
  startWord: string;
  targetWord: string;
  optimalSteps: number;
  allowedWords?: string[];
  canonicalSolution: string[]; // sequence of words from start to target
}

export interface WordCategoryPuzzle extends BasePuzzle {
  gameId: 'word-weave';
  type: 'category';
  categories: {
    name: string;
    items: string[];
  }[];
  allShuffledItems: string[];
}

export type WordWeavePuzzle = WordLadderPuzzle | WordCategoryPuzzle;

// 3. Code Cracker
export interface CodeCrackerPuzzle extends BasePuzzle {
  gameId: 'code-cracker';
  codeLength: number;
  allowedDigits: string[];
  canonicalSolution: string;
  clues: {
    guess: string;
    bulls: number; // Correct position
    cows: number;  // Wrong position
    description: string;
  }[];
}

// 4. Grid Tactician
export interface GridTacticianPuzzle extends BasePuzzle {
  gameId: 'grid-tactician';
  gridSize: number; // 4 or 5
  initialGrid: (string | null)[][];
  canonicalSolution: string[][];
  constraints: string[];
  palette: { symbol: string; label: string; maxCount?: number }[];
}

export type AnyPuzzle = PatternShiftPuzzle | WordWeavePuzzle | CodeCrackerPuzzle | GridTacticianPuzzle;
