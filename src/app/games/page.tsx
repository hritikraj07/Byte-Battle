'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  Gamepad2,
  Trophy,
  Play,
  Search,
  Dices,
} from 'lucide-react';
import { GameId } from '@/types/puzzle';
import { db } from '@/services/db';
import {
  ACTIVE_GAMES,
  GameDefinition,
  ARCADE_CATEGORIES,
  ArcadeCategory,
} from '@/data/gamesList';
import { GameLeaderboardModal } from '@/components/leaderboard/GameLeaderboardModal';
import { GameSetupModal } from '@/components/common/GameSetupModal';
import { useArcadeShortcuts } from '@/hooks/useArcadeShortcuts';

export default function GamesHubPage() {
  const router = useRouter();

  const [personalBests, setPersonalBests] = useState<Record<string, number>>({});
  const [selectedLeaderboardGame, setSelectedLeaderboardGame] = useState<GameId | null>(null);
  const [selectedLeaderboardTitle, setSelectedLeaderboardTitle] = useState('');

  // Universal Name & Difficulty Setup Modal State
  const [setupGame, setSetupGame] = useState<GameDefinition | null>(null);

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<ArcadeCategory>('all');

  useEffect(() => {
    async function loadBests() {
      try {
        const records = await db.personalBests.toArray();
        const map: Record<string, number> = {};
        for (const r of records) {
          map[r.gameId] = Math.max(map[r.gameId] || 0, r.bestScore);
        }
        setPersonalBests(map);
      } catch (err) {
        console.warn('Could not load personal bests:', err);
      }
    }
    loadBests();
  }, []);

  const handleStartGameClick = (game: GameDefinition) => {
    setSetupGame(game);
  };

  const handleRandomGame = () => {
    const eligibleGames = ACTIVE_GAMES.filter((g) => Boolean(g && g.routeId));
    if (eligibleGames.length === 0) return;
    const randomIndex = Math.floor(Math.random() * eligibleGames.length);
    const chosenGame = eligibleGames[randomIndex];
    setSetupGame(chosenGame);
  };

  const handleConfirmSetup = (nickname: string, difficulty: string) => {
    if (!setupGame) return;
    const targetRoute = `/play/${setupGame.routeId}?diff=${difficulty}`;
    setSetupGame(null);
    router.push(targetRoute);
  };

  // Keyboard Shortcuts: / to search, Esc to close, R for random game
  useArcadeShortcuts({
    onSearch: () => {
      const input = document.querySelector('input[type="text"]') as HTMLInputElement | null;
      input?.focus();
      input?.select();
    },
    onEscape: () => {
      setSetupGame(null);
      setSelectedLeaderboardGame(null);
      setSearchQuery('');
    },
    onRandom: () => {
      handleRandomGame();
    },
  });

  const filteredGames = useMemo(() => {
    return ACTIVE_GAMES.filter((game) => {
      const matchesSearch =
        game.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        game.tagline.toLowerCase().includes(searchQuery.toLowerCase()) ||
        game.desc.toLowerCase().includes(searchQuery.toLowerCase());

      if (!matchesSearch) return false;

      if (selectedCategory === 'all') return true;
      return game.categories.includes(selectedCategory);
    });
  }, [searchQuery, selectedCategory]);

  return (
    <div className="w-full max-w-[1720px] mx-auto px-3 sm:px-5 lg:px-6 py-8 animate-fadeIn text-[#E8E8FF]">
      {/* Universal Name & Difficulty Setup Modal */}
      {setupGame && (
        <GameSetupModal
          isOpen={true}
          game={setupGame}
          onConfirm={handleConfirmSetup}
          onCancel={() => setSetupGame(null)}
        />
      )}

      {/* Header matching GH-Arcade without any game count */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-8 pb-6 border-b border-[#24244A]">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <h1 className="font-pixel text-xl sm:text-2xl tracking-tight text-[#00F0FF] uppercase">
              ARCADE CATALOG
            </h1>
            <span className="w-2 h-2 rounded-full bg-[#FF2E97] animate-pulse" />
          </div>
          <p className="text-xs sm:text-sm text-[#8A8AB8] font-sans">
            Choose your challenge. Reflex speed, mental arithmetic, pattern recall, and retro survival.
          </p>
        </div>

        {/* Actions: Random Game + Search input */}
        <div className="flex items-center gap-3 w-full md:w-auto">
          <button
            type="button"
            onClick={handleRandomGame}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#0D0D22] hover:bg-[#12122A] border border-[#A855F7]/70 hover:border-[#00F0FF] text-[#E8E8FF] hover:text-[#00F0FF] text-xs font-pixel tracking-wider focus:outline-none focus:ring-2 focus:ring-[#00F0FF] transition-all group shrink-0"
            aria-label="Play a random arcade game (Shortcut: Press R)"
          >
            <Dices className="w-3.5 h-3.5 text-[#FFE45E] group-hover:rotate-45 transition-transform" />
            <span className="hidden sm:inline">RANDOM GAME</span>
            <span className="sm:hidden">RANDOM</span>
          </button>

          <div className="w-full md:w-auto relative flex-1 md:flex-initial">
            <Search className="w-4 h-4 text-[#8A8AB8] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search arenas... (Press /)"
              className="w-full md:w-64 pl-10 pr-4 py-2 rounded-full bg-[#0D0D22] border border-[#24244A] text-white text-xs font-sans placeholder:text-[#8A8AB8]/60 focus:outline-none focus:border-[#00F0FF] focus:shadow-[0_0_12px_rgba(0,240,255,0.3)] transition-all"
            />
          </div>
        </div>
      </div>

      {/* Category Filter Pills Bar */}
      <div
        className="flex items-center gap-2 overflow-x-auto pb-3 mb-8 no-scrollbar"
        role="toolbar"
        aria-label="Filter games by category"
      >
        {ARCADE_CATEGORIES.map((cat) => {
          const isSelected = selectedCategory === cat.id;
          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => setSelectedCategory(cat.id)}
              aria-pressed={isSelected}
              className={`arcade-filter-pill ${isSelected ? 'active' : ''}`}
            >
              {cat.label}
            </button>
          );
        })}
      </div>

      {/* 4 Cards Per Row on Desktop Grid */}
      {filteredGames.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-4 gap-4 sm:gap-5">
          {filteredGames.map((game) => {
            const Artwork = game.artwork;
            const pb = personalBests[game.id] || personalBests[game.routeId] || 0;

            return (
              <div
                key={game.id}
                className="arcade-card flex flex-col justify-between group"
                style={{ '--accent': game.accent } as React.CSSProperties}
              >
                <div>
                  {/* Artwork Header with 16:9 aspect ratio */}
                  <div className="arcade-card-art">
                    <Artwork className="w-full h-full" />
                  </div>

                  {/* Card Body */}
                  <div className="p-5">
                    {/* Header: Title & Badge */}
                    <div className="flex items-center justify-between mb-2">
                      <h3
                        className="font-pixel text-xs sm:text-sm font-bold tracking-wide truncate"
                        style={{ color: game.accent }}
                      >
                        {game.title}
                      </h3>
                      <span className="text-[10px] font-sans font-semibold px-2 py-0.5 rounded-full bg-[#101023] border border-[#24244A] text-[#8A8AB8]">
                        {game.badge}
                      </span>
                    </div>

                    {/* Tagline */}
                    <span className="text-[11px] font-sans font-medium block mb-2 text-[#8A8AB8]">
                      {game.tagline}
                    </span>

                    {/* Description */}
                    <p className="text-xs text-[#8A8AB8] leading-relaxed mb-4 font-sans line-clamp-2">
                      {game.desc}
                    </p>

                    {/* Controls metadata pill */}
                    <div className="flex items-center gap-1.5 text-[11px] text-[#8A8AB8] font-sans mb-3">
                      <span className="text-[#00F0FF]">🎮</span>
                      <span className="truncate">{game.controls}</span>
                    </div>
                  </div>
                </div>

                {/* Footer: Personal Best + Leaderboard + Play Trigger */}
                <div className="px-5 pb-5 pt-3 border-t border-[#24244A] flex items-center justify-between">
                  <div>
                    <span className="text-[9px] font-sans text-[#8A8AB8] block uppercase">
                      Personal Best
                    </span>
                    <span className="text-xs sm:text-sm font-pixel font-bold text-[#FFE45E]">
                      {pb > 0 ? `${pb.toLocaleString()} PTS` : '—'}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setSelectedLeaderboardGame(game.id);
                        setSelectedLeaderboardTitle(game.title);
                      }}
                      className="p-2.5 rounded-xl bg-[#05050D] hover:bg-[#141432] border border-[#24244A] text-[#8A8AB8] hover:text-[#FFE45E] transition-colors"
                      title={`View ${game.title} Leaderboard`}
                      aria-label={`Open ${game.title} Leaderboard`}
                    >
                      <Trophy className="w-3.5 h-3.5 text-[#FFE45E]" />
                    </button>

                    <button
                      onClick={() => handleStartGameClick(game)}
                      className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#00F0FF] hover:bg-[#38F9FF] text-[#05050D] font-pixel text-[11px] font-bold tracking-wider transition-all shadow-[0_0_16px_rgba(0,240,255,0.4)] active:scale-95 cursor-pointer"
                    >
                      <Play className="w-3 h-3 fill-current" />
                      <span>PLAY</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Empty State */
        <div className="py-16 px-6 text-center rounded-2xl bg-[#0D0D22] border border-[#24244A] flex flex-col items-center max-w-lg mx-auto">
          <div className="w-14 h-14 rounded-2xl bg-[#05050D] border border-[#24244A] flex items-center justify-center text-[#00F0FF] mb-4 shadow-[0_0_20px_rgba(0,240,255,0.2)]">
            <Gamepad2 className="w-7 h-7" />
          </div>
          <h3 className="font-pixel text-xs sm:text-sm text-[#00F0FF] uppercase mb-2">
            NO ARENAS FOUND
          </h3>
          <p className="text-xs text-[#8A8AB8] leading-relaxed font-sans mb-5">
            No games matched your current search or category filter.
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('all');
            }}
            className="px-5 py-2.5 rounded-full bg-[#00F0FF] text-[#05050D] font-sans font-bold text-xs shadow-[0_0_16px_rgba(0,240,255,0.4)]"
          >
            Clear Filters
          </button>
        </div>
      )}

      {/* In-Game Dedicated Leaderboard Modal */}
      {selectedLeaderboardGame && (
        <GameLeaderboardModal
          gameId={selectedLeaderboardGame}
          gameTitle={selectedLeaderboardTitle}
          isOpen={true}
          onClose={() => setSelectedLeaderboardGame(null)}
          currentParticipantId="practice-user"
        />
      )}
    </div>
  );
}
