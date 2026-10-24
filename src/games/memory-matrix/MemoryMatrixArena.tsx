'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ArrowLeft, Play, RotateCcw, Trophy, Grid, Heart, Sparkles, CheckCircle2 } from 'lucide-react';
import { useAudio } from '@/hooks/useAudio';
import { saveGameAttempt, db, getOrCreateParticipant } from '@/services/db';
import { GameLeaderboardModal } from '@/components/leaderboard/GameLeaderboardModal';

interface MemoryMatrixArenaProps {
  difficulty?: string;
  nickname?: string;
  onExit?: () => void;
}

export const MemoryMatrixArena: React.FC<MemoryMatrixArenaProps> = ({
  difficulty = 'medium',
  nickname: initialNickname = '',
  onExit = () => window.history.back(),
}) => {
  const { playSound } = useAudio();

  const [gameState, setGameState] = useState<'intro' | 'memorize' | 'recall' | 'success' | 'gameover'>('intro');
  const [level, setLevel] = useState(1);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [gridSize, setGridSize] = useState(4); // 3, 4, or 5
  const [targetPattern, setTargetPattern] = useState<number[]>([]);
  const [selectedCells, setSelectedCells] = useState<number[]>([]);
  const [wrongCell, setWrongCell] = useState<number | null>(null);

  const [leaderboardOpen, setLeaderboardOpen] = useState(false);
  const [personalBest, setPersonalBest] = useState(0);

  const [playerName, setPlayerName] = useState(initialNickname || 'Player');
  const [participantId, setParticipantId] = useState('practice-user');

  useEffect(() => {
    const active = initialNickname || (typeof window !== 'undefined' ? sessionStorage.getItem('bytebattle_active_player') || 'MemoryChamp' : 'MemoryChamp');
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
          .equals([participantId, 'memory-matrix'])
          .first();
        if (pb) setPersonalBest(pb.bestScore);
      } catch {
        // ignore
      }
    }
    loadBest();
  }, [participantId]);

  // Determine grid size and target tile count based on level and difficulty
  const getRoundConfig = useCallback((lvl: number) => {
    let size = 4;
    let tileCount = 4;
    let memorizeTime = 1400;

    if (difficulty === 'easy') {
      size = lvl <= 2 ? 3 : 4;
      tileCount = Math.min(3 + Math.floor(lvl / 2), size * size - 2);
      memorizeTime = 1600;
    } else if (difficulty === 'hard') {
      size = lvl <= 2 ? 4 : 5;
      tileCount = Math.min(5 + lvl, size * size - 3);
      memorizeTime = 1000;
    } else {
      // medium
      size = lvl <= 3 ? 4 : 5;
      tileCount = Math.min(4 + Math.floor(lvl * 0.8), size * size - 3);
      memorizeTime = 1300;
    }

    return { size, tileCount, memorizeTime };
  }, [difficulty]);

  // Generate pattern and show memorize phase
  const generateLevel = useCallback((lvl: number) => {
    const config = getRoundConfig(lvl);
    setGridSize(config.size);
    setSelectedCells([]);
    setWrongCell(null);

    const totalCells = config.size * config.size;
    const indices = Array.from({ length: totalCells }, (_, i) => i);
    // Shuffle indices
    for (let i = indices.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [indices[i], indices[j]] = [indices[j], indices[i]];
    }

    const chosen = indices.slice(0, config.tileCount);
    setTargetPattern(chosen);
    setGameState('memorize');

    // Memorize timer
    setTimeout(() => {
      setGameState('recall');
    }, config.memorizeTime);
  }, [getRoundConfig]);

  const handleStartGame = useCallback(() => {
    setLevel(1);
    setScore(0);
    setLives(3);
    generateLevel(1);
  }, [generateLevel]);

  // Direct launch when nickname is passed
  useEffect(() => {
    if (initialNickname && gameState === 'intro') {
      handleStartGame();
    }
  }, [initialNickname, gameState, handleStartGame]);

  const handleCellClick = (idx: number) => {
    if (gameState !== 'recall') return;
    if (selectedCells.includes(idx)) return; // already picked

    if (targetPattern.includes(idx)) {
      // Correct tile clicked!
      playSound('click');
      const nextSelected = [...selectedCells, idx];
      setSelectedCells(nextSelected);

      const pointsEarned = 100 * level * (difficulty === 'hard' ? 2 : difficulty === 'medium' ? 1.5 : 1);
      setScore((prev) => prev + pointsEarned);

      // Check if all target tiles in pattern are found
      if (nextSelected.length === targetPattern.length) {
        playSound('win');
        setGameState('success');
        setTimeout(() => {
          const nextLvl = level + 1;
          setLevel(nextLvl);
          generateLevel(nextLvl);
        }, 1100);
      }
    } else {
      // Incorrect tile!
      playSound('wrong');
      setWrongCell(idx);
      const remainingLives = lives - 1;
      setLives(remainingLives);

      if (remainingLives <= 0) {
        setGameState('gameover');
        if (score > personalBest) {
          setPersonalBest(score);
        }

        saveGameAttempt({
          id: `att-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
          eventId: null,
          participantId: participantId,
          nickname: playerName,
          gameId: 'memory-matrix',
          puzzleId: `MM-LVL-${level}`,
          difficulty: difficulty as 'easy' | 'medium' | 'hard',
          isCorrect: level >= 3,
          score: score,
          basePoints: score,
          timeRemainingSeconds: 0,
          timeBonusPoints: 0,
          hintsUsed: 0,
          hintPenaltyPoints: 0,
          elapsedSeconds: level * 8,
          totalRoundSeconds: 120,
          completedAt: new Date().toISOString(),
          isPractice: true,
        }).catch(console.error);
      } else {
        setTimeout(() => {
          setWrongCell(null);
        }, 600);
      }
    }
  };

  const totalCells = gridSize * gridSize;

  return (
    <div className="fixed inset-0 w-screen h-[100dvh] z-50 bg-[#0B0D13] flex flex-col select-none overflow-hidden touch-none text-neo-text">
      {/* Leaderboard Modal */}
      <GameLeaderboardModal
        isOpen={leaderboardOpen}
        onClose={() => setLeaderboardOpen(false)}
        gameId="memory-matrix"
        gameTitle="Memory Matrix"
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
                MEMORY MATRIX
              </h1>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-neo-lime/15 text-neo-lime border border-neo-lime/30 uppercase">
                Level {level}
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase border border-neo-border bg-neo-surface text-neo-secondary">
                {difficulty}
              </span>
            </div>
            <span className="text-[10px] font-mono text-neo-secondary hidden sm:inline">
              Recall illuminated cells before they vanish
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4 font-mono">
          {/* Lives Counter */}
          <div className="flex items-center gap-1 bg-neo-surface px-3 py-1.5 rounded-xl border border-neo-border">
            {Array.from({ length: 3 }).map((_, i) => (
              <Heart
                key={i}
                className={`w-4 h-4 ${
                  i < lives ? 'text-neo-coral fill-neo-coral' : 'text-slate-700'
                }`}
              />
            ))}
          </div>

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

      {/* GAMEPLAY CANVAS AREA */}
      <main className="flex-1 w-full flex flex-col items-center justify-center p-4">
        {gameState === 'intro' ? (
          <div className="text-center max-w-md bg-neo-surface border border-neo-border p-8 rounded-3xl shadow-arcade-card animate-fadeIn">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400 shadow-md">
              <Grid className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-black font-mono text-white mb-2 uppercase">
              VISUAL RECALL MATRIX
            </h2>
            <p className="text-xs text-neo-secondary font-mono mb-6 leading-relaxed">
              Tiles will flash neon blue. Memorize their exact locations and tap every target tile once they hide.
            </p>
            <button
              onClick={handleStartGame}
              className="w-full py-3.5 px-6 rounded-2xl bg-neo-lime text-slate-950 font-black font-mono text-xs tracking-wider uppercase hover:bg-lime-300 transition-all shadow-neo-lime flex items-center justify-center gap-2"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>START CHALLENGE</span>
            </button>
          </div>
        ) : gameState === 'gameover' ? (
          <div className="text-center max-w-md bg-neo-surface border border-neo-border p-8 rounded-3xl shadow-arcade-card animate-fadeIn">
            <h2 className="text-3xl font-black font-mono text-neo-coral mb-2 uppercase">
              OUT OF LIVES!
            </h2>
            <p className="text-xs text-neo-secondary font-mono mb-6">
              You cleared {level - 1} levels with a final score of <strong className="text-white">{score}</strong>.
            </p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={handleStartGame}
                className="px-6 py-3 rounded-xl bg-neo-lime text-slate-950 font-bold font-mono text-xs tracking-wider shadow-neo-lime flex items-center gap-2"
              >
                <RotateCcw className="w-4 h-4" />
                <span>TRY AGAIN</span>
              </button>
              <button
                onClick={onExit}
                className="px-6 py-3 rounded-xl bg-neo-bg hover:bg-neo-cardHover border border-neo-border text-white font-bold font-mono text-xs tracking-wider cursor-pointer"
              >
                BACK TO GAMES
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center">
            {/* Phase Instructions Prompt */}
            <div className="mb-6 text-center">
              {gameState === 'memorize' ? (
                <span className="px-4 py-1.5 rounded-full text-xs font-mono font-black uppercase tracking-wider bg-blue-500/20 text-blue-400 border border-blue-500/40 animate-pulse">
                  👁️ MEMORIZE THE PATTERN...
                </span>
              ) : gameState === 'recall' ? (
                <span className="px-4 py-1.5 rounded-full text-xs font-mono font-black uppercase tracking-wider bg-neo-lime/20 text-neo-lime border border-neo-lime/40">
                  ⚡ TAP RECALLED TILES ({selectedCells.length}/{targetPattern.length})
                </span>
              ) : (
                <span className="px-4 py-1.5 rounded-full text-xs font-mono font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 animate-bounce">
                  ✨ PERFECT RECALL! NEXT LEVEL...
                </span>
              )}
            </div>

            {/* Grid Container */}
            <div
              className="grid gap-2.5 p-4 rounded-3xl bg-neo-surface border border-neo-border shadow-arcade-card max-w-[90vw]"
              style={{
                gridTemplateColumns: `repeat(${gridSize}, minmax(0, 1fr))`,
              }}
            >
              {Array.from({ length: totalCells }).map((_, idx) => {
                const isTarget = targetPattern.includes(idx);
                const isMemorizeLit = gameState === 'memorize' && isTarget;
                const isSelectedCorrect = selectedCells.includes(idx);
                const isWrong = wrongCell === idx;

                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleCellClick(idx)}
                    disabled={gameState !== 'recall' || isSelectedCorrect}
                    className={`w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 rounded-2xl border transition-all flex items-center justify-center ${
                      isMemorizeLit
                        ? 'bg-cyan-500 border-cyan-300 shadow-[0_0_16px_rgba(6,182,212,0.8)] scale-105'
                        : isSelectedCorrect
                        ? 'bg-neo-lime border-white shadow-[0_0_16px_rgba(200,255,61,0.8)] scale-105'
                        : isWrong
                        ? 'bg-neo-coral border-red-300 shadow-[0_0_16px_rgba(239,68,68,0.8)] animate-wiggle'
                        : 'bg-neo-bg border-neo-border hover:border-slate-600 hover:bg-neo-cardHover active:scale-95'
                    }`}
                  >
                    {isSelectedCorrect && (
                      <CheckCircle2 className="w-6 h-6 text-slate-950 font-black animate-scaleIn" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
