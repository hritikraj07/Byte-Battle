'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ArrowLeft, Play, RotateCcw, Trophy, Calculator, Flame, CheckCircle2, Info, X, Zap } from 'lucide-react';
import { useAudio } from '@/hooks/useAudio';
import { saveGameAttempt, db, getOrCreateParticipant } from '@/services/db';
import { GameLeaderboardModal } from '@/components/leaderboard/GameLeaderboardModal';

interface NumberBlitzArenaProps {
  difficulty?: string;
  nickname?: string;
  onExit?: () => void;
}

interface MathQuestion {
  prompt: string;
  answer: number;
  choices: number[];
}

export const NumberBlitzArena: React.FC<NumberBlitzArenaProps> = ({
  difficulty = 'medium',
  nickname: initialNickname = '',
  onExit = () => window.history.back(),
}) => {
  const { playSound } = useAudio();

  const [gameState, setGameState] = useState<'intro' | 'playing' | 'gameover'>('intro');
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [highestStreak, setHighestStreak] = useState(0);
  const [totalSolved, setTotalSolved] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60);

  const [currentQuestion, setCurrentQuestion] = useState<MathQuestion | null>(null);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [showInfoModal, setShowInfoModal] = useState(false);

  const [leaderboardOpen, setLeaderboardOpen] = useState(false);
  const [personalBest, setPersonalBest] = useState(0);

  const [playerName, setPlayerName] = useState(initialNickname || 'Player');
  const [participantId, setParticipantId] = useState('practice-user');

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const active = initialNickname || (typeof window !== 'undefined' ? sessionStorage.getItem('bytebattle_active_player') || 'MathWhiz' : 'MathWhiz');
    setPlayerName(active);
    getOrCreateParticipant('practice-session', active)
      .then((p) => setParticipantId(p.id))
      .catch(() => setParticipantId(`p-${Date.now()}`));
  }, [initialNickname]);

  // Load personal best
  useEffect(() => {
    async function loadBest() {
      try {
        const pb = await db.personalBests
          .where(['participantId', 'gameId'])
          .equals([participantId, 'number-blitz'])
          .first();
        if (pb) setPersonalBest(pb.bestScore);
      } catch {
        // ignore
      }
    }
    loadBest();
  }, [participantId]);

  // Generate equations based on difficulty - HARD is "Too Much Difficult"
  const generateQuestion = useCallback((): MathQuestion => {
    let prompt = '';
    let answer = 0;

    if (difficulty === 'easy') {
      // Easy: Rapid double-digit mixed arithmetic
      const type = Math.floor(Math.random() * 3);
      if (type === 0) {
        const a = Math.floor(Math.random() * 14) + 6;
        const b = Math.floor(Math.random() * 9) + 4;
        const c = Math.floor(Math.random() * 25) + 10;
        prompt = `(${a} × ${b}) − ${c}`;
        answer = a * b - c;
      } else if (type === 1) {
        const div = Math.floor(Math.random() * 8) + 3;
        const res = Math.floor(Math.random() * 15) + 6;
        const num = div * res;
        const c = Math.floor(Math.random() * 30) + 15;
        prompt = `(${num} ÷ ${div}) + ${c}`;
        answer = res + c;
      } else {
        const a = Math.floor(Math.random() * 18) + 7;
        const b = Math.floor(Math.random() * 12) + 4;
        prompt = `${a} × ${b}`;
        answer = a * b;
      }
    } else if (difficulty === 'hard') {
      // HARD: "TOO MUCH DIFFICULT" - Board & Olympiad mental math sprint!
      const type = Math.floor(Math.random() * 5);

      if (type === 0) {
        // Exponents & square roots e.g. 5³ - (18 × 6) + √256
        const base = Math.floor(Math.random() * 3) + 4; // 4, 5, 6
        const cube = base * base * base;
        const m1 = Math.floor(Math.random() * 8) + 12; // 12-19
        const m2 = Math.floor(Math.random() * 5) + 5;  // 5-9
        const rootBases = [12, 13, 14, 15, 16, 17, 18, 19, 20];
        const rootBase = rootBases[Math.floor(Math.random() * rootBases.length)];
        const rootVal = rootBase * rootBase;
        prompt = `${base}³ − (${m1} × ${m2}) + √${rootVal}`;
        answer = cube - (m1 * m2) + rootBase;
      } else if (type === 1) {
        // Multi-bracket algebra e.g. [(24 × 15) − 60] ÷ 6
        const div = Math.floor(Math.random() * 6) + 4; // 4, 5, 6, 7, 8, 9
        const targetQ = Math.floor(Math.random() * 35) + 25; // 25-59
        const innerTotal = div * targetQ;
        const subtractVal = Math.floor(Math.random() * 40) + 20; // 20-59
        const productVal = innerTotal + subtractVal;
        // find a factor
        const factor1 = Math.floor(Math.random() * 8) + 12; // 12-19
        const factor2 = Math.round(productVal / factor1);
        const adjustedProduct = factor1 * factor2;
        const adjustedSub = adjustedProduct - innerTotal;
        prompt = `[(${factor1} × ${factor2}) − ${adjustedSub}] ÷ ${div}`;
        answer = targetQ;
      } else if (type === 2) {
        // Difference of squares + division e.g. (17² − 13²) + (96 ÷ 6)
        const x = Math.floor(Math.random() * 6) + 15; // 15-20
        const y = Math.floor(Math.random() * 5) + 9;  // 9-13
        const div = Math.floor(Math.random() * 5) + 4;
        const res = Math.floor(Math.random() * 15) + 10;
        const num = div * res;
        prompt = `(${x}² − ${y}²) + (${num} ÷ ${div})`;
        answer = (x * x - y * y) + res;
      } else if (type === 3) {
        // Square root of three-digit + double-digit multiplication e.g. √625 + (24 × 16) − (84 ÷ 7)
        const rootBases = [15, 16, 20, 25, 30];
        const rb = rootBases[Math.floor(Math.random() * rootBases.length)];
        const sq = rb * rb;
        const a = Math.floor(Math.random() * 11) + 15; // 15-25
        const b = Math.floor(Math.random() * 8) + 12;  // 12-19
        const div = Math.floor(Math.random() * 6) + 4;
        const res = Math.floor(Math.random() * 12) + 6;
        const num = div * res;
        prompt = `√${sq} + (${a} × ${b}) − (${num} ÷ ${div})`;
        answer = rb + (a * b) - res;
      } else {
        // Division and product sprint e.g. (360 ÷ 15) × 7 + 68
        const div = Math.floor(Math.random() * 7) + 12; // 12-18
        const q = Math.floor(Math.random() * 15) + 12;   // 12-26
        const num = div * q;
        const mult = Math.floor(Math.random() * 6) + 6;  // 6-11
        const add = Math.floor(Math.random() * 50) + 25; // 25-74
        prompt = `(${num} ÷ ${div}) × ${mult} + ${add}`;
        answer = (q * mult) + add;
      }
    } else {
      // MEDIUM: 3-tier mental operations
      const type = Math.floor(Math.random() * 3);
      if (type === 0) {
        const a = Math.floor(Math.random() * 12) + 12; // 12-23
        const b = Math.floor(Math.random() * 9) + 6;   // 6-14
        const c = Math.floor(Math.random() * 8) + 3;
        const d = Math.floor(Math.random() * 15) + 5;
        prompt = `(${a} × ${b}) − (${c * d} ÷ ${c})`;
        answer = (a * b) - d;
      } else if (type === 1) {
        const sq = Math.floor(Math.random() * 6) + 6; // 6-11
        const a = Math.floor(Math.random() * 12) + 11;
        const b = Math.floor(Math.random() * 7) + 4;
        prompt = `${sq}² + (${a} × ${b})`;
        answer = (sq * sq) + (a * b);
      } else {
        const rootBases = [11, 12, 13, 14, 15, 16];
        const rb = rootBases[Math.floor(Math.random() * rootBases.length)];
        const a = Math.floor(Math.random() * 14) + 11;
        const b = Math.floor(Math.random() * 8) + 4;
        prompt = `√${rb * rb} + (${a} × ${b})`;
        answer = rb + (a * b);
      }
    }

    // Generate 3 tricky distractors close to true answer
    const choices = [answer];
    const candidateOffsets = [-1, 1, -2, 2, -10, 10, -5, 5, -11, 11, -3, 3];
    // Shuffle candidate offsets
    candidateOffsets.sort(() => Math.random() - 0.5);

    for (const offset of candidateOffsets) {
      if (choices.length >= 4) break;
      const fake = answer + offset;
      if (!choices.includes(fake)) {
        choices.push(fake);
      }
    }

    // Fallback if needed
    while (choices.length < 4) {
      const offset = (Math.floor(Math.random() * 12) + 1) * (Math.random() < 0.5 ? 1 : -1);
      const fake = answer + offset;
      if (!choices.includes(fake)) {
        choices.push(fake);
      }
    }

    // Shuffle final choices
    for (let i = choices.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [choices[i], choices[j]] = [choices[j], choices[i]];
    }

    return { prompt, answer, choices };
  }, [difficulty]);

  const finishGame = useCallback((finalScore: number, solvedCount: number) => {
    if (timerRef.current) clearInterval(timerRef.current);
    setGameState('gameover');

    if (finalScore > personalBest) {
      setPersonalBest(finalScore);
    }

    saveGameAttempt({
      id: `att-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      eventId: null,
      participantId: participantId,
      nickname: playerName,
      gameId: 'number-blitz',
      puzzleId: `NB-SOLVED-${solvedCount}`,
      difficulty: difficulty as 'easy' | 'medium' | 'hard',
      isCorrect: solvedCount >= 10,
      score: finalScore,
      basePoints: finalScore,
      timeRemainingSeconds: 0,
      timeBonusPoints: 0,
      hintsUsed: 0,
      hintPenaltyPoints: 0,
      elapsedSeconds: 60,
      totalRoundSeconds: 60,
      completedAt: new Date().toISOString(),
      isPractice: true,
    }).catch(console.error);

    playSound('win');
  }, [difficulty, participantId, personalBest, playerName, playSound]);

  // 60-second timer
  useEffect(() => {
    if (gameState === 'playing') {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current!);
            finishGame(score, totalSolved);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [gameState, score, totalSolved, finishGame]);

  const handleStart = useCallback(() => {
    setScore(0);
    setStreak(0);
    setHighestStreak(0);
    setTotalSolved(0);
    setTimeLeft(60);
    setCurrentQuestion(generateQuestion());
    setGameState('playing');
  }, [generateQuestion]);

  // Direct game launch if nickname prop provided
  useEffect(() => {
    if (initialNickname && gameState === 'intro') {
      handleStart();
    }
  }, [initialNickname, gameState, handleStart]);

  const handleSkipQuestion = () => {
    playSound('click');
    setStreak(0);
    setCurrentQuestion(generateQuestion());
  };

  // Instant response with ZERO artificial delay (<30ms)
  const handleSelectChoice = (val: number) => {
    if (gameState !== 'playing' || !currentQuestion) return;

    if (val === currentQuestion.answer) {
      // Correct!
      playSound('correct');
      setFeedback('correct');
      const newStreak = streak + 1;
      setStreak(newStreak);
      if (newStreak > highestStreak) setHighestStreak(newStreak);
      setTotalSolved((prev) => prev + 1);

      const multiplier = 1 + Math.min(newStreak * 0.35, 4.5);
      const points = Math.round(150 * multiplier * (difficulty === 'hard' ? 2.5 : difficulty === 'medium' ? 1.6 : 1));
      setScore((prev) => prev + points);
    } else {
      // Wrong!
      playSound('wrong');
      setFeedback('wrong');
      setStreak(0);
    }

    // Instant transition - ZERO DELAY
    setFeedback(null);
    setCurrentQuestion(generateQuestion());
  };

  // Keyboard shortcut listener (1, 2, 3, 4)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (gameState !== 'playing' || !currentQuestion) return;
      if (e.key === '1' && currentQuestion.choices[0] !== undefined) handleSelectChoice(currentQuestion.choices[0]);
      if (e.key === '2' && currentQuestion.choices[1] !== undefined) handleSelectChoice(currentQuestion.choices[1]);
      if (e.key === '3' && currentQuestion.choices[2] !== undefined) handleSelectChoice(currentQuestion.choices[2]);
      if (e.key === '4' && currentQuestion.choices[3] !== undefined) handleSelectChoice(currentQuestion.choices[3]);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentQuestion, gameState, handleSelectChoice]);

  return (
    <div className="fixed inset-0 w-screen h-[100dvh] z-50 bg-[#0B0D13] flex flex-col select-none overflow-hidden touch-none text-neo-text">
      {/* Leaderboard Modal */}
      <GameLeaderboardModal
        isOpen={leaderboardOpen}
        onClose={() => setLeaderboardOpen(false)}
        gameId="number-blitz"
        gameTitle="Number Blitz"
        currentParticipantId={participantId}
      />

      {/* HOW TO PLAY INFO MODAL */}
      {showInfoModal && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn"
          onClick={() => setShowInfoModal(false)}
        >
          <div
            className="w-full max-w-md rounded-3xl bg-[#0D0D22] border-2 border-[#00F0FF] p-6 sm:p-7 shadow-[0_0_50px_rgba(0,240,255,0.35)] relative text-[#E8E8FF]"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowInfoModal(false)}
              className="absolute top-4 right-4 p-2 rounded-xl text-[#8A8AB8] hover:text-white bg-[#101023] border border-[#24244A] cursor-pointer"
              aria-label="Close rules"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-2.5 mb-4">
              <div className="p-2 rounded-xl bg-[#00F0FF]/15 text-[#00F0FF] border border-[#00F0FF]/30">
                <Calculator className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-pixel text-xs text-[#00F0FF] uppercase tracking-wide">
                  HOW TO PLAY
                </h3>
                <span className="text-[11px] font-mono text-[#8A8AB8]">Number Blitz Battle Guide</span>
              </div>
            </div>

            <div className="space-y-3.5 text-xs font-sans text-[#C4C8D8] leading-relaxed">
              <div className="p-3.5 rounded-2xl bg-[#05050D] border border-[#24244A] space-y-1">
                <strong className="text-white block font-mono text-[11px] uppercase text-[#00F0FF]">
                  1. The 60-Second Blitz
                </strong>
                <p>
                  Solve as many high-speed mental arithmetic equations as possible before the countdown timer hits zero.
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-[#05050D] border border-[#24244A] space-y-1">
                <strong className="text-white block font-mono text-[11px] uppercase text-orange-400">
                  2. Streak Multipliers (Up to 4.5×)
                </strong>
                <p>
                  Every consecutive correct answer boosts your score multiplier up to <strong className="text-white">4.5×</strong>. A single error resets your streak to zero!
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-[#05050D] border border-[#24244A] space-y-1">
                <strong className="text-white block font-mono text-[11px] uppercase text-[#A78BFA]">
                  3. Order of Operations (PEMDAS / BODMAS)
                </strong>
                <p>
                  Equations strictly follow standard precedence: <strong className="text-white">Parentheses `(...)` → Exponents/Roots `(√x, x²)` → Multiply/Divide `(×, ÷)` → Add/Subtract `(+, −)`</strong>.
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-[#05050D] border border-[#24244A] space-y-1">
                <strong className="text-white block font-mono text-[11px] uppercase text-emerald-400">
                  4. Lightning Controls
                </strong>
                <p>
                  Tap any of the 4 choice cards or press numeric keys <strong className="text-white font-mono">[1] [2] [3] [4]</strong> on your keyboard for instant 0-delay inputs.
                </p>
              </div>
            </div>

            <button
              onClick={() => setShowInfoModal(false)}
              className="mt-6 w-full py-3 rounded-xl bg-[#00F0FF] hover:bg-[#38BDF8] text-slate-950 font-bold font-mono text-xs uppercase tracking-wider transition-all cursor-pointer"
            >
              GOT IT — READY TO SOLVE!
            </button>
          </div>
        </div>
      )}

      {/* TOP HUD */}
      <header className="h-16 px-4 sm:px-6 flex items-center justify-between bg-black/60 backdrop-blur-md border-b border-neo-border flex-shrink-0 z-10">
        <div className="flex items-center gap-3">
          <button
            onClick={onExit}
            className="p-2.5 rounded-xl bg-neo-surface hover:bg-neo-cardHover border border-neo-border text-neo-secondary hover:text-white transition-colors cursor-pointer"
            title="Exit to Games"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-black font-mono text-white tracking-wider uppercase">
                NUMBER BLITZ
              </h1>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase border ${
                difficulty === 'hard'
                  ? 'border-red-500/50 bg-red-950/40 text-red-400'
                  : 'border-neo-border bg-neo-surface text-neo-secondary'
              }`}>
                {difficulty === 'hard' ? 'BRUTAL' : difficulty}
              </span>
            </div>
            <span className="text-[10px] font-mono text-neo-secondary hidden sm:inline">
              Fast-paced mental math sprint • Keys [1, 2, 3, 4] or Tap
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3 sm:gap-4 font-mono">
          {/* Info Button */}
          <button
            onClick={() => setShowInfoModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-neo-surface hover:bg-neo-cardHover border border-neo-border text-[#00F0FF] hover:text-white text-xs font-bold transition-colors cursor-pointer"
            title="How to Play"
          >
            <Info className="w-4 h-4" />
            <span className="hidden sm:inline">INFO</span>
          </button>

          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-neo-surface border border-neo-border">
            <span className="text-[10px] text-neo-secondary uppercase">Timer:</span>
            <span className={`text-base font-black ${timeLeft <= 8 ? 'text-neo-coral animate-pulse' : 'text-white'}`}>
              {timeLeft}s
            </span>
          </div>

          {streak > 1 && (
            <div className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-orange-500/20 border border-orange-500/40 text-orange-400 text-xs font-bold animate-fadeIn">
              <Flame className="w-3.5 h-3.5 fill-current" />
              <span>×{streak}</span>
            </div>
          )}

          <div className="text-right">
            <span className="text-[10px] text-neo-secondary uppercase block leading-none">Score</span>
            <span className="text-xl sm:text-2xl font-black text-neo-lime leading-tight">{score}</span>
          </div>

          <button
            onClick={() => setLeaderboardOpen(true)}
            className="p-2.5 rounded-xl bg-neo-surface hover:bg-neo-cardHover border border-neo-border text-neo-secondary hover:text-white transition-colors cursor-pointer"
            title="Leaderboard"
          >
            <Trophy className="w-5 h-5 text-amber-400" />
          </button>
        </div>
      </header>

      {/* MAIN PLAYFIELD */}
      <main className="flex-1 w-full flex flex-col items-center justify-center p-6">
        {gameState === 'intro' ? (
          <div className="text-center max-w-md bg-neo-surface border border-neo-border p-8 rounded-3xl shadow-arcade-card animate-fadeIn">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-orange-500/10 border border-orange-500/30 flex items-center justify-center text-orange-400 shadow-md">
              <Calculator className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-black font-mono text-white mb-2 uppercase">
              RAPID-FIRE ARITHMETIC
            </h2>
            <p className="text-xs text-neo-secondary font-mono mb-6 leading-relaxed">
              Solve as many equations as you can in 60 seconds! Keep your streak alive to unlock up to 4.5× multipliers.
            </p>
            <div className="flex flex-col gap-3">
              <button
                onClick={handleStart}
                className="w-full py-3.5 px-6 rounded-2xl bg-neo-lime text-slate-950 font-black font-mono text-xs tracking-wider uppercase hover:bg-lime-300 transition-all shadow-neo-lime flex items-center justify-center gap-2 cursor-pointer"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>START 60s BLITZ</span>
              </button>
              <button
                onClick={() => setShowInfoModal(true)}
                className="w-full py-2.5 px-6 rounded-2xl bg-neo-bg hover:bg-neo-cardHover border border-neo-border text-[#00F0FF] font-mono text-xs font-bold flex items-center justify-center gap-2 cursor-pointer"
              >
                <Info className="w-4 h-4" />
                <span>HOW TO PLAY & FORMULAS</span>
              </button>
            </div>
          </div>
        ) : gameState === 'gameover' ? (
          <div className="text-center max-w-md bg-neo-surface border border-neo-border p-8 rounded-3xl shadow-arcade-card animate-fadeIn">
            <CheckCircle2 className="w-14 h-14 text-neo-lime mx-auto mb-3" />
            <h2 className="text-3xl font-black font-mono text-white mb-1 uppercase">
              ROUND FINISHED!
            </h2>
            <p className="text-xs text-neo-secondary font-mono mb-6">
              Solved: <strong className="text-white text-base">{totalSolved} equations</strong> • Best streak: <strong className="text-orange-400">{highestStreak}</strong>
            </p>
            <div className="text-4xl font-black font-mono text-neo-lime mb-6">
              {score} pts
            </div>
            <div className="flex gap-3 justify-center">
              <button
                onClick={handleStart}
                className="px-6 py-3 rounded-xl bg-neo-lime text-slate-950 font-bold font-mono text-xs tracking-wider shadow-neo-lime flex items-center gap-2 cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
                <span>PLAY AGAIN</span>
              </button>
              <button
                onClick={onExit}
                className="px-6 py-3 rounded-xl bg-neo-bg hover:bg-neo-cardHover border border-neo-border text-white font-bold font-mono text-xs tracking-wider cursor-pointer"
              >
                BACK TO GAMES
              </button>
            </div>
          </div>
        ) : currentQuestion && (
          <div className="flex flex-col items-center max-w-lg w-full animate-fadeIn">
            {/* Equation Card */}
            <div
              className={`w-full py-10 px-6 rounded-3xl border text-center shadow-arcade-card mb-8 transition-colors ${
                feedback === 'correct'
                  ? 'bg-emerald-950/40 border-emerald-500/80 shadow-[0_0_24px_rgba(160,255,100,0.4)]'
                  : feedback === 'wrong'
                  ? 'bg-red-950/40 border-red-500/80 shadow-[0_0_24px_rgba(239,68,68,0.4)]'
                  : 'bg-neo-surface border-neo-border'
              }`}
            >
              <span className="text-2xl sm:text-3xl md:text-4xl font-black font-mono tracking-wider text-white drop-shadow-md whitespace-nowrap block">
                {currentQuestion.prompt}
              </span>
            </div>

            {/* 4 Answer Choice Buttons */}
            <div className="grid grid-cols-2 gap-4 w-full mb-4">
              {currentQuestion.choices.map((choice, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => handleSelectChoice(choice)}
                  className="p-5 rounded-2xl bg-neo-surface hover:bg-neo-cardHover border-2 border-neo-border hover:border-neo-lime text-center transition-all hover:scale-102 active:scale-95 shadow-arcade-card cursor-pointer"
                >
                  <span className="text-2xl sm:text-3xl font-mono font-black text-white block">
                    {choice}
                  </span>
                </button>
              ))}
            </div>

            {/* Change Question Button & Keyboard Info */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleSkipQuestion}
                className="px-5 py-2.5 rounded-full bg-[#0D0D22] hover:bg-[#1C1C3A] border border-[#00F0FF]/40 text-[#00F0FF] font-mono text-xs font-bold transition-all active:scale-95 cursor-pointer flex items-center gap-1.5"
              >
                <span>CHANGE QUESTION</span>
              </button>
              <button
                type="button"
                onClick={() => setShowInfoModal(true)}
                className="p-2.5 rounded-full bg-[#0D0D22] hover:bg-[#1C1C3A] border border-[#24244A] text-[#8A8AB8] hover:text-white transition-colors cursor-pointer"
                title="Rules & Formulas"
              >
                <Info className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
