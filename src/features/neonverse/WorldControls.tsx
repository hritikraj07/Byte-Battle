'use client';

import React from 'react';
import { Sparkles, Play, Pause } from 'lucide-react';
import { WorldDefinition } from './neonverseData';

interface WorldControlsProps {
  currentWorld: WorldDefinition;
  isPlaying: boolean;
  setIsPlaying: React.Dispatch<React.SetStateAction<boolean>>;
  speed: number;
  setSpeed: (v: number) => void;
  density: number;
  setDensity: (v: number) => void;
}

export const WorldControls: React.FC<WorldControlsProps> = ({
  currentWorld,
  isPlaying,
  setIsPlaying,
  speed,
  setSpeed,
  density,
  setDensity,
}) => {
  return (
    <footer className="relative z-20 w-full px-4 sm:px-8 pb-6 flex flex-col sm:flex-row items-center justify-between gap-4 pointer-events-auto">
      {/* World Bio Description */}
      <div className="bg-[#090A0F]/85 backdrop-blur-md p-4 rounded-2xl border border-white/10 max-w-md shadow-xl text-left">
        <h2 className="text-sm font-bold text-white flex items-center gap-2">
          <Sparkles className="w-4 h-4" style={{ color: currentWorld.accent }} />
          <span>{currentWorld.name}</span>
        </h2>
        <p className="text-xs text-[#A4A6B8] mt-1 leading-relaxed">
          {currentWorld.tagline}
        </p>
      </div>

      {/* Kinetic Controls */}
      <div className="bg-[#090A0F]/85 backdrop-blur-md p-3 px-5 rounded-2xl border border-white/10 shadow-xl flex items-center gap-5">
        {/* Pause / Resume */}
        <button
          onClick={() => setIsPlaying((prev) => !prev)}
          className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
          title={isPlaying ? 'Pause Simulation' : 'Resume Simulation'}
        >
          {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
        </button>

        {/* Speed Slider */}
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono text-[#A4A6B8] uppercase">Velocity</span>
          <input
            type="range"
            min={0.2}
            max={3.0}
            step={0.1}
            value={speed}
            onChange={(e) => setSpeed(Number(e.target.value))}
            className="w-20 accent-[#00F0FF] cursor-pointer"
          />
        </div>

        {/* Particles Density */}
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono text-[#A4A6B8] uppercase">Density</span>
          <input
            type="range"
            min={40}
            max={250}
            step={10}
            value={density}
            onChange={(e) => setDensity(Number(e.target.value))}
            className="w-20 accent-[#A855F7] cursor-pointer"
          />
        </div>
      </div>
    </footer>
  );
};
