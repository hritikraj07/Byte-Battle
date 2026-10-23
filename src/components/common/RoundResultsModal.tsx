'use client';

import React, { useEffect } from 'react';
import { Trophy, Clock, Lightbulb, CheckCircle2, XCircle, ArrowRight, RotateCcw, Home } from 'lucide-react';
import { ScoreBreakdown } from '@/services/scoring';
import { triggerConfetti } from './Confetti';

interface RoundResultsModalProps {
  isOpen: boolean;
  isCorrect: boolean;
  scoreBreakdown: ScoreBreakdown;
  explanation: string;
  isEventMode?: boolean;
  isPractice?: boolean;
  nextPlayerName?: string;
  onNextPlayer?: () => void;
  onReplay?: () => void;
  onPlayAgain?: () => void;
  onExit: () => void;
}

export const RoundResultsModal: React.FC<RoundResultsModalProps> = ({
  isOpen,
  isCorrect,
  scoreBreakdown,
  explanation,
  isEventMode = false,
  onNextPlayer,
  onReplay,
  onPlayAgain,
  onExit,
}) => {
  const handleRetry = onPlayAgain || onReplay || (() => {});

  useEffect(() => {
    if (isOpen && isCorrect) {
      triggerConfetti();
    }
  }, [isOpen, isCorrect]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn text-neo-text"
    >
      <div className="w-full max-w-lg bg-neo-surface border border-neo-border rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        {/* Glow accent */}
        <div
          className={`absolute top-0 left-0 right-0 h-2 ${
            isCorrect
              ? 'bg-gradient-to-r from-neo-lime via-white to-neo-purple'
              : 'bg-gradient-to-r from-neo-coral to-amber-600'
          }`}
        />

        {/* Header Status */}
        <div className="text-center mb-6">
          <div className="inline-flex p-3 rounded-2xl mb-3 border bg-neo-bg">
            {isCorrect ? (
              <CheckCircle2 className="w-12 h-12 text-neo-lime animate-bounce" />
            ) : (
              <XCircle className="w-12 h-12 text-neo-coral" />
            )}
          </div>
          <h2 className="text-2xl sm:text-3xl font-black font-mono text-white tracking-wide">
            {isCorrect ? 'PUZZLE SOLVED!' : 'TIME EXPIRED!'}
          </h2>
          <p className="text-xs sm:text-sm text-neo-secondary mt-1 font-mono">
            {isCorrect
              ? 'Outstanding computational deduction, player!'
              : 'A valiant run! Review the mathematical explanation below.'}
          </p>
        </div>

        {/* Score Display Card */}
        <div className="bg-neo-bg border border-neo-border rounded-2xl p-5 mb-5 font-mono">
          <div className="flex items-center justify-between pb-3 border-b border-neo-border mb-3">
            <span className="text-xs font-bold text-neo-secondary flex items-center gap-1.5 uppercase">
              <Trophy className="w-4 h-4 text-neo-lime" /> Total Points Awarded
            </span>
            <span className="text-3xl font-black text-neo-lime">
              {scoreBreakdown.score.toLocaleString()}
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2 text-center text-xs">
            <div className="p-2.5 rounded-xl bg-neo-surface border border-neo-border">
              <span className="text-neo-secondary block mb-0.5 text-[10px] uppercase">Base Points</span>
              <span className="font-bold text-white">+{scoreBreakdown.basePoints}</span>
            </div>
            <div className="p-2.5 rounded-xl bg-neo-surface border border-neo-border">
              <span className="text-neo-secondary block mb-0.5 text-[10px] uppercase flex items-center justify-center gap-1">
                <Clock className="w-3 h-3 text-neo-lime" /> Time Bonus
              </span>
              <span className="font-bold text-neo-lime">+{scoreBreakdown.timeBonusPoints}</span>
            </div>
            <div className="p-2.5 rounded-xl bg-neo-surface border border-neo-border">
              <span className="text-neo-secondary block mb-0.5 text-[10px] uppercase flex items-center justify-center gap-1">
                <Lightbulb className="w-3 h-3 text-neo-coral" /> Penalties
              </span>
              <span className="font-bold text-neo-coral">-{scoreBreakdown.hintPenaltyPoints}</span>
            </div>
          </div>
        </div>

        {/* Explanation Section */}
        <div className="p-4 rounded-2xl bg-neo-bg/60 border border-neo-border mb-6 text-xs text-slate-300 font-mono">
          <span className="text-[11px] font-bold uppercase tracking-wider text-neo-lime block mb-1">
            Logic & Solution Breakdown
          </span>
          <p className="leading-relaxed">{explanation}</p>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-3 font-mono">
          {isEventMode && onNextPlayer && (
            <button
              onClick={onNextPlayer}
              className="w-full flex items-center justify-center gap-2 py-3.5 px-6 rounded-2xl font-bold text-slate-950 bg-neo-lime hover:bg-lime-300 shadow-neo-lime transition-all active:scale-95"
            >
              <span>Submit & Next Player Turn</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}

          <div className="flex items-center gap-3">
            <button
              onClick={handleRetry}
              className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-2xl font-bold text-xs bg-neo-lime text-slate-950 shadow-neo-lime hover:bg-lime-300 transition-all active:scale-95"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Play Next Puzzle</span>
            </button>

            <button
              onClick={onExit}
              className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-2xl font-bold text-xs bg-neo-surface hover:bg-neo-cardHover border border-neo-border text-white transition-all active:scale-95"
            >
              <Home className="w-4 h-4" />
              <span>Return to Games</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
