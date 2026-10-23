import { describe, it, expect } from 'vitest';
import {
  ALL_PUZZLES,
  PATTERN_SHIFT_PUZZLES,
  WORD_WEAVE_PUZZLES,
  CODE_CRACKER_PUZZLES,
  GRID_TACTICIAN_PUZZLES,
  validatePuzzleCatalog,
} from '@/data/puzzles';

describe('Puzzle Catalog Validation Suite', () => {
  it('contains at least 110 curated verified puzzles across all four games', () => {
    expect(ALL_PUZZLES.length).toBeGreaterThanOrEqual(110);
    expect(PATTERN_SHIFT_PUZZLES.length).toBe(30);
    expect(WORD_WEAVE_PUZZLES.length).toBe(30);
    expect(CODE_CRACKER_PUZZLES.length).toBe(30);
    expect(GRID_TACTICIAN_PUZZLES.length).toBe(20);
  });

  it('has zero duplicate puzzle IDs', () => {
    const report = validatePuzzleCatalog();
    expect(report.duplicates).toHaveLength(0);
    expect(report.isValid).toBe(true);
  });

  it('ensures every puzzle has valid hints and explanation', () => {
    for (const puzzle of ALL_PUZZLES) {
      expect(puzzle.id).toBeTruthy();
      expect(puzzle.title).toBeTruthy();
      expect(puzzle.prompt).toBeTruthy();
      expect(puzzle.hints).toHaveLength(2);
      expect(puzzle.explanation).toBeTruthy();
    }
  });

  it('validates Pattern Shift puzzles canonical solutions match one of the choices', () => {
    for (const ps of PATTERN_SHIFT_PUZZLES) {
      expect(ps.options).toContain(ps.canonicalSolution);
      expect(ps.sequence).toContain('?');
    }
  });

  it('validates Word Weave word ladder transitions', () => {
    for (const p of WORD_WEAVE_PUZZLES) {
      if (p.type === 'ladder') {
        expect(p.startWord).toBeTruthy();
        expect(p.targetWord).toBeTruthy();
        expect(p.canonicalSolution[0]).toBe(p.startWord);
        expect(p.canonicalSolution[p.canonicalSolution.length - 1]).toBe(p.targetWord);
      } else if (p.type === 'category') {
        expect(p.categories.length).toBeGreaterThanOrEqual(1);
        expect(p.allShuffledItems.length).toBeGreaterThanOrEqual(4);
      }
    }
  });

  it('validates Code Cracker secret codes match specified codeLength', () => {
    for (const cc of CODE_CRACKER_PUZZLES) {
      expect(cc.canonicalSolution).toHaveLength(cc.codeLength);
      expect(cc.clues.length).toBeGreaterThanOrEqual(2);
    }
  });

  it('validates Grid Tactician matrix dimensions and initial grids', () => {
    for (const gt of GRID_TACTICIAN_PUZZLES) {
      expect(gt.gridSize).toBeGreaterThanOrEqual(4);
      expect(gt.initialGrid).toHaveLength(gt.gridSize);
      expect(gt.canonicalSolution).toHaveLength(gt.gridSize);
      expect(gt.constraints.length).toBeGreaterThanOrEqual(1);
    }
  });
});
