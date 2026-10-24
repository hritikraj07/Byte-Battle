'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { PatternShiftPuzzle, Difficulty } from '@/types/puzzle';
import { getRandomPuzzle } from '@/services/puzzleRandomizer';
import { useTimer } from '@/hooks/useTimer';
import { useAudio } from '@/hooks/useAudio';
import { calculateScore, ScoreBreakdown } from '@/services/scoring';
import { saveGameAttempt, db, getOrCreateParticipant } from '@/services/db';
import { GameHUD } from '@/components/common/GameHUD';
import { RoundResultsModal } from '@/components/common/RoundResultsModal';
import { GameLeaderboardModal } from '@/components/leaderboard/GameLeaderboardModal';
import { PlayerNameModal } from '@/components/common/PlayerNameModal';
import { Lightbulb, ArrowRight, Zap, RefreshCw, Eye, CheckCircle2 } from 'lucide-react';

interface PatternShiftArenaProps {
  difficulty?: Difficulty;
  isEventMode?: boolean;
  participantId?: string;
  nickname?: string;
  eventId?: string;
  roundDurationSeconds?: number;
  onFinish?: (score: number) => void;
  onExit?: () => void;
}

export const PatternShiftArena: React.FC<PatternShiftArenaProps> = ({
  difficulty: initialDifficulty = 'easy',
  isEventMode = false,
  participantId: initialParticipantId = '',
  nickname: initialNickname = '',
  eventId = null,
  roundDurationSeconds = 60,
  onFinish,
  onExit = () => window.history.back(),
}) => {
  const { playSound } = useAudio();

  // Difficulty scoped strictly to Pattern Shift
  const [difficulty, setDifficulty] = useState<Difficulty>(initialDifficulty);

  // Player Name Confirmation State
  const [confirmedNickname, setConfirmedNickname] = useState<string>(initialNickname);
  const [activeParticipantId, setActiveParticipantId] = useState<string>(initialParticipantId);
  const [nameModalOpen, setNameModalOpen] = useState(false);

  // Dynamic randomized puzzle state
  const [currentPuzzle, setCurrentPuzzle] = useState<PatternShiftPuzzle | null>(null);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [showAnswer, setShowAnswer] = useState(false);
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

  // Check if player name confirmed - direct launch if nickname provided
  useEffect(() => {
    if (initialNickname) {
      setConfirmedNickname(initialNickname);
      getOrCreateParticipant(eventId || 'practice-session', initialNickname)
        .then((p) => setActiveParticipantId(p.id))
        .catch(() => setActiveParticipantId(`p-${Date.now()}`));
      setNameModalOpen(false);
    } else if (!confirmedNickname) {
      setNameModalOpen(true);
    }
  }, [initialNickname, eventId]);

  // Pick a fresh non-repeating puzzle
  const loadNewPuzzle = useCallback(() => {
    const puzzle = getRandomPuzzle<PatternShiftPuzzle>('pattern-shift', difficulty);
    setCurrentPuzzle(puzzle);
    setSelectedOption(null);
    setHintsUsed(0);
    setFeedback(null);
    setShowAnswer(false);
    setIsGameOver(false);
  }, [difficulty]);

  useEffect(() => {
    loadNewPuzzle();
  }, [loadNewPuzzle]);

  // Load PB
  useEffect(() => {
    const pId = activeParticipantId || 'practice-user';
    db.personalBests
      .where(['participantId', 'gameId'])
      .equals([pId, 'pattern-shift'])
      .first()
      .then((pb) => {
        if (pb) setPersonalBest(pb.bestScore);
      })
      .catch(() => {});
  }, [activeParticipantId]);

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

    const pId = activeParticipantId || `p-${Date.now()}`;
    const pName = confirmedNickname || 'Player';

    saveGameAttempt({
      id: `att-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      eventId,
      participantId: pId,
      nickname: pName,
      gameId: 'pattern-shift',
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
  }, [currentPuzzle, eventId, hintsUsed, isEventMode, confirmedNickname, activeParticipantId, onFinish, playSound, roundDurationSeconds]);

  const { secondsLeft, formattedTime, reset, pause, addPenalty } = useTimer({
    initialSeconds: roundDurationSeconds,
    onTimeout: handleTimeout,
    autoStart: !nameModalOpen,
  });

  const handleUseHint = () => {
    if (hintsUsed < 2) {
      playSound('click');
      setHintsUsed((prev) => prev + 1);
      addPenalty(5);
    }
  };

  const handleConfirmName = async (name: string) => {
    setConfirmedNickname(name);
    try {
      const p = await getOrCreateParticipant(eventId || 'practice-session', name);
      setActiveParticipantId(p.id);
    } catch {
      setActiveParticipantId(`p-${Date.now()}`);
    }
    setNameModalOpen(false);
    reset(roundDurationSeconds);
  };

  const handleSelectOption = (option: string) => {
    if (isGameOver || feedback !== null) return;
    playSound('click');
    setSelectedOption(option);
  };

  const handleSkipQuestion = () => {
    playSound('click');
    addPenalty(3);
    loadNewPuzzle();
  };

  const handleSubmit = () => {
    if (!selectedOption || !currentPuzzle || isGameOver) return;

    const isCorrect = selectedOption.trim() === currentPuzzle.canonicalSolution.trim();

    if (isCorrect) {
      pause();
      playSound('correct');
      setFeedback('correct');

      const breakdown = calculateScore({
        difficulty: currentPuzzle.difficulty,
        isCorrect: true,
        timeRemainingSeconds: secondsLeft,
        totalRoundSeconds: roundDurationSeconds,
        hintsUsed,
      });

      setScoreBreakdown(breakdown);
      if (breakdown.score > personalBest) {
        setPersonalBest(breakdown.score);
      }

      const pId = activeParticipantId || `p-${Date.now()}`;
      const pName = confirmedNickname || 'Player';

      saveGameAttempt({
        id: `att-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        eventId,
        participantId: pId,
        nickname: pName,
        gameId: 'pattern-shift',
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
      }, 120);
    } else {
      playSound('wrong');
      setFeedback('wrong');
      addPenalty(5);

      // Selected wrong option: automatically change the question immediately!
      setTimeout(() => {
        loadNewPuzzle();
      }, 120);
    }
  };

  const handlePlayAgain = () => {
    loadNewPuzzle();
    reset(roundDurationSeconds);
  };

  // Keyboard shortcut listener (1-4 for options, Enter for submit)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isGameOver || !currentPuzzle || nameModalOpen) return;
      if (['1', '2', '3', '4'].includes(e.key)) {
        const idx = Number(e.key) - 1;
        if (currentPuzzle.options[idx]) {
          handleSelectOption(currentPuzzle.options[idx]);
        }
      } else if (e.key === 'Enter' && selectedOption) {
        handleSubmit();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentPuzzle, handleSelectOption, handleSubmit, isGameOver, nameModalOpen, selectedOption]);

  if (!currentPuzzle) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-neo-secondary">
        <RefreshCw className="w-8 h-8 animate-spin text-neo-lime mb-2" />
        <span className="font-mono text-xs">Loading Pattern Arena...</span>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 py-6 flex flex-col items-center text-neo-text">
      {/* Player Confirmation Modal */}
      <PlayerNameModal
        isOpen={nameModalOpen}
        gameTitle="Pattern Shift"
        onConfirm={handleConfirmName}
        onCancel={() => {
          setNameModalOpen(false);
          onExit();
        }}
      />

      {/* HUD Header */}
      <div className="w-full mb-6">
        <GameHUD
          gameTitle="Pattern Shift"
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

      {/* Main Arena Card */}
      <div className="w-full bg-neo-surface border border-neo-border rounded-3xl p-6 sm:p-8 shadow-arcade-card relative overflow-hidden">
        {/* Pattern Category Pill & Scoped Difficulty Selector */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6 pb-4 border-b border-neo-border">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-neo-lime/15 text-neo-lime border border-neo-lime/30 uppercase tracking-wider">
              {currentPuzzle.patternType}
            </span>
            <span className="text-xs font-mono text-neo-secondary">
              ID: {currentPuzzle.id}
            </span>
          </div>

          {/* Difficulty Selector Scoped Strictly to Pattern Shift */}
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-neo-bg border border-neo-border">
            {(['easy', 'medium', 'hard'] as const).map((diff) => (
              <button
                key={diff}
                onClick={() => {
                  setDifficulty(diff);
                  playSound('click');
                }}
                className={`px-3 py-1 rounded-lg text-xs font-mono font-bold uppercase transition-all ${
                  difficulty === diff
                    ? diff === 'easy'
                      ? 'bg-[#3B82F6] text-white font-black shadow-md'
                      : diff === 'medium'
                      ? 'bg-[#22C55E] text-slate-950 font-black shadow-md'
                      : 'bg-[#EF4444] text-white font-black shadow-md'
                    : 'text-neo-secondary hover:text-white'
                }`}
              >
                {diff}
              </button>
            ))}
          </div>
        </div>

        {/* Prompt */}
        <h2 className="text-lg sm:text-xl font-bold text-white mb-6 leading-relaxed">
          {currentPuzzle.prompt}
        </h2>

        {/* Interactive Sequence Register Tape */}
        <div className="mb-8 p-6 sm:p-8 rounded-2xl bg-neo-bg border border-neo-border flex items-center justify-center overflow-x-auto">
          <div className="flex items-center gap-3 sm:gap-4 flex-nowrap">
            {currentPuzzle.sequence.map((term, idx) => {
              const isMissing = idx === currentPuzzle.missingIndex;
              return (
                <div
                  key={idx}
                  className={`w-16 h-16 sm:w-20 sm:h-20 rounded-2xl flex items-center justify-center font-mono font-black text-xl sm:text-2xl transition-all shadow-md ${
                    isMissing
                      ? selectedOption
                        ? 'bg-neo-lime text-slate-950 border-2 border-neo-lime shadow-neo-lime scale-105'
                        : 'bg-neo-surface text-neo-lime border-2 border-dashed border-neo-lime/60 animate-pulse'
                      : 'bg-neo-surface text-white border border-neo-border'
                  }`}
                >
                  {isMissing ? selectedOption ?? '?' : term}
                </div>
              );
            })}
          </div>
        </div>

        {/* 4 Multiple Choice Options (Keys 1-4) */}
        <div className="mb-6">
          <span className="text-xs font-mono text-neo-secondary uppercase tracking-wider block mb-3 font-semibold">
            Select the matching value
          </span>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            {currentPuzzle.options.map((opt, idx) => {
              const isSelected = selectedOption === opt;
              return (
                <button
                  key={idx}
                  onClick={() => handleSelectOption(opt)}
                  disabled={feedback !== null}
                  className={`relative py-4 px-3 rounded-2xl font-mono font-black text-lg transition-all flex flex-col items-center justify-center border active:scale-95 ${
                    isSelected
                      ? 'bg-neo-lime text-slate-950 border-neo-lime shadow-neo-lime ring-2 ring-neo-lime'
                      : 'bg-neo-bg text-white border-neo-border hover:border-neo-lime/50 hover:bg-neo-cardHover'
                  }`}
                >
                  <span className="text-[10px] font-mono font-normal opacity-60 absolute top-1.5 left-2.5">
                    [{idx + 1}]
                  </span>
                  <span>{opt}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Progressive Hints Drawer (Strictly resets per puzzle ID) */}
        {hintsUsed > 0 && (
          <div className="mb-6 p-4 rounded-2xl bg-neo-purple/10 border border-neo-purple/30 text-xs font-mono text-slate-300 space-y-2 animate-fadeIn">
            <div className="flex items-center gap-1.5 text-neo-purple font-bold">
              <Lightbulb className="w-4 h-4" />
              <span>TELEMETRY HINTS UNLOCKED ({hintsUsed}/2 • PENALTY APPLIED)</span>
            </div>
            {hintsUsed >= 1 && <p>• {currentPuzzle.hints[0]}</p>}
            {hintsUsed >= 2 && <p>• {currentPuzzle.hints[1]}</p>}
          </div>
        )}

        {/* Answer Reveal Drawer */}
        {showAnswer && (
          <div className="mb-6 p-5 rounded-2xl bg-[#00F0FF]/10 border border-[#00F0FF]/40 text-xs font-mono space-y-2.5 animate-fadeIn">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-[#00F0FF] font-bold text-sm">
                <CheckCircle2 className="w-4 h-4 text-[#C8FF3D]" />
                <span>CANONICAL SOLUTION:</span>
                <span className="px-3 py-1 rounded-lg bg-[#C8FF3D] text-slate-950 font-black text-sm">
                  {currentPuzzle.canonicalSolution}
                </span>
              </div>
              <button
                onClick={loadNewPuzzle}
                className="px-3 py-1 rounded-lg bg-[#00F0FF] text-slate-950 font-bold hover:bg-[#38BDF8] transition-all"
              >
                NEXT PUZZLE →
              </button>
            </div>
            <p className="text-slate-200 text-xs leading-relaxed border-t border-[#00F0FF]/20 pt-2">
              <strong className="text-[#FFE45E]">Mathematical Logic:</strong> {currentPuzzle.explanation}
            </p>
          </div>
        )}

        {/* Action Controls: Change Question, See Answer & Submit */}
        <div className="flex items-center justify-between gap-3 pt-4 border-t border-neo-border flex-wrap">
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={handleSkipQuestion}
              disabled={feedback !== null}
              className="flex items-center gap-1.5 px-4 py-3 rounded-2xl bg-[#0D0D22] hover:bg-[#1C1C3A] border border-[#00F0FF]/40 text-[#00F0FF] font-mono text-xs font-bold transition-all active:scale-95 cursor-pointer"
              title="Unable to solve? Switch to a new question"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>CHANGE QUESTION</span>
            </button>

            <button
              onClick={() => {
                setShowAnswer((prev) => !prev);
                playSound('click');
              }}
              className="flex items-center gap-1.5 px-4 py-3 rounded-2xl bg-[#1A102A] hover:bg-[#281545] border border-[#FFE45E]/40 text-[#FFE45E] font-mono text-xs font-bold transition-all active:scale-95 cursor-pointer"
              title="Inspect canonical solution and step-by-step logic"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>{showAnswer ? 'HIDE ANSWER' : 'SEE ANSWER'}</span>
            </button>
          </div>

          <button
            onClick={handleSubmit}
            disabled={!selectedOption || feedback !== null}
            className={`w-full sm:w-auto px-8 py-3.5 rounded-2xl font-mono font-black text-sm tracking-wide transition-all shadow-md flex items-center justify-center gap-2 ${
              selectedOption && feedback === null
                ? 'bg-neo-lime hover:bg-lime-300 text-slate-950 shadow-neo-lime cursor-pointer'
                : 'bg-neo-bg text-neo-secondary border border-neo-border opacity-50 cursor-not-allowed'
            }`}
          >
            <span>SUBMIT SELECTION</span>
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
        gameId="pattern-shift"
        gameTitle="Pattern Shift"
        isOpen={leaderboardOpen}
        onClose={() => setLeaderboardOpen(false)}
        currentParticipantId={activeParticipantId}
      />
    </div>
  );
};
