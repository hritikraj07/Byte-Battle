'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Trophy, Maximize, Minimize, WifiOff, Users, Clock, Sparkles } from 'lucide-react';
import { getActiveSession, getEventData } from '@/services/db';
import { calculateOverallLeaderboard, calculateGameLeaderboard } from '@/services/leaderboard';
import { LeaderboardEntry, GameSpecificLeaderboardEntry } from '@/types/leaderboard';
import { GameId } from '@/types/puzzle';
import { EventSession } from '@/types/event';

export default function ProjectorDisplayPage() {
  const [session, setSession] = useState<EventSession | null>(null);
  const [activeBoard, setActiveBoard] = useState<'overall' | GameId>('overall');
  const [overallEntries, setOverallEntries] = useState<LeaderboardEntry[]>([]);
  const [gameEntries, setGameEntries] = useState<Record<string, GameSpecificLeaderboardEntry[]>>({
    'pattern-shift': [],
    'word-weave': [],
    'pulse-jumper': [],
  });
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<string>('');

  const boards: ('overall' | GameId)[] = [
    'overall',
    'pattern-shift',
    'word-weave',
    'pulse-jumper',
  ];

  const boardTitles: Record<string, string> = {
    overall: 'TOURNAMENT STANDINGS',
    'pattern-shift': 'PATTERN SHIFT',
    'word-weave': 'WORD WEAVE',
    'pulse-jumper': 'PULSE JUMPER',
  };

  const fetchDisplayData = async () => {
    try {
      const activeSess = await getActiveSession();
      setSession(activeSess);
      if (activeSess) {
        const { participants, attempts } = await getEventData(activeSess.id);
        setOverallEntries(calculateOverallLeaderboard(participants, attempts));
        setGameEntries({
          'pattern-shift': calculateGameLeaderboard('pattern-shift', participants, attempts),
          'word-weave': calculateGameLeaderboard('word-weave', participants, attempts),
          'pulse-jumper': calculateGameLeaderboard('pulse-jumper', participants, attempts),
        });
      }
      setLastUpdated(new Date().toLocaleTimeString());
    } catch (err) {
      console.error('Error fetching projector data:', err);
    }
  };

  // Poll IndexedDB every 5 seconds for live updates
  useEffect(() => {
    fetchDisplayData();
    const interval = setInterval(fetchDisplayData, 5000);
    return () => clearInterval(interval);
  }, []);

  // Auto-cycle through boards every 15 seconds
  useEffect(() => {
    const cycleInterval = setInterval(() => {
      setActiveBoard((prev) => {
        const currentIndex = boards.indexOf(prev);
        const nextIndex = (currentIndex + 1) % boards.length;
        return boards[nextIndex];
      });
    }, 15000);
    return () => clearInterval(cycleInterval);
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  const currentBoardTitle = boardTitles[activeBoard];

  return (
    <div className="min-h-screen bg-[#06080D] text-white p-6 sm:p-10 flex flex-col justify-between font-mono select-none">
      {/* Top Projector Header */}
      <header className="flex items-center justify-between border-b border-slate-800/80 pb-6 mb-8">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-arena-cyan to-arena-purple p-0.5 shadow-neon-cyan">
            <div className="w-full h-full bg-[#06080D] rounded-[14px] flex items-center justify-center font-black text-arena-cyan text-lg">
              BB
            </div>
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-widest text-white">
              BYTE <span className="text-arena-cyan">BATTLE</span>
            </h1>
            <span className="text-xs text-slate-400 block tracking-wider">
              {session ? session.title : 'OFFICIAL TOURNAMENT ARENA'}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-400">
            <Clock className="w-4 h-4 text-arena-cyan" />
            <span>Updated: {lastUpdated}</span>
          </div>

          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-400">
            <Users className="w-4 h-4 text-emerald-400" />
            <span>{overallEntries.length} Competitors</span>
          </div>

          <button
            onClick={toggleFullscreen}
            className="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-white transition-all"
            title="Toggle Fullscreen"
          >
            {isFullscreen ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
          </button>
        </div>
      </header>

      {/* Main Board Carousel Display */}
      <main className="flex-1 flex flex-col justify-center max-w-6xl w-full mx-auto my-4 animate-fadeIn">
        {/* Active Board Title Banner */}
        <div className="flex items-center justify-between mb-6 pb-2 border-b border-arena-cyan/30">
          <h2 className="text-xl sm:text-2xl font-black tracking-wider text-arena-cyan flex items-center gap-3">
            <Trophy className="w-6 h-6 text-arena-cyan animate-pulse" />
            <span>{currentBoardTitle}</span>
          </h2>
          <div className="flex items-center gap-1 text-xs text-slate-500">
            {boards.map((b) => (
              <span
                key={b}
                className={`w-2 h-2 rounded-full transition-all ${
                  activeBoard === b ? 'bg-arena-cyan w-6' : 'bg-slate-700'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Top Standings Cards */}
        {activeBoard === 'overall' ? (
          overallEntries.length === 0 ? (
            <div className="py-24 text-center text-slate-500 text-lg">
              Waiting for first competitors to enter the arena...
            </div>
          ) : (
            <div className="space-y-3">
              {overallEntries.slice(0, 8).map((entry) => {
                const isFirst = entry.rank === 1 && entry.overallScore > 0;
                const isSecond = entry.rank === 2 && entry.overallScore > 0;
                const isThird = entry.rank === 3 && entry.overallScore > 0;

                return (
                  <div
                    key={entry.participantId}
                    className={`flex items-center justify-between px-6 py-4 rounded-2xl border transition-all ${
                      isFirst
                        ? 'bg-gradient-to-r from-amber-950/60 via-slate-900 to-amber-950/40 border-amber-500/60 shadow-[0_0_20px_rgba(245,158,11,0.2)]'
                        : isSecond
                        ? 'bg-gradient-to-r from-slate-800/60 via-slate-900 to-slate-800/40 border-slate-400/50'
                        : isThird
                        ? 'bg-gradient-to-r from-amber-900/40 via-slate-900 to-amber-900/20 border-amber-700/50'
                        : 'bg-slate-900/60 border-slate-800/80 hover:bg-slate-900'
                    }`}
                  >
                    <div className="flex items-center gap-5">
                      <span className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-lg ${
                        isFirst
                          ? 'bg-amber-500 text-slate-950 shadow-neon-amber'
                          : isSecond
                          ? 'bg-slate-300 text-slate-950'
                          : isThird
                          ? 'bg-amber-700 text-white'
                          : 'bg-slate-800 text-slate-400 text-sm'
                      }`}>
                        {entry.rank}
                      </span>
                      <span className="text-xl sm:text-2xl font-bold tracking-wide text-white">
                        {entry.nickname}
                      </span>
                    </div>

                    <div className="flex items-center gap-6 sm:gap-12">
                      <div className="hidden md:flex items-center gap-4 text-xs text-slate-400">
                        <span>P: <strong className="text-slate-200">{entry.gameScores['pattern-shift']}</strong></span>
                        <span>W: <strong className="text-slate-200">{entry.gameScores['word-weave']}</strong></span>
                        <span>PJ: <strong className="text-slate-200">{entry.gameScores['pulse-jumper']}</strong></span>
                      </div>

                      <span className="text-2xl sm:text-3xl font-black text-arena-cyan tracking-wider">
                        {entry.overallScore.toLocaleString()}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )
        ) : (
          /* Individual Game Leaderboard */
          (gameEntries[activeBoard] || []).length === 0 ? (
            <div className="py-24 text-center text-slate-500 text-lg">
              No attempts registered for this arena yet.
            </div>
          ) : (
            <div className="space-y-3">
              {(gameEntries[activeBoard] || []).slice(0, 8).map((entry) => (
                <div
                  key={entry.participantId}
                  className="flex items-center justify-between px-6 py-4 rounded-2xl bg-slate-900/70 border border-slate-800"
                >
                  <div className="flex items-center gap-5">
                    <span className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center font-black text-slate-400 text-sm">
                      #{entry.rank}
                    </span>
                    <span className="text-xl sm:text-2xl font-bold text-white tracking-wide">
                      {entry.nickname}
                    </span>
                  </div>
                  <div className="flex items-center gap-8">
                    <span className="text-xs text-slate-400">{entry.timeSeconds}s solve</span>
                    <span className="text-2xl sm:text-3xl font-black text-arena-cyan">
                      {entry.bestScore.toLocaleString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )
        )}
      </main>

      {/* Projector Footer Ticker */}
      <footer className="border-t border-slate-800/80 pt-4 flex flex-wrap items-center justify-between text-xs text-slate-500">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-arena-cyan" />
          <span>Auto-cycling arena leaderboards every 15 seconds</span>
        </div>
        <div className="font-mono">
          Single-Laptop Kiosk • Best-Score Tournament Protocol
        </div>
      </footer>
    </div>
  );
}
