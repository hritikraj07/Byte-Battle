'use client';

import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Play, Pause, RotateCcw, Trophy, ArrowLeft, Zap } from 'lucide-react';
import { useAudio } from '@/hooks/useAudio';
import { saveGameAttempt, db, getOrCreateParticipant } from '@/services/db';
import { GameLeaderboardModal } from '@/components/leaderboard/GameLeaderboardModal';
import { PlayerNameModal } from '@/components/common/PlayerNameModal';

interface PulseJumperArenaProps {
  difficulty?: string;
  nickname?: string;
  onExit?: () => void;
}

interface Obstacle {
  x: number;
  y: number;
  width: number;
  height: number;
  type: 'spike' | 'block' | 'orb' | 'platform';
  collected?: boolean;
}

const DIFFICULTY_CONFIG: Record<
  string,
  { baseSpeed: number; maxSpeed: number; gap: number; multiplier: number; label: string; color: string; bg: string }
> = {
  easy: { baseSpeed: 4.4, maxSpeed: 5.8, gap: 500, multiplier: 1.0, label: 'Easy', color: '#3B82F6', bg: 'rgba(59,130,246,0.15)' },
  normal: { baseSpeed: 5.2, maxSpeed: 6.8, gap: 410, multiplier: 1.5, label: 'Normal', color: '#06B6D4', bg: 'rgba(6,182,212,0.15)' },
  hard: { baseSpeed: 6.2, maxSpeed: 8.0, gap: 340, multiplier: 2.0, label: 'Hard', color: '#EAB308', bg: 'rgba(234,179,8,0.15)' },
  expert: { baseSpeed: 7.4, maxSpeed: 9.4, gap: 290, multiplier: 2.8, label: 'Expert', color: '#F97316', bg: 'rgba(249,115,22,0.15)' },
  insane: { baseSpeed: 8.8, maxSpeed: 11.0, gap: 250, multiplier: 4.0, label: 'Insane', color: '#EF4444', bg: 'rgba(239,68,68,0.15)' },
};

export const PulseJumperArena: React.FC<PulseJumperArenaProps> = ({
  difficulty = 'normal',
  nickname: initialNickname = '',
  onExit = () => window.history.back(),
}) => {
  const diffConfig = DIFFICULTY_CONFIG[difficulty] || DIFFICULTY_CONFIG.normal;
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const { playSound, playBeatPulse } = useAudio();

  // Player Name Confirmation State
  const [confirmedNickname, setConfirmedNickname] = useState<string>(initialNickname);
  const [activeParticipantId, setActiveParticipantId] = useState<string>('');
  const [nameModalOpen, setNameModalOpen] = useState(false);

  const [gameState, setGameState] = useState<'menu' | 'playing' | 'paused' | 'gameover'>('menu');
  const [score, setScore] = useState(0);
  const [distanceDisplay, setDistanceDisplay] = useState(0);
  const [currentLevel, setCurrentLevel] = useState(1);
  const [personalBest, setPersonalBest] = useState(0);
  const [leaderboardOpen, setLeaderboardOpen] = useState(false);

  // Mutable Game Loop State
  const engineRef = useRef({
    player: {
      x: 100,
      y: 0,
      size: 34,
      vy: 0,
      isGrounded: true,
      rotation: 0,
    },
    cameraX: 0,
    baseSpeed: diffConfig.baseSpeed,
    speed: diffConfig.baseSpeed,
    gravity: 0.58,
    jumpForce: -12.0,
    obstacles: [] as Obstacle[],
    levelLength: 12000,
    score: 0,
    distance: 0,
    orbPoints: 0,
    animationFrameId: 0,
    lastBeatTime: 0,
    beatInterval: 468, // ~128 BPM
    pulseScale: 1,
    groundY: 400,
    isJumpingInput: false,
    particles: [] as { x: number; y: number; vx: number; vy: number; life: number; color: string }[],
    canvasWidth: 800,
    canvasHeight: 500,
  });

  // Prompt for player name before gameplay begins only if not passed as prop
  useEffect(() => {
    if (initialNickname) {
      setConfirmedNickname(initialNickname);
      getOrCreateParticipant('practice-session', initialNickname)
        .then((p) => setActiveParticipantId(p.id))
        .catch(() => setActiveParticipantId(`p-${Date.now()}`));
      setNameModalOpen(false);
      startNewRun();
    } else if (!confirmedNickname) {
      setNameModalOpen(true);
    }
  }, [initialNickname]);

  // Load personal best
  useEffect(() => {
    async function loadBest() {
      try {
        const pId = activeParticipantId || 'practice-user';
        const pb = await db.personalBests
          .where(['participantId', 'gameId'])
          .equals([pId, 'pulse-jumper'])
          .first();
        if (pb) setPersonalBest(pb.bestScore);
      } catch (err) {
        console.warn('PB error:', err);
      }
    }
    loadBest();
  }, [activeParticipantId]);

  // Responsive full-viewport canvas sizing
  useEffect(() => {
    const handleResize = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const w = window.innerWidth;
      const h = window.innerHeight;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);

      canvas.width = w * dpr;
      canvas.height = h * dpr;

      engineRef.current.canvasWidth = w;
      engineRef.current.canvasHeight = h;
      engineRef.current.groundY = h - 110; // 110px above screen bottom for comfortable jumping view
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Generate obstacle course starting at Level 1
  const generateLevelCourse = useCallback(
    (groundY: number) => {
      const list: Obstacle[] = [];
      let cursorX = 650; // Give player 650px of clean ground to get ready!

      for (let i = 0; i < 45; i++) {
        const typeChoice = Math.random();
        const baseGap = Math.max(240, diffConfig.gap - Math.min(i * 3, 100));

        if (typeChoice < 0.45) {
          // Single Spike
          list.push({
            x: cursorX,
            y: groundY - 28,
            width: 28,
            height: 28,
            type: 'spike',
          });
          cursorX += baseGap + Math.random() * 80;
        } else if (typeChoice < 0.7) {
          // Step Block + Energy Orb
          list.push({
            x: cursorX,
            y: groundY - 40,
            width: 55,
            height: 40,
            type: 'block',
          });
          list.push({
            x: cursorX + 85,
            y: groundY - 75,
            width: 20,
            height: 20,
            type: 'orb',
          });
          cursorX += baseGap + 60 + Math.random() * 80;
        } else if (typeChoice < 0.85) {
          // Floating Platform with spikes below
          list.push({
            x: cursorX,
            y: groundY - 26,
            width: 26,
            height: 26,
            type: 'spike',
          });
          list.push({
            x: cursorX + 60,
            y: groundY - 65,
            width: 90,
            height: 20,
            type: 'platform',
          });
          list.push({
            x: cursorX + 105,
            y: groundY - 95,
            width: 18,
            height: 18,
            type: 'orb',
          });
          cursorX += baseGap + 90 + Math.random() * 80;
        } else {
          // Double Spikes
          list.push({
            x: cursorX,
            y: groundY - 28,
            width: 28,
            height: 28,
            type: 'spike',
          });
          list.push({
            x: cursorX + 30,
            y: groundY - 28,
            width: 28,
            height: 28,
            type: 'spike',
          });
          cursorX += baseGap + 50 + Math.random() * 80;
        }
      }

      return list;
    },
    [diffConfig.gap]
  );

  // Trigger Jump Action
  const triggerJump = useCallback(() => {
    const e = engineRef.current;
    if (gameState !== 'playing') return;

    if (e.player.isGrounded) {
      e.player.vy = e.jumpForce;
      e.player.isGrounded = false;
      playSound('jump');

      // Create spark trail
      for (let i = 0; i < 6; i++) {
        e.particles.push({
          x: e.player.x,
          y: e.player.y + e.player.size,
          vx: (Math.random() - 0.5) * 4 - 2,
          vy: Math.random() * 2 + 1,
          life: 1,
          color: '#C8FF3D',
        });
      }
    }
  }, [gameState, playSound]);

  // Spacebar and ArrowUp keyboard controls for zero-latency jumping
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.key === ' ' || e.code === 'ArrowUp') {
        e.preventDefault();
        triggerJump();
      } else if (e.code === 'KeyP') {
        setGameState((prev) => (prev === 'playing' ? 'paused' : prev === 'paused' ? 'playing' : prev));
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [triggerJump]);

  // Start / Restart game at Level 1
  const startNewRun = useCallback(() => {
    const e = engineRef.current;
    const ground = e.groundY || window.innerHeight - 110;

    e.player = {
      x: 100,
      y: ground - 34,
      size: 34,
      vy: 0,
      isGrounded: true,
      rotation: 0,
    };
    e.cameraX = 0;
    e.baseSpeed = diffConfig.baseSpeed;
    e.speed = diffConfig.baseSpeed;
    e.score = 0;
    e.distance = 0;
    e.orbPoints = 0;
    e.particles = [];
    e.obstacles = generateLevelCourse(ground);

    setScore(0);
    setDistanceDisplay(0);
    setCurrentLevel(1);
    setGameState('playing');
  }, [diffConfig.baseSpeed, generateLevelCourse]);

  // Player confirmed name
  const handleConfirmName = async (name: string) => {
    setConfirmedNickname(name);
    try {
      const p = await getOrCreateParticipant('practice-session', name);
      setActiveParticipantId(p.id);
    } catch {
      setActiveParticipantId(`p-${Date.now()}`);
    }
    setNameModalOpen(false);
    startNewRun();
  };

  // Game over handler
  const handleGameOver = useCallback(
    (finalScore: number, finalDist: number) => {
      playSound('wrong');
      setGameState('gameover');

      if (finalScore > personalBest) {
        setPersonalBest(finalScore);
      }

      const pId = activeParticipantId || `p-${Date.now()}`;
      const pName = confirmedNickname || 'Player';

      saveGameAttempt({
        id: `att-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        eventId: null,
        participantId: pId,
        nickname: pName,
        gameId: 'pulse-jumper',
        puzzleId: 'PJ-RHYTHM-LEVEL-1',
        difficulty: 'medium',
        isCorrect: finalScore > 300,
        score: finalScore,
        basePoints: finalScore,
        timeRemainingSeconds: 0,
        timeBonusPoints: 0,
        hintsUsed: 0,
        hintPenaltyPoints: 0,
        elapsedSeconds: Math.floor(finalDist / 100),
        totalRoundSeconds: 120,
        completedAt: new Date().toISOString(),
        isPractice: true,
      }).catch(console.error);
    },
    [activeParticipantId, confirmedNickname, personalBest, playSound]
  );

  // Key listeners (Space / Up / W for jump, Esc / P for pause)
  useEffect(() => {
    const handleKeyDown = (evt: KeyboardEvent) => {
      if (nameModalOpen) return;

      if (evt.code === 'Space' || evt.code === 'ArrowUp' || evt.code === 'KeyW') {
        evt.preventDefault();
        triggerJump();
      } else if (evt.code === 'KeyP' || evt.code === 'Escape') {
        evt.preventDefault();
        setGameState((prev) => (prev === 'playing' ? 'paused' : prev === 'paused' ? 'playing' : prev));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [nameModalOpen, triggerJump]);

  // 60 FPS Delta-Time Canvas Game Loop
  useEffect(() => {
    if (gameState !== 'playing') return;

    let isRunning = true;
    let lastTime = performance.now();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const gameLoop = (currentTime: number) => {
      if (!isRunning) return;

      // Delta time calculation with strict clamp (prevents huge jump after tab switch)
      let dt = (currentTime - lastTime) / 1000;
      lastTime = currentTime;
      if (dt > 0.04) dt = 0.04; // Clamp lag/frame drop to 40ms max

      const step = dt * 60; // 1.0 unit per 60fps frame
      const e = engineRef.current;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const width = e.canvasWidth;
      const height = e.canvasHeight;
      const groundY = e.groundY;

      // Gradually increase speed based on distance and difficulty
      e.speed = Math.min(e.baseSpeed + e.distance * 0.00018, diffConfig.maxSpeed);

      // Advance camera and player forward
      const forwardStep = e.speed * step;
      e.player.x += forwardStep;
      e.distance += forwardStep;
      e.cameraX = e.player.x - 140;

      // Level progression check
      const computedLevel = 1 + Math.floor(e.distance / 3500);
      if (computedLevel !== currentLevel) {
        setCurrentLevel(computedLevel);
      }

      // 128 BPM Synth Beat Pulse
      if (currentTime - e.lastBeatTime > e.beatInterval) {
        e.lastBeatTime = currentTime;
        e.pulseScale = 1.35;
        playBeatPulse();
      } else {
        e.pulseScale = Math.max(1, e.pulseScale - 0.04 * step);
      }

      // Player Vertical Physics (Gravity & Jump)
      e.player.vy += e.gravity * step;
      e.player.y += e.player.vy * step;

      // Floor Collision
      if (e.player.y >= groundY - e.player.size) {
        e.player.y = groundY - e.player.size;
        e.player.vy = 0;
        e.player.isGrounded = true;
        // Snap rotation to upright when landing
        e.player.rotation = Math.round(e.player.rotation / (Math.PI / 2)) * (Math.PI / 2);
      } else {
        e.player.isGrounded = false;
        // Smooth rotation while mid-air
        e.player.rotation += 0.08 * step;
      }

      // Check Obstacle Collisions & Platforms
      const px = e.player.x;
      const py = e.player.y;
      const pSize = e.player.size;

      for (let i = 0; i < e.obstacles.length; i++) {
        const obs = e.obstacles[i];

        // Only test active nearby obstacles
        if (obs.x < e.cameraX - 100 || obs.x > e.cameraX + width + 100) continue;

        if (obs.type === 'spike') {
          // Precise triangular hitbox
          const inset = 6;
          const left = obs.x + inset;
          const right = obs.x + obs.width - inset;
          const top = obs.y + inset;

          if (px + pSize > left && px < right && py + pSize > top) {
            // Collision!
            const finalScore = Math.floor(e.distance / 8) + e.orbPoints;
            handleGameOver(finalScore, e.distance);
            return;
          }
        } else if (obs.type === 'block') {
          // Solid block collision
          if (
            px + pSize > obs.x + 4 &&
            px < obs.x + obs.width - 4 &&
            py + pSize > obs.y &&
            py < obs.y + obs.height
          ) {
            // If hitting the top of the block while falling downward
            if (e.player.vy > 0 && py + pSize - e.player.vy <= obs.y + 10) {
              e.player.y = obs.y - pSize;
              e.player.vy = 0;
              e.player.isGrounded = true;
            } else {
              // Side collision -> Game Over
              const finalScore = Math.floor(e.distance / 8) + e.orbPoints;
              handleGameOver(finalScore, e.distance);
              return;
            }
          }
        } else if (obs.type === 'platform') {
          // Thin jump-through platform
          if (
            px + pSize > obs.x &&
            px < obs.x + obs.width &&
            py + pSize >= obs.y &&
            py + pSize <= obs.y + 14 &&
            e.player.vy >= 0
          ) {
            e.player.y = obs.y - pSize;
            e.player.vy = 0;
            e.player.isGrounded = true;
          }
        } else if (obs.type === 'orb' && !obs.collected) {
          // Collecting energy orb
          const orbCenterX = obs.x + obs.width / 2;
          const orbCenterY = obs.y + obs.height / 2;
          const dist = Math.hypot(px + pSize / 2 - orbCenterX, py + pSize / 2 - orbCenterY);

          if (dist < 32) {
            obs.collected = true;
            e.orbPoints += 150;
            playSound('correct');
            // Particle burst
            for (let k = 0; k < 8; k++) {
              e.particles.push({
                x: orbCenterX,
                y: orbCenterY,
                vx: (Math.random() - 0.5) * 6,
                vy: (Math.random() - 0.5) * 6,
                life: 1,
                color: '#C8FF3D',
              });
            }
          }
        }
      }

      // Update UI score every few frames with difficulty multiplier
      const currentCalculatedScore = Math.floor(((e.distance / 8) + e.orbPoints) * diffConfig.multiplier);
      setScore(currentCalculatedScore);
      setDistanceDisplay(Math.floor(e.distance / 10));

      // -------------------------------------------------------------
      // RENDERING CANVAS (High-DPI scaled)
      // -------------------------------------------------------------
      ctx.save();
      ctx.scale(dpr, dpr);
      ctx.clearRect(0, 0, width, height);

      // Deep Neo-Arcade Backdrop
      ctx.fillStyle = '#0D1017';
      ctx.fillRect(0, 0, width, height);

      // Horizon Pulse Wave Line
      ctx.strokeStyle = '#1E2333';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, groundY - 120);
      ctx.lineTo(width, groundY - 120);
      ctx.stroke();

      // Camera Offset Transform
      ctx.save();
      ctx.translate(-e.cameraX, 0);

      // Draw Grid Flooring
      ctx.fillStyle = '#161A24';
      ctx.fillRect(e.cameraX, groundY, width, height - groundY);

      // Neon Top Border Line with Beat Pulse
      ctx.strokeStyle = '#C8FF3D';
      ctx.lineWidth = 3;
      ctx.shadowColor = '#C8FF3D';
      ctx.shadowBlur = 10 * e.pulseScale;
      ctx.beginPath();
      ctx.moveTo(e.cameraX, groundY);
      ctx.lineTo(e.cameraX + width, groundY);
      ctx.stroke();
      ctx.shadowBlur = 0;

      // Render Obstacles
      for (let i = 0; i < e.obstacles.length; i++) {
        const obs = e.obstacles[i];
        if (obs.x < e.cameraX - 60 || obs.x > e.cameraX + width + 60) continue;

        if (obs.type === 'spike') {
          // Sharp neon spike
          ctx.fillStyle = '#FF647C';
          ctx.strokeStyle = '#FFFFFF';
          ctx.lineWidth = 1.5;
          ctx.shadowColor = '#FF647C';
          ctx.shadowBlur = 8 * e.pulseScale;
          ctx.beginPath();
          ctx.moveTo(obs.x, obs.y + obs.height);
          ctx.lineTo(obs.x + obs.width / 2, obs.y);
          ctx.lineTo(obs.x + obs.width, obs.y + obs.height);
          ctx.closePath();
          ctx.fill();
          ctx.stroke();
          ctx.shadowBlur = 0;
        } else if (obs.type === 'block') {
          ctx.fillStyle = '#1E2436';
          ctx.strokeStyle = '#9B6BFF';
          ctx.lineWidth = 2;
          ctx.shadowColor = '#9B6BFF';
          ctx.shadowBlur = 10 * e.pulseScale;
          ctx.fillRect(obs.x, obs.y, obs.width, obs.height);
          ctx.strokeRect(obs.x, obs.y, obs.width, obs.height);
          ctx.shadowBlur = 0;
        } else if (obs.type === 'platform') {
          ctx.fillStyle = '#202638';
          ctx.strokeStyle = '#C8FF3D';
          ctx.lineWidth = 2;
          ctx.fillRect(obs.x, obs.y, obs.width, obs.height);
          ctx.strokeRect(obs.x, obs.y, obs.width, obs.height);
        } else if (obs.type === 'orb' && !obs.collected) {
          ctx.fillStyle = '#C8FF3D';
          ctx.shadowColor = '#C8FF3D';
          ctx.shadowBlur = 14 * e.pulseScale;
          ctx.beginPath();
          ctx.arc(obs.x + obs.width / 2, obs.y + obs.height / 2, obs.width / 2, 0, Math.PI * 2);
          ctx.fill();
          ctx.shadowBlur = 0;
        }
      }

      // Render Spark Particles
      for (let i = e.particles.length - 1; i >= 0; i--) {
        const p = e.particles[i];
        p.x += p.vx * step;
        p.y += p.vy * step;
        p.life -= 0.03 * step;
        if (p.life <= 0) {
          e.particles.splice(i, 1);
          continue;
        }
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.life;
        ctx.fillRect(p.x, p.y, 4, 4);
        ctx.globalAlpha = 1;
      }

      // Render Player Cube
      ctx.save();
      const centerX = e.player.x + e.player.size / 2;
      const centerY = e.player.y + e.player.size / 2;
      ctx.translate(centerX, centerY);
      ctx.rotate(e.player.rotation);

      // Neon Cube Outer Body
      ctx.fillStyle = '#C8FF3D';
      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = 2;
      ctx.shadowColor = '#C8FF3D';
      ctx.shadowBlur = 14 * e.pulseScale;
      ctx.fillRect(-e.player.size / 2, -e.player.size / 2, e.player.size, e.player.size);
      ctx.strokeRect(-e.player.size / 2, -e.player.size / 2, e.player.size, e.player.size);

      // Inner Core
      ctx.fillStyle = '#101116';
      ctx.fillRect(-7, -7, 14, 14);
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(-3, -3, 6, 6);

      ctx.restore(); // Restore player
      ctx.restore(); // Restore camera
      ctx.restore(); // Restore dpr

      e.animationFrameId = requestAnimationFrame(gameLoop);
    };

    engineRef.current.animationFrameId = requestAnimationFrame(gameLoop);

    return () => {
      isRunning = false;
      cancelAnimationFrame(engineRef.current.animationFrameId);
    };
  }, [gameState, handleGameOver, playBeatPulse, playSound, currentLevel]);

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 w-screen h-screen z-50 bg-[#0B0D13] flex flex-col select-none overflow-hidden touch-none"
    >
      {/* Player Confirmation Modal */}
      <PlayerNameModal
        isOpen={nameModalOpen}
        gameTitle="Pulse Jumper"
        onConfirm={handleConfirmName}
        onCancel={() => {
          setNameModalOpen(false);
          onExit();
        }}
      />

      {/* TOP HUD BAR */}
      <header className="absolute top-0 left-0 right-0 z-30 h-16 px-4 sm:px-6 flex items-center justify-between bg-black/60 backdrop-blur-md border-b border-neo-border">
        {/* Left: Exit & Title */}
        <div className="flex items-center gap-3">
          <button
            onClick={onExit}
            className="p-2.5 rounded-xl bg-neo-surface hover:bg-neo-cardHover border border-neo-border text-neo-secondary hover:text-white transition-colors"
            title="Exit to Games"
            aria-label="Exit Game"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-black font-mono text-white tracking-wider uppercase">
                PULSE JUMPER
              </h1>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-neo-lime/15 text-neo-lime border border-neo-lime/30 uppercase">
                Level {currentLevel}
              </span>
              <span
                className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase border"
                style={{
                  color: diffConfig.color,
                  borderColor: diffConfig.color,
                  backgroundColor: diffConfig.bg,
                }}
              >
                {diffConfig.label} ({diffConfig.multiplier}x)
              </span>
            </div>
            <span className="text-[10px] font-mono text-neo-secondary hidden sm:inline">
              128 BPM Synth Runner • Tap or Space to Jump
            </span>
          </div>
        </div>

        {/* Center: Live Score & Distance */}
        <div className="flex items-center gap-4 font-mono">
          <div className="text-right">
            <span className="text-[10px] text-neo-secondary uppercase block leading-none">Score</span>
            <span className="text-xl sm:text-2xl font-black text-neo-lime leading-tight">{score}</span>
          </div>
          <div className="text-right hidden sm:block">
            <span className="text-[10px] text-neo-secondary uppercase block leading-none">Distance</span>
            <span className="text-lg font-black text-white leading-tight">{distanceDisplay}m</span>
          </div>
        </div>

        {/* Right: Pause & Leaderboard */}
        <div className="flex items-center gap-2">
          {typeof personalBest === 'number' && personalBest > 0 && (
            <div className="text-right mr-1 hidden md:block font-mono">
              <span className="text-[9px] text-neo-secondary block uppercase leading-none">Best</span>
              <span className="text-xs font-black text-neo-lime leading-tight">{personalBest}</span>
            </div>
          )}

          <button
            onClick={() => setLeaderboardOpen(true)}
            className="p-2.5 rounded-xl bg-neo-surface hover:bg-neo-cardHover border border-neo-border text-amber-400 transition-colors"
            title="Pulse Jumper Leaderboard"
            aria-label="Open Leaderboard"
          >
            <Trophy className="w-4 h-4" />
          </button>

          {gameState === 'playing' ? (
            <button
              onClick={() => setGameState('paused')}
              className="p-2.5 rounded-xl bg-neo-surface hover:bg-neo-cardHover border border-neo-border text-white transition-colors"
              title="Pause Game"
              aria-label="Pause Game"
            >
              <Pause className="w-4 h-4" />
            </button>
          ) : gameState === 'paused' ? (
            <button
              onClick={() => setGameState('playing')}
              className="p-2.5 rounded-xl bg-neo-lime text-slate-950 font-bold transition-colors"
              title="Resume Game"
              aria-label="Resume Game"
            >
              <Play className="w-4 h-4 fill-current" />
            </button>
          ) : null}
        </div>
      </header>

      {/* FULL-VIEWPORT GAME CANVAS with zero-latency onPointerDown */}
      <div
        className="flex-1 w-full h-full relative cursor-pointer touch-none"
        onPointerDown={(e) => {
          e.preventDefault();
          triggerJump();
        }}
      >
        <canvas ref={canvasRef} className="w-full h-full block" />

        {/* Overlay: Game Over */}
        {gameState === 'gameover' && (
          <div
            className="absolute inset-0 bg-black/85 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center animate-fadeIn z-40"
            onClick={(e) => e.stopPropagation()}
            onPointerDown={(e) => e.stopPropagation()}
          >
            <span className="text-neo-coral text-xs font-mono font-bold uppercase tracking-widest mb-1">
              Collision Detected
            </span>
            <h2 className="text-3xl sm:text-4xl font-black font-mono text-white mb-2 uppercase">
              RUN TERMINATED
            </h2>

            <div className="flex items-center gap-4 my-5 font-mono text-xs">
              <div className="p-3.5 rounded-2xl bg-neo-surface border border-neo-border">
                <span className="text-neo-secondary block text-[10px] uppercase">Final Score</span>
                <span className="text-2xl font-black text-neo-lime">{score}</span>
              </div>
              <div className="p-3.5 rounded-2xl bg-neo-surface border border-neo-border">
                <span className="text-neo-secondary block text-[10px] uppercase">Distance</span>
                <span className="text-2xl font-black text-white">{distanceDisplay}m</span>
              </div>
              <div className="p-3.5 rounded-2xl bg-neo-surface border border-neo-border">
                <span className="text-neo-secondary block text-[10px] uppercase">Personal Best</span>
                <span className="text-2xl font-black text-neo-purple">
                  {Math.max(score, personalBest)}
                </span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={startNewRun}
                className="flex items-center justify-center gap-2 px-7 py-3.5 rounded-2xl bg-neo-lime text-slate-950 font-mono font-black text-sm shadow-neo-lime hover:bg-lime-300 transition-all active:scale-95 cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
                <span>INSTANT RETRY</span>
              </button>

              <button
                onClick={onExit}
                className="flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-[#0D0D22] hover:bg-[#1C1C3A] border border-[#FF2E97] text-[#FF2E97] hover:text-white font-mono font-bold text-xs transition-all active:scale-95 cursor-pointer shadow-[0_0_16px_rgba(255,46,151,0.25)]"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>BACK TO GAMES</span>
              </button>

              <button
                onClick={() => setLeaderboardOpen(true)}
                className="flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-neo-surface hover:bg-neo-cardHover border border-neo-border text-white font-mono font-bold text-xs transition-all cursor-pointer"
              >
                <Trophy className="w-4 h-4 text-amber-400" />
                <span>VIEW LEADERBOARD</span>
              </button>
            </div>
          </div>
        )}

        {/* Overlay: Paused */}
        {gameState === 'paused' && (
          <div
            className="absolute inset-0 bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center animate-fadeIn z-40"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-3xl font-black font-mono text-white mb-2 uppercase">GAME PAUSED</h2>
            <p className="text-xs font-mono text-neo-secondary mb-6">Press P or Resume to continue your run</p>
            <button
              onClick={() => setGameState('playing')}
              className="flex items-center gap-2 px-8 py-3.5 rounded-2xl bg-neo-lime text-slate-950 font-mono font-bold text-sm shadow-neo-lime hover:bg-lime-300 transition-all active:scale-95"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>RESUME RUN</span>
            </button>
          </div>
        )}

        {/* Mobile On-Screen Jump Bar */}
        <div
          className="absolute bottom-4 left-4 right-4 z-20 sm:hidden"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onTouchStart={(e) => {
              e.preventDefault();
              triggerJump();
            }}
            onClick={triggerJump}
            className="w-full py-4 rounded-2xl font-black font-mono text-sm tracking-widest bg-neo-lime text-slate-950 shadow-neo-lime active:scale-95 select-none touch-none"
          >
            TAP TO JUMP
          </button>
        </div>
      </div>

      {/* Dedicated Independent Leaderboard Modal */}
      <GameLeaderboardModal
        gameId="pulse-jumper"
        gameTitle="Pulse Jumper"
        isOpen={leaderboardOpen}
        onClose={() => setLeaderboardOpen(false)}
        currentParticipantId={activeParticipantId}
      />
    </div>
  );
};
