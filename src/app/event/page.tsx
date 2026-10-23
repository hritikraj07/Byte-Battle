'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Users, Trophy, Play, CheckCircle2, UserCheck, Shield, RefreshCw, ArrowRight, Zap, Binary, FileCode, Activity, Compass } from 'lucide-react';
import { sanitizeNickname } from '@/services/sanitizer';
import { getActiveSession, createSession, getOrCreateParticipant, getEventData } from '@/services/db';
import { EventSession, Participant } from '@/types/event';
import { GameId, Difficulty } from '@/types/puzzle';
import { PatternShiftArena } from '@/games/pattern-shift/PatternShiftArena';
import { WordWeaveArena } from '@/games/word-weave/WordWeaveArena';
import { PulseJumperArena } from '@/games/pulse-jumper/PulseJumperArena';
import { PalmDriveArena } from '@/games/palmdrive-rally/PalmDriveArena';

export default function EventPage() {
  const [session, setSession] = useState<EventSession | null>(null);
  const [nicknameInput, setNicknameInput] = useState('');
  const [nicknameError, setNicknameError] = useState('');
  const [activeParticipant, setActiveParticipant] = useState<Participant | null>(null);
  const [selectedGame, setSelectedGame] = useState<GameId | null>(null);
  const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty>('medium');
  const [isCreatingSession, setIsCreatingSession] = useState(false);
  const [newSessionTitle, setNewSessionTitle] = useState('');
  const [recentParticipants, setRecentParticipants] = useState<Participant[]>([]);

  // Load active session from IndexedDB
  const refreshSession = async () => {
    const active = await getActiveSession();
    setSession(active);
    if (active) {
      const data = await getEventData(active.id);
      setRecentParticipants(data.participants.slice(-5).reverse());
    }
  };

  useEffect(() => {
    refreshSession();
  }, []);

  // Handle student registration
  const handleRegisterStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session) return;

    const validation = sanitizeNickname(nicknameInput);
    if (!validation.isValid) {
      setNicknameError(validation.errorMessage || 'Invalid nickname.');
      return;
    }

    setNicknameError('');
    try {
      const participant = await getOrCreateParticipant(session.id, validation.sanitized);
      setActiveParticipant(participant);
      setNicknameInput('');
    } catch (err) {
      setNicknameError('Failed to register participant.');
      console.error(err);
    }
  };

  // Create new session if none active
  const handleCreateSessionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const title = newSessionTitle.trim() || 'University Tech Fest 2026';
    const newSess = await createSession(title);
    setSession(newSess);
    setIsCreatingSession(false);
    setNewSessionTitle('');
  };

  // Handover: Next Player Turn
  const handleNextPlayer = () => {
    setSelectedGame(null);
    setActiveParticipant(null);
    setNicknameInput('');
    setNicknameError('');
    refreshSession();
  };

  // If a game is actively being played by student:
  if (selectedGame && activeParticipant && session) {
    const commonProps = {
      difficulty: selectedDifficulty,
      isEventMode: true,
      participantId: activeParticipant.id,
      nickname: activeParticipant.nickname,
      eventId: session.id,
      roundDurationSeconds: session.config.roundDurationSeconds || 120,
      onFinish: (score: number) => {
        // Return to selection or directly offer next player
      },
      onExit: () => setSelectedGame(null),
    };

    switch (selectedGame) {
      case 'pattern-shift':
        return <PatternShiftArena {...commonProps} />;
      case 'word-weave':
        return <WordWeaveArena {...commonProps} />;
      case 'pulse-jumper':
        return <PulseJumperArena {...commonProps} />;
      case 'neon-ridge-rally':
      case 'palmdrive-rally':
        return <PalmDriveArena {...commonProps} />;
    }
  }

  return (
    <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fadeIn">
      {/* Session Top Banner */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-arena-card border border-arena-cardBorder mb-8 shadow-arcade-card">
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 rounded-full bg-emerald-400 animate-pulse" />
          <div>
            <span className="text-xs font-mono uppercase text-slate-400 block">Active Event Session</span>
            <span className="text-base font-bold text-white">
              {session ? session.title : 'No Active Session'}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/leaderboard"
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold font-mono bg-slate-900 hover:bg-slate-800 text-arena-cyan border border-arena-cyan/30 transition-all"
          >
            <Trophy className="w-4 h-4 text-arena-cyan" />
            <span>View Leaderboards</span>
          </Link>
          <Link
            href="/host"
            className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700 transition-all"
            title="Host Controls"
          >
            <Shield className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* If No Active Session: Host Prompt to Create */}
      {!session && (
        <div className="bg-arena-card border border-arena-cardBorder rounded-3xl p-8 sm:p-12 text-center max-w-lg mx-auto shadow-2xl">
          <Shield className="w-12 h-12 text-arena-cyan mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">Initialize Tournament Session</h2>
          <p className="text-sm text-slate-300 mb-6">
            An active event session is required to record student nicknames and compute tournament rankings.
          </p>

          <form onSubmit={handleCreateSessionSubmit} className="space-y-4">
            <input
              type="text"
              value={newSessionTitle}
              onChange={(e) => setNewSessionTitle(e.target.value)}
              placeholder="e.g. City High STEM Arena 2026"
              className="w-full py-3 px-4 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono text-sm focus:outline-none focus:border-arena-cyan"
            />
            <button
              type="submit"
              className="w-full py-3.5 px-6 rounded-xl font-mono font-bold text-slate-950 bg-arena-cyan hover:bg-cyan-300 shadow-neon-cyan transition-all"
            >
              Start Event Session
            </button>
          </form>
        </div>
      )}

      {/* Main Kiosk Flow: When Session Exists */}
      {session && !activeParticipant && (
        <div className="bg-arena-card border border-arena-cardBorder rounded-3xl p-6 sm:p-10 shadow-arcade-card max-w-xl mx-auto">
          <div className="text-center mb-8">
            <div className="w-12 h-12 rounded-2xl bg-arena-cyan/10 border border-arena-cyan/30 flex items-center justify-center text-arena-cyan mx-auto mb-4">
              <Users className="w-6 h-6" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-black font-mono text-white mb-2">PLAYER REGISTRATION</h2>
            <p className="text-sm text-slate-300">
              Welcome cadet! Enter your gamer tag to start your tournament attempt.
            </p>
          </div>

          <form onSubmit={handleRegisterStudent} className="space-y-4">
            <div>
              <label htmlFor="nickname" className="block text-xs font-mono uppercase tracking-wider text-slate-400 mb-2">
                Nickname / Gamer Tag (2–15 chars)
              </label>
              <input
                id="nickname"
                type="text"
                value={nicknameInput}
                onChange={(e) => {
                  setNicknameInput(e.target.value);
                  if (nicknameError) setNicknameError('');
                }}
                maxLength={15}
                placeholder="e.g. MatrixRider, CyberFalcon"
                className="w-full py-3.5 px-4 rounded-xl bg-slate-900/90 border border-slate-700 text-white font-mono text-base focus:outline-none focus:border-arena-cyan focus:ring-1 focus:ring-arena-cyan"
                autoFocus
              />
              {nicknameError && (
                <p className="text-xs text-rose-400 font-mono mt-2">{nicknameError}</p>
              )}
            </div>

            <button
              type="submit"
              className="w-full py-4 px-6 rounded-xl font-mono font-bold text-base text-slate-950 bg-gradient-to-r from-arena-cyan to-cyan-400 hover:from-cyan-300 hover:to-cyan-200 shadow-neon-cyan transition-all transform active:scale-98"
            >
              Enter Arena
            </button>
          </form>

          {/* Quick instructions for the student */}
          <div className="mt-8 pt-6 border-t border-slate-800 text-xs text-slate-400 font-mono space-y-1">
            <p>• Only your highest score in each game counts towards Overall rank.</p>
            <p>• Replays do not accumulate duplicate points.</p>
            <p>• When finished, click &quot;Next Player&quot; to hand over the device.</p>
          </div>
        </div>
      )}

      {/* Screen 2: Student is Registered, Choosing Game Arena */}
      {session && activeParticipant && (
        <div className="space-y-8 animate-fadeIn">
          {/* Active Player Status Card */}
          <div className="flex flex-wrap items-center justify-between gap-4 p-5 rounded-2xl bg-gradient-to-r from-arena-cyan/10 via-slate-900 to-arena-purple/10 border border-arena-cyan/30 shadow-arcade-card">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-arena-cyan/20 border border-arena-cyan/40 flex items-center justify-center font-mono font-black text-arena-cyan">
                {activeParticipant.nickname.slice(0, 2).toUpperCase()}
              </div>
              <div>
                <span className="text-xs font-mono text-slate-400 block">Current Competitor</span>
                <span className="text-lg font-black text-white font-mono">{activeParticipant.nickname}</span>
              </div>
            </div>

            {/* Handover / Switch Player Button */}
            <button
              onClick={handleNextPlayer}
              className="flex items-center gap-2 py-2 px-4 rounded-xl text-xs font-mono font-bold bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 transition-all"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Next Player Turn</span>
            </button>
          </div>

          {/* Game Selection Grid */}
          <div>
            <h3 className="text-xl font-bold font-mono text-white mb-4">SELECT TOURNAMENT ARENA</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                {
                  id: 'pattern-shift' as GameId,
                  title: 'Pattern Shift',
                  subtitle: 'Sequences & Equations',
                  icon: Binary,
                  color: 'border-cyan-500/40 hover:border-cyan-400 text-arena-cyan',
                },
                {
                  id: 'word-weave' as GameId,
                  title: 'Word Weave',
                  subtitle: 'Word Ladders & Categories',
                  icon: FileCode,
                  color: 'border-purple-500/40 hover:border-purple-400 text-purple-400',
                },
                {
                  id: 'pulse-jumper' as GameId,
                  title: 'Pulse Jumper',
                  subtitle: '1-Button Rhythm Platformer',
                  icon: Activity,
                  color: 'border-emerald-500/40 hover:border-emerald-400 text-emerald-400',
                },
              ].map((g) => {
                const Icon = g.icon;
                return (
                  <button
                    key={g.id}
                    onClick={() => setSelectedGame(g.id)}
                    className={`p-6 rounded-3xl bg-arena-card border text-left flex items-center justify-between transition-all hover:-translate-y-1 shadow-arcade-card group ${g.color}`}
                  >
                    <div className="flex items-center gap-4">
                      <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800">
                        <Icon className="w-8 h-8" />
                      </div>
                      <div>
                        <h4 className="text-lg font-bold text-white group-hover:text-arena-cyan transition-colors">
                          {g.title}
                        </h4>
                        <span className="text-xs font-mono text-slate-400">{g.subtitle}</span>
                      </div>
                    </div>
                    <ArrowRight className="w-5 h-5 text-slate-500 group-hover:text-white group-hover:translate-x-1 transition-all" />
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
