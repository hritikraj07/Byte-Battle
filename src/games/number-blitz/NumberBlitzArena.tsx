'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ArrowLeft, Play, RotateCcw, Trophy, Calculator, Flame, CheckCircle2 } from 'lucide-react';
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

  // Generate valid arithmetic equations based on difficulty
  const generateQuestion = useCallback((): MathQuestion => {
    let prompt = '';
    let answer = 0;

    if (difficulty === 'easy') {
      // Simple addition / subtraction under 40
      const isAdd = Math.random() < 0.6;
      const a = Math.floor(Math.random() * 25) + 3;
      const b = Math.floor(Math.random() * 20) + 2;
      if (isAdd) {
        prompt = `${a} + ${b}`;
        answer = a + b;
      } else {
        const maxVal = Math.max(a, b);
        const minVal = Math.min(a, b);
        prompt = `${maxVal} − ${minVal}`;
        answer = maxVal - minVal;
      }
    } else if (difficulty === 'hard') {
      // 3-operator equation or double-digit multiplication
      const type = Math.floor(Math.random() * 3);
      if (type === 0) {
        // Multi-operator e.g. 6 × 7 + 12
        const a = Math.floor(Math.random() * 12) + 2;
        const b = Math.floor(Math.random() * 10) + 2;
        const c = Math.floor(Math.random() * 20) + 5;
        prompt = `(${a} × ${b}) + ${c}`;
        answer = a * b + c;
      } else if (type === 1) {
        // Division e.g. 96 ÷ 8
        const div = Math.floor(Math.random() * 11) + 2;
        const res = Math.floor(Math.random() * 14) + 2;
        const num = div * res;
        prompt = `${num} ÷ ${div}`;
        answer = res;
      } else {
        // Multiplication e.g. 14 × 6
        const a = Math.floor(Math.random() * 16) + 4;
        const b = Math.floor(Math.random() * 12) + 3;
        prompt = `${a} × ${b}`;
        answer = a * b;
      }
    } else {
      // Medium: standard multiplication & subtraction
      const type = Math.floor(Math.random() * 2);
      if (type === 0) {
        const a = Math.floor(Math.random() * 12) + 2;
        const b = Math.floor(Math.random() * 12) + 2;
        prompt = `${a} × ${b}`;
        answer = a * b;
      } else {
        const a = Math.floor(Math.random() * 60) + 20;
        const b = Math.floor(Math.random() * 40) + 10;
        prompt = `${a} + ${b}`;
        answer = a + b;
      }
    }

    // Generate 3 plausible distractors
    const choices = [answer];
    while (choices.length < 4) {
      const offset = (Math.floor(Math.random() * 7) + 1) * (Math.random() < 0.5 ? 1 : -1);
      const fake = Math.max(1, answer + offset);
      if (!choices.includes(fake)) {
        choices.push(fake);
      }
    }

    // Shuffle choices
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

      const multiplier = 1 + Math.min(newStreak * 0.25, 3.5);
      const points = Math.round(120 * multiplier * (difficulty === 'hard' ? 2 : difficulty === 'medium' ? 1.4 : 1));
      setScore((prev) => prev + points);
    } else {
      // Wrong!
      playSound('wrong');
      setFeedback('wrong');
      setStreak(0);
    }

    setTimeout(() => {
      setFeedback(null);
      setCurrentQuestion(generateQuestion());
    }, 250);
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

      {/* TOP HUD */}
      <header className="h-16 px-4 sm:px-6 flex items-center justify-between bg-black/60 backdrop-blur-md border-b border-neo-border flex-shrink-0 z-10">
        <div className="flex items-center gap-3">
          <button
            onClick={onExit}
            className="p-2.5 rounded-xl bg-neo-surface hover:bg-neo-cardHover border border-neo-border text-neo-secondary hover:text-white transition-colors"
            title="Exit to Games"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-black font-mono text-white tracking-wider uppercase">
                NUMBER BLITZ
              </h1>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase border border-neo-border bg-neo-surface text-neo-secondary">
                {difficulty}
              </span>
            </div>
            <span className="text-[10px] font-mono text-neo-secondary hidden sm:inline">
              Fast-paced mental math sprint • Keyboard [1, 2, 3, 4] or Tap
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4 font-mono">
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
            className="p-2.5 rounded-xl bg-neo-surface hover:bg-neo-cardHover border border-neo-border text-neo-secondary hover:text-white transition-colors"
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
              Solve as many equations as you can in 60 seconds! Keep your streak alive to unlock massive score multipliers.
            </p>
            <button
              onClick={handleStart}
              className="w-full py-3.5 px-6 rounded-2xl bg-neo-lime text-slate-950 font-black font-mono text-xs tracking-wider uppercase hover:bg-lime-300 transition-all shadow-neo-lime flex items-center justify-center gap-2"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>START 60s BLITZ</span>
            </button>
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
                className="px-6 py-3 rounded-xl bg-neo-lime text-slate-950 font-bold font-mono text-xs tracking-wider shadow-neo-lime flex items-center gap-2"
              >
                <RotateCcw className="w-4 h-4" />
                <span>PLAY AGAIN</span>
              </button>
              <button
                onClick={onExit}
                className="px-6 py-3 rounded-xl bg-neo-bg hover:bg-neo-cardHover border border-neo-border text-white font-bold font-mono text-xs tracking-wider"
              >
                BACK TO GAMES
              </button>
            </div>
          </div>
        ) : currentQuestion && (
          <div className="flex flex-col items-center max-w-md w-full animate-fadeIn">
            {/* Equation Card */}
            <div
              className={`w-full py-12 px-6 rounded-3xl border text-center shadow-arcade-card mb-8 transition-colors ${
                feedback === 'correct'
                  ? 'bg-emerald-950/40 border-emerald-500/80 shadow-[0_0_24px_rgba(16,185,129,0.4)]'
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

            {/* Change Question Button */}
            <button
              type="button"
              onClick={handleSkipQuestion}
              className="px-5 py-2.5 rounded-full bg-[#0D0D22] hover:bg-[#1C1C3A] border border-[#00F0FF]/40 text-[#00F0FF] font-mono text-xs font-bold transition-all active:scale-95 cursor-pointer flex items-center gap-1.5"
            >
              <span>CHANGE QUESTION</span>
            </button>
          </div>
        )}
      </main>
    </div>
  );
};
