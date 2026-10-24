'use client';

import React, { useState, useEffect } from 'react';
import { User, Play, X, ShieldAlert, Sparkles, Edit3 } from 'lucide-react';
import { sanitizeNickname } from '@/services/sanitizer';

interface PlayerNameModalProps {
  isOpen: boolean;
  gameTitle: string;
  onConfirm: (confirmedNickname: string) => void;
  onCancel: () => void;
}

const STORAGE_KEY = 'byte_battle_last_nickname';

export const PlayerNameModal: React.FC<PlayerNameModalProps> = ({
  isOpen,
  gameTitle,
  onConfirm,
  onCancel,
}) => {
  const [nickname, setNickname] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (isOpen) {
      // Always ask for a new name for each game — zero previous name preference
      setNickname('');
      setError(null);
      setIsEditing(true);
      if (typeof window !== 'undefined') {
        localStorage.removeItem(STORAGE_KEY);
        localStorage.removeItem('bytebattle_remembered_nickname');
      }
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = nickname.trim();

    if (!trimmed) {
      setError('Please enter a gamer nickname to record your scores.');
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
    onConfirm(sanitized);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn"
      onClick={onCancel}
    >
      <div
        className="w-full max-w-md bg-neo-surface border border-neo-border rounded-3xl p-6 sm:p-8 shadow-2xl relative text-neo-text flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onCancel}
          className="absolute top-5 right-5 p-2 rounded-xl bg-neo-bg hover:bg-neo-cardHover border border-neo-border text-neo-secondary hover:text-white transition-colors"
          aria-label="Close dialog"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3.5 mb-5">
          <div className="p-3 rounded-2xl bg-neo-lime/10 border border-neo-lime/30 text-neo-lime">
            <User className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] font-mono uppercase tracking-widest text-neo-lime font-bold block">
              Player Verification
            </span>
            <h2 className="text-xl font-black font-mono text-white">
              Ready to Enter {gameTitle}?
            </h2>
          </div>
        </div>

        <p className="text-xs text-neo-secondary font-mono mb-6 leading-relaxed">
          Leaderboard ranking requires player confirmation before every run. Your score will be saved directly under this tag.
        </p>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label htmlFor="player-nickname-input" className="text-xs font-mono font-bold text-slate-300">
                Gamer Nickname
              </label>
              {nickname && !isEditing && (
                <button
                  type="button"
                  onClick={() => setIsEditing(true)}
                  className="text-[11px] font-mono text-neo-lime hover:underline flex items-center gap-1"
                >
                  <Edit3 className="w-3 h-3" />
                  <span>Change Name</span>
                </button>
              )}
            </div>

            {isEditing || !nickname ? (
              <div className="relative">
                <input
                  id="player-nickname-input"
                  type="text"
                  value={nickname}
                  onChange={(e) => {
                    setNickname(e.target.value);
                    if (error) setError(null);
                  }}
                  maxLength={20}
                  autoFocus
                  placeholder="e.g. PixelHero_99"
                  className="w-full py-3.5 px-4 rounded-2xl bg-neo-bg border border-neo-border focus:border-neo-lime text-white font-mono font-bold text-sm tracking-wide focus:outline-none transition-colors"
                />
                <span className="absolute right-3.5 top-3.5 text-[11px] font-mono text-neo-secondary">
                  {nickname.length}/20
                </span>
              </div>
            ) : (
              <div className="p-4 rounded-2xl bg-neo-bg border border-neo-lime/40 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-mono text-neo-secondary block uppercase">
                    Active Gamer Tag
                  </span>
                  <span className="text-lg font-black font-mono text-neo-lime tracking-wide">
                    {nickname}
                  </span>
                </div>
                <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-neo-lime/10 text-neo-lime border border-neo-lime/30">
                  Ready
                </span>
              </div>
            )}

            {error && (
              <div className="mt-2.5 flex items-center gap-1.5 text-neo-coral text-xs font-mono animate-fadeIn">
                <ShieldAlert className="w-3.5 h-3.5 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}
          </div>

          <div className="pt-2 flex flex-col gap-2.5">
            <button
              type="submit"
              className="w-full py-4 rounded-2xl bg-neo-lime hover:bg-lime-300 text-slate-950 font-black font-mono text-sm tracking-wider shadow-neo-lime transition-all transform hover:-translate-y-0.5 active:scale-95 flex items-center justify-center gap-2"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>CONFIRM & START GAME</span>
            </button>

            <button
              type="button"
              onClick={onCancel}
              className="w-full py-2.5 rounded-xl bg-transparent hover:bg-neo-bg text-neo-secondary hover:text-white font-mono text-xs transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
