'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { GridTacticianPuzzle, Difficulty } from '@/types/puzzle';
import { getRandomPuzzle } from '@/services/puzzleRandomizer';
import { useTimer } from '@/hooks/useTimer';
import { useAudio } from '@/hooks/useAudio';
import { calculateScore, ScoreBreakdown } from '@/services/scoring';
import { saveGameAttempt, db } from '@/services/db';
import { GameHUD } from '@/components/common/GameHUD';
import { RoundResultsModal } from '@/components/common/RoundResultsModal';
import { GameLeaderboardModal } from '@/components/leaderboard/GameLeaderboardModal';
import { LayoutGrid, Check, RotateCcw, Undo2, Lightbulb, RefreshCw, ArrowRight } from 'lucide-react';

interface GridTacticianArenaProps {
  difficulty?: Difficulty;
  isEventMode?: boolean;
  participantId?: string;
  nickname?: string;
  eventId?: string;
  roundDurationSeconds?: number;
  onFinish?: (score: number) => void;
  onExit?: () => void;
}

const SYMBOL_ICONS: Record<string, { label: string; bg: string; text: string; border: string }> = {
  S: { label: 'Server', bg: 'bg-neo-purple/20', text: 'text-neo-purple', border: 'border-neo-purple/60' },
  F: { label: 'Firewall', bg: 'bg-neo-coral/20', text: 'text-neo-coral', border: 'border-neo-coral/60' },
  R: { label: 'Router', bg: 'bg-neo-lime/20', text: 'text-neo-lime', border: 'border-neo-lime/60' },
  T: { label: 'Terminal', bg: 'bg-amber-400/20', text: 'text-amber-400', border: 'border-amber-400/60' },
  G: { label: 'Gateway', bg: 'bg-cyan-400/20', text: 'text-cyan-400', border: 'border-cyan-400/60' },
};

export const GridTacticianArena: React.FC<GridTacticianArenaProps> = ({
  difficulty = 'easy',
  isEventMode = false,
  participantId = 'practice-user',
  nickname = 'Player',
  eventId = null,
  roundDurationSeconds = 120,
  onFinish,
  onExit = () => window.history.back(),
}) => {
  const { playSound } = useAudio();

  const [currentPuzzle, setCurrentPuzzle] = useState<GridTacticianPuzzle | null>(null);
  const [grid, setGrid] = useState<(string | null)[][]>([]);
  const [undoStack, setUndoStack] = useState<(string | null)[][][]>([]);
  const [selectedPaletteSymbol, setSelectedPaletteSymbol] = useState<string>('S');

  const [hintsUsed, setHintsUsed] = useState(0);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [isGameOver, setIsGameOver] = useState(false);
  const [leaderboardOpen, setLeaderboardOpen] = useState(false);
  const [personalBest, setPersonalBest] = useState(0);

  const [scoreBreakdown, setScoreBreakdown] = useState<ScoreBreakdown>({
    score: 0,
    basePoints: 0,
    timeBonusPoints: 0,
    hintPenaltyPoints: 0,
    elapsedSeconds: 0,
    accuracy: 0,
  });

  // Pick non-repeating puzzle
  const loadNewPuzzle = useCallback(() => {
    const puzzle = getRandomPuzzle<GridTacticianPuzzle>('grid-tactician', difficulty);
    setCurrentPuzzle(puzzle);
    if (puzzle) {
      setGrid(puzzle.initialGrid.map((r) => [...r]));
      setSelectedPaletteSymbol(puzzle.palette[0]?.symbol || 'S');
      setUndoStack([]);
    }
    setHintsUsed(0);
    setFeedback(null);
    setIsGameOver(false);
  }, [difficulty]);

  useEffect(() => {
    loadNewPuzzle();
    db.personalBests
      .where(['participantId', 'gameId'])
      .equals([participantId, 'grid-tactician'])
      .first()
      .then((pb) => {
        if (pb) setPersonalBest(pb.bestScore);
      })
      .catch(() => {});
  }, [loadNewPuzzle, participantId]);

  const handleTimeout = useCallback(() => {
    if (!currentPuzzle) return;
    playSound('wrong');
    setIsGameOver(true);
    const breakdown = calculateScore({
      difficulty: currentPuzzle.difficulty,
      isCorrect: false,
      timeRemainingSeconds: 0,
      totalRoundSeconds: roundDurationSeconds,
      hintsUsed,
    });
    setScoreBreakdown(breakdown);

    saveGameAttempt({
      id: `att-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      eventId,
      participantId,
      nickname,
      gameId: 'grid-tactician',
      puzzleId: currentPuzzle.id,
      difficulty: currentPuzzle.difficulty,
      isCorrect: false,
      score: 0,
      basePoints: 0,
      timeRemainingSeconds: 0,
      timeBonusPoints: 0,
      hintsUsed,
      hintPenaltyPoints: breakdown.hintPenaltyPoints,
      elapsedSeconds: roundDurationSeconds,
      totalRoundSeconds: roundDurationSeconds,
      completedAt: new Date().toISOString(),
      isPractice: !isEventMode,
    }).catch(console.error);

    if (onFinish) onFinish(0);
  }, [currentPuzzle, eventId, hintsUsed, isEventMode, nickname, onFinish, participantId, playSound, roundDurationSeconds]);

  const { secondsLeft, formattedTime, reset, pause, addPenalty } = useTimer({
    initialSeconds: roundDurationSeconds,
    onTimeout: handleTimeout,
    autoStart: true,
  });

  const handleUseHint = () => {
    if (hintsUsed < 2) {
      playSound('click');
      setHintsUsed((prev) => prev + 1);
      addPenalty(10);
    }
  };

  const handleCellClick = (r: number, c: number) => {
    if (!currentPuzzle || isGameOver || feedback !== null) return;

    // Fixed initial clue cells cannot be modified
    if (currentPuzzle.initialGrid[r][c] !== null) return;

    playSound('click');

    // Save previous state to undo stack
    setUndoStack((prev) => [...prev, grid.map((row) => [...row])]);

    setGrid((prev) => {
      const next = prev.map((row) => [...row]);
      // Toggle cell: if already selected symbol, clear it, else set to selected symbol
      if (next[r][c] === selectedPaletteSymbol) {
        next[r][c] = null;
      } else {
        next[r][c] = selectedPaletteSymbol;
      }
      return next;
    });
  };

  const handleUndo = () => {
    if (undoStack.length === 0 || isGameOver) return;
    playSound('click');
    const prevGrid = undoStack[undoStack.length - 1];
    setUndoStack((prev) => prev.slice(0, -1));
    setGrid(prevGrid);
  };

  const handleResetGrid = () => {
    if (!currentPuzzle || isGameOver) return;
    playSound('click');
    setGrid(currentPuzzle.initialGrid.map((r) => [...r]));
    setUndoStack([]);
  };

  const handleSubmitSolution = () => {
    if (!currentPuzzle || isGameOver) return;

    // Check complete solution match against canonicalSolution
    let isCorrect = true;
    for (let r = 0; r < currentPuzzle.gridSize; r++) {
      for (let c = 0; c < currentPuzzle.gridSize; c++) {
        if (grid[r][c] !== currentPuzzle.canonicalSolution[r][c]) {
          isCorrect = false;
          break;
        }
      }
      if (!isCorrect) break;
    }

    const breakdown = calculateScore({
      difficulty: currentPuzzle.difficulty,
      isCorrect,
      timeRemainingSeconds: secondsLeft,
      totalRoundSeconds: roundDurationSeconds,
      hintsUsed,
    });

    setScoreBreakdown(breakdown);

    if (isCorrect) {
      pause();
      playSound('correct');
      setFeedback('correct');
      if (breakdown.score > personalBest) setPersonalBest(breakdown.score);

      saveGameAttempt({
        id: `att-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        eventId,
        participantId,
        nickname,
        gameId: 'grid-tactician',
        puzzleId: currentPuzzle.id,
        difficulty: currentPuzzle.difficulty,
        isCorrect: true,
        score: breakdown.score,
        basePoints: breakdown.basePoints,
        timeRemainingSeconds: secondsLeft,
        timeBonusPoints: breakdown.timeBonusPoints,
        hintsUsed,
        hintPenaltyPoints: breakdown.hintPenaltyPoints,
        elapsedSeconds: breakdown.elapsedSeconds,
        totalRoundSeconds: roundDurationSeconds,
        completedAt: new Date().toISOString(),
        isPractice: !isEventMode,
      }).catch(console.error);

      setTimeout(() => {
        setIsGameOver(true);
        if (onFinish) onFinish(breakdown.score);
      }, 900);
    } else {
      playSound('wrong');
      addPenalty(5);
    }
  };

  const handlePlayAgain = () => {
    loadNewPuzzle();
    reset(roundDurationSeconds);
  };

  if (!currentPuzzle) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-neo-secondary">
        <RefreshCw className="w-8 h-8 animate-spin text-neo-lime mb-2" />
        <span className="font-mono text-xs">Loading Constraint Matrix...</span>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 py-6 flex flex-col items-center text-neo-text">
      {/* HUD Header */}
      <div className="w-full mb-6">
        <GameHUD
          gameTitle="Grid Tactician"
          difficulty={currentPuzzle.difficulty}
          puzzleId={currentPuzzle.id}
          formattedTime={formattedTime}
          secondsLeft={secondsLeft}
          hintsUsed={hintsUsed}
          maxHints={2}
          onUseHint={handleUseHint}
          onExit={onExit}
          onOpenLeaderboard={() => setLeaderboardOpen(true)}
          personalBest={personalBest}
        />
      </div>

      {/* Main Grid Card */}
      <div className="w-full bg-neo-surface border border-neo-border rounded-3xl p-6 sm:p-8 shadow-arcade-card relative">
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-neo-border">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-neo-lime/15 text-neo-lime border border-neo-lime/30 uppercase tracking-wider">
              {currentPuzzle.gridSize}×{currentPuzzle.gridSize} Spatial Matrix
            </span>
            <span className="text-xs font-mono text-neo-secondary">ID: {currentPuzzle.id}</span>
          </div>

          <div className="text-xs font-mono text-neo-secondary">
            Score potential: <span className="text-white font-bold">500 - 1,200 pts</span>
          </div>
        </div>

        {/* Prompt */}
        <h2 className="text-lg sm:text-xl font-bold text-white mb-6 leading-relaxed">
          {currentPuzzle.prompt}
        </h2>

        {/* Rules & Constraints List */}
        <div className="mb-6 p-4 rounded-2xl bg-neo-bg border border-neo-border">
          <span className="text-xs font-mono text-neo-secondary block mb-2 font-semibold uppercase tracking-wider">
            Active Architectural Constraints
          </span>
          <div className="space-y-1.5 font-mono text-xs">
            {currentPuzzle.constraints.map((rule, idx) => (
              <div key={idx} className="flex items-start gap-2 text-slate-300">
                <Check className="w-4 h-4 text-neo-lime flex-shrink-0 mt-0.5" />
                <span>{rule}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Matrix & Palette Layout */}
        <div className="flex flex-col md:flex-row items-center justify-center gap-8 mb-8">
          {/* Interactive Matrix Grid */}
          <div className="p-4 rounded-3xl bg-neo-bg border border-neo-border shadow-inner">
            <div
              className="grid gap-2.5"
              style={{
                gridTemplateColumns: `repeat(${currentPuzzle.gridSize}, minmax(0, 1fr))`,
              }}
            >
              {grid.map((row, r) =>
                row.map((cell, c) => {
                  const isInitial = currentPuzzle.initialGrid[r][c] !== null;
                  const symConfig = cell ? SYMBOL_ICONS[cell] : null;

                  return (
                    <button
                      key={`${r}-${c}`}
                      onClick={() => handleCellClick(r, c)}
                      disabled={isInitial || isGameOver}
                      className={`w-14 sm:w-16 h-14 sm:h-16 rounded-2xl font-mono font-black text-xl flex flex-col items-center justify-center border transition-all ${
                        isInitial
                          ? `${symConfig?.bg} ${symConfig?.text} ${symConfig?.border} cursor-default ring-1 ring-white/10`
                          : cell
                          ? `${symConfig?.bg} ${symConfig?.text} ${symConfig?.border} active:scale-95 shadow-md`
                          : 'bg-neo-surface border-neo-border hover:border-neo-lime/40 active:scale-95'
                      }`}
                    >
                      {cell ? (
                        <>
                          <span>{cell}</span>
                          <span className="text-[9px] font-normal opacity-70 leading-none">
                            {symConfig?.label}
                          </span>
                        </>
                      ) : (
                        <span className="w-2 h-2 rounded-full bg-neo-border" />
                      )}
                    </button>
                  );
                })
              )}
            </div>
          </div>

          {/* Palette Selector & Undo Actions */}
          <div className="flex flex-col items-center md:items-start gap-4">
            <span className="text-xs font-mono text-neo-secondary font-bold uppercase tracking-wider">
              Component Palette
            </span>
            <div className="flex md:flex-col gap-2.5">
              {currentPuzzle.palette.map((item) => {
                const symConfig = SYMBOL_ICONS[item.symbol];
                const isSelected = selectedPaletteSymbol === item.symbol;
                return (
                  <button
                    key={item.symbol}
                    onClick={() => {
                      playSound('click');
                      setSelectedPaletteSymbol(item.symbol);
                    }}
                    className={`flex items-center gap-3 px-4 py-3 rounded-2xl font-mono text-xs font-bold border transition-all active:scale-95 ${
                      isSelected
                        ? 'bg-neo-lime text-slate-950 border-neo-lime shadow-neo-lime'
                        : `${symConfig?.bg} ${symConfig?.text} border-neo-border hover:border-neo-lime/50`
                    }`}
                  >
                    <span className="text-base font-black">{item.symbol}</span>
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Undo & Reset buttons */}
            <div className="flex gap-2 mt-2">
              <button
                onClick={handleUndo}
                disabled={undoStack.length === 0}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-neo-bg hover:bg-neo-cardHover border border-neo-border text-xs font-mono text-neo-secondary hover:text-white transition-all disabled:opacity-30"
              >
                <Undo2 className="w-3.5 h-3.5" />
                <span>Undo</span>
              </button>

              <button
                onClick={handleResetGrid}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-neo-bg hover:bg-neo-cardHover border border-neo-border text-xs font-mono text-neo-secondary hover:text-white transition-all"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset</span>
              </button>
            </div>
          </div>
        </div>

        {/* Progressive Hints */}
        {hintsUsed > 0 && (
          <div className="mb-6 p-4 rounded-2xl bg-neo-purple/10 border border-neo-purple/30 text-xs font-mono text-slate-300 space-y-2 animate-fadeIn">
            <div className="flex items-center gap-1.5 text-neo-purple font-bold">
              <Lightbulb className="w-4 h-4" />
              <span>SPATIAL CONSTRAINTS HINTS UNLOCKED ({hintsUsed}/2)</span>
            </div>
            {hintsUsed >= 1 && <p>• {currentPuzzle.hints[0]}</p>}
            {hintsUsed >= 2 && <p>• {currentPuzzle.hints[1]}</p>}
          </div>
        )}

        {/* Submit */}
        <div className="flex items-center justify-between gap-4 pt-4 border-t border-neo-border">
          <span className="text-xs font-mono text-neo-secondary hidden sm:inline">
            Ensure all rows and columns comply with non-interference constraints
          </span>

          <button
            onClick={handleSubmitSolution}
            className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-neo-lime hover:bg-lime-300 text-slate-950 font-mono font-black text-sm tracking-wide shadow-neo-lime transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95"
          >
            <span>SUBMIT ARCHITECTURE</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Results Modal */}
      <RoundResultsModal
        isOpen={isGameOver}
        isCorrect={feedback === 'correct'}
        scoreBreakdown={scoreBreakdown}
        explanation={currentPuzzle.explanation}
        onPlayAgain={handlePlayAgain}
        onExit={onExit}
        isPractice={!isEventMode}
      />

      {/* In-Game Dedicated Leaderboard Modal */}
      <GameLeaderboardModal
        gameId="grid-tactician"
        gameTitle="Grid Tactician"
        isOpen={leaderboardOpen}
        onClose={() => setLeaderboardOpen(false)}
        currentParticipantId={participantId}
      />
    </div>
  );
};
