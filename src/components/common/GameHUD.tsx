'use client';

import React from 'react';
import { Timer, Zap, Lightbulb, RefreshCw, XCircle, Trophy } from 'lucide-react';
import { Difficulty, GameId } from '@/types/puzzle';

interface GameHUDProps {
  gameTitle: string;
  difficulty: Difficulty;
  formattedTime: string;
  secondsLeft: number;
  hintsUsed: number;
  maxHints?: number;
  onUseHint: () => void;
  onExit: () => void;
  onRestart?: () => void;
  onOpenLeaderboard?: () => void;
  personalBest?: number;
  puzzleId?: string;
  gameId?: GameId;
  title?: string;
}

const DIFFICULTY_COLORS: Record<Difficulty, { bg: string; text: string; border: string }> = {
  easy: { bg: 'bg-[#3B82F6]/15', text: 'text-[#3B82F6]', border: 'border-[#3B82F6]/40' },
  medium: { bg: 'bg-[#22C55E]/15', text: 'text-[#22C55E]', border: 'border-[#22C55E]/40' },
  hard: { bg: 'bg-[#EF4444]/15', text: 'text-[#EF4444]', border: 'border-[#EF4444]/40' },
};

export const GameHUD: React.FC<GameHUDProps> = ({
  gameTitle,
  difficulty,
  formattedTime,
  secondsLeft,
  hintsUsed,
  maxHints = 2,
  onUseHint,
  onExit,
  onRestart,
  onOpenLeaderboard,
  personalBest,
  puzzleId,
  title,
}) => {
  const displayTitle = gameTitle || title || 'Arena';
  const diffStyle = DIFFICULTY_COLORS[difficulty] || DIFFICULTY_COLORS.easy;
  const isTimeCritical = secondsLeft <= 15;

  return (
    <div className="w-full bg-[#0D0D22] border border-[#24244A] rounded-2xl p-4 shadow-[0_0_24px_-6px_rgba(0,240,255,0.15)]">
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Left: Game Title and Difficulty */}
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-[#00F0FF]/10 border border-[#00F0FF]/30 text-[#00F0FF]">
            <Zap className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-pixel text-xs sm:text-sm text-[#00F0FF] uppercase tracking-wide">{displayTitle}</h2>
            <div className="flex items-center gap-2 mt-1">
              <span
                className={`text-[10px] px-2.5 py-0.5 rounded-full font-sans font-bold uppercase tracking-wider border ${diffStyle.bg} ${diffStyle.text} ${diffStyle.border}`}
              >
                {difficulty}
              </span>
              {puzzleId && (
                <span className="text-[10px] font-mono text-[#8A8AB8] hidden sm:inline">
                  [{puzzleId}]
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Center: Countdown Timer */}
        <div
          className={`flex items-center gap-2 px-4 py-2 rounded-xl border transition-all ${
            isTimeCritical
              ? 'bg-[#FF2E97]/20 border-[#FF2E97] text-[#FF2E97] shadow-[0_0_16px_rgba(255,46,151,0.4)] animate-pulse'
              : 'bg-[#05050D] border-[#24244A] text-[#00F0FF] shadow-inner'
          }`}
        >
          <Timer className={`w-4 h-4 ${isTimeCritical ? 'text-[#FF2E97] animate-spin' : 'text-[#00F0FF]'}`} />
          <span className="font-mono text-xl sm:text-2xl font-black tracking-widest">{formattedTime}</span>
        </div>

        {/* Right: Personal Best, Hint, Leaderboard, Exit */}
        <div className="flex items-center gap-2 font-sans">
          {typeof personalBest === 'number' && (
            <div className="text-right mr-1 hidden sm:block">
              <span className="text-[9px] text-[#8A8AB8] block uppercase leading-none font-sans">Best</span>
              <span className="text-xs font-pixel font-bold text-[#FFE45E] leading-tight">{personalBest}</span>
            </div>
          )}

          {onOpenLeaderboard && (
            <button
              onClick={onOpenLeaderboard}
              className="p-2.5 rounded-xl bg-[#05050D] hover:bg-[#141432] border border-[#24244A] text-[#8A8AB8] hover:text-[#FFE45E] transition-all"
              title="Game Leaderboard"
              aria-label="Open Game Leaderboard"
            >
              <Trophy className="w-4 h-4 text-[#FFE45E]" />
            </button>
          )}

          <button
            onClick={onUseHint}
            disabled={hintsUsed >= maxHints}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-sans font-bold transition-all border ${
              hintsUsed >= maxHints
                ? 'opacity-40 cursor-not-allowed bg-[#05050D] border-[#24244A] text-[#8A8AB8]'
                : 'bg-[#A855F7]/20 hover:bg-[#A855F7]/30 border-[#A855F7]/50 text-[#A855F7]'
            }`}
            title={`Use Hint (${hintsUsed}/${maxHints})`}
          >
            <Lightbulb className="w-4 h-4" />
            <span className="hidden sm:inline">Hint</span>
            <span>({hintsUsed}/{maxHints})</span>
          </button>

          {onRestart && (
            <button
              onClick={onRestart}
              className="p-2.5 rounded-xl bg-[#05050D] hover:bg-[#141432] border border-[#24244A] text-[#8A8AB8] hover:text-white transition-all"
              title="Restart Puzzle"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          )}

          <button
            onClick={onExit}
            className="p-2.5 rounded-xl bg-[#05050D] hover:bg-[#FF2E97]/20 border border-[#24244A] text-[#8A8AB8] hover:text-[#FF2E97] hover:border-[#FF2E97]/40 transition-all"
            title="Exit Arena"
            aria-label="Exit Game Arena"
          >
            <XCircle className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
