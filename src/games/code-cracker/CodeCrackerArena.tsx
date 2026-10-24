'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { CodeCrackerPuzzle, Difficulty } from '@/types/puzzle';
import { getRandomPuzzle } from '@/services/puzzleRandomizer';
import { useTimer } from '@/hooks/useTimer';
import { useAudio } from '@/hooks/useAudio';
import { calculateScore, ScoreBreakdown } from '@/services/scoring';
import { saveGameAttempt, db } from '@/services/db';
import { GameHUD } from '@/components/common/GameHUD';
import { RoundResultsModal } from '@/components/common/RoundResultsModal';
import { GameLeaderboardModal } from '@/components/leaderboard/GameLeaderboardModal';
import { Terminal, KeyRound, Lightbulb, Delete, Check, ArrowRight, RefreshCw, Hash } from 'lucide-react';

interface CodeCrackerArenaProps {
  difficulty?: Difficulty;
  isEventMode?: boolean;
  participantId?: string;
  nickname?: string;
  eventId?: string;
  roundDurationSeconds?: number;
  onFinish?: (score: number) => void;
  onExit?: () => void;
}

interface AttemptRecord {
  guess: string;
  bulls: number;
  cows: number;
}

export const CodeCrackerArena: React.FC<CodeCrackerArenaProps> = ({
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

  const [currentPuzzle, setCurrentPuzzle] = useState<CodeCrackerPuzzle | null>(null);
  const [currentGuess, setCurrentGuess] = useState<string>('');
  const [attempts, setAttempts] = useState<AttemptRecord[]>([]);
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
    const puzzle = getRandomPuzzle<CodeCrackerPuzzle>('code-cracker', difficulty);
    setCurrentPuzzle(puzzle);
    setCurrentGuess('');
    setAttempts([]);
    setHintsUsed(0);
    setFeedback(null);
    setIsGameOver(false);
  }, [difficulty]);

  useEffect(() => {
    loadNewPuzzle();
    db.personalBests
      .where(['participantId', 'gameId'])
      .equals([participantId, 'code-cracker'])
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
      gameId: 'code-cracker',
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

  // Compute Bulls and Cows
  const evaluateGuess = (guess: string, solution: string) => {
    let bulls = 0;
    let cows = 0;
    const solArr = solution.split('');
    const guessArr = guess.split('');

    // First pass for exact bulls
    for (let i = 0; i < solArr.length; i++) {
      if (guessArr[i] === solArr[i]) {
        bulls++;
        solArr[i] = '#';
        guessArr[i] = '*';
      }
    }

    // Second pass for cows
    for (let i = 0; i < guessArr.length; i++) {
      if (guessArr[i] !== '*') {
        const foundIdx = solArr.indexOf(guessArr[i]);
        if (foundIdx !== -1) {
          cows++;
          solArr[foundIdx] = '#';
        }
      }
    }

    return { bulls, cows };
  };

  const handleDigitPress = (digit: string) => {
    if (!currentPuzzle || isGameOver || feedback !== null) return;
    if (currentGuess.length < currentPuzzle.codeLength) {
      playSound('click');
      setCurrentGuess((prev) => prev + digit);
    }
  };

  const handleDeleteDigit = () => {
    if (currentGuess.length > 0) {
      playSound('click');
      setCurrentGuess((prev) => prev.slice(0, -1));
    }
  };

  const handleVerifyGuess = () => {
    if (!currentPuzzle || currentGuess.length !== currentPuzzle.codeLength || isGameOver) return;

    const { bulls, cows } = evaluateGuess(currentGuess, currentPuzzle.canonicalSolution);
    const newAttempts = [{ guess: currentGuess, bulls, cows }, ...attempts];
    setAttempts(newAttempts);

    if (bulls === currentPuzzle.codeLength) {
      // Solved
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
      if (breakdown.score > personalBest) setPersonalBest(breakdown.score);

      saveGameAttempt({
        id: `att-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        eventId,
        participantId,
        nickname,
        gameId: 'code-cracker',
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
      setCurrentGuess('');
      addPenalty(3);
    }
  };

  const handlePlayAgain = () => {
    loadNewPuzzle();
    reset(roundDurationSeconds);
  };

  // Physical keyboard support
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isGameOver || !currentPuzzle) return;
      if (currentPuzzle.allowedDigits.includes(e.key)) {
        handleDigitPress(e.key);
      } else if (e.key === 'Backspace') {
        handleDeleteDigit();
      } else if (e.key === 'Enter') {
        if (currentGuess.length === currentPuzzle.codeLength) {
          handleVerifyGuess();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentGuess, currentPuzzle, handleDeleteDigit, handleDigitPress, handleVerifyGuess, isGameOver]);

  if (!currentPuzzle) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-neo-secondary">
        <RefreshCw className="w-8 h-8 animate-spin text-neo-lime mb-2" />
        <span className="font-mono text-xs">Loading Cryptanalysis Terminal...</span>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 py-6 flex flex-col items-center text-neo-text">
      {/* HUD Header */}
      <div className="w-full mb-6">
        <GameHUD
          gameTitle="Code Cracker"
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

      {/* Main Terminal Card */}
      <div className="w-full bg-neo-surface border border-neo-border rounded-3xl p-6 sm:p-8 shadow-arcade-card relative">
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-neo-border">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-neo-lime/15 text-neo-lime border border-neo-lime/30 uppercase tracking-wider">
              {currentPuzzle.codeLength}-Digit Cryptanalysis
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

        {/* Clues & Cryptographic Telemetry Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Static Pre-analyzed Clues */}
          <div>
            <span className="text-xs font-mono text-neo-secondary block mb-3 font-semibold uppercase tracking-wider">
              Intercepted Cipher Probes
            </span>
            <div className="space-y-2.5">
              {currentPuzzle.clues.map((clue, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-2xl bg-neo-bg border border-neo-border flex items-center justify-between font-mono"
                >
                  <div className="flex items-center gap-3">
                    <span className="px-2.5 py-1 rounded-xl bg-neo-surface border border-neo-border text-white font-black text-sm tracking-widest">
                      {clue.guess}
                    </span>
                    <span className="text-[11px] text-neo-secondary">{clue.description}</span>
                  </div>

                  <div className="flex items-center gap-2 text-xs">
                    <span className="px-2 py-0.5 rounded-lg bg-neo-lime/20 text-neo-lime font-bold">
                      {clue.bulls} Bulls
                    </span>
                    <span className="px-2 py-0.5 rounded-lg bg-neo-purple/20 text-neo-purple font-bold">
                      {clue.cows} Cows
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Interactive Hash Input & Keypad */}
          <div>
            <span className="text-xs font-mono text-neo-secondary block mb-3 font-semibold uppercase tracking-wider">
              Decrypt Access Key ({currentGuess.length}/{currentPuzzle.codeLength})
            </span>

            {/* Current Input Slots */}
            <div className="flex items-center justify-center gap-2.5 py-4 px-2 rounded-2xl bg-neo-bg border border-neo-border mb-4">
              {Array.from({ length: currentPuzzle.codeLength }).map((_, idx) => {
                const char = currentGuess[idx];
                return (
                  <div
                    key={idx}
                    className={`w-12 h-14 rounded-xl flex items-center justify-center font-mono font-black text-2xl border transition-all ${
                      char
                        ? 'bg-neo-lime/15 border-neo-lime text-neo-lime shadow-neo-lime'
                        : idx === currentGuess.length
                        ? 'bg-neo-surface border-neo-secondary/50 text-neo-secondary animate-pulse'
                        : 'bg-neo-surface border-neo-border text-neo-secondary/30'
                    }`}
                  >
                    {char ?? '•'}
                  </div>
                );
              })}
            </div>

            {/* Keypad */}
            <div className="grid grid-cols-4 gap-2 mb-3">
              {currentPuzzle.allowedDigits.map((digit) => (
                <button
                  key={digit}
                  onClick={() => handleDigitPress(digit)}
                  className="py-3 rounded-xl bg-neo-bg hover:bg-neo-cardHover border border-neo-border text-white font-mono font-black text-lg transition-all active:scale-95"
                >
                  {digit}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={handleDeleteDigit}
                disabled={currentGuess.length === 0}
                className="py-2.5 rounded-xl bg-neo-bg hover:bg-neo-cardHover border border-neo-border text-neo-secondary hover:text-white font-mono text-xs font-bold transition-all flex items-center justify-center gap-1.5 disabled:opacity-40"
              >
                <Delete className="w-4 h-4" />
                <span>BACKSPACE</span>
              </button>

              <button
                onClick={handleVerifyGuess}
                disabled={currentGuess.length !== currentPuzzle.codeLength}
                className={`py-2.5 rounded-xl font-mono text-xs font-black transition-all flex items-center justify-center gap-1.5 ${
                  currentGuess.length === currentPuzzle.codeLength
                    ? 'bg-neo-lime text-slate-950 shadow-neo-lime cursor-pointer'
                    : 'bg-neo-bg text-neo-secondary border border-neo-border opacity-40 cursor-not-allowed'
                }`}
              >
                <span>VERIFY HASH</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Live Guess History */}
        {attempts.length > 0 && (
          <div className="mb-6 p-4 rounded-2xl bg-neo-bg border border-neo-border font-mono text-xs">
            <span className="text-neo-secondary block mb-2 font-bold uppercase">
              Terminal Probe Telemetry Log
            </span>
            <div className="space-y-1.5">
              {attempts.slice(0, 4).map((att, idx) => (
                <div key={idx} className="flex items-center justify-between py-1 border-b border-neo-border/40">
                  <span className="text-white font-bold tracking-widest">{att.guess}</span>
                  <div className="flex gap-2">
                    <span className="text-neo-lime">{att.bulls} Bulls (Exact)</span>
                    <span className="text-neo-purple">{att.cows} Cows (Misplaced)</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Progressive Hints */}
        {hintsUsed > 0 && (
          <div className="p-4 rounded-2xl bg-neo-purple/10 border border-neo-purple/30 text-xs font-mono text-slate-300 space-y-2 animate-fadeIn">
            <div className="flex items-center gap-1.5 text-neo-purple font-bold">
              <Lightbulb className="w-4 h-4" />
              <span>CRYPTOGRAPHIC HINTS UNLOCKED ({hintsUsed}/2)</span>
            </div>
            {hintsUsed >= 1 && <p>• {currentPuzzle.hints[0]}</p>}
            {hintsUsed >= 2 && <p>• {currentPuzzle.hints[1]}</p>}
          </div>
        )}
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
        gameId="code-cracker"
        gameTitle="Code Cracker"
        isOpen={leaderboardOpen}
        onClose={() => setLeaderboardOpen(false)}
        currentParticipantId={participantId}
      />
    </div>
  );
};
