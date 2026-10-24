'use client';

import React, { useRef, useEffect, useState, useCallback } from 'react';
import { ArrowLeft, Play, RotateCcw, Trophy, Layers, Sparkles } from 'lucide-react';
import { useAudio } from '@/hooks/useAudio';
import { saveGameAttempt, db, getOrCreateParticipant } from '@/services/db';
import { GameLeaderboardModal } from '@/components/leaderboard/GameLeaderboardModal';

interface StackSprintArenaProps {
  difficulty?: string;
  nickname?: string;
  onExit?: () => void;
}

interface StackBlock {
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
}

const BLOCK_COLORS = [
  '#C8FF3D', '#00E5FF', '#9B6BFF', '#EC4899', '#F59E0B', '#22C55E', '#3B82F6', '#F43F5E'
];

export const StackSprintArena: React.FC<StackSprintArenaProps> = ({
  difficulty = 'medium',
  nickname: initialNickname = '',
  onExit = () => window.history.back(),
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const { playSound } = useAudio();

  const [gameState, setGameState] = useState<'menu' | 'playing' | 'gameover'>('menu');
  const [towerHeight, setTowerHeight] = useState(0);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [personalBest, setPersonalBest] = useState(0);
  const [leaderboardOpen, setLeaderboardOpen] = useState(false);

  const [playerName, setPlayerName] = useState(initialNickname || 'Player');
  const [participantId, setParticipantId] = useState('practice-user');

  const engineRef = useRef({
    placedBlocks: [] as StackBlock[],
    currentBlock: {
      x: 0,
      y: 0,
      width: 200,
      height: 26,
      direction: 1,
      speed: 4.5,
      color: BLOCK_COLORS[0],
    },
    fallingPieces: [] as { x: number; y: number; width: number; height: number; vy: number; rotation: number; color: string }[],
    cameraY: 0,
    targetCameraY: 0,
    width: 600,
    height: 600,
    animId: 0,
    baseBlockWidth: 200,
    speedMultiplier: 1.0,
  });

  useEffect(() => {
    const active = initialNickname || (typeof window !== 'undefined' ? sessionStorage.getItem('bytebattle_active_player') || 'StackMaster' : 'StackMaster');
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
          .equals([participantId, 'stack-sprint'])
          .first();
        if (pb) setPersonalBest(pb.bestScore);
      } catch {
        // ignore
      }
    }
    loadBest();
  }, [participantId]);

  // Difficulty settings
  const baseSpeed = difficulty === 'hard' ? 5.5 : difficulty === 'medium' ? 4.2 : 3.2;
  const initialWidth = difficulty === 'hard' ? 160 : difficulty === 'medium' ? 200 : 240;
  const tolerance = difficulty === 'hard' ? 3 : difficulty === 'medium' ? 5 : 8; // Pixels considered "Perfect!"

  // Canvas resize
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
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Start new tower
  const startNewGame = useCallback(() => {
    const e = engineRef.current;
    const w = e.width || window.innerWidth;
    const h = e.height || window.innerHeight;
    const blockHeight = 26;
    const baseY = h - 140;

    // Foundation Base Block
    const baseBlock: StackBlock = {
      x: (w - initialWidth) / 2,
      y: baseY,
      width: initialWidth,
      height: blockHeight,
      color: '#1E2538',
    };

    e.placedBlocks = [baseBlock];
    e.fallingPieces = [];
    e.cameraY = 0;
    e.targetCameraY = 0;

    // Current moving block
    e.currentBlock = {
      x: 0,
      y: baseY - blockHeight,
      width: initialWidth,
      height: blockHeight,
      direction: 1,
      speed: baseSpeed,
      color: BLOCK_COLORS[1 % BLOCK_COLORS.length],
    };

    setTowerHeight(0);
    setScore(0);
    setCombo(0);
    setGameState('playing');
  }, [baseSpeed, initialWidth]);

  // Drop Block Trigger
  const handleDrop = useCallback(() => {
    if (gameState !== 'playing') return;

    const e = engineRef.current;
    const current = e.currentBlock;
    const topPlaced = e.placedBlocks[e.placedBlocks.length - 1];

    const diff = current.x - topPlaced.x;
    const absDiff = Math.abs(diff);

    // Completely missed tower!
    if (absDiff >= topPlaced.width) {
      playSound('wrong');
      setGameState('gameover');

      const finalScore = Math.round(e.placedBlocks.length * 100 * (difficulty === 'hard' ? 2 : difficulty === 'medium' ? 1.5 : 1));
      if (finalScore > personalBest) {
        setPersonalBest(finalScore);
      }

      saveGameAttempt({
        id: `att-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        eventId: null,
        participantId: participantId,
        nickname: playerName,
        gameId: 'stack-sprint',
        puzzleId: `SS-HEIGHT-${e.placedBlocks.length}`,
        difficulty: difficulty as 'easy' | 'medium' | 'hard',
        isCorrect: e.placedBlocks.length >= 8,
        score: finalScore,
        basePoints: finalScore,
        timeRemainingSeconds: 0,
        timeBonusPoints: 0,
        hintsUsed: 0,
        hintPenaltyPoints: 0,
        elapsedSeconds: Math.round(e.placedBlocks.length * 1.5),
        totalRoundSeconds: 60,
        completedAt: new Date().toISOString(),
        isPractice: true,
      }).catch(console.error);

      return;
    }

    let newWidth = topPlaced.width;
    let newX = current.x;
    let isPerfect = false;

    if (absDiff <= tolerance) {
      // Perfect placement! Snap to exact alignment
      newX = topPlaced.x;
      isPerfect = true;
      playSound('correct');
      setCombo((prev) => prev + 1);
    } else {
      // Imperfect placement: Slice off overhang
      setCombo(0);
      playSound('click');
      newWidth = topPlaced.width - absDiff;

      // Create falling slice
      const sliceWidth = absDiff;
      const sliceX = diff > 0 ? topPlaced.x + newWidth : current.x;

      e.fallingPieces.push({
        x: sliceX,
        y: current.y,
        width: sliceWidth,
        height: current.height,
        vy: 1.5,
        rotation: diff > 0 ? 0.08 : -0.08,
        color: current.color,
      });

      if (diff > 0) {
        newX = topPlaced.x;
      }
    }

    // Place block
    e.placedBlocks.push({
      x: newX,
      y: current.y,
      width: newWidth,
      height: current.height,
      color: current.color,
    });

    const newHeight = e.placedBlocks.length - 1;
    setTowerHeight(newHeight);

    const comboBonus = isPerfect ? combo * 50 : 0;
    const addedPoints = Math.round((100 + comboBonus) * (difficulty === 'hard' ? 2 : difficulty === 'medium' ? 1.5 : 1));
    setScore((prev) => prev + addedPoints);

    // Scroll camera up as tower grows
    const visibleThreshold = e.height * 0.55;
    if (current.y - e.targetCameraY < visibleThreshold) {
      e.targetCameraY += current.height;
    }

    // Spawn next block
    const nextColorIdx = e.placedBlocks.length % BLOCK_COLORS.length;
    const nextSpeed = Math.min(baseSpeed + newHeight * 0.12, 10.5);

    e.currentBlock = {
      x: Math.random() < 0.5 ? -newWidth : e.width,
      y: current.y - current.height,
      width: newWidth,
      height: current.height,
      direction: Math.random() < 0.5 ? 1 : -1,
      speed: nextSpeed,
      color: BLOCK_COLORS[nextColorIdx],
    };
  }, [baseSpeed, combo, difficulty, gameState, participantId, personalBest, playerName, playSound, tolerance]);

  // Spacebar and ArrowDown controls for dropping block
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.key === ' ' || e.code === 'ArrowDown') {
        e.preventDefault();
        if (gameState === 'menu') {
          startNewGame();
        } else if (gameState === 'playing') {
          handleDrop();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameState, handleDrop, startNewGame]);

  // Direct game launch if nickname prop is provided
  useEffect(() => {
    if (initialNickname && gameState === 'menu') {
      startNewGame();
    }
  }, [initialNickname, gameState, startNewGame]);

  // Main rendering & animation loop
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

      // Smooth camera interpolation
      e.cameraY += (e.targetCameraY - e.cameraY) * 0.1;

      // Move active block
      const cur = e.currentBlock;
      cur.x += cur.direction * cur.speed * step;
      if (cur.x > w - cur.width * 0.3) {
        cur.x = w - cur.width * 0.3;
        cur.direction = -1;
      } else if (cur.x < -cur.width * 0.7) {
        cur.x = -cur.width * 0.7;
        cur.direction = 1;
      }

      // Update falling slice fragments
      for (let i = e.fallingPieces.length - 1; i >= 0; i--) {
        const piece = e.fallingPieces[i];
        piece.y += piece.vy * step;
        piece.vy += 0.4 * step;
        if (piece.y - e.cameraY > h + 100) {
          e.fallingPieces.splice(i, 1);
        }
      }

      // -------------------------------------------------------------
      // RENDERING CANVAS
      // -------------------------------------------------------------
      ctx.save();
      ctx.scale(dpr, dpr);
      ctx.clearRect(0, 0, w, h);

      // Deep arcade background
      ctx.fillStyle = '#0B0D13';
      ctx.fillRect(0, 0, w, h);

      // Subtle background grid lines
      ctx.strokeStyle = '#181C28';
      ctx.lineWidth = 1;
      for (let x = 0; x < w; x += 50) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, h);
        ctx.stroke();
      }

      ctx.save();
      ctx.translate(0, e.cameraY);

      // Render Placed Tower Blocks
      for (let i = 0; i < e.placedBlocks.length; i++) {
        const b = e.placedBlocks[i];
        ctx.fillStyle = b.color;
        ctx.shadowColor = b.color;
        ctx.shadowBlur = i === e.placedBlocks.length - 1 ? 12 : 4;
        ctx.fillRect(b.x, b.y, b.width, b.height);
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 1;
        ctx.strokeRect(b.x, b.y, b.width, b.height);
      }

      // Render Falling Fragments
      for (const piece of e.fallingPieces) {
        ctx.save();
        ctx.translate(piece.x + piece.width / 2, piece.y + piece.height / 2);
        ctx.rotate(piece.rotation);
        ctx.fillStyle = piece.color;
        ctx.fillRect(-piece.width / 2, -piece.height / 2, piece.width, piece.height);
        ctx.restore();
      }

      // Render Current Moving Block
      ctx.fillStyle = cur.color;
      ctx.shadowColor = cur.color;
      ctx.shadowBlur = 14;
      ctx.fillRect(cur.x, cur.y, cur.width, cur.height);
      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(cur.x, cur.y, cur.width, cur.height);

      ctx.restore(); // camera
      ctx.restore(); // dpr

      e.animId = requestAnimationFrame(loop);
    };

    engineRef.current.animId = requestAnimationFrame(loop);

    return () => {
      isRunning = false;
      cancelAnimationFrame(engineRef.current.animId);
    };
  }, [gameState]);

  // Spacebar & Keyboard trigger
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.code === 'ArrowDown' || e.code === 'Enter') {
        e.preventDefault();
        handleDrop();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleDrop]);

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
        gameId="stack-sprint"
        gameTitle="Stack Sprint"
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
                STACK SPRINT
              </h1>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase border border-neo-border bg-neo-surface text-neo-secondary">
                {difficulty}
              </span>
            </div>
            <span className="text-[10px] font-mono text-neo-secondary hidden sm:inline">
              Tap or Space to place block • Align perfectly to preserve width
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4 font-mono">
          {combo > 1 && (
            <div className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-neo-lime/20 border border-neo-lime/40 text-neo-lime text-xs font-bold animate-bounce">
              <Sparkles className="w-3.5 h-3.5" />
              <span>PERFECT ×{combo}</span>
            </div>
          )}
          <div className="text-right">
            <span className="text-[10px] text-neo-secondary uppercase block leading-none">Height</span>
            <span className="text-base sm:text-lg font-black text-cyan-400 leading-tight">{towerHeight}</span>
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

      {/* CANVAS TOUCH INTERACTIVE PLAYFIELD */}
      <div className="flex-1 w-full h-full relative touch-none" onPointerDown={handleDrop}>
        <canvas ref={canvasRef} className="w-full h-full block cursor-pointer select-none" />

        {/* Start Menu Overlay */}
        {gameState === 'menu' && (
          <div
            className="absolute inset-0 bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center animate-fadeIn z-30"
            onClick={(e) => e.stopPropagation()}
            onPointerDown={(e) => e.stopPropagation()}
          >
            <div className="max-w-md bg-neo-surface border border-neo-border p-8 rounded-3xl shadow-arcade-card">
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-neo-lime/10 border border-neo-lime/30 flex items-center justify-center text-neo-lime shadow-md">
                <Layers className="w-8 h-8" />
              </div>
              <h2 className="text-2xl font-black font-mono text-white mb-2 uppercase">
                PRECISION STACK TOWER
              </h2>
              <p className="text-xs text-neo-secondary font-mono mb-6 leading-relaxed">
                Click or press Spacebar to drop the sliding block. Align it cleanly with the block below. Any overhang will be sliced off!
              </p>
              <button
                onClick={startNewGame}
                className="w-full py-3.5 px-6 rounded-2xl bg-neo-lime text-slate-950 font-black font-mono text-xs tracking-wider uppercase hover:bg-lime-300 transition-all shadow-neo-lime flex items-center justify-center gap-2 cursor-pointer"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>BUILD TOWER</span>
              </button>
            </div>
          </div>
        )}

        {/* Game Over Overlay */}
        {gameState === 'gameover' && (
          <div
            className="absolute inset-0 bg-black/85 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center animate-fadeIn z-30"
            onClick={(e) => e.stopPropagation()}
            onPointerDown={(e) => e.stopPropagation()}
          >
            <div className="max-w-md bg-neo-surface border border-neo-border p-8 rounded-3xl shadow-arcade-card">
              <h2 className="text-3xl font-black font-mono text-neo-coral mb-2 uppercase">
                TOWER COLLAPSED!
              </h2>
              <p className="text-xs text-neo-secondary font-mono mb-4">
                You reached a height of <strong className="text-cyan-400 font-bold">{towerHeight} floors</strong>.
              </p>
              <div className="text-4xl font-black font-mono text-neo-lime mb-6">
                {score} pts
              </div>
              <div className="flex gap-3 justify-center">
                <button
                  onClick={startNewGame}
                  className="px-6 py-3 rounded-xl bg-neo-lime text-slate-950 font-bold font-mono text-xs tracking-wider shadow-neo-lime flex items-center gap-2 cursor-pointer"
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
      </div>
    </div>
  );
};
