'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ArrowLeft, Play, RotateCcw, Trophy, Zap, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { useAudio } from '@/hooks/useAudio';
import { saveGameAttempt, db, getOrCreateParticipant } from '@/services/db';
import { GameLeaderboardModal } from '@/components/leaderboard/GameLeaderboardModal';

interface ReflexRushArenaProps {
  difficulty?: string;
  onExit?: () => void;
}

type RoundState = 'idle' | 'waiting' | 'ready' | 'early' | 'clicked' | 'complete';

export const ReflexRushArena: React.FC<ReflexRushArenaProps> = ({
  difficulty = 'medium',
  onExit = () => window.history.back(),
}) => {
  const { playSound } = useAudio();
  const [roundState, setRoundState] = useState<RoundState>('idle');
  const [roundTimes, setRoundTimes] = useState<number[]>([]);
  const [currentRound, setCurrentRound] = useState(1);
  const totalRounds = 5;

  const [lastReactionTime, setLastReactionTime] = useState<number | null>(null);
  const [leaderboardOpen, setLeaderboardOpen] = useState(false);
  const [personalBest, setPersonalBest] = useState<number>(0);

  const startTimeRef = useRef<number>(0);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Active player info from storage
  const [playerName, setPlayerName] = useState('Player');
  const [participantId, setParticipantId] = useState('practice-user');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = sessionStorage.getItem('bytebattle_active_player') ||
        localStorage.getItem('byte_battle_last_nickname') ||
        'ReflexPro';
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
          .equals([participantId, 'reflex-rush'])
          .first();
        if (pb) setPersonalBest(pb.bestScore);
      } catch {
        // ignore
      }
    }
    loadBest();
  }, [participantId]);

  // Clean timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  // Difficulty parameters
  const minWait = difficulty === 'hard' ? 1200 : difficulty === 'medium' ? 1800 : 2500;
  const maxWait = difficulty === 'hard' ? 3200 : difficulty === 'medium' ? 4500 : 5500;
  const scoreMultiplier = difficulty === 'hard' ? 1.5 : difficulty === 'medium' ? 1.2 : 1.0;

  // Start a round
  const startRound = useCallback(() => {
    setRoundState('waiting');
    setLastReactionTime(null);

    const randomDelay = Math.floor(Math.random() * (maxWait - minWait)) + minWait;
    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    timeoutRef.current = setTimeout(() => {
      startTimeRef.current = performance.now();
      setRoundState('ready');
      playSound('correct');
    }, randomDelay);
  }, [maxWait, minWait, playSound]);

  // Handle player click or tap
  const handleInteraction = () => {
    if (roundState === 'idle') {
      startRound();
      return;
    }

    if (roundState === 'waiting') {
      // Too early! False start!
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      setRoundState('early');
      playSound('wrong');
      return;
    }

    if (roundState === 'ready') {
      const elapsed = Math.round(performance.now() - startTimeRef.current);
      setLastReactionTime(elapsed);
      playSound('jump');

      const nextTimes = [...roundTimes, elapsed];
      setRoundTimes(nextTimes);

      if (currentRound >= totalRounds) {
        setRoundState('complete');
        // Calculate final score
        const avg = Math.round(nextTimes.reduce((a, b) => a + b, 0) / nextTimes.length);
        const best = Math.min(...nextTimes);
        // Score: faster time = higher score (e.g. 200ms -> ~1600 pts)
        const computedScore = Math.max(100, Math.round((2000 - avg * 3) * scoreMultiplier));

        if (computedScore > personalBest) {
          setPersonalBest(computedScore);
        }

        saveGameAttempt({
          id: `att-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
          eventId: null,
          participantId: participantId,
          nickname: playerName,
          gameId: 'reflex-rush',
          puzzleId: `RR-BEST-${best}MS`,
          difficulty: difficulty as 'easy' | 'medium' | 'hard',
          isCorrect: true,
          score: computedScore,
          basePoints: computedScore,
          timeRemainingSeconds: 0,
          timeBonusPoints: 0,
          hintsUsed: 0,
          hintPenaltyPoints: 0,
          elapsedSeconds: Math.round(avg / 100),
          totalRoundSeconds: 60,
          completedAt: new Date().toISOString(),
          isPractice: true,
        }).catch(console.error);

        playSound('win');
      } else {
        setRoundState('clicked');
      }
    } else if (roundState === 'early' || roundState === 'clicked') {
      if (roundState === 'clicked') {
        setCurrentRound((prev) => prev + 1);
      }
      startRound();
    }
  };

  const handleRestart = () => {
    setRoundTimes([]);
    setCurrentRound(1);
    setLastReactionTime(null);
    setRoundState('idle');
  };

  const averageTime =
    roundTimes.length > 0 ? Math.round(roundTimes.reduce((a, b) => a + b, 0) / roundTimes.length) : 0;
  const bestTime = roundTimes.length > 0 ? Math.min(...roundTimes) : 0;
  const finalScore = Math.max(100, Math.round((2000 - averageTime * 3) * scoreMultiplier));

  const getRankBadge = (ms: number) => {
    if (ms < 190) return { label: 'GODLIKE', color: 'text-amber-400 bg-amber-950/40 border-amber-500/50' };
    if (ms < 230) return { label: 'LIGHTNING', color: 'text-cyan-400 bg-cyan-950/40 border-cyan-500/50' };
    if (ms < 280) return { label: 'PRO', color: 'text-emerald-400 bg-emerald-950/40 border-emerald-500/50' };
    if (ms < 350) return { label: 'AVERAGE', color: 'text-blue-400 bg-blue-950/40 border-blue-500/50' };
    return { label: 'NEEDS WARMUP', color: 'text-slate-400 bg-slate-800 border-slate-700' };
  };

  return (
    <div className="fixed inset-0 w-screen h-[100dvh] z-50 bg-[#0B0D13] flex flex-col select-none overflow-hidden touch-none text-neo-text">
      {/* Leaderboard Modal */}
      <GameLeaderboardModal
        isOpen={leaderboardOpen}
        onClose={() => setLeaderboardOpen(false)}
        gameId="reflex-rush"
        gameTitle="Reflex Rush"
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
                REFLEX RUSH
              </h1>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-neo-lime/15 text-neo-lime border border-neo-lime/30 uppercase">
                Round {currentRound}/{totalRounds}
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase border border-neo-border bg-neo-surface text-neo-secondary">
                {difficulty}
              </span>
            </div>
            <span className="text-[10px] font-mono text-neo-secondary hidden sm:inline">
              React when green appears. Avoid false starts!
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4 font-mono">
          {bestTime > 0 && (
            <div className="text-right hidden sm:block">
              <span className="text-[10px] text-neo-secondary uppercase block leading-none">Best</span>
              <span className="text-base font-black text-cyan-400 leading-tight">{bestTime} ms</span>
            </div>
          )}
          {averageTime > 0 && (
            <div className="text-right">
              <span className="text-[10px] text-neo-secondary uppercase block leading-none">Avg</span>
              <span className="text-lg sm:text-xl font-black text-neo-lime leading-tight">{averageTime} ms</span>
            </div>
          )}
          <button
            onClick={() => setLeaderboardOpen(true)}
            className="p-2.5 rounded-xl bg-neo-surface hover:bg-neo-cardHover border border-neo-border text-neo-secondary hover:text-white transition-colors"
            title="Leaderboard"
          >
            <Trophy className="w-5 h-5 text-amber-400" />
          </button>
        </div>
      </header>

      {/* MAIN INTERACTIVE CLICK ARENA */}
      <main
        onClick={handleInteraction}
        className={`flex-1 w-full flex flex-col items-center justify-center p-6 cursor-pointer transition-colors duration-150 ${
          roundState === 'waiting'
            ? 'bg-[#B91C1C]' // Bold Red: Hold on!
            : roundState === 'ready'
            ? 'bg-[#15803D]' // Bold Green: CLICK NOW!
            : roundState === 'early'
            ? 'bg-[#450A0A]' // Dark Red: Penalty
            : 'bg-[#0E111A]' // Dark neutral
        }`}
      >
        {roundState === 'idle' && (
          <div className="text-center max-w-md animate-fadeIn">
            <div className="w-20 h-20 mx-auto mb-6 rounded-3xl bg-neo-lime/10 border border-neo-lime/30 flex items-center justify-center text-neo-lime shadow-neo-lime">
              <Zap className="w-10 h-10" />
            </div>
            <h2 className="text-2xl sm:text-4xl font-black font-mono text-white mb-3 uppercase tracking-tight">
              TEST YOUR REFLEXES
            </h2>
            <p className="text-xs sm:text-sm text-neo-secondary font-mono mb-8 leading-relaxed">
              When the screen turns <strong className="text-emerald-400 font-bold">GREEN</strong>, tap or click as fast as humanly possible!
            </p>
            <div className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-neo-lime text-slate-950 font-black font-mono text-sm tracking-wider shadow-neo-lime">
              <Play className="w-4 h-4 fill-current" />
              <span>TAP TO START ROUND 1</span>
            </div>
          </div>
        )}

        {roundState === 'waiting' && (
          <div className="text-center animate-pulse">
            <h2 className="text-4xl sm:text-6xl font-black font-mono text-white mb-3 uppercase tracking-wider">
              WAIT FOR GREEN...
            </h2>
            <p className="text-sm font-mono text-red-200">Do not click yet or it counts as a false start!</p>
          </div>
        )}

        {roundState === 'ready' && (
          <div className="text-center animate-bounce">
            <h2 className="text-5xl sm:text-7xl font-black font-mono text-white uppercase tracking-wider drop-shadow-md">
              CLICK NOW!
            </h2>
          </div>
        )}

        {roundState === 'early' && (
          <div className="text-center animate-fadeIn">
            <AlertTriangle className="w-16 h-16 text-neo-coral mx-auto mb-4" />
            <h2 className="text-3xl sm:text-5xl font-black font-mono text-neo-coral mb-2 uppercase">
              TOO EARLY!
            </h2>
            <p className="text-sm font-mono text-slate-300 mb-6">
              You clicked before green appeared. Keep calm and wait for the signal.
            </p>
            <div className="inline-block px-6 py-3 rounded-xl bg-neo-surface border border-neo-border text-white font-mono text-xs font-bold">
              TAP TO TRY ROUND {currentRound} AGAIN
            </div>
          </div>
        )}

        {roundState === 'clicked' && lastReactionTime !== null && (
          <div className="text-center animate-fadeIn">
            <div className="text-6xl sm:text-8xl font-black font-mono text-white mb-2 tracking-tight">
              {lastReactionTime} <span className="text-2xl sm:text-3xl text-neo-lime">ms</span>
            </div>
            <div className="inline-block mb-6 px-4 py-1.5 rounded-full text-xs font-mono font-bold border border-neo-border bg-neo-surface text-neo-lime">
              {getRankBadge(lastReactionTime).label}
            </div>
            <p className="text-sm font-mono text-neo-secondary block mb-6">
              Round {currentRound} recorded.
            </p>
            <div className="inline-block px-8 py-3.5 rounded-2xl bg-neo-lime text-slate-950 font-black font-mono text-xs tracking-wider shadow-neo-lime">
              TAP FOR ROUND {currentRound + 1}
            </div>
          </div>
        )}

        {roundState === 'complete' && (
          <div className="text-center max-w-lg bg-neo-surface border border-neo-border p-8 rounded-3xl shadow-arcade-card animate-fadeIn">
            <CheckCircle2 className="w-14 h-14 text-neo-lime mx-auto mb-3" />
            <h2 className="text-2xl sm:text-3xl font-black font-mono text-white uppercase mb-1">
              CHALLENGE COMPLETE!
            </h2>
            <p className="text-xs text-neo-secondary font-mono mb-6">
              Performance breakdown over {totalRounds} rounds:
            </p>

            <div className="grid grid-cols-3 gap-3 font-mono mb-6">
              <div className="p-3 rounded-2xl bg-neo-bg border border-neo-border">
                <span className="text-[10px] text-neo-secondary block mb-1 uppercase">Best Round</span>
                <span className="text-xl font-black text-cyan-400">{bestTime} ms</span>
              </div>
              <div className="p-3 rounded-2xl bg-neo-bg border border-neo-border">
                <span className="text-[10px] text-neo-secondary block mb-1 uppercase">Average Time</span>
                <span className="text-xl font-black text-neo-lime">{averageTime} ms</span>
              </div>
              <div className="p-3 rounded-2xl bg-neo-bg border border-neo-border">
                <span className="text-[10px] text-neo-secondary block mb-1 uppercase">Arcade Score</span>
                <span className="text-xl font-black text-white">{finalScore}</span>
              </div>
            </div>

            <div className="mb-6">
              <span className={`px-4 py-1.5 rounded-full text-xs font-mono font-black border ${getRankBadge(averageTime).color}`}>
                RATING: {getRankBadge(averageTime).label}
              </span>
            </div>

            <div className="flex gap-3 justify-center">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleRestart();
                }}
                className="px-6 py-3 rounded-xl bg-neo-lime text-slate-950 font-bold font-mono text-xs tracking-wider shadow-neo-lime flex items-center gap-2"
              >
                <RotateCcw className="w-4 h-4" />
                <span>PLAY AGAIN</span>
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onExit();
                }}
                className="px-6 py-3 rounded-xl bg-neo-bg hover:bg-neo-cardHover border border-neo-border text-white font-bold font-mono text-xs tracking-wider"
              >
                BACK TO GAMES
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
