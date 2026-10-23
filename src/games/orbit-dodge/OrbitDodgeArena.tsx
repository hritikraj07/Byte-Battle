'use client';

import React, { useRef, useEffect, useState, useCallback } from 'react';
import { ArrowLeft, Play, RotateCcw, Trophy, Compass, Shield, Sparkles } from 'lucide-react';
import { useAudio } from '@/hooks/useAudio';
import { saveGameAttempt, db, getOrCreateParticipant } from '@/services/db';
import { GameLeaderboardModal } from '@/components/leaderboard/GameLeaderboardModal';

interface OrbitDodgeArenaProps {
  difficulty?: string;
  onExit?: () => void;
}

interface Hazard {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  color: string;
}

interface Shard {
  x: number;
  y: number;
  radius: number;
  collected?: boolean;
}

export const OrbitDodgeArena: React.FC<OrbitDodgeArenaProps> = ({
  difficulty = 'medium',
  onExit = () => window.history.back(),
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const { playSound } = useAudio();

  const [gameState, setGameState] = useState<'menu' | 'playing' | 'gameover'>('menu');
  const [score, setScore] = useState(0);
  const [survivalSeconds, setSurvivalSeconds] = useState(0);
  const [personalBest, setPersonalBest] = useState(0);
  const [leaderboardOpen, setLeaderboardOpen] = useState(false);

  const [playerName, setPlayerName] = useState('Player');
  const [participantId, setParticipantId] = useState('practice-user');

  // Player & Engine Mutable State
  const engineRef = useRef({
    player: {
      x: 400,
      y: 300,
      radius: 14,
      speed: 5.5,
      trail: [] as { x: number; y: number }[],
    },
    keys: {
      up: false,
      down: false,
      left: false,
      right: false,
    },
    hazards: [] as Hazard[],
    shards: [] as Shard[],
    particles: [] as { x: number; y: number; vx: number; vy: number; life: number; color: string }[],
    width: 800,
    height: 600,
    elapsedMs: 0,
    shardPoints: 0,
    animId: 0,
    touchTarget: null as { x: number; y: number } | null,
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = sessionStorage.getItem('bytebattle_active_player') ||
        localStorage.getItem('byte_battle_last_nickname') ||
        'OrbitPilot';
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
          .equals([participantId, 'orbit-dodge'])
          .first();
        if (pb) setPersonalBest(pb.bestScore);
      } catch {
        // ignore
      }
    }
    loadBest();
  }, [participantId]);

  // Resize canvas to full viewport
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

      if (gameState === 'menu') {
        engineRef.current.player.x = w / 2;
        engineRef.current.player.y = h / 2;
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [gameState]);

  // Difficulty scaling
  const diffMultiplier = difficulty === 'hard' ? 2.0 : difficulty === 'medium' ? 1.5 : 1.0;
  const initialHazardCount = difficulty === 'hard' ? 7 : difficulty === 'medium' ? 5 : 3;

  // Start a new survival run
  const startGame = useCallback(() => {
    const e = engineRef.current;
    const w = e.width || window.innerWidth;
    const h = e.height || window.innerHeight;

    e.player.x = w / 2;
    e.player.y = h / 2;
    e.player.trail = [];
    e.elapsedMs = 0;
    e.shardPoints = 0;
    e.particles = [];
    e.touchTarget = null;

    // Spawn initial hazards around screen edges
    const hazards: Hazard[] = [];
    for (let i = 0; i < initialHazardCount; i++) {
      const edge = Math.floor(Math.random() * 4);
      let hx = 0;
      let hy = 0;
      if (edge === 0) { hx = Math.random() * w; hy = -20; }
      else if (edge === 1) { hx = w + 20; hy = Math.random() * h; }
      else if (edge === 2) { hx = Math.random() * w; hy = h + 20; }
      else { hx = -20; hy = Math.random() * h; }

      const angle = Math.atan2(h / 2 - hy, w / 2 - hx) + (Math.random() - 0.5) * 0.8;
      const speed = 2.4 + Math.random() * 2.2;

      hazards.push({
        x: hx,
        y: hy,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        radius: 12 + Math.random() * 8,
        color: i % 2 === 0 ? '#EF4444' : '#F59E0B',
      });
    }
    e.hazards = hazards;

    // Spawn initial energy shards
    const shards: Shard[] = [];
    for (let i = 0; i < 4; i++) {
      shards.push({
        x: 60 + Math.random() * (w - 120),
        y: 80 + Math.random() * (h - 160),
        radius: 8,
      });
    }
    e.shards = shards;

    setScore(0);
    setSurvivalSeconds(0);
    setGameState('playing');
  }, [initialHazardCount]);

  // Main game loop
  useEffect(() => {
    if (gameState !== 'playing') return;

    let isRunning = true;
    let lastTime = performance.now();

    const gameLoop = (now: number) => {
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

      e.elapsedMs += dt * 1000;
      const totalSec = Math.floor(e.elapsedMs / 1000);
      setSurvivalSeconds(totalSec);

      // Player Movement - Keyboard input
      let moveX = 0;
      let moveY = 0;
      if (e.keys.left) moveX -= 1;
      if (e.keys.right) moveX += 1;
      if (e.keys.up) moveY -= 1;
      if (e.keys.down) moveY += 1;

      // Touch drag / pointer input
      if (e.touchTarget) {
        const dx = e.touchTarget.x - e.player.x;
        const dy = e.touchTarget.y - e.player.y;
        const dist = Math.hypot(dx, dy);
        if (dist > 8) {
          moveX = dx / dist;
          moveY = dy / dist;
        } else {
          e.touchTarget = null;
        }
      }

      if (moveX !== 0 && moveY !== 0) {
        moveX *= 0.7071;
        moveY *= 0.7071;
      }

      e.player.x = Math.max(e.player.radius, Math.min(w - e.player.radius, e.player.x + moveX * e.player.speed * step));
      e.player.y = Math.max(64 + e.player.radius, Math.min(h - e.player.radius, e.player.y + moveY * e.player.speed * step));

      // Player trail
      if (Math.random() < 0.4) {
        e.player.trail.push({ x: e.player.x, y: e.player.y });
        if (e.player.trail.length > 8) e.player.trail.shift();
      }

      // Periodically spawn new hazards
      if (Math.random() < 0.015 + totalSec * 0.0005 && e.hazards.length < 24) {
        const edge = Math.floor(Math.random() * 4);
        let hx = 0;
        let hy = 0;
        if (edge === 0) { hx = Math.random() * w; hy = -20; }
        else if (edge === 1) { hx = w + 20; hy = Math.random() * h; }
        else if (edge === 2) { hx = Math.random() * w; hy = h + 20; }
        else { hx = -20; hy = Math.random() * h; }

        const angle = Math.atan2(e.player.y - hy, e.player.x - hx) + (Math.random() - 0.5) * 0.4;
        const speed = 2.5 + Math.random() * 2.5 + Math.min(totalSec * 0.05, 3.5);

        e.hazards.push({
          x: hx,
          y: hy,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          radius: 10 + Math.random() * 10,
          color: Math.random() < 0.6 ? '#EF4444' : '#F59E0B',
        });
      }

      // Update Hazards & Check Collision with Player
      let hit = false;
      for (const hazard of e.hazards) {
        hazard.x += hazard.vx * step;
        hazard.y += hazard.vy * step;

        // Bounce off walls
        if (hazard.x < hazard.radius) { hazard.x = hazard.radius; hazard.vx *= -1; }
        if (hazard.x > w - hazard.radius) { hazard.x = w - hazard.radius; hazard.vx *= -1; }
        if (hazard.y < 64 + hazard.radius) { hazard.y = 64 + hazard.radius; hazard.vy *= -1; }
        if (hazard.y > h - hazard.radius) { hazard.y = h - hazard.radius; hazard.vy *= -1; }

        // Collision check
        const distToPlayer = Math.hypot(hazard.x - e.player.x, hazard.y - e.player.y);
        if (distToPlayer < hazard.radius + e.player.radius - 2) {
          hit = true;
          break;
        }
      }

      // Update Energy Shards & Collection
      for (let i = e.shards.length - 1; i >= 0; i--) {
        const s = e.shards[i];
        const dist = Math.hypot(s.x - e.player.x, s.y - e.player.y);
        if (dist < s.radius + e.player.radius + 6) {
          e.shardPoints += 250;
          playSound('coin');
          // Respawn shard elsewhere
          e.shards[i] = {
            x: 60 + Math.random() * (w - 120),
            y: 80 + Math.random() * (h - 160),
            radius: 8,
          };
        }
      }

      // Live Score Calculation
      const currentScore = Math.round((totalSec * 50 + e.shardPoints) * diffMultiplier);
      setScore(currentScore);

      if (hit) {
        playSound('wrong');
        setGameState('gameover');
        if (currentScore > personalBest) {
          setPersonalBest(currentScore);
        }

        saveGameAttempt({
          id: `att-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
          eventId: null,
          participantId: participantId,
          nickname: playerName,
          gameId: 'orbit-dodge',
          puzzleId: `OD-SURVIVED-${totalSec}S`,
          difficulty: difficulty as 'easy' | 'medium' | 'hard',
          isCorrect: totalSec >= 15,
          score: currentScore,
          basePoints: currentScore,
          timeRemainingSeconds: 0,
          timeBonusPoints: 0,
          hintsUsed: 0,
          hintPenaltyPoints: 0,
          elapsedSeconds: totalSec,
          totalRoundSeconds: totalSec,
          completedAt: new Date().toISOString(),
          isPractice: true,
        }).catch(console.error);

        return;
      }

      // -------------------------------------------------------------
      // RENDERING CANVAS
      // -------------------------------------------------------------
      ctx.save();
      ctx.scale(dpr, dpr);
      ctx.clearRect(0, 0, w, h);

      // Deep space background with subtle grid
      ctx.fillStyle = '#0B0D13';
      ctx.fillRect(0, 0, w, h);

      ctx.strokeStyle = '#181C2A';
      ctx.lineWidth = 1;
      const gridSize = 60;
      for (let gx = 0; gx < w; gx += gridSize) {
        ctx.beginPath();
        ctx.moveTo(gx, 64);
        ctx.lineTo(gx, h);
        ctx.stroke();
      }
      for (let gy = 64; gy < h; gy += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, gy);
        ctx.lineTo(w, gy);
        ctx.stroke();
      }

      // Render Shards (Glowing Neon Diamonds)
      for (const s of e.shards) {
        ctx.save();
        ctx.translate(s.x, s.y);
        ctx.fillStyle = '#C8FF3D';
        ctx.shadowColor = '#C8FF3D';
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.moveTo(0, -s.radius);
        ctx.lineTo(s.radius, 0);
        ctx.lineTo(0, s.radius);
        ctx.lineTo(-s.radius, 0);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
      }

      // Render Player Trail
      for (let i = 0; i < e.player.trail.length; i++) {
        const pt = e.player.trail[i];
        const alpha = (i + 1) / e.player.trail.length * 0.4;
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, e.player.radius * 0.6, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(0, 229, 255, ${alpha})`;
        ctx.fill();
      }

      // Render Player Vessel
      ctx.save();
      ctx.translate(e.player.x, e.player.y);
      ctx.shadowColor = '#00E5FF';
      ctx.shadowBlur = 14;
      ctx.fillStyle = '#00E5FF';
      ctx.beginPath();
      ctx.arc(0, 0, e.player.radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();
      ctx.arc(0, 0, e.player.radius * 0.4, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // Render Hazards
      for (const hazard of e.hazards) {
        ctx.save();
        ctx.translate(hazard.x, hazard.y);
        ctx.shadowColor = hazard.color;
        ctx.shadowBlur = 12;
        ctx.fillStyle = hazard.color;
        ctx.beginPath();
        ctx.arc(0, 0, hazard.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      ctx.restore();

      e.animId = requestAnimationFrame(gameLoop);
    };

    engineRef.current.animId = requestAnimationFrame(gameLoop);

    return () => {
      isRunning = false;
      cancelAnimationFrame(engineRef.current.animId);
    };
  }, [diffMultiplier, difficulty, gameState, participantId, personalBest, playerName, playSound]);

  // Keyboard controls listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const keys = engineRef.current.keys;
      if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') keys.up = true;
      if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') keys.down = true;
      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') keys.left = true;
      if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') keys.right = true;
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      const keys = engineRef.current.keys;
      if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') keys.up = false;
      if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') keys.down = false;
      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') keys.left = false;
      if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') keys.right = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  // Touch / pointer navigation on canvas
  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (gameState !== 'playing') return;
    const rect = e.currentTarget.getBoundingClientRect();
    engineRef.current.touchTarget = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (gameState !== 'playing' || !engineRef.current.touchTarget) return;
    const rect = e.currentTarget.getBoundingClientRect();
    engineRef.current.touchTarget = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  };

  const handlePointerUp = () => {
    engineRef.current.touchTarget = null;
  };

  const handleExitGame = () => {
    if (engineRef.current.animId) {
      cancelAnimationFrame(engineRef.current.animId);
    }
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
        gameId="orbit-dodge"
        gameTitle="Orbit Dodge"
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
                ORBIT DODGE
              </h1>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase border border-neo-border bg-neo-surface text-neo-secondary">
                {difficulty}
              </span>
            </div>
            <span className="text-[10px] font-mono text-neo-secondary hidden sm:inline">
              Avoid red/amber hazards • Collect green energy shards
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4 font-mono">
          <div className="text-right">
            <span className="text-[10px] text-neo-secondary uppercase block leading-none">Survived</span>
            <span className="text-base sm:text-lg font-black text-cyan-400 leading-tight">{survivalSeconds}s</span>
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
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          className="w-full h-full block cursor-crosshair"
        />

        {/* Start Screen Overlay */}
        {gameState === 'menu' && (
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center animate-fadeIn z-30">
            <div className="max-w-md bg-neo-surface border border-neo-border p-8 rounded-3xl shadow-arcade-card">
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-md">
                <Compass className="w-8 h-8" />
              </div>
              <h2 className="text-2xl font-black font-mono text-white mb-2 uppercase">
                ARCADE SURVIVAL
              </h2>
              <p className="text-xs text-neo-secondary font-mono mb-6 leading-relaxed">
                Pilot the cyan probe using Arrow Keys, WASD, or Touch Drag. Dodge incoming space hazards and harvest energy crystals!
              </p>
              <button
                onClick={startGame}
                className="w-full py-3.5 px-6 rounded-2xl bg-neo-lime text-slate-950 font-black font-mono text-xs tracking-wider uppercase hover:bg-lime-300 transition-all shadow-neo-lime flex items-center justify-center gap-2"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>LAUNCH PROBE</span>
              </button>
            </div>
          </div>
        )}

        {/* Game Over Overlay */}
        {gameState === 'gameover' && (
          <div className="absolute inset-0 bg-black/85 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center animate-fadeIn z-30">
            <div className="max-w-md bg-neo-surface border border-neo-border p-8 rounded-3xl shadow-arcade-card">
              <h2 className="text-3xl font-black font-mono text-neo-coral mb-2 uppercase">
                HULL COMPROMISED!
              </h2>
              <p className="text-xs text-neo-secondary font-mono mb-4">
                You survived for <strong className="text-cyan-400">{survivalSeconds}s</strong> with a final score of:
              </p>
              <div className="text-4xl font-black font-mono text-neo-lime mb-6">
                {score}
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
                  className="px-6 py-3 rounded-xl bg-neo-bg hover:bg-neo-cardHover border border-neo-border text-white font-bold font-mono text-xs tracking-wider"
                >
                  EXIT
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
