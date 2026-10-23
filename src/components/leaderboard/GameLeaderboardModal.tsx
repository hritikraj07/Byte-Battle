'use client';

import React, { useEffect, useState } from 'react';
import { Trophy, X, Clock, HelpCircle, Award, Sparkles } from 'lucide-react';
import { GameId } from '@/types/puzzle';
import { GameSpecificLeaderboardEntry } from '@/types/leaderboard';
import { db } from '@/services/db';
import { calculateGameLeaderboard } from '@/services/leaderboard';

interface GameLeaderboardModalProps {
  gameId: GameId;
  isOpen: boolean;
  onClose: () => void;
  gameTitle: string;
  currentParticipantId?: string;
}

export const GameLeaderboardModal: React.FC<GameLeaderboardModalProps> = ({
  gameId,
  isOpen,
  onClose,
  gameTitle,
  currentParticipantId,
}) => {
  const [entries, setEntries] = useState<GameSpecificLeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isOpen) return;

    async function fetchLeaderboard() {
      setLoading(true);
      try {
        const attempts = await db.attempts.where('gameId').equals(gameId).toArray();
        const participants = await db.participants.toArray();
        const results = calculateGameLeaderboard(gameId, participants, attempts);
        // Only show entries that have actually scored or participated
        const activeEntries = results.filter((r) => r.bestScore > 0 || r.attemptsCount > 0);
        setEntries(activeEntries);
      } catch (err) {
        console.error('Failed to load game leaderboard:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchLeaderboard();
  }, [gameId, isOpen]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="w-full max-w-xl bg-[#0D0D22] border border-[#24244A] rounded-2xl p-6 sm:p-7 shadow-[0_0_60px_-20px_#00F0FF] flex flex-col max-h-[85vh] relative text-[#E8E8FF]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#24244A]">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-[#00F0FF]/10 border border-[#00F0FF]/30 text-[#00F0FF]">
              <Trophy className="w-5 h-5 text-[#FFE45E]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-pixel text-xs sm:text-sm text-[#00F0FF] tracking-tight">
                  {gameTitle}
                </h2>
                <span className="text-[10px] font-sans font-bold px-2 py-0.5 rounded-full bg-[#00F0FF]/15 text-[#00F0FF] border border-[#00F0FF]/30">
                  RECORDS
                </span>
              </div>
              <p className="text-xs text-[#8A8AB8] font-sans mt-0.5">
                Independent rankings for this arena • Best score policy
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-lg bg-[#05050D] hover:bg-[#141432] border border-[#24244A] text-[#8A8AB8] hover:text-white transition-colors"
            aria-label="Close leaderboard modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto py-4 space-y-2.5 pr-1">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12 text-[#8A8AB8]">
              <div className="w-8 h-8 border-2 border-[#00F0FF] border-t-transparent rounded-full animate-spin mb-3" />
              <span className="text-xs font-mono">Retrieving local records...</span>
            </div>
          ) : entries.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="w-12 h-12 rounded-xl bg-[#05050D] border border-[#24244A] flex items-center justify-center text-[#00F0FF] mb-3 shadow-[0_0_16px_rgba(0,240,255,0.2)]">
                <Sparkles className="w-5 h-5" />
              </div>
              <h3 className="font-pixel text-xs text-[#E8E8FF] uppercase mb-1">No Scores Recorded Yet</h3>
              <p className="text-xs text-[#8A8AB8] max-w-sm mb-4 font-sans">
                Play a round of {gameTitle} to record your first score and claim Rank #1!
              </p>
            </div>
          ) : (
            entries.map((entry) => {
              const isCurrentPlayer = currentParticipantId === entry.participantId;
              const isTop1 = entry.rank === 1;
              const isTop2 = entry.rank === 2;
              const isTop3 = entry.rank === 3;

              return (
                <div
                  key={entry.participantId}
                  className={`flex items-center justify-between p-3.5 sm:p-4 rounded-xl border transition-all ${
                    isCurrentPlayer
                      ? 'bg-[#00F0FF]/10 border-[#00F0FF] shadow-[0_0_12px_rgba(0,240,255,0.3)]'
                      : isTop1
                      ? 'bg-amber-500/10 border-amber-500/40'
                      : 'bg-[#05050D] border-[#24244A] hover:border-[#24244A]/80'
                  }`}
                >
                  {/* Left: Rank & Nickname */}
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center font-pixel text-xs font-bold ${
                        isTop1
                          ? 'bg-[#FFE45E] text-slate-950 shadow-md'
                          : isTop2
                          ? 'bg-slate-300 text-slate-950'
                          : isTop3
                          ? 'bg-amber-700 text-white'
                          : 'bg-[#101023] text-[#8A8AB8] border border-[#24244A]'
                      }`}
                    >
                      {entry.rank}
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-white font-mono">
                          {entry.nickname}
                        </span>
                        {isCurrentPlayer && (
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-[#00F0FF] text-slate-950">
                            YOU
                          </span>
                        )}
                        {isTop1 && <Award className="w-3.5 h-3.5 text-[#FFE45E]" />}
                      </div>
                      <div className="flex items-center gap-3 text-[11px] font-sans text-[#8A8AB8] mt-0.5">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {entry.timeSeconds}s
                        </span>
                        <span className="flex items-center gap-1">
                          <HelpCircle className="w-3 h-3" />
                          {entry.hintsUsed} hints
                        </span>
                        <span>{entry.attemptsCount} runs</span>
                      </div>
                    </div>
                  </div>

                  {/* Right: Score */}
                  <div className="text-right">
                    <span className="text-base sm:text-lg font-pixel font-bold text-[#FFE45E] block leading-none">
                      {entry.bestScore.toLocaleString()}
                    </span>
                    <span className="text-[10px] font-sans text-[#8A8AB8] uppercase">Points</span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
