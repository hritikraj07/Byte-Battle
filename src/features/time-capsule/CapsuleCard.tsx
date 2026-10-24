'use client';

import React from 'react';
import { Lock, Unlock, Eye, Trash2 } from 'lucide-react';
import { TimeCapsule, getDaysRemaining } from './capsuleData';

interface CapsuleCardProps {
  capsule: TimeCapsule;
  isRevealed: boolean;
  onToggleReveal: (id: string) => void;
  onDelete: (id: string) => void;
}

export const CapsuleCard: React.FC<CapsuleCardProps> = ({
  capsule,
  isRevealed,
  onToggleReveal,
  onDelete,
}) => {
  const daysLeft = getDaysRemaining(capsule.unlockDate);
  const isReady = daysLeft === 0;
  const isContentShown = isRevealed || isReady;

  return (
    <div className="p-6 sm:p-7 rounded-3xl bg-[#0B1028]/80 border border-[#161D42] hover:border-[#6D5DFC]/50 transition-all shadow-xl space-y-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono uppercase bg-[#6D5DFC]/15 text-[#818CF8] border border-[#6D5DFC]/30">
              {capsule.category}
            </span>
            <span className="text-[11px] font-mono text-[#8A90B2]">
              Sealed on {new Date(capsule.createdAt).toLocaleDateString()}
            </span>
          </div>
          <h3 className="text-lg sm:text-xl font-bold text-white tracking-tight">
            {capsule.title}
          </h3>
        </div>

        {/* Countdown Badge */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#060814] border border-[#1E2756] text-right flex-shrink-0">
          {isReady ? (
            <>
              <Unlock className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-xs font-mono font-bold text-emerald-400">UNLOCKED</span>
            </>
          ) : (
            <>
              <Lock className="w-3.5 h-3.5 text-[#818CF8]" />
              <span className="text-xs font-mono font-bold text-white">
                {daysLeft}d left
              </span>
            </>
          )}
        </div>
      </div>

      {/* Sealed / Unlocked Message Content */}
      <div className="p-5 rounded-2xl bg-[#060814] border border-[#141A38]">
        {isContentShown ? (
          <p className="text-sm text-[#E2E6F5] leading-relaxed whitespace-pre-wrap font-sans">
            {capsule.content}
          </p>
        ) : (
          <div className="flex flex-col items-center justify-center py-6 text-center space-y-2">
            <Lock className="w-8 h-8 text-[#6D5DFC] animate-pulse" />
            <span className="text-xs font-mono font-bold text-white uppercase tracking-wider">
              ENCRYPTED TEMPORAL ARCHIVE
            </span>
            <p className="text-[11px] text-[#8A90B2] max-w-sm">
              Set to unlock on{' '}
              <strong className="text-[#818CF8]">
                {new Date(capsule.unlockDate).toLocaleDateString()}
              </strong>.
            </p>
          </div>
        )}
      </div>

      {/* Actions Bar */}
      <div className="flex items-center justify-between pt-2 text-xs">
        <button
          onClick={() => onToggleReveal(capsule.id)}
          className="flex items-center gap-1.5 text-[#818CF8] hover:text-white font-mono transition-colors cursor-pointer"
        >
          <Eye className="w-3.5 h-3.5" />
          <span>{isContentShown ? 'Hide Contents' : 'Inspect Envelope'}</span>
        </button>

        <button
          onClick={() => onDelete(capsule.id)}
          className="text-[#64748B] hover:text-red-400 transition-colors p-1 cursor-pointer"
          title="Delete Capsule"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
