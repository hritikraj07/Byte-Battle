'use client';

import React, { useEffect } from 'react';
import {
  X,
  Info,
  Gamepad2,
  CheckCircle2,
  Trophy,
  Lightbulb,
  Keyboard,
  Touchpad,
} from 'lucide-react';
import { GAME_INSTRUCTIONS, GameInstruction } from '@/data/gameInstructions';

interface HowToPlayModalProps {
  isOpen: boolean;
  gameId: string;
  onClose: () => void;
}

export const HowToPlayModal: React.FC<HowToPlayModalProps> = ({
  isOpen,
  gameId,
  onClose,
}) => {
  const instruction: GameInstruction = GAME_INSTRUCTIONS[gameId] || {
    id: gameId,
    title: 'Arcade Arena',
    tagline: 'Championship Mini-Game',
    badge: 'Arcade Challenge',
    accentColor: '#00F0FF',
    objective: 'Complete the objective, score points, and set a personal best before time runs out.',
    controls: {
      keyboard: ['Use Keyboard arrow keys or numeric keys [1]-[4]', '[Space] to trigger primary action'],
      mouseTouch: ['Click or tap on interactive targets on screen'],
    },
    rules: [
      'Follow the on-screen prompts and timing indicators.',
      'Achieve combinations and streaks to earn score multipliers.',
      'Maintain accuracy: errors apply time or point penalties.',
    ],
    scoring: [
      'Points scale with difficulty and speed.',
      'High scores are saved to your local offline leaderboard.',
    ],
    proTips: [
      'Focus on precision over raw speed initially to build your multiplier.',
      'Watch for audio and visual cues signaling state changes.',
    ],
  };

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-fadeIn"
      role="dialog"
      aria-modal="true"
      aria-labelledby="how-to-play-title"
    >
      <div className="relative w-full max-w-2xl max-h-[90vh] bg-[#0E1322] border-2 border-[#1E293B] rounded-3xl shadow-[0_0_50px_rgba(0,0,0,0.9)] overflow-hidden flex flex-col animate-scaleUp">
        {/* Header Bar */}
        <div
          className="p-4 sm:p-6 border-b border-[#1E293B] flex items-center justify-between"
          style={{
            background: `linear-gradient(90deg, rgba(14,19,34,0.95), ${instruction.accentColor}15)`,
          }}
        >
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-2xl flex items-center justify-center text-white border shadow-md"
              style={{
                backgroundColor: `${instruction.accentColor}20`,
                borderColor: `${instruction.accentColor}50`,
                color: instruction.accentColor,
              }}
            >
              <Info className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono tracking-widest uppercase font-bold text-[#94A3B8]">
                  HOW TO PLAY & BATTLE GUIDE
                </span>
                <span
                  className="px-2 py-0.5 rounded-full text-[9px] font-mono font-bold"
                  style={{
                    backgroundColor: `${instruction.accentColor}20`,
                    color: instruction.accentColor,
                    border: `1px solid ${instruction.accentColor}40`,
                  }}
                >
                  {instruction.badge}
                </span>
              </div>
              <h2
                id="how-to-play-title"
                className="text-lg sm:text-2xl font-black text-white tracking-tight"
              >
                {instruction.title}
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2.5 rounded-xl bg-[#1E293B] hover:bg-[#334155] text-[#94A3B8] hover:text-white transition-colors cursor-pointer"
            aria-label="Close guide"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5 text-xs sm:text-sm text-[#94A3B8]">
          {/* Mission Objective */}
          <div className="p-4 rounded-2xl bg-[#090D18] border border-[#1E293B]">
            <div className="flex items-center gap-2 mb-1.5 font-bold text-white font-mono text-xs uppercase">
              <Gamepad2 className="w-4 h-4 text-[#00F0FF]" />
              <span>Mission Objective</span>
            </div>
            <p className="leading-relaxed text-slate-200">
              {instruction.objective}
            </p>
          </div>

          {/* Controls Matrix */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 font-mono">
            <div className="p-3.5 rounded-2xl bg-[#090D18] border border-[#1E293B] space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-bold text-white">
                <Keyboard className="w-3.5 h-3.5 text-[#38BDF8]" />
                <span>Keyboard Shortcuts</span>
              </div>
              <ul className="space-y-1 text-[11px] text-slate-300">
                {instruction.controls.keyboard.map((ctrl, i) => (
                  <li key={i} className="flex items-start gap-1.5">
                    <span className="text-[#38BDF8]">›</span>
                    <span>{ctrl}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="p-3.5 rounded-2xl bg-[#090D18] border border-[#1E293B] space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-bold text-white">
                <Touchpad className="w-3.5 h-3.5 text-[#A855F7]" />
                <span>Mouse & Touch</span>
              </div>
              <ul className="space-y-1 text-[11px] text-slate-300">
                {instruction.controls.mouseTouch.map((ctrl, i) => (
                  <li key={i} className="flex items-start gap-1.5">
                    <span className="text-[#A855F7]">›</span>
                    <span>{ctrl}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Arena Rules */}
          <div className="p-4 rounded-2xl bg-[#090D18] border border-[#1E293B] space-y-2.5">
            <div className="flex items-center gap-2 font-bold text-white font-mono text-xs uppercase">
              <CheckCircle2 className="w-4 h-4 text-[#10B981]" />
              <span>Arena Rules & Mechanics</span>
            </div>
            <ul className="space-y-2">
              {instruction.rules.map((rule, idx) => (
                <li key={idx} className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-[#1E293B] flex items-center justify-center font-mono text-[10px] text-white shrink-0 mt-0.5 font-bold">
                    {idx + 1}
                  </span>
                  <span className="leading-relaxed text-slate-300">{rule}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Scoring System */}
          <div className="p-4 rounded-2xl bg-[#090D18] border border-[#1E293B] space-y-2">
            <div className="flex items-center gap-2 font-bold text-white font-mono text-xs uppercase">
              <Trophy className="w-4 h-4 text-[#FFE45E]" />
              <span>Scoring & Rank Multipliers</span>
            </div>
            <ul className="space-y-1.5 text-xs text-slate-300">
              {instruction.scoring.map((scoreItem, sIdx) => (
                <li key={sIdx} className="flex items-start gap-2">
                  <span className="text-[#FFE45E]">★</span>
                  <span>{scoreItem}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Tactical Pro Tips */}
          <div className="p-4 rounded-2xl bg-[#131A2E] border border-[#2B3558] space-y-2">
            <div className="flex items-center gap-2 font-bold text-[#FDE047] font-mono text-xs uppercase">
              <Lightbulb className="w-4 h-4 text-[#FFE45E]" />
              <span>Tactical Pro Tips</span>
            </div>
            <ul className="space-y-1.5 text-xs text-slate-200">
              {instruction.proTips.map((tip, tIdx) => (
                <li key={tIdx} className="flex items-start gap-2">
                  <span className="text-[#00F0FF]">⚡</span>
                  <span className="leading-relaxed">{tip}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Action Button Footer */}
        <div className="p-4 sm:p-5 border-t border-[#1E293B] bg-[#090D18] flex items-center justify-between gap-4">
          <span className="text-[11px] font-mono text-slate-500 hidden sm:inline">
            Press [Esc] to return to battle
          </span>
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl font-bold font-mono text-xs uppercase tracking-wider text-slate-950 shadow-md hover:brightness-110 active:scale-95 transition-all cursor-pointer"
            style={{ backgroundColor: instruction.accentColor }}
          >
            I&apos;M READY — LET&apos;S PLAY!
          </button>
        </div>
      </div>
    </div>
  );
};
