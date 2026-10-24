'use client';

import React, { useState, useEffect } from 'react';
import { User, Play, X, ShieldAlert, Sliders } from 'lucide-react';
import { GameDefinition } from '@/data/gamesList';
import { sanitizeNickname } from '@/services/sanitizer';

interface GameSetupModalProps {
  isOpen: boolean;
  game: GameDefinition;
  initialDifficulty?: string;
  onConfirm: (confirmedNickname: string, selectedDifficulty: string) => void;
  onCancel: () => void;
}

const STORAGE_KEY = 'byte_battle_last_nickname';

interface DifficultyOption {
  id: string;
  label: string;
  desc: string;
  colorHex: string;
  bgHex: string;
  borderHex: string;
}

const STANDARD_DIFFICULTIES: DifficultyOption[] = [
  {
    id: 'easy',
    label: 'Easy',
    desc: 'Relaxed timing & generous hints',
    colorHex: '#3B82F6',
    bgHex: 'rgba(59, 130, 246, 0.15)',
    borderHex: '#3B82F6',
  },
  {
    id: 'medium',
    label: 'Medium',
    desc: 'Balanced speed & standard constraints',
    colorHex: '#22C55E',
    bgHex: 'rgba(34, 197, 94, 0.15)',
    borderHex: '#22C55E',
  },
  {
    id: 'hard',
    label: 'Hard',
    desc: 'Fast pace, complex patterns & strict penalties',
    colorHex: '#EF4444',
    bgHex: 'rgba(239, 68, 68, 0.15)',
    borderHex: '#EF4444',
  },
];

const PULSE_JUMPER_DIFFICULTIES: DifficultyOption[] = [
  {
    id: 'easy',
    label: 'Easy',
    desc: 'Gentle 4.2 speed, wide obstacle spacing',
    colorHex: '#3B82F6',
    bgHex: 'rgba(59, 130, 246, 0.15)',
    borderHex: '#3B82F6',
  },
  {
    id: 'normal',
    label: 'Normal',
    desc: 'Standard 5.2 arcade speed, regular beats',
    colorHex: '#06B6D4',
    bgHex: 'rgba(6, 182, 212, 0.15)',
    borderHex: '#06B6D4',
  },
  {
    id: 'hard',
    label: 'Hard',
    desc: 'Elevated 6.2 speed, double obstacle clusters',
    colorHex: '#EAB308',
    bgHex: 'rgba(234, 179, 8, 0.15)',
    borderHex: '#EAB308',
  },
  {
    id: 'expert',
    label: 'Expert',
    desc: 'Rapid 7.4 speed, quick rhythmic timing',
    colorHex: '#F97316',
    bgHex: 'rgba(249, 115, 22, 0.15)',
    borderHex: '#F97316',
  },
  {
    id: 'insane',
    label: 'Insane',
    desc: 'Hyper 8.8 speed, pinpoint reflex jumps (4x Score)',
    colorHex: '#EF4444',
    bgHex: 'rgba(239, 68, 68, 0.15)',
    borderHex: '#EF4444',
  },
];

export const GameSetupModal: React.FC<GameSetupModalProps> = ({
  isOpen,
  game,
  initialDifficulty,
  onConfirm,
  onCancel,
}) => {
  const isPulseJumper = game.id === 'pulse-jumper';
  const difficultyList = isPulseJumper ? PULSE_JUMPER_DIFFICULTIES : STANDARD_DIFFICULTIES;

  const [nickname, setNickname] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>(
    initialDifficulty || (isPulseJumper ? 'normal' : 'easy')
  );
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      // Must ask for a new name every time — no previous name preference
      setNickname('');
      setSelectedDifficulty(initialDifficulty || (isPulseJumper ? 'normal' : 'easy'));
      setError(null);
    }
  }, [isOpen, initialDifficulty, isPulseJumper]);

  if (!isOpen) return null;

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = nickname.trim();

    if (!trimmed) {
      setError('Please enter your nickname to start.');
      return;
    }

    if (trimmed.length < 2) {
      setError('Nickname must be at least 2 characters.');
      return;
    }

    if (trimmed.length > 20) {
      setError('Nickname cannot exceed 20 characters.');
      return;
    }

    const result = sanitizeNickname(trimmed);
    if (!result.isValid) {
      setError(result.errorMessage || 'Only letters, numbers, hyphens, and underscores are allowed.');
      return;
    }

    const sanitized = result.sanitized;

    if (typeof window !== 'undefined') {
      sessionStorage.setItem('bytebattle_active_player', sanitized);
    }

    setError(null);
    onConfirm(sanitized, selectedDifficulty);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn"
      onClick={onCancel}
    >
      <div
        className="relative w-full max-w-lg bg-[#0D0D22] border border-[#24244A] rounded-2xl p-6 sm:p-7 shadow-[0_0_60px_-20px_#00F0FF] text-[#E8E8FF]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onCancel}
          className="absolute top-5 right-5 p-2 rounded-lg text-[#8A8AB8] hover:text-white bg-[#05050D] border border-[#24244A] transition-colors"
          aria-label="Close dialog"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-[#24244A]">
          <div className="p-2.5 rounded-xl bg-[#00F0FF]/10 border border-[#00F0FF]/30 text-[#00F0FF]">
            <game.icon className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-pixel text-xs sm:text-sm text-[#00F0FF] uppercase tracking-wide">
                {game.title}
              </h2>
              <span className="text-[10px] px-2 py-0.5 rounded-full font-sans font-semibold uppercase bg-[#05050D] text-[#8A8AB8] border border-[#24244A]">
                {game.badge}
              </span>
            </div>
            <p className="text-xs text-[#8A8AB8] font-sans mt-0.5">
              Confirm your player nickname and challenge difficulty
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* 1. Nickname Field */}
          <div>
            <label className="flex items-center justify-between text-xs font-sans font-bold text-white mb-2 uppercase">
              <span className="flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-[#00F0FF]" />
                Player Nickname
              </span>
              <span className="text-[11px] text-[#8A8AB8] lowercase font-normal">
                {nickname.length}/20 chars
              </span>
            </label>
            <input
              type="text"
              value={nickname}
              onChange={(e) => {
                setNickname(e.target.value);
                if (error) setError(null);
              }}
              placeholder="e.g. CYBER_RACER"
              maxLength={20}
              autoFocus
              className="w-full px-4 py-2.5 rounded-xl bg-[#05050D] border border-[#24244A] text-white font-mono text-sm tracking-wider uppercase focus:outline-none focus:border-[#00F0FF] focus:shadow-[0_0_12px_rgba(0,240,255,0.3)] transition-all"
            />
          </div>

          {/* 2. Difficulty Selection */}
          <div>
            <label className="flex items-center gap-1.5 text-xs font-sans font-bold text-white mb-2 uppercase">
              <Sliders className="w-3.5 h-3.5 text-[#00F0FF]" />
              Select Difficulty
            </label>

            <div
              className={`grid gap-2 ${
                isPulseJumper ? 'grid-cols-2 sm:grid-cols-3' : 'grid-cols-3'
              }`}
            >
              {difficultyList.map((diff) => {
                const isSelected = selectedDifficulty === diff.id;
                return (
                  <button
                    key={diff.id}
                    type="button"
                    onClick={() => setSelectedDifficulty(diff.id)}
                    style={
                      isSelected
                        ? {
                            borderColor: diff.borderHex,
                            backgroundColor: diff.bgHex,
                            color: '#FFFFFF',
                            boxShadow: `0 0 14px ${diff.bgHex}`,
                          }
                        : {}
                    }
                    className={`p-3 rounded-xl text-left border transition-all ${
                      isSelected
                        ? 'border-2 font-bold'
                        : 'bg-[#05050D] border-[#24244A] text-[#8A8AB8] hover:text-white hover:border-[#24244A]/80'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span
                        className="text-xs font-sans font-bold uppercase tracking-wider"
                        style={isSelected ? { color: diff.colorHex } : {}}
                      >
                        {diff.label}
                      </span>
                      {isSelected && (
                        <div
                          className="w-2 h-2 rounded-full"
                          style={{ backgroundColor: diff.colorHex }}
                        />
                      )}
                    </div>
                    <p className="text-[10px] text-[#8A8AB8] line-clamp-2 leading-tight font-sans">
                      {diff.desc}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-[#FF2E97]/15 border border-[#FF2E97]/40 text-[#FF2E97] text-xs font-mono animate-fadeIn">
              <ShieldAlert className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Submit Action Button */}
          <div className="pt-2">
            <button
              type="submit"
              className="w-full py-3.5 px-6 rounded-full bg-[#00F0FF] hover:bg-[#38F9FF] text-[#05050D] font-pixel text-xs uppercase tracking-wider transition-all shadow-[0_0_16px_rgba(0,240,255,0.4)] active:scale-95 flex items-center justify-center gap-2"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>START {game.title.toUpperCase()}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
