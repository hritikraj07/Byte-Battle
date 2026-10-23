'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { Trophy, Search, RefreshCw, ArrowLeft, Gamepad2 } from 'lucide-react';
import { getActiveSession, getEventData } from '@/services/db';
import { calculateGameLeaderboard } from '@/services/leaderboard';
import { GameSpecificLeaderboardEntry } from '@/types/leaderboard';
import { GameId } from '@/types/puzzle';
import { EventSession } from '@/types/event';
import { ACTIVE_GAMES } from '@/data/gamesList';
import { db } from '@/services/db';

const TABS: { id: GameId; label: string }[] = ACTIVE_GAMES.map((g) => ({
  id: g.id,
  label: g.title,
}));

export default function LeaderboardPage() {
  const [session, setSession] = useState<EventSession | null>(null);
  const [activeTab, setActiveTab] = useState<GameId>('pattern-shift');
  const [searchQuery, setSearchQuery] = useState('');
  const [gameEntries, setGameEntries] = useState<Record<string, GameSpecificLeaderboardEntry[]>>({});
  const [loading, setLoading] = useState(true);

  const fetchScores = async () => {
    setLoading(true);
    try {
      const activeSess = await getActiveSession();
      setSession(activeSess);

      const participants = activeSess
        ? (await getEventData(activeSess.id)).participants
        : await db.participants.toArray();
      const attempts = activeSess
        ? (await getEventData(activeSess.id)).attempts
        : await db.attempts.toArray();

      const newEntries: Record<string, GameSpecificLeaderboardEntry[]> = {};
      for (const tab of TABS) {
        newEntries[tab.id] = calculateGameLeaderboard(tab.id, participants, attempts);
      }
      setGameEntries(newEntries);
    } catch (err) {
      console.error('Error fetching leaderboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchScores();
  }, []);

  const filteredGame = useMemo(() => {
    const list = gameEntries[activeTab] || [];
    if (!searchQuery.trim()) return list;
    return list.filter((e) =>
      e.nickname.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [activeTab, gameEntries, searchQuery]);

  return (
    <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fadeIn text-[#E8E8FF]">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8 pb-6 border-b border-[#24244A]">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <Trophy className="w-5 h-5 text-[#FFE45E]" />
            <h1 className="font-pixel text-xl sm:text-2xl text-[#00F0FF] uppercase tracking-tight">
              GAME TROPHIES & LEADERBOARDS
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-[#8A8AB8] font-sans">
            {session ? (
              <>Session: <strong className="text-white">{session.title}</strong> • Independent Best Scores</>
            ) : (
              'Independent per-game arcade leaderboards. Highest verified score per player.'
            )}
          </p>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <Link
            href="/games"
            className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#0D0D22] hover:bg-[#141432] border border-[#24244A] text-xs font-sans font-medium text-[#8A8AB8] hover:text-white hover:border-[#00F0FF] transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Games</span>
          </Link>
          <button
            onClick={fetchScores}
            className="p-2 rounded-full bg-[#0D0D22] hover:bg-[#141432] border border-[#24244A] text-[#8A8AB8] hover:text-white hover:border-[#00F0FF] transition-all"
            title="Refresh Leaderboard"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Tabs for Independent Leaderboards */}
      <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-6 no-scrollbar" role="tablist">
        {TABS.map((tab) => {
          const isSelected = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              role="tab"
              aria-selected={isSelected}
              onClick={() => setActiveTab(tab.id)}
              className={`arcade-filter-pill ${isSelected ? 'active' : ''}`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Search Input Bar */}
      <div className="relative mb-6 max-w-md">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8A8AB8]" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Filter by player nickname..."
          className="w-full py-2.5 pl-10 pr-4 rounded-full bg-[#0D0D22] border border-[#24244A] text-white font-sans text-xs placeholder:text-[#8A8AB8]/60 focus:outline-none focus:border-[#00F0FF] focus:shadow-[0_0_12px_rgba(0,240,255,0.3)] transition-all"
        />
      </div>

      {/* Table Content */}
      <div className="bg-[#0D0D22] border border-[#24244A] rounded-2xl overflow-hidden shadow-[0_0_24px_-6px_rgba(0,240,255,0.15)]">
        {loading ? (
          <div className="py-20 text-center text-[#8A8AB8] font-mono text-sm">
            Computing live leaderboards from IndexedDB...
          </div>
        ) : filteredGame.length === 0 ? (
          <div className="py-16 text-center text-[#8A8AB8] font-sans text-sm flex flex-col items-center gap-3">
            <Gamepad2 className="w-8 h-8 text-[#24244A]" />
            <span>No scores recorded for this game yet. Be the first to set a record!</span>
            <Link
              href={`/play/${activeTab}`}
              className="mt-2 px-5 py-2.5 rounded-full bg-[#00F0FF] text-[#05050D] font-pixel text-xs font-bold hover:bg-[#38F9FF] transition-all shadow-[0_0_16px_rgba(0,240,255,0.4)]"
            >
              Play {TABS.find((t) => t.id === activeTab)?.label}
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#05050D]/80 border-b border-[#24244A] text-[11px] font-sans uppercase tracking-wider text-[#8A8AB8]">
                  <th className="py-3.5 px-4 sm:px-6">Rank</th>
                  <th className="py-3.5 px-4">Player</th>
                  <th className="py-3.5 px-4 text-right">Attempts</th>
                  <th className="py-3.5 px-4 text-right">Hints / Details</th>
                  <th className="py-3.5 px-4 text-right">Duration</th>
                  <th className="py-3.5 px-4 sm:px-6 text-right font-bold text-white">Best Score</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#24244A] font-sans text-xs sm:text-sm">
                {filteredGame.map((entry) => (
                  <tr key={entry.participantId} className="hover:bg-[#141432]/50 transition-colors">
                    <td className="py-4 px-4 sm:px-6 font-bold">
                      {entry.rank === 1 && entry.bestScore > 0 ? (
                        <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-amber-500/20 border border-amber-500/50 text-[#FFE45E] font-pixel text-xs">
                          1
                        </span>
                      ) : entry.rank === 2 && entry.bestScore > 0 ? (
                        <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-slate-300/20 border border-slate-300/50 text-slate-200 font-pixel text-xs">
                          2
                        </span>
                      ) : entry.rank === 3 && entry.bestScore > 0 ? (
                        <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-amber-700/20 border border-amber-700/50 text-amber-500 font-pixel text-xs">
                          3
                        </span>
                      ) : (
                        <span className="text-[#8A8AB8] px-2 font-mono">#{entry.rank}</span>
                      )}
                    </td>
                    <td className="py-4 px-4 font-bold text-white font-mono">{entry.nickname}</td>
                    <td className="py-4 px-4 text-right text-[#8A8AB8]">{entry.attemptsCount}</td>
                    <td className="py-4 px-4 text-right text-[#8A8AB8]">
                      {entry.hintsUsed > 0 ? `${entry.hintsUsed} hints` : '0 hints'}
                    </td>
                    <td className="py-4 px-4 text-right text-[#8A8AB8]">{entry.timeSeconds}s</td>
                    <td className="py-4 px-4 sm:px-6 text-right font-pixel text-sm text-[#FFE45E]">
                      {entry.bestScore.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
