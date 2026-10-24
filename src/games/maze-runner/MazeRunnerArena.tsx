'use client';

import React, { useRef, useEffect, useState, useCallback } from 'react';
import { ArrowLeft, Play, RotateCcw, Trophy, Navigation, Compass, ChevronUp, ChevronDown, ChevronLeft, ChevronRight, CheckCircle2 } from 'lucide-react';
import { useAudio } from '@/hooks/useAudio';
import { saveGameAttempt, db, getOrCreateParticipant } from '@/services/db';
import { GameLeaderboardModal } from '@/components/leaderboard/GameLeaderboardModal';

interface MazeRunnerArenaProps {
  difficulty?: string;
  nickname?: string;
  onExit?: () => void;
}

// Depth-First Search Maze Generator
function generateMaze(cols: number, rows: number): { grid: number[][]; start: [number, number]; exit: [number, number] } {
  // Grid: 1 = wall, 0 = path
  const grid: number[][] = Array.from({ length: rows }, () => Array(cols).fill(1));

  function carve(cx: number, cy: number) {
    grid[cy][cx] = 0;
    const directions = [
      [0, -2], // Up
      [2, 0],  // Right
      [0, 2],  // Down
      [-2, 0], // Left
    ];
    // Shuffle directions
    for (let i = directions.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [directions[i], directions[j]] = [directions[j], directions[i]];
    }

    for (const [dx, dy] of directions) {
      const nx = cx + dx;
      const ny = cy + dy;
      if (nx > 0 && nx < cols - 1 && ny > 0 && ny < rows - 1 && grid[ny][nx] === 1) {
        grid[cy + dy / 2][cx + dx / 2] = 0; // Carve wall between
        carve(nx, ny);
      }
    }
  }

  carve(1, 1);
  const start: [number, number] = [1, 1];
  const exit: [number, number] = [cols - 2, rows - 2];
  grid[exit[1]][exit[0]] = 0;

  return { grid, start, exit };
}

export const MazeRunnerArena: React.FC<MazeRunnerArenaProps> = ({
  difficulty = 'medium',
  nickname: initialNickname = '',
  onExit = () => window.history.back(),
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const { playSound } = useAudio();

  const [gameState, setGameState] = useState<'menu' | 'playing' | 'victory'>('menu');
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [score, setScore] = useState(0);
  const [personalBest, setPersonalBest] = useState(0);
  const [leaderboardOpen, setLeaderboardOpen] = useState(false);

  const [playerName, setPlayerName] = useState(initialNickname || 'Player');
  const [participantId, setParticipantId] = useState('practice-user');

  // Maze dimensions based on difficulty (must be odd numbers for DFS grid)
  const cols = difficulty === 'hard' ? 21 : difficulty === 'medium' ? 15 : 11;
  const rows = difficulty === 'hard' ? 21 : difficulty === 'medium' ? 15 : 11;
  const timeLimit = difficulty === 'hard' ? 90 : difficulty === 'medium' ? 60 : 45;

  const engineRef = useRef({
    grid: [] as number[][],
    player: { x: 1, y: 1 },
    exit: { x: 9, y: 9 },
    trail: [] as { x: number; y: number }[],
    animId: 0,
    startTime: 0,
    timerInterval: null as NodeJS.Timeout | null,
    cellSize: 24,
    offsetX: 0,
    offsetY: 0,
  });

  useEffect(() => {
    const active = initialNickname || (typeof window !== 'undefined' ? sessionStorage.getItem('bytebattle_active_player') || 'MazeRunner' : 'MazeRunner');
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
          .equals([participantId, 'maze-runner'])
          .first();
        if (pb) setPersonalBest(pb.bestScore);
      } catch {
        // ignore
      }
    }
    loadBest();
  }, [participantId]);

  // Start a new maze run
  const startNewMaze = useCallback(() => {
    const e = engineRef.current;
    if (e.timerInterval) clearInterval(e.timerInterval);

    const { grid, start, exit } = generateMaze(cols, rows);
    e.grid = grid;
    e.player = { x: start[0], y: start[1] };
    e.exit = { x: exit[0], y: exit[1] };
    e.trail = [{ x: start[0], y: start[1] }];
    e.startTime = Date.now();

    setElapsedSeconds(0);
    setScore(0);
    setGameState('playing');

    e.timerInterval = setInterval(() => {
      const now = Date.now();
      const sec = Math.floor((now - e.startTime) / 1000);
      setElapsedSeconds(sec);
    }, 1000);
  }, [cols, rows]);

  // Direct game launch if nickname prop is provided
  useEffect(() => {
    if (initialNickname && gameState === 'menu') {
      startNewMaze();
    }
  }, [initialNickname, gameState, startNewMaze]);

  // Player movement
  const movePlayer = useCallback((dx: number, dy: number) => {
    if (gameState !== 'playing') return;
    const e = engineRef.current;
    const nx = e.player.x + dx;
    const ny = e.player.y + dy;

    // Check bounds & wall
    if (ny >= 0 && ny < e.grid.length && nx >= 0 && nx < e.grid[0].length) {
      if (e.grid[ny][nx] === 0) {
        e.player.x = nx;
        e.player.y = ny;
        e.trail.push({ x: nx, y: ny });
        playSound('click');

        // Check victory
        if (nx === e.exit.x && ny === e.exit.y) {
          if (e.timerInterval) clearInterval(e.timerInterval);
          playSound('win');
          setGameState('victory');

          const finalSeconds = Math.max(1, Math.floor((Date.now() - e.startTime) / 1000));
          const timeBonus = Math.max(0, (timeLimit - finalSeconds) * 25);
          const basePts = difficulty === 'hard' ? 1200 : difficulty === 'medium' ? 800 : 500;
          const finalScore = basePts + timeBonus;

          setScore(finalScore);
          if (finalScore > personalBest) {
            setPersonalBest(finalScore);
          }

          saveGameAttempt({
            id: `att-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
            eventId: null,
            participantId: participantId,
            nickname: playerName,
            gameId: 'maze-runner',
            puzzleId: `MR-GRID-${cols}X${rows}`,
            difficulty: difficulty as 'easy' | 'medium' | 'hard',
            isCorrect: true,
            score: finalScore,
            basePoints: basePts,
            timeRemainingSeconds: Math.max(0, timeLimit - finalSeconds),
            timeBonusPoints: timeBonus,
            hintsUsed: 0,
            hintPenaltyPoints: 0,
            elapsedSeconds: finalSeconds,
            totalRoundSeconds: timeLimit,
            completedAt: new Date().toISOString(),
            isPractice: true,
          }).catch(console.error);
        }
      }
    }
  }, [cols, difficulty, gameState, participantId, personalBest, playerName, playSound, rows, timeLimit]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (gameState !== 'playing') return;
      if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') { e.preventDefault(); movePlayer(0, -1); }
      if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') { e.preventDefault(); movePlayer(0, 1); }
      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') { e.preventDefault(); movePlayer(-1, 0); }
      if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') { e.preventDefault(); movePlayer(1, 0); }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameState, movePlayer]);

  // Canvas rendering loop
  useEffect(() => {
    let isRunning = true;

    const render = () => {
      if (!isRunning) return;

      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;

      if (canvas.width !== w * dpr || canvas.height !== h * dpr) {
        canvas.width = w * dpr;
        canvas.height = h * dpr;
      }

      ctx.save();
      ctx.scale(dpr, dpr);
      ctx.clearRect(0, 0, w, h);

      ctx.fillStyle = '#0B0D13';
      ctx.fillRect(0, 0, w, h);

      const e = engineRef.current;
      if (e.grid.length > 0) {
        // Calculate cell size to fit cleanly on screen
        const maxW = w - 40;
        const maxH = h - 40;
        const cellSize = Math.floor(Math.min(maxW / cols, maxH / rows));
        e.cellSize = cellSize;

        const mazeW = cellSize * cols;
        const mazeH = cellSize * rows;
        const offX = Math.floor((w - mazeW) / 2);
        const offY = Math.floor((h - mazeH) / 2);
        e.offsetX = offX;
        e.offsetY = offY;

        ctx.save();
        ctx.translate(offX, offY);

        // Draw Walls and Paths
        for (let r = 0; r < rows; r++) {
          for (let c = 0; c < cols; c++) {
            const isWall = e.grid[r][c] === 1;
            const x = c * cellSize;
            const y = r * cellSize;

            if (isWall) {
              ctx.fillStyle = '#192434';
              ctx.fillRect(x, y, cellSize, cellSize);
              ctx.strokeStyle = '#273950';
              ctx.lineWidth = 1;
              ctx.strokeRect(x, y, cellSize, cellSize);
            } else {
              ctx.fillStyle = '#0F131D';
              ctx.fillRect(x, y, cellSize, cellSize);
            }
          }
        }

        // Render Breadcrumb Trail
        for (const pt of e.trail) {
          ctx.fillStyle = 'rgba(16, 185, 129, 0.2)';
          ctx.beginPath();
          ctx.arc(
            pt.x * cellSize + cellSize / 2,
            pt.y * cellSize + cellSize / 2,
            cellSize * 0.25,
            0,
            Math.PI * 2
          );
          ctx.fill();
        }

        // Render Exit Portal
        const exitX = e.exit.x * cellSize + cellSize / 2;
        const exitY = e.exit.y * cellSize + cellSize / 2;
        ctx.fillStyle = '#EC4899';
        ctx.shadowColor = '#EC4899';
        ctx.shadowBlur = 12;
        ctx.beginPath();
        ctx.arc(exitX, exitY, cellSize * 0.38, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.arc(exitX, exitY, cellSize * 0.18, 0, Math.PI * 2);
        ctx.fill();

        // Render Player Node
        const px = e.player.x * cellSize + cellSize / 2;
        const py = e.player.y * cellSize + cellSize / 2;
        ctx.fillStyle = '#10B981';
        ctx.shadowColor = '#10B981';
        ctx.shadowBlur = 14;
        ctx.beginPath();
        ctx.arc(px, py, cellSize * 0.38, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.arc(px, py, cellSize * 0.18, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
      }

      ctx.restore();
      e.animId = requestAnimationFrame(render);
    };

    engineRef.current.animId = requestAnimationFrame(render);

    return () => {
      isRunning = false;
      cancelAnimationFrame(engineRef.current.animId);
      if (engineRef.current.timerInterval) clearInterval(engineRef.current.timerInterval);
    };
  }, [cols, rows]);

  const handleExitGame = () => {
    if (engineRef.current.animId) cancelAnimationFrame(engineRef.current.animId);
    if (engineRef.current.timerInterval) clearInterval(engineRef.current.timerInterval);
    onExit();
  };

  return (
    <div className="fixed inset-0 w-screen h-[100dvh] z-50 bg-[#0B0D13] flex flex-col select-none overflow-hidden touch-none text-neo-text">
      {/* Leaderboard Modal */}
      <GameLeaderboardModal
        isOpen={leaderboardOpen}
        onClose={() => setLeaderboardOpen(false)}
        gameId="maze-runner"
        gameTitle="Maze Runner"
        currentParticipantId={participantId}
      />

      {/* TOP HUD */}
      <header className="h-16 px-4 sm:px-6 flex items-center justify-between bg-black/60 backdrop-blur-md border-b border-neo-border flex-shrink-0 z-20">
        <div className="flex items-center gap-3">
          <button
            onClick={handleExitGame}
            className="p-2.5 rounded-xl bg-neo-surface hover:bg-neo-cardHover border border-neo-border text-neo-secondary hover:text-white transition-colors"
            title="Exit to Games"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-black font-mono text-white tracking-wider uppercase">
                MAZE RUNNER
              </h1>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase border border-neo-border bg-neo-surface text-neo-secondary">
                {difficulty} • {cols}×{rows}
              </span>
            </div>
            <span className="text-[10px] font-mono text-neo-secondary hidden sm:inline">
              Guide the green beacon to the pink exit portal
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4 font-mono">
          <div className="text-right">
            <span className="text-[10px] text-neo-secondary uppercase block leading-none">Time</span>
            <span className="text-base sm:text-lg font-black text-emerald-400 leading-tight">{elapsedSeconds}s</span>
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
      <main className="flex-1 w-full h-full relative flex flex-col items-center justify-center">
        <canvas ref={canvasRef} className="w-full h-full block" />

        {/* Start Overlay */}
        {gameState === 'menu' && (
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center animate-fadeIn z-30">
            <div className="max-w-md bg-neo-surface border border-neo-border p-8 rounded-3xl shadow-arcade-card">
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shadow-md">
                <Navigation className="w-8 h-8" />
              </div>
              <h2 className="text-2xl font-black font-mono text-white mb-2 uppercase">
                PROCEDURAL LABYRINTH
              </h2>
              <p className="text-xs text-neo-secondary font-mono mb-6 leading-relaxed">
                A new solvable maze is generated every run. Use Arrow keys, WASD, or the on-screen D-Pad to reach the exit portal.
              </p>
              <button
                onClick={startNewMaze}
                className="w-full py-3.5 px-6 rounded-2xl bg-neo-lime text-slate-950 font-black font-mono text-xs tracking-wider uppercase hover:bg-lime-300 transition-all shadow-neo-lime flex items-center justify-center gap-2"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>GENERATE MAZE</span>
              </button>
            </div>
          </div>
        )}

        {/* Victory Overlay */}
        {gameState === 'victory' && (
          <div className="absolute inset-0 bg-black/85 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center animate-fadeIn z-30">
            <div className="max-w-md bg-neo-surface border border-neo-border p-8 rounded-3xl shadow-arcade-card">
              <CheckCircle2 className="w-14 h-14 text-emerald-400 mx-auto mb-3" />
              <h2 className="text-3xl font-black font-mono text-white mb-1 uppercase">
                MAZE SOLVED!
              </h2>
              <p className="text-xs text-neo-secondary font-mono mb-4">
                Escaped in <strong className="text-emerald-400">{elapsedSeconds} seconds</strong>!
              </p>
              <div className="text-4xl font-black font-mono text-neo-lime mb-6">
                {score} pts
              </div>
              <div className="flex gap-3 justify-center">
                <button
                  onClick={startNewMaze}
                  className="px-6 py-3 rounded-xl bg-neo-lime text-slate-950 font-bold font-mono text-xs tracking-wider shadow-neo-lime flex items-center gap-2"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>NEW MAZE</span>
                </button>
                <button
                  onClick={handleExitGame}
                  className="px-6 py-3 rounded-xl bg-neo-bg hover:bg-neo-cardHover border border-neo-border text-white font-bold font-mono text-xs tracking-wider cursor-pointer"
                >
                  BACK TO GAMES
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Tactile On-Screen D-Pad (Convenient on Mobile / Tablets) */}
        {gameState === 'playing' && (
          <div className="absolute bottom-6 right-6 z-20 flex flex-col items-center opacity-75 hover:opacity-100 transition-opacity">
            <button
              onClick={() => movePlayer(0, -1)}
              className="w-12 h-12 rounded-xl bg-neo-surface/90 border border-neo-border flex items-center justify-center text-white active:bg-neo-lime active:text-slate-950 shadow-md mb-1"
            >
              <ChevronUp className="w-6 h-6" />
            </button>
            <div className="flex gap-1">
              <button
                onClick={() => movePlayer(-1, 0)}
                className="w-12 h-12 rounded-xl bg-neo-surface/90 border border-neo-border flex items-center justify-center text-white active:bg-neo-lime active:text-slate-950 shadow-md"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <button
                onClick={() => movePlayer(0, 1)}
                className="w-12 h-12 rounded-xl bg-neo-surface/90 border border-neo-border flex items-center justify-center text-white active:bg-neo-lime active:text-slate-950 shadow-md"
              >
                <ChevronDown className="w-6 h-6" />
              </button>
              <button
                onClick={() => movePlayer(1, 0)}
                className="w-12 h-12 rounded-xl bg-neo-surface/90 border border-neo-border flex items-center justify-center text-white active:bg-neo-lime active:text-slate-950 shadow-md"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
