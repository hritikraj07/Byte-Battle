'use client';

import React, { useRef, useEffect, useState, useCallback } from 'react';
import { ArrowLeft, Play, RotateCcw, Trophy, Crosshair, Heart, ArrowRight } from 'lucide-react';
import { useAudio } from '@/hooks/useAudio';
import { saveGameAttempt, db, getOrCreateParticipant } from '@/services/db';
import { GameLeaderboardModal } from '@/components/leaderboard/GameLeaderboardModal';

interface PixelInvadersArenaProps {
  difficulty?: string;
  nickname?: string;
  onExit?: () => void;
}

interface Invader {
  x: number;
  y: number;
  width: number;
  height: number;
  alive: boolean;
  type: number; // 0, 1, 2
  color: string;
}

interface Projectile {
  x: number;
  y: number;
  vy: number;
  isPlayer: boolean;
  color: string;
}

export const PixelInvadersArena: React.FC<PixelInvadersArenaProps> = ({
  difficulty = 'medium',
  nickname: initialNickname = '',
  onExit = () => window.history.back(),
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const { playSound } = useAudio();

  const [gameState, setGameState] = useState<'menu' | 'playing' | 'gameover'>('menu');
  const [score, setScore] = useState(0);
  const [wave, setWave] = useState(1);
  const [lives, setLives] = useState(3);
  const [personalBest, setPersonalBest] = useState(0);
  const [leaderboardOpen, setLeaderboardOpen] = useState(false);

  const [playerName, setPlayerName] = useState(initialNickname || 'Player');
  const [participantId, setParticipantId] = useState('practice-user');

  const engineRef = useRef({
    player: {
      x: 300,
      y: 500,
      width: 36,
      height: 18,
      speed: 6.0,
      movingLeft: false,
      movingRight: false,
      canShoot: true,
      lastShot: 0,
    },
    invaders: [] as Invader[],
    projectiles: [] as Projectile[],
    particles: [] as { x: number; y: number; vx: number; vy: number; life: number; color: string }[],
    invaderDirection: 1,
    invaderStepDown: false,
    invaderSpeed: 1.2,
    ufo: null as { x: number; y: number; speed: number; points: number } | null,
    width: 600,
    height: 600,
    animId: 0,
  });

  useEffect(() => {
    const active = initialNickname || (typeof window !== 'undefined' ? sessionStorage.getItem('bytebattle_active_player') || 'SpaceAce' : 'SpaceAce');
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
          .equals([participantId, 'pixel-invaders'])
          .first();
        if (pb) setPersonalBest(pb.bestScore);
      } catch {
        // ignore
      }
    }
    loadBest();
  }, [participantId]);

  // Difficulty parameters
  const diffMultiplier = difficulty === 'hard' ? 2.0 : difficulty === 'medium' ? 1.5 : 1.0;
  const initialInvaderSpeed = difficulty === 'hard' ? 1.6 : difficulty === 'medium' ? 1.2 : 0.8;
  const enemyFireChance = difficulty === 'hard' ? 0.035 : difficulty === 'medium' ? 0.02 : 0.01;

  // Resize canvas
  useEffect(() => {
    const handleResize = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const w = window.innerWidth;
      const h = window.innerHeight;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);

      canvas.width = w * dpr;
      canvas.height = h * dpr;
      engineRef.current.width = w;
      engineRef.current.height = h;

      engineRef.current.player.y = h - 90;
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Generate invader army grid
  const spawnInvaderWave = useCallback((currentWave: number) => {
    const e = engineRef.current;
    const w = e.width || window.innerWidth;
    const invaders: Invader[] = [];

    const cols = 8;
    const rows = 4;
    const invWidth = 32;
    const invHeight = 20;
    const spacingX = 48;
    const spacingY = 32;
    const startX = (w - cols * spacingX) / 2;
    const startY = 100;

    const rowColors = ['#EC4899', '#A855F7', '#06B6D4', '#C8FF3D'];

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        invaders.push({
          x: startX + c * spacingX,
          y: startY + r * spacingY,
          width: invWidth,
          height: invHeight,
          alive: true,
          type: r,
          color: rowColors[r],
        });
      }
    }

    e.invaders = invaders;
    e.invaderDirection = 1;
    e.invaderSpeed = initialInvaderSpeed + (currentWave - 1) * 0.25;
    e.projectiles = [];
    e.ufo = null;
  }, [initialInvaderSpeed]);

  // Start new game
  const startGame = useCallback(() => {
    const e = engineRef.current;
    const w = e.width || window.innerWidth;
    const h = e.height || window.innerHeight;

    e.player.x = w / 2;
    e.player.y = h - 90;
    e.player.movingLeft = false;
    e.player.movingRight = false;
    e.particles = [];

    setScore(0);
    setWave(1);
    setLives(3);
    spawnInvaderWave(1);
    setGameState('playing');
  }, [spawnInvaderWave]);

  // Direct game launch if nickname prop provided
  useEffect(() => {
    if (initialNickname && gameState === 'menu') {
      startGame();
    }
  }, [initialNickname, gameState, startGame]);

  // Shoot player laser
  const firePlayerLaser = useCallback(() => {
    const e = engineRef.current;
    if (gameState !== 'playing') return;

    const now = Date.now();
    if (now - e.player.lastShot < 280) return; // cooldown
    e.player.lastShot = now;

    e.projectiles.push({
      x: e.player.x,
      y: e.player.y - 12,
      vy: -10,
      isPlayer: true,
      color: '#C8FF3D',
    });
    playSound('jump');
  }, [gameState, playSound]);

  // Main game animation loop
  useEffect(() => {
    if (gameState !== 'playing') return;

    let isRunning = true;
    let lastTime = performance.now();

    const loop = (now: number) => {
      if (!isRunning) return;

      const dt = Math.min((now - lastTime) / 1000, 0.04);
      lastTime = now;
      const step = dt * 60;

      const e = engineRef.current;
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = e.width;
      const h = e.height;

      // Update Player position
      if (e.player.movingLeft) e.player.x -= e.player.speed * step;
      if (e.player.movingRight) e.player.x += e.player.speed * step;
      e.player.x = Math.max(e.player.width / 2, Math.min(w - e.player.width / 2, e.player.x));

      // Move Invaders Side-to-Side
      let edgeReached = false;
      const aliveInvaders = e.invaders.filter((inv) => inv.alive);

      if (aliveInvaders.length === 0) {
        // Wave cleared! Advance to next wave
        playSound('win');
        setWave((prev) => {
          const nextW = prev + 1;
          spawnInvaderWave(nextW);
          return nextW;
        });
        setScore((prev) => prev + 1000);
        return;
      }

      for (const inv of aliveInvaders) {
        inv.x += e.invaderDirection * e.invaderSpeed * step;
        if (inv.x < 30 || inv.x > w - 60) {
          edgeReached = true;
        }

        // Alien reaches ground -> instant game over!
        if (inv.y + inv.height >= e.player.y) {
          playSound('wrong');
          setGameState('gameover');
          return;
        }
      }

      if (edgeReached) {
        e.invaderDirection *= -1;
        for (const inv of aliveInvaders) {
          inv.y += 18;
        }
      }

      // Enemy fire
      if (Math.random() < enemyFireChance && aliveInvaders.length > 0) {
        const shooter = aliveInvaders[Math.floor(Math.random() * aliveInvaders.length)];
        e.projectiles.push({
          x: shooter.x + shooter.width / 2,
          y: shooter.y + shooter.height,
          vy: 5.5,
          isPlayer: false,
          color: '#EC4899',
        });
      }

      // Mystery UFO periodic spawn
      if (!e.ufo && Math.random() < 0.003) {
        e.ufo = {
          x: -40,
          y: 75,
          speed: 3.5,
          points: 300,
        };
      }
      if (e.ufo) {
        e.ufo.x += e.ufo.speed * step;
        if (e.ufo.x > w + 50) e.ufo = null;
      }

      // Update Projectiles & Check Collisions
      for (let i = e.projectiles.length - 1; i >= 0; i--) {
        const p = e.projectiles[i];
        p.y += p.vy * step;

        if (p.y < 50 || p.y > h) {
          e.projectiles.splice(i, 1);
          continue;
        }

        if (p.isPlayer) {
          // Check collision with UFO
          if (e.ufo) {
            if (p.x >= e.ufo.x - 20 && p.x <= e.ufo.x + 20 && p.y >= e.ufo.y - 10 && p.y <= e.ufo.y + 10) {
              playSound('coin');
              setScore((prev) => prev + Math.round(e.ufo!.points * diffMultiplier));
              e.ufo = null;
              e.projectiles.splice(i, 1);
              continue;
            }
          }

          // Check collision with invaders
          let hitInvader = false;
          for (const inv of aliveInvaders) {
            if (p.x >= inv.x && p.x <= inv.x + inv.width && p.y >= inv.y && p.y <= inv.y + inv.height) {
              inv.alive = false;
              hitInvader = true;
              playSound('click');

              // Particles
              for (let k = 0; k < 6; k++) {
                e.particles.push({
                  x: inv.x + inv.width / 2,
                  y: inv.y + inv.height / 2,
                  vx: (Math.random() - 0.5) * 6,
                  vy: (Math.random() - 0.5) * 6,
                  life: 1,
                  color: inv.color,
                });
              }

              const pts = Math.round(100 * (4 - inv.type) * diffMultiplier);
              setScore((prev) => prev + pts);
              break;
            }
          }
          if (hitInvader) {
            e.projectiles.splice(i, 1);
          }
        } else {
          // Enemy projectile hits player
          const dist = Math.hypot(p.x - e.player.x, p.y - e.player.y);
          if (dist < e.player.width / 2) {
            e.projectiles.splice(i, 1);
            playSound('wrong');

            setLives((prevLives) => {
              const remaining = prevLives - 1;
              if (remaining <= 0) {
                setGameState('gameover');
                if (score > personalBest) {
                  setPersonalBest(score);
                }

                saveGameAttempt({
                  id: `att-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
                  eventId: null,
                  participantId: participantId,
                  nickname: playerName,
                  gameId: 'pixel-invaders',
                  puzzleId: `PI-WAVE-${wave}`,
                  difficulty: difficulty as 'easy' | 'medium' | 'hard',
                  isCorrect: wave >= 2,
                  score: score,
                  basePoints: score,
                  timeRemainingSeconds: 0,
                  timeBonusPoints: 0,
                  hintsUsed: 0,
                  hintPenaltyPoints: 0,
                  elapsedSeconds: wave * 25,
                  totalRoundSeconds: 120,
                  completedAt: new Date().toISOString(),
                  isPractice: true,
                }).catch(console.error);
              }
              return remaining;
            });
          }
        }
      }

      // Update particle explosions
      for (let i = e.particles.length - 1; i >= 0; i--) {
        const pt = e.particles[i];
        pt.x += pt.vx * step;
        pt.y += pt.vy * step;
        pt.life -= 0.05 * step;
        if (pt.life <= 0) e.particles.splice(i, 1);
      }

      // -------------------------------------------------------------
      // RENDERING CANVAS
      // -------------------------------------------------------------
      ctx.save();
      ctx.scale(dpr, dpr);
      ctx.clearRect(0, 0, w, h);

      // Deep space background
      ctx.fillStyle = '#0B0D13';
      ctx.fillRect(0, 0, w, h);

      // Render UFO if present
      if (e.ufo) {
        ctx.save();
        ctx.translate(e.ufo.x, e.ufo.y);
        ctx.fillStyle = '#EC4899';
        ctx.shadowColor = '#EC4899';
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.ellipse(0, 0, 22, 8, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.arc(0, -3, 5, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      // Render Invaders
      for (const inv of aliveInvaders) {
        ctx.save();
        ctx.translate(inv.x, inv.y);
        ctx.fillStyle = inv.color;
        ctx.shadowColor = inv.color;
        ctx.shadowBlur = 8;
        // Pixel-shaped alien
        ctx.fillRect(4, 2, 24, 12);
        ctx.fillRect(0, 6, 32, 6);
        ctx.fillRect(4, 14, 6, 4);
        ctx.fillRect(22, 14, 6, 4);
        // Eyes
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(8, 4, 4, 4);
        ctx.fillRect(20, 4, 4, 4);
        ctx.restore();
      }

      // Render Projectiles
      for (const p of e.projectiles) {
        ctx.save();
        ctx.fillStyle = p.color;
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 8;
        ctx.fillRect(p.x - 2, p.y - 8, 4, 12);
        ctx.restore();
      }

      // Render Particles
      for (const pt of e.particles) {
        ctx.save();
        ctx.fillStyle = pt.color;
        ctx.globalAlpha = Math.max(0, pt.life);
        ctx.fillRect(pt.x, pt.y, 3, 3);
        ctx.restore();
      }

      // Render Player Space Cannon
      ctx.save();
      ctx.translate(e.player.x, e.player.y);
      ctx.fillStyle = '#C8FF3D';
      ctx.shadowColor = '#C8FF3D';
      ctx.shadowBlur = 12;
      ctx.fillRect(-e.player.width / 2, 0, e.player.width, 10);
      ctx.fillRect(-8, -8, 16, 8);
      ctx.fillRect(-2, -14, 4, 6);
      ctx.restore();

      ctx.restore();

      e.animId = requestAnimationFrame(loop);
    };

    engineRef.current.animId = requestAnimationFrame(loop);

    return () => {
      isRunning = false;
      cancelAnimationFrame(engineRef.current.animId);
    };
  }, [diffMultiplier, difficulty, enemyFireChance, gameState, participantId, personalBest, playerName, playSound, score, spawnInvaderWave, wave]);

  // Keyboard controls (Arrows / A & D, Space)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const p = engineRef.current.player;
      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') p.movingLeft = true;
      if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') p.movingRight = true;
      if (e.code === 'Space' || e.key === ' ' || e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') {
        e.preventDefault();
        firePlayerLaser();
      }
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      const p = engineRef.current.player;
      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') p.movingLeft = false;
      if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') p.movingRight = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [firePlayerLaser]);

  // Pointer / Mouse Movement & Firing on Canvas
  const handleCanvasPointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (gameState !== 'playing') return;
    const rect = e.currentTarget.getBoundingClientRect();
    const clientX = e.clientX - rect.left;
    const p = engineRef.current.player;
    const w = engineRef.current.width || window.innerWidth;
    p.x = Math.max(p.width / 2, Math.min(w - p.width / 2, clientX));
  };

  const handleCanvasPointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (gameState !== 'playing') return;
    const rect = e.currentTarget.getBoundingClientRect();
    const clientX = e.clientX - rect.left;
    const p = engineRef.current.player;
    const w = engineRef.current.width || window.innerWidth;
    p.x = Math.max(p.width / 2, Math.min(w - p.width / 2, clientX));
    firePlayerLaser();
  };

  const handleExitGame = () => {
    if (engineRef.current.animId) cancelAnimationFrame(engineRef.current.animId);
    onExit();
  };

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 w-screen h-[100dvh] z-50 bg-[#0B0D13] flex flex-col select-none overflow-hidden touch-none text-neo-text"
    >
      {/* Leaderboard Modal */}
      <GameLeaderboardModal
        isOpen={leaderboardOpen}
        onClose={() => setLeaderboardOpen(false)}
        gameId="pixel-invaders"
        gameTitle="Pixel Invaders"
        currentParticipantId={participantId}
      />

      {/* TOP HUD */}
      <header className="h-16 px-4 sm:px-6 flex items-center justify-between bg-black/70 backdrop-blur-md border-b border-neo-border flex-shrink-0 z-20">
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
                PIXEL INVADERS
              </h1>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-neo-lime/15 text-neo-lime border border-neo-lime/30 uppercase">
                Wave {wave}
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase border border-neo-border bg-neo-surface text-neo-secondary">
                {difficulty}
              </span>
            </div>
            <span className="text-[10px] font-mono text-neo-secondary hidden sm:inline">
              Arrows/A-D to Move • Spacebar to Fire
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

      {/* FULL-VIEWPORT CANVAS PLAYFIELD */}
      <div className="flex-1 w-full h-full relative">
        <canvas
          ref={canvasRef}
          onPointerMove={handleCanvasPointerMove}
          onPointerDown={handleCanvasPointerDown}
          className="w-full h-full block cursor-crosshair touch-none"
        />

        {/* Start Overlay */}
        {gameState === 'menu' && (
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center animate-fadeIn z-30">
            <div className="max-w-md bg-neo-surface border border-neo-border p-8 rounded-3xl shadow-arcade-card">
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-violet-500/10 border border-violet-500/30 flex items-center justify-center text-violet-400 shadow-md">
                <Crosshair className="w-8 h-8" />
              </div>
              <h2 className="text-2xl font-black font-mono text-white mb-2 uppercase">
                RETRO SPACE DEFENSE
              </h2>
              <p className="text-xs text-neo-secondary font-mono mb-6 leading-relaxed">
                Control the neon cannon with Arrow keys or A/D. Press Spacebar to shoot. Destroy incoming pixel waves and mystery UFOs!
              </p>
              <button
                onClick={startGame}
                className="w-full py-3.5 px-6 rounded-2xl bg-neo-lime text-slate-950 font-black font-mono text-xs tracking-wider uppercase hover:bg-lime-300 transition-all shadow-neo-lime flex items-center justify-center gap-2"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>ENGAGE INVADERS</span>
              </button>
            </div>
          </div>
        )}

        {/* Game Over Overlay */}
        {gameState === 'gameover' && (
          <div className="absolute inset-0 bg-black/85 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center animate-fadeIn z-30">
            <div className="max-w-md bg-neo-surface border border-neo-border p-8 rounded-3xl shadow-arcade-card">
              <h2 className="text-3xl font-black font-mono text-neo-coral mb-2 uppercase">
                DEFENSE BREACHED!
              </h2>
              <p className="text-xs text-neo-secondary font-mono mb-4">
                You reached <strong className="text-cyan-400 font-bold">Wave {wave}</strong> with a final score of:
              </p>
              <div className="text-4xl font-black font-mono text-neo-lime mb-6">
                {score} pts
              </div>
              <div className="flex gap-3 justify-center">
                <button
                  onClick={startGame}
                  className="px-6 py-3 rounded-xl bg-neo-lime text-slate-950 font-bold font-mono text-xs tracking-wider shadow-neo-lime flex items-center gap-2"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>PLAY AGAIN</span>
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

        {/* On-screen Touch Controls (Mobile) */}
        {gameState === 'playing' && (
          <div className="absolute bottom-4 left-4 right-4 z-20 flex items-center justify-between pointer-events-auto md:hidden">
            <div className="flex gap-2">
              <button
                onPointerDown={() => { engineRef.current.player.movingLeft = true; }}
                onPointerUp={() => { engineRef.current.player.movingLeft = false; }}
                onPointerCancel={() => { engineRef.current.player.movingLeft = false; }}
                className="w-14 h-14 rounded-2xl bg-neo-surface/90 border border-neo-border flex items-center justify-center text-white active:bg-neo-lime active:text-slate-950 shadow-md"
              >
                <ArrowLeft className="w-6 h-6" />
              </button>
              <button
                onPointerDown={() => { engineRef.current.player.movingRight = true; }}
                onPointerUp={() => { engineRef.current.player.movingRight = false; }}
                onPointerCancel={() => { engineRef.current.player.movingRight = false; }}
                className="w-14 h-14 rounded-2xl bg-neo-surface/90 border border-neo-border flex items-center justify-center text-white active:bg-neo-lime active:text-slate-950 shadow-md"
              >
                <ArrowRight className="w-6 h-6" />
              </button>
            </div>
            <button
              onClick={firePlayerLaser}
              className="px-8 py-4 rounded-2xl bg-neo-lime text-slate-950 font-black font-mono text-sm tracking-wider shadow-neo-lime active:scale-95"
            >
              FIRE ⚡
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
