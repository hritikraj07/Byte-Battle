'use client';

import React, { useRef, useEffect, useState, useCallback } from 'react';
import { ArrowLeft, Trophy, RotateCcw, Play, Pause, Fuel, Coins, HelpCircle, Camera, Flame, Disc } from 'lucide-react';
import { CameraPreview } from './CameraPreview';
import { DetectedGesture } from '@/services/gestureDetector';
import { GameLeaderboardModal } from '@/components/leaderboard/GameLeaderboardModal';
import { PlayerNameModal } from '@/components/common/PlayerNameModal';
import { useAudio } from '@/hooks/useAudio';
import { saveGameAttempt, db, getOrCreateParticipant } from '@/services/db';

interface PalmDriveArenaProps {
  difficulty?: 'easy' | 'medium' | 'hard';
  onExit?: () => void;
}

interface Collectible {
  x: number;
  y: number;
  type: 'coin' | 'fuel';
  collected: boolean;
}

export const PalmDriveArena: React.FC<PalmDriveArenaProps> = ({
  difficulty = 'easy',
  onExit = () => window.history.back(),
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const { playSound } = useAudio();

  // Player Name Confirmation State
  const [confirmedNickname, setConfirmedNickname] = useState<string>('');
  const [activeParticipantId, setActiveParticipantId] = useState<string>('');
  const [nameModalOpen, setNameModalOpen] = useState(false);

  const [cameraEnabled, setCameraEnabled] = useState(false);
  const [activeGesture, setActiveGesture] = useState<DetectedGesture>('none');
  const [gameState, setGameState] = useState<'menu' | 'playing' | 'paused' | 'gameover'>('menu');
  const [gameOverReason, setGameOverReason] = useState<string>('');
  const [distance, setDistance] = useState(0);
  const [coins, setCoins] = useState(0);
  const [fuel, setFuel] = useState(100);
  const [personalBest, setPersonalBest] = useState(0);
  const [leaderboardOpen, setLeaderboardOpen] = useState(false);
  const [showHowToPlay, setShowHowToPlay] = useState(false);

  // Pedal visual state for UI feedback
  const [isGasPressed, setIsGasPressed] = useState(false);
  const [isBrakePressed, setIsBrakePressed] = useState(false);

  // Manual input state (keyboard or touch pedals)
  const manualInputRef = useRef({
    accelerate: false,
    brake: false,
  });

  // Pure canvas driving physics engine
  const engineRef = useRef({
    car: {
      x: 100,
      y: 200,
      vx: 0,
      vy: 0,
      angle: 0,
      omega: 0,
      width: 52,
      height: 24,
      wheelRadius: 11,
    },
    cameraX: 0,
    fuel: 100,
    distance: 0,
    coins: 0,
    collectibles: [] as Collectible[],
    terrainSeed: 42,
    animationFrameId: 0,
    canvasWidth: 800,
    canvasHeight: 500,
  });

  // Smooth undulating terrain height function
  const getTerrainHeight = useCallback((x: number) => {
    return (
      (engineRef.current.canvasHeight ? engineRef.current.canvasHeight - 160 : 380) +
      Math.sin(x * 0.0022) * 65 +
      Math.cos(x * 0.0055) * 35 +
      Math.sin(x * 0.011) * 16
    );
  }, []);

  // Prompt for player name before gameplay begins
  useEffect(() => {
    if (!confirmedNickname) {
      const remembered = typeof window !== 'undefined' ? localStorage.getItem('bytebattle_remembered_nickname') || '' : '';
      if (remembered) {
        setConfirmedNickname(remembered);
      }
      setNameModalOpen(true);
    }
  }, [confirmedNickname]);

  // Load personal best
  useEffect(() => {
    async function loadBest() {
      try {
        const pId = activeParticipantId || 'practice-user';
        const pb = await db.personalBests
          .where(['participantId', 'gameId'])
          .equals([pId, 'palmdrive-rally'])
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
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Neutralize inputs on window blur or tab switch
  useEffect(() => {
    const handleBlur = () => {
      manualInputRef.current.accelerate = false;
      manualInputRef.current.brake = false;
      setIsGasPressed(false);
      setIsBrakePressed(false);
    };

    window.addEventListener('blur', handleBlur);
    return () => window.removeEventListener('blur', handleBlur);
  }, []);

  // Initialize collectibles along terrain
  const initCollectibles = useCallback(() => {
    const list: Collectible[] = [];
    for (let x = 400; x < 25000; x += 340) {
      const type = Math.random() < 0.25 ? 'fuel' : 'coin';
      const ty = getTerrainHeight(x);
      list.push({
        x,
        y: ty - (type === 'fuel' ? 40 : 30),
        type,
        collected: false,
      });
    }
    return list;
  }, [getTerrainHeight]);

  // Start / Restart driving run
  const startGame = useCallback(() => {
    const e = engineRef.current;
    const startY = getTerrainHeight(100) - 40;

    e.car = {
      x: 100,
      y: startY,
      vx: 0,
      vy: 0,
      angle: 0,
      omega: 0,
      width: 52,
      height: 24,
      wheelRadius: 11,
    };
    e.cameraX = 0;
    e.fuel = 100;
    e.distance = 0;
    e.coins = 0;
    e.collectibles = initCollectibles();

    manualInputRef.current.accelerate = false;
    manualInputRef.current.brake = false;
    setIsGasPressed(false);
    setIsBrakePressed(false);

    setDistance(0);
    setCoins(0);
    setFuel(100);
    setGameState('playing');
  }, [getTerrainHeight, initCollectibles]);

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
    startGame();
  };

  // Handle game over
  const handleGameOver = useCallback(
    (reason: string) => {
      setGameOverReason(reason);
      setGameState('gameover');
      playSound('wrong');

      const finalScore = Math.floor(engineRef.current.distance) + engineRef.current.coins;
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
        gameId: 'palmdrive-rally',
        puzzleId: 'NRR-RIDGE-RUN',
        difficulty: 'medium',
        isCorrect: finalScore > 400,
        score: finalScore,
        basePoints: finalScore,
        timeRemainingSeconds: 0,
        timeBonusPoints: 0,
        hintsUsed: 0,
        hintPenaltyPoints: 0,
        elapsedSeconds: Math.floor(finalScore / 30),
        totalRoundSeconds: 120,
        completedAt: new Date().toISOString(),
        isPractice: true,
      }).catch(console.error);
    },
    [activeParticipantId, confirmedNickname, personalBest, playSound]
  );

  // Keyboard controls listener (ArrowRight / D for gas, ArrowLeft / A / Space for brake)
  useEffect(() => {
    const handleKeyDown = (evt: KeyboardEvent) => {
      if (nameModalOpen) return;

      if (evt.code === 'ArrowRight' || evt.code === 'KeyD') {
        manualInputRef.current.accelerate = true;
        setIsGasPressed(true);
      } else if (evt.code === 'ArrowLeft' || evt.code === 'KeyA' || evt.code === 'Space') {
        manualInputRef.current.brake = true;
        setIsBrakePressed(true);
      } else if (evt.code === 'KeyP' || evt.code === 'Escape') {
        evt.preventDefault();
        setGameState((prev) => (prev === 'playing' ? 'paused' : prev === 'paused' ? 'playing' : prev));
      }
    };

    const handleKeyUp = (evt: KeyboardEvent) => {
      if (evt.code === 'ArrowRight' || evt.code === 'KeyD') {
        manualInputRef.current.accelerate = false;
        setIsGasPressed(false);
      } else if (evt.code === 'ArrowLeft' || evt.code === 'KeyA' || evt.code === 'Space') {
        manualInputRef.current.brake = false;
        setIsBrakePressed(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [nameModalOpen]);

  // 60 FPS 2D Physics Loop with Delta Time Clamping
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

      let dt = (currentTime - lastTime) / 1000;
      lastTime = currentTime;
      if (dt > 0.04) dt = 0.04; // clamp frame drops
      const step = dt * 60; // 1.0 unit per 60fps frame

      const e = engineRef.current;
      const c = e.car;
      const width = e.canvasWidth;
      const height = e.canvasHeight;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);

      // Determine Driving Inputs (Pedals or Optional Camera Gesture)
      const isGasActive = manualInputRef.current.accelerate || (cameraEnabled && activeGesture === 'open_palm');
      const isBrakeActive = manualInputRef.current.brake || (cameraEnabled && activeGesture === 'closed_fist');

      // Vehicle Drive Dynamics
      if (isGasActive && e.fuel > 0) {
        c.vx += Math.cos(c.angle) * 0.42 * step;
        c.vy += Math.sin(c.angle) * 0.42 * step;
        e.fuel = Math.max(0, e.fuel - 0.07 * step);
      }

      if (isBrakeActive) {
        // Active reverse braking torque
        c.vx -= Math.cos(c.angle) * 0.32 * step;
        c.vy -= Math.sin(c.angle) * 0.32 * step;
      }

      // Environmental Gravity & Aerodynamic Drag
      c.vy += 0.38 * step;
      c.vx *= Math.pow(0.985, step);
      c.vy *= Math.pow(0.985, step);
      c.omega *= Math.pow(0.92, step);

      // Airborne rotation control
      if (isGasActive) c.omega += 0.008 * step;
      if (isBrakeActive) c.omega -= 0.008 * step;

      // Position Integration
      c.x += c.vx * step;
      c.y += c.vy * step;
      c.angle += c.omega * step;

      // Terrain Contact / Suspension Physics
      const terrainY = getTerrainHeight(c.x);
      const groundOffset = terrainY - c.wheelRadius;

      if (c.y >= groundOffset) {
        c.y = groundOffset;

        // Sample slope tangent
        const slopeDx = 16;
        const yBefore = getTerrainHeight(c.x - slopeDx);
        const yAfter = getTerrainHeight(c.x + slopeDx);
        const slopeAngle = Math.atan2(yAfter - yBefore, slopeDx * 2);

        // Ground friction & slope alignment torque
        const angleDiff = slopeAngle - c.angle;
        c.omega += angleDiff * 0.14 * step;
        c.vy = (yAfter - yBefore) * 0.06 * c.vx;

        // Flip detection: vehicle flipped upside down
        const normalizedAngle = ((c.angle % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);
        if (normalizedAngle > Math.PI * 0.65 && normalizedAngle < Math.PI * 1.35) {
          handleGameOver('Vehicle Overturned on Hill');
          return;
        }
      }

      // Out of Fuel Check
      if (e.fuel <= 0 && Math.abs(c.vx) < 0.25) {
        handleGameOver('Fuel Tank Depleted');
        return;
      }

      // Distance & Camera Tracking
      e.distance = Math.max(e.distance, Math.floor(c.x / 10));
      e.cameraX = c.x - 200;

      // Collectibles Collision Check
      for (let i = 0; i < e.collectibles.length; i++) {
        const item = e.collectibles[i];
        if (item.collected) continue;

        const dist = Math.hypot(c.x - item.x, c.y - item.y);
        if (dist < 42) {
          item.collected = true;
          if (item.type === 'coin') {
            e.coins += 50;
            playSound('correct');
          } else if (item.type === 'fuel') {
            e.fuel = Math.min(100, e.fuel + 45);
            playSound('win');
          }
        }
      }

      // Update UI Telemetry
      setDistance(Math.floor(e.distance));
      setCoins(e.coins);
      setFuel(Math.round(e.fuel));

      // -------------------------------------------------------------
      // RENDER FULL-VIEWPORT CANVAS
      // -------------------------------------------------------------
      ctx.save();
      ctx.scale(dpr, dpr);
      ctx.clearRect(0, 0, width, height);

      // Neo-Arcade Night Sky Backdrop
      const skyGrad = ctx.createLinearGradient(0, 0, 0, height);
      skyGrad.addColorStop(0, '#0D111A');
      skyGrad.addColorStop(0.6, '#171424');
      skyGrad.addColorStop(1, '#0F0E17');
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, width, height);

      // Starfield
      ctx.fillStyle = '#FFFFFF';
      for (let s = 0; s < 25; s++) {
        const sx = ((s * 97) % width);
        const sy = ((s * 43) % (height * 0.5));
        ctx.fillRect(sx, sy, 1.5, 1.5);
      }

      // Camera Offset Transform
      ctx.save();
      ctx.translate(-e.cameraX, 0);

      // Draw Undulating Hill Terrain
      ctx.beginPath();
      const startX = Math.floor(e.cameraX - 100);
      const endX = Math.ceil(e.cameraX + width + 100);
      ctx.moveTo(startX, getTerrainHeight(startX));

      for (let tx = startX; tx <= endX; tx += 12) {
        ctx.lineTo(tx, getTerrainHeight(tx));
      }
      ctx.lineTo(endX, height + 100);
      ctx.lineTo(startX, height + 100);
      ctx.closePath();

      // Hill Body Fill
      const hillGrad = ctx.createLinearGradient(0, height - 200, 0, height);
      hillGrad.addColorStop(0, '#21293B');
      hillGrad.addColorStop(1, '#0E1119');
      ctx.fillStyle = hillGrad;
      ctx.fill();

      // Glowing Hill Crest Edge Line
      ctx.strokeStyle = '#9B6BFF';
      ctx.lineWidth = 3;
      ctx.shadowColor = '#9B6BFF';
      ctx.shadowBlur = 10;
      ctx.stroke();
      ctx.shadowBlur = 0;

      // Draw Collectibles
      for (let i = 0; i < e.collectibles.length; i++) {
        const item = e.collectibles[i];
        if (item.collected) continue;
        if (item.x < e.cameraX - 50 || item.x > e.cameraX + width + 50) continue;

        if (item.type === 'coin') {
          ctx.fillStyle = '#C8FF3D';
          ctx.strokeStyle = '#FFFFFF';
          ctx.lineWidth = 1.5;
          ctx.shadowColor = '#C8FF3D';
          ctx.shadowBlur = 10;
          ctx.beginPath();
          ctx.arc(item.x, item.y, 10, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();
          ctx.shadowBlur = 0;
        } else if (item.type === 'fuel') {
          ctx.fillStyle = '#FF647C';
          ctx.strokeStyle = '#FFFFFF';
          ctx.lineWidth = 1.5;
          ctx.shadowColor = '#FF647C';
          ctx.shadowBlur = 12;
          ctx.fillRect(item.x - 10, item.y - 14, 20, 26);
          ctx.strokeRect(item.x - 10, item.y - 14, 20, 26);
          ctx.shadowBlur = 0;
        }
      }

      // Render Player Vehicle Buggy
      ctx.save();
      ctx.translate(c.x, c.y);
      ctx.rotate(c.angle);

      // Chassis Rollcage
      ctx.strokeStyle = '#9B6BFF';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(-18, -6);
      ctx.lineTo(-8, -20);
      ctx.lineTo(12, -20);
      ctx.lineTo(24, -6);
      ctx.stroke();

      // Buggy Body
      ctx.fillStyle = '#C8FF3D';
      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = 1.5;
      ctx.shadowColor = '#C8FF3D';
      ctx.shadowBlur = 12;
      ctx.beginPath();
      ctx.moveTo(-28, 4);
      ctx.lineTo(-24, -8);
      ctx.lineTo(26, -8);
      ctx.lineTo(32, 4);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.shadowBlur = 0;

      // Headlight Beam
      ctx.fillStyle = 'rgba(200, 255, 61, 0.2)';
      ctx.beginPath();
      ctx.moveTo(30, -4);
      ctx.lineTo(130, -25);
      ctx.lineTo(140, 20);
      ctx.closePath();
      ctx.fill();

      // Wheels
      const drawWheel = (wx: number, wy: number) => {
        ctx.fillStyle = '#141722';
        ctx.strokeStyle = '#FF647C';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.arc(wx, wy, c.wheelRadius, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.arc(wx, wy, 3, 0, Math.PI * 2);
        ctx.fill();
      };

      drawWheel(-18, 10);
      drawWheel(18, 10);

      ctx.restore(); // Restore Car
      ctx.restore(); // Restore Camera
      ctx.restore(); // Restore DPR

      e.animationFrameId = requestAnimationFrame(gameLoop);
    };

    engineRef.current.animationFrameId = requestAnimationFrame(gameLoop);

    return () => {
      isRunning = false;
      cancelAnimationFrame(engineRef.current.animationFrameId);
    };
  }, [cameraEnabled, activeGesture, gameState, getTerrainHeight, handleGameOver, playSound]);

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 w-screen h-screen z-50 bg-[#0A0D14] flex flex-col select-none overflow-hidden touch-none"
    >
      {/* Player Confirmation Modal */}
      <PlayerNameModal
        isOpen={nameModalOpen}
        gameTitle="Neon Ridge Rally"
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
                NEON RIDGE RALLY
              </h1>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-neo-purple/20 text-neo-purple border border-neo-purple/30 uppercase">
                Hill Physics
              </span>
            </div>
            <span className="text-[10px] font-mono text-neo-secondary hidden sm:inline">
              Gas (Right) • Brake (Left) • Arrow Keys or Touch Pedals
            </span>
          </div>
        </div>

        {/* Center: Live Telemetry */}
        <div className="flex items-center gap-3 sm:gap-5 font-mono text-xs">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-neo-bg border border-neo-border">
            <Fuel className={`w-3.5 h-3.5 ${fuel <= 20 ? 'text-neo-coral animate-pulse' : 'text-neo-coral'}`} />
            <span className="font-bold text-white">{fuel}%</span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-neo-bg border border-neo-border">
            <Coins className="w-3.5 h-3.5 text-neo-lime" />
            <span className="font-bold text-neo-lime">{coins}</span>
          </div>
          <div className="text-right">
            <span className="text-[9px] text-neo-secondary uppercase block leading-none">Distance</span>
            <span className="text-lg font-black text-white leading-tight">{distance}m</span>
          </div>
        </div>

        {/* Right: Camera Toggle, Leaderboard, Pause */}
        <div className="flex items-center gap-2">
          {typeof personalBest === 'number' && personalBest > 0 && (
            <div className="text-right mr-1 hidden md:block font-mono">
              <span className="text-[9px] text-neo-secondary block uppercase leading-none">Best</span>
              <span className="text-xs font-black text-neo-lime leading-tight">{personalBest}</span>
            </div>
          )}

          {/* Optional Camera Gesture Toggle */}
          <button
            onClick={() => setCameraEnabled((prev) => !prev)}
            className={`p-2.5 rounded-xl border transition-colors ${
              cameraEnabled
                ? 'bg-neo-purple/30 border-neo-purple text-neo-purple'
                : 'bg-neo-surface border-neo-border text-neo-secondary hover:text-white'
            }`}
            title={cameraEnabled ? 'Disable Camera Tracking' : 'Enable Optional Gesture Camera'}
            aria-label="Toggle Camera Tracking"
          >
            <Camera className="w-4 h-4" />
          </button>

          <button
            onClick={() => setLeaderboardOpen(true)}
            className="p-2.5 rounded-xl bg-neo-surface hover:bg-neo-cardHover border border-neo-border text-amber-400 transition-colors"
            title="Neon Ridge Rally Leaderboard"
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

      {/* FULL-VIEWPORT GAME CANVAS */}
      <div className="flex-1 w-full h-full relative">
        <canvas ref={canvasRef} className="w-full h-full block" />

        {/* Optional Draggable / Resizable Top-Left Gesture Camera Preview */}
        {cameraEnabled && (
          <CameraPreview
            isEnabled={cameraEnabled}
            onGestureChange={setActiveGesture}
            onToggleCamera={setCameraEnabled}
          />
        )}

        {/* Overlay: Game Over */}
        {gameState === 'gameover' && (
          <div
            className="absolute inset-0 bg-black/85 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center animate-fadeIn z-40"
            onClick={(e) => e.stopPropagation()}
          >
            <span className="text-neo-coral text-xs font-mono font-bold uppercase tracking-widest mb-1">
              {gameOverReason}
            </span>
            <h2 className="text-3xl sm:text-4xl font-black font-mono text-white mb-2 uppercase">
              RALLY FINISHED
            </h2>

            <div className="flex items-center gap-4 my-5 font-mono text-xs">
              <div className="p-3.5 rounded-2xl bg-neo-surface border border-neo-border">
                <span className="text-neo-secondary block text-[10px] uppercase">Distance</span>
                <span className="text-2xl font-black text-white">{distance}m</span>
              </div>
              <div className="p-3.5 rounded-2xl bg-neo-surface border border-neo-border">
                <span className="text-neo-secondary block text-[10px] uppercase">Coin Bonus</span>
                <span className="text-2xl font-black text-neo-lime">+{coins}</span>
              </div>
              <div className="p-3.5 rounded-2xl bg-neo-surface border border-neo-border">
                <span className="text-neo-secondary block text-[10px] uppercase">Total Score</span>
                <span className="text-2xl font-black text-neo-purple">{distance + coins}</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={startGame}
                className="flex items-center justify-center gap-2 px-8 py-3.5 rounded-2xl bg-neo-lime text-slate-950 font-mono font-black text-sm shadow-neo-lime hover:bg-lime-300 transition-all active:scale-95"
              >
                <RotateCcw className="w-4 h-4" />
                <span>RACE AGAIN</span>
              </button>

              <button
                onClick={() => setLeaderboardOpen(true)}
                className="flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-neo-surface hover:bg-neo-cardHover border border-neo-border text-white font-mono font-bold text-xs transition-all"
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
            <p className="text-xs font-mono text-neo-secondary mb-6">Press P or Resume to continue driving</p>
            <button
              onClick={() => setGameState('playing')}
              className="flex items-center gap-2 px-8 py-3.5 rounded-2xl bg-neo-lime text-slate-950 font-mono font-bold text-sm shadow-neo-lime hover:bg-lime-300 transition-all active:scale-95"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>RESUME RUN</span>
            </button>
          </div>
        )}

        {/* TWO LARGE DRIVING PEDALS (Bottom-Left: Brake, Bottom-Right: Gas) */}
        <div className="absolute bottom-6 left-6 right-6 z-20 flex items-center justify-between pointer-events-none select-none">
          {/* BRAKE PEDAL: Bottom-Left */}
          <button
            type="button"
            onPointerDown={(e) => {
              try {
                e.currentTarget.setPointerCapture(e.pointerId);
              } catch {}
              manualInputRef.current.brake = true;
              setIsBrakePressed(true);
            }}
            onPointerUp={(e) => {
              try {
                e.currentTarget.releasePointerCapture(e.pointerId);
              } catch {}
              manualInputRef.current.brake = false;
              setIsBrakePressed(false);
            }}
            onPointerCancel={() => {
              manualInputRef.current.brake = false;
              setIsBrakePressed(false);
            }}
            onLostPointerCapture={() => {
              manualInputRef.current.brake = false;
              setIsBrakePressed(false);
            }}
            className={`pointer-events-auto w-36 sm:w-48 h-20 sm:h-24 rounded-3xl font-mono font-black text-xs sm:text-sm tracking-wider border-2 flex flex-col items-center justify-center gap-1 transition-all shadow-xl active:scale-95 select-none touch-none ${
              isBrakePressed || (cameraEnabled && activeGesture === 'closed_fist')
                ? 'bg-neo-coral text-white border-neo-coral shadow-neo-coral scale-95 ring-4 ring-neo-coral/40'
                : 'bg-neo-surface/90 backdrop-blur-md text-neo-coral border-neo-coral/40 hover:bg-neo-cardHover'
            }`}
            title="Brake / Reverse (ArrowLeft, A, Space)"
          >
            <Disc className="w-5 h-5 sm:w-6 sm:h-6" />
            <span>BRAKE / REV</span>
            <span className="text-[9px] font-normal opacity-70 hidden sm:inline">[A / ←]</span>
          </button>

          {/* ACCELERATOR PEDAL: Bottom-Right */}
          <button
            type="button"
            onPointerDown={(e) => {
              try {
                e.currentTarget.setPointerCapture(e.pointerId);
              } catch {}
              manualInputRef.current.accelerate = true;
              setIsGasPressed(true);
            }}
            onPointerUp={(e) => {
              try {
                e.currentTarget.releasePointerCapture(e.pointerId);
              } catch {}
              manualInputRef.current.accelerate = false;
              setIsGasPressed(false);
            }}
            onPointerCancel={() => {
              manualInputRef.current.accelerate = false;
              setIsGasPressed(false);
            }}
            onLostPointerCapture={() => {
              manualInputRef.current.accelerate = false;
              setIsGasPressed(false);
            }}
            className={`pointer-events-auto w-36 sm:w-48 h-20 sm:h-24 rounded-3xl font-mono font-black text-xs sm:text-sm tracking-wider border-2 flex flex-col items-center justify-center gap-1 transition-all shadow-xl active:scale-95 select-none touch-none ${
              isGasPressed || (cameraEnabled && activeGesture === 'open_palm')
                ? 'bg-neo-lime text-slate-950 border-neo-lime shadow-neo-lime scale-95 ring-4 ring-neo-lime/40'
                : 'bg-neo-surface/90 backdrop-blur-md text-neo-lime border-neo-lime/40 hover:bg-neo-cardHover'
            }`}
            title="Accelerate (ArrowRight, D)"
          >
            <Flame className="w-5 h-5 sm:w-6 sm:h-6" />
            <span>ACCELERATE</span>
            <span className="text-[9px] font-normal opacity-70 hidden sm:inline">[D / →]</span>
          </button>
        </div>
      </div>

      {/* Dedicated Independent Leaderboard Modal */}
      <GameLeaderboardModal
        gameId="palmdrive-rally"
        gameTitle="Neon Ridge Rally"
        isOpen={leaderboardOpen}
        onClose={() => setLeaderboardOpen(false)}
        currentParticipantId={activeParticipantId}
      />
    </div>
  );
};
