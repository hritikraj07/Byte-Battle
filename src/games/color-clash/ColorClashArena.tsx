'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ArrowLeft, Play, RotateCcw, Trophy, Palette, Flame, CheckCircle2 } from 'lucide-react';
import { useAudio } from '@/hooks/useAudio';
import { saveGameAttempt, db, getOrCreateParticipant } from '@/services/db';
import { GameLeaderboardModal } from '@/components/leaderboard/GameLeaderboardModal';

interface ColorClashArenaProps {
  difficulty?: string;
  onExit?: () => void;
}

type ColorKey = 'RED' | 'GREEN' | 'BLUE' | 'YELLOW';

interface ColorDef {
  key: ColorKey;
  label: string;
  hex: string;
  bgClass: string;
  borderClass: string;
  keyHint: string;
}

const COLORS: ColorDef[] = [
  { key: 'RED', label: 'RED', hex: '#EF4444', bgClass: 'bg-red-500/20', borderClass: 'border-red-500', keyHint: '1 / R' },
  { key: 'GREEN', label: 'GREEN', hex: '#22C55E', bgClass: 'bg-emerald-500/20', borderClass: 'border-emerald-500', keyHint: '2 / G' },
  { key: 'BLUE', label: 'BLUE', hex: '#3B82F6', bgClass: 'bg-blue-500/20', borderClass: 'border-blue-500', keyHint: '3 / B' },
  { key: 'YELLOW', label: 'YELLOW', hex: '#EAB308', bgClass: 'bg-yellow-500/20', borderClass: 'border-yellow-500', keyHint: '4 / Y' },
];

export const ColorClashArena: React.FC<ColorClashArenaProps> = ({
  difficulty = 'medium',
  onExit = () => window.history.back(),
}) => {
  const { playSound } = useAudio();

  const [gameState, setGameState] = useState<'intro' | 'playing' | 'gameover'>('intro');
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [highestStreak, setHighestStreak] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);

  // Current Card Display
  const [wordText, setWordText] = useState<ColorKey>('RED');
  const [inkColor, setInkColor] = useState<ColorDef>(COLORS[1]); // e.g. green ink
  const [rule, setRule] = useState<'MATCH_INK' | 'MATCH_WORD'>('MATCH_INK');

  const [leaderboardOpen, setLeaderboardOpen] = useState(false);
  const [personalBest, setPersonalBest] = useState(0);

  const [playerName, setPlayerName] = useState('Player');
  const [participantId, setParticipantId] = useState('practice-user');

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = sessionStorage.getItem('bytebattle_active_player') ||
        localStorage.getItem('byte_battle_last_nickname') ||
        'ColorMaster';
      setPlayerName(saved);
      getOrCreateParticipant('practice-session', saved)
        .then((p) => setParticipantId(p.id))
        .catch(() => setParticipantId(`p-${Date.now()}`));
    }
  }, []);

  // Load personal best
  useEffect(() => {
    async function loadBest() {
      try {
        const pb = await db.personalBests
          .where(['participantId', 'gameId'])
          .equals([participantId, 'color-clash'])
          .first();
        if (pb) setPersonalBest(pb.bestScore);
      } catch {
        // ignore
      }
    }
    loadBest();
  }, [participantId]);

  // Generate next Stroop challenge card
  const nextCard = useCallback(() => {
    const randomWordIdx = Math.floor(Math.random() * COLORS.length);
    let randomInkIdx = Math.floor(Math.random() * COLORS.length);

    // High likelihood of conflict between word & ink
    if (Math.random() < 0.75 && randomInkIdx === randomWordIdx) {
      randomInkIdx = (randomInkIdx + 1) % COLORS.length;
    }

    setWordText(COLORS[randomWordIdx].key);
    setInkColor(COLORS[randomInkIdx]);

    // Rule alternation: on Easy, always MATCH_INK. On Medium/Hard, dynamically switch!
    if (difficulty === 'easy') {
      setRule('MATCH_INK');
    } else {
      setRule(Math.random() < 0.5 ? 'MATCH_INK' : 'MATCH_WORD');
    }
  }, [difficulty]);

  // End of Game
  const finishGame = useCallback((finalScore: number) => {
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
      gameId: 'color-clash',
      puzzleId: `CC-SCORE-${finalScore}`,
      difficulty: difficulty as 'easy' | 'medium' | 'hard',
      isCorrect: finalScore > 400,
      score: finalScore,
      basePoints: finalScore,
      timeRemainingSeconds: 0,
      timeBonusPoints: 0,
      hintsUsed: 0,
      hintPenaltyPoints: 0,
      elapsedSeconds: 30,
      totalRoundSeconds: 30,
      completedAt: new Date().toISOString(),
      isPractice: true,
    }).catch(console.error);

    playSound('win');
  }, [difficulty, participantId, personalBest, playerName, playSound]);

  // 30-Second Countdown Timer
  useEffect(() => {
    if (gameState === 'playing') {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current!);
            finishGame(score);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [gameState, score, finishGame]);

  const handleStartGame = () => {
    setScore(0);
    setStreak(0);
    setHighestStreak(0);
    setTimeLeft(30);
    nextCard();
    setGameState('playing');
  };

  const handleChoice = (color: ColorKey) => {
    if (gameState !== 'playing') return;

    const targetColorKey = rule === 'MATCH_INK' ? inkColor.key : wordText;

    if (color === targetColorKey) {
      // Correct!
      playSound('correct');
      const newStreak = streak + 1;
      setStreak(newStreak);
      if (newStreak > highestStreak) setHighestStreak(newStreak);

      const multiplier = 1 + Math.min(newStreak * 0.2, 3);
      const points = Math.round(100 * multiplier * (difficulty === 'hard' ? 1.5 : 1.0));
      setScore((prev) => prev + points);
    } else {
      // Wrong!
      playSound('wrong');
      setStreak(0);
    }

    nextCard();
  };

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (gameState !== 'playing') return;
      if (e.key === '1' || e.key.toLowerCase() === 'r') handleChoice('RED');
      if (e.key === '2' || e.key.toLowerCase() === 'g') handleChoice('GREEN');
      if (e.key === '3' || e.key.toLowerCase() === 'b') handleChoice('BLUE');
      if (e.key === '4' || e.key.toLowerCase() === 'y') handleChoice('YELLOW');
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameState, handleChoice]);

  return (
    <div className="fixed inset-0 w-screen h-[100dvh] z-50 bg-[#0B0D13] flex flex-col select-none overflow-hidden touch-none text-neo-text">
      {/* Leaderboard Modal */}
      <GameLeaderboardModal
        isOpen={leaderboardOpen}
        onClose={() => setLeaderboardOpen(false)}
        gameId="color-clash"
        gameTitle="Color Clash"
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
                COLOR CLASH
              </h1>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase border border-neo-border bg-neo-surface text-neo-secondary">
                {difficulty}
              </span>
            </div>
            <span className="text-[10px] font-mono text-neo-secondary hidden sm:inline">
              Defeat Stroop cognitive interference under time pressure
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4 font-mono">
          {/* Time Remaining */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-neo-surface border border-neo-border">
            <span className="text-[10px] text-neo-secondary uppercase">Time:</span>
            <span className={`text-base font-black ${timeLeft <= 5 ? 'text-neo-coral animate-pulse' : 'text-white'}`}>
              {timeLeft}s
            </span>
          </div>

          {/* Streak Indicator */}
          {streak > 1 && (
            <div className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-400 text-xs font-bold animate-fadeIn">
              <Flame className="w-3.5 h-3.5 fill-current" />
              <span>×{streak}</span>
            </div>
          )}

          {/* Live Score */}
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

      {/* ARENA BODY */}
      <main className="flex-1 w-full flex flex-col items-center justify-center p-6">
        {gameState === 'intro' ? (
          <div className="text-center max-w-md bg-neo-surface border border-neo-border p-8 rounded-3xl shadow-arcade-card animate-fadeIn">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-pink-500/10 border border-pink-500/30 flex items-center justify-center text-pink-400 shadow-md">
              <Palette className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-black font-mono text-white mb-2 uppercase">
              STROOP COLOR COMBAT
            </h2>
            <p className="text-xs text-neo-secondary font-mono mb-6 leading-relaxed">
              Read the rule at the top carefully! Sometimes you match the written word; other times you match the ink color. Speed and focus win!
            </p>
            <button
              onClick={handleStartGame}
              className="w-full py-3.5 px-6 rounded-2xl bg-neo-lime text-slate-950 font-black font-mono text-xs tracking-wider uppercase hover:bg-lime-300 transition-all shadow-neo-lime flex items-center justify-center gap-2"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>START 30s SPRINT</span>
            </button>
          </div>
        ) : gameState === 'gameover' ? (
          <div className="text-center max-w-md bg-neo-surface border border-neo-border p-8 rounded-3xl shadow-arcade-card animate-fadeIn">
            <CheckCircle2 className="w-14 h-14 text-neo-lime mx-auto mb-3" />
            <h2 className="text-3xl font-black font-mono text-white mb-1 uppercase">
              TIME&apos;S UP!
            </h2>
            <p className="text-xs text-neo-secondary font-mono mb-6">
              Final score: <strong className="text-neo-lime text-base">{score}</strong> • Best streak: <strong className="text-white">{highestStreak}</strong>
            </p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={handleStartGame}
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
        ) : (
          <div className="flex flex-col items-center max-w-lg w-full animate-fadeIn">
            {/* Active Rule Pill */}
            <div className="mb-6">
              <span
                className={`px-5 py-2 rounded-full text-xs sm:text-sm font-mono font-black uppercase tracking-wider border shadow-sm ${
                  rule === 'MATCH_INK'
                    ? 'bg-pink-500/20 text-pink-300 border-pink-500/50'
                    : 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50'
                }`}
              >
                {rule === 'MATCH_INK' ? '🎨 SELECT THE INK COLOR' : '🔤 SELECT THE WRITTEN WORD'}
              </span>
            </div>

            {/* Central Stroop Word Card */}
            <div className="w-full py-12 px-6 rounded-3xl bg-neo-surface border border-neo-border text-center shadow-arcade-card mb-8">
              <span
                className="text-5xl sm:text-7xl font-black font-mono tracking-widest uppercase select-none transition-transform"
                style={{
                  color: inkColor.hex,
                  textShadow: `0 0 24px ${inkColor.hex}88`,
                }}
              >
                {wordText}
              </span>
            </div>

            {/* 4 Interactive Color Buttons */}
            <div className="grid grid-cols-2 gap-4 w-full">
              {COLORS.map((c) => (
                <button
                  key={c.key}
                  type="button"
                  onClick={() => handleChoice(c.key)}
                  style={{ borderColor: c.hex }}
                  className="p-4 sm:p-5 rounded-2xl bg-neo-surface border-2 text-center transition-all hover:scale-102 active:scale-95 shadow-arcade-card"
                >
                  <span className="text-lg sm:text-xl font-mono font-black uppercase block mb-1" style={{ color: c.hex }}>
                    {c.label}
                  </span>
                  <span className="text-[10px] text-neo-secondary font-mono">
                    Key: {c.keyHint}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
