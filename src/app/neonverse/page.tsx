'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import {
  WorldId,
  WORLDS,
  createParticles,
  renderQuantum,
  renderNebula,
  renderSpire,
  WorldControls,
} from '@/features/neonverse';

export default function NeonversePage() {
  const [activeWorld, setActiveWorld] = useState<WorldId>('quantum');
  const [speed, setSpeed] = useState<number>(1.2);
  const [density, setDensity] = useState<number>(120);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const pointerRef = useRef<{ x: number; y: number; active: boolean }>({ x: 0, y: 0, active: false });

  const currentWorld = WORLDS.find((w) => w.id === activeWorld) || WORLDS[0];

  // Canvas Animation Engine
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId = 0;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    const particles = createParticles(density, width, height);
    let time = 0;

    const render = () => {
      if (!isPlaying) {
        animId = requestAnimationFrame(render);
        return;
      }

      time += 0.015 * speed;

      // Clear with slight trailing opacity for motion blur
      ctx.fillStyle = 'rgba(4, 3, 8, 0.22)';
      ctx.fillRect(0, 0, width, height);

      const centerX = width / 2;
      const centerY = height / 2;
      const ptr = pointerRef.current;
      const focalX = ptr.active ? ptr.x : centerX;
      const focalY = ptr.active ? ptr.y : centerY;

      if (activeWorld === 'quantum') {
        renderQuantum(ctx, particles, width, height, focalX, focalY, speed);
      } else if (activeWorld === 'nebula') {
        renderNebula(ctx, width, height, centerX, time);
      } else if (activeWorld === 'spire') {
        renderSpire(ctx, height, centerX, centerY, time);
      }

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
    };
  }, [activeWorld, density, isPlaying, speed]);

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    pointerRef.current = { x: e.clientX, y: e.clientY, active: true };
  };

  const handlePointerLeave = () => {
    pointerRef.current.active = false;
  };

  return (
    <div className="fixed inset-0 w-screen h-[100dvh] bg-[#040308] text-white select-none overflow-hidden touch-none z-30 flex flex-col justify-between">
      {/* Interactive Fullscreen Canvas */}
      <canvas
        ref={canvasRef}
        onPointerMove={handlePointerMove}
        onPointerLeave={handlePointerLeave}
        className="absolute inset-0 w-full h-full block cursor-crosshair z-0"
      />

      {/* TOP FLOATING HUD BAR */}
      <header className="relative z-20 w-full px-4 sm:px-8 pt-6 flex items-center justify-between gap-4 pointer-events-auto">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="p-2.5 rounded-2xl bg-[#090A0F]/80 hover:bg-[#151928] border border-white/10 text-[#A4A6B8] hover:text-white backdrop-blur-md transition-all shadow-lg"
            title="Return to AFTERHOURS Home"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>

          <div className="bg-[#090A0F]/80 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/10 shadow-lg">
            <div className="flex items-center gap-2">
              <span
                className="w-2 h-2 rounded-full animate-ping"
                style={{ backgroundColor: currentWorld.accent }}
              />
              <span className="font-mono text-xs font-bold uppercase tracking-widest text-white">
                NEONVERSE
              </span>
              <span className="text-[10px] text-[#A4A6B8] font-mono">• {currentWorld.name}</span>
            </div>
          </div>
        </div>

        {/* World Switcher Pills */}
        <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-[#090A0F]/80 backdrop-blur-md border border-white/10 shadow-lg overflow-x-auto">
          {WORLDS.map((w) => {
            const isSelected = activeWorld === w.id;
            return (
              <button
                key={w.id}
                onClick={() => setActiveWorld(w.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-white text-black shadow-[0_0_16px_rgba(255,255,255,0.4)]'
                    : 'text-[#A4A6B8] hover:text-white'
                }`}
              >
                {w.name}
              </button>
            );
          })}
        </div>
      </header>

      {/* BOTTOM FLOATING CONTROLS & TELEMETRY */}
      <WorldControls
        currentWorld={currentWorld}
        isPlaying={isPlaying}
        setIsPlaying={setIsPlaying}
        speed={speed}
        setSpeed={setSpeed}
        density={density}
        setDensity={setDensity}
      />
    </div>
  );
}
