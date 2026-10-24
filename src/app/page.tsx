'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  Trophy,
  Play,
  Gamepad2,
  Dices,
  Info,
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
import { HowToPlayModal } from '@/components/common/HowToPlayModal';
import { ArcadeInstallButton } from '@/components/common/ArcadeInstallButton';
import { useArcadeShortcuts } from '@/hooks/useArcadeShortcuts';

export default function HomePage() {
  const router = useRouter();

  const [personalBests, setPersonalBests] = useState<Record<string, number>>({});
  const [selectedLeaderboardGame, setSelectedLeaderboardGame] = useState<GameId | null>(null);
  const [selectedLeaderboardTitle, setSelectedLeaderboardTitle] = useState('');
  const [selectedInfoGame, setSelectedInfoGame] = useState<string | null>(null);

  // Universal Game Setup Modal state (Nickname + Difficulty prompt before every run)
  const [setupGame, setSetupGame] = useState<GameDefinition | null>(null);

  // Active Category Filter
  const [activeCategory, setActiveCategory] = useState<ArcadeCategory>('all');

  const handleRandomGame = () => {
    const eligibleGames = ACTIVE_GAMES.filter((g) => Boolean(g && g.routeId));
    if (eligibleGames.length === 0) return;
    const randomIndex = Math.floor(Math.random() * eligibleGames.length);
    const chosenGame = eligibleGames[randomIndex];
    setSetupGame(chosenGame);
  };

  // Keyboard Shortcuts: / to search, Esc to close modals, R for random game
  useArcadeShortcuts({
    onSearch: () => {
      router.push('/games');
    },
    onEscape: () => {
      setSetupGame(null);
      setSelectedLeaderboardGame(null);
      setSelectedInfoGame(null);
    },
    onRandom: () => {
      handleRandomGame();
    },
  });

  useEffect(() => {
    async function loadStats() {
      try {
        const records = await db.personalBests.toArray();
        const map: Record<string, number> = {};
        for (const r of records) {
          map[r.gameId] = Math.max(map[r.gameId] || 0, r.bestScore);
        }
        setPersonalBests(map);
      } catch (err) {
        console.warn('Stats load note:', err);
      }
    }
    loadStats();
  }, []);

  const handleStartGameClick = (game: GameDefinition) => {
    setSetupGame(game);
  };

  const handleConfirmSetup = (nickname: string, difficulty: string) => {
    if (!setupGame) return;
    const targetRoute = `/play/${setupGame.routeId}?diff=${difficulty}&player=${encodeURIComponent(nickname)}`;
    setSetupGame(null);
    router.push(targetRoute);
  };

  // Real category filtering
  const filteredGames = useMemo(() => {
    if (activeCategory === 'all') return ACTIVE_GAMES;
    return ACTIVE_GAMES.filter((g) => g.categories.includes(activeCategory));
  }, [activeCategory]);

  return (
    <div className="flex-1 flex flex-col items-center w-full text-[#E8E8FF]">
      {/* Universal Name & Difficulty Setup Modal */}
      {setupGame && (
        <GameSetupModal
          isOpen={true}
          game={setupGame}
          onConfirm={handleConfirmSetup}
          onCancel={() => setSetupGame(null)}
        />
      )}

      {/* Marquee Arcade Hero Section matching GH-Arcade */}
      <section className="w-full max-w-[1720px] mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-8 sm:pt-14 sm:pb-10 text-center relative overflow-hidden">
        {/* Retro perspective neon grid floor extending under the hero */}
        <div className="arcade-perspective-grid" aria-hidden="true" />

        <div className="relative z-10 flex flex-col items-center">
          {/* Eyebrow Label */}
          <p className="arcade-eyebrow mb-4">
            INSERT COIN
          </p>

          {/* Large Pixel Title with Cyan & Hot-Pink 3D Shadow & Glow */}
          <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-pixel uppercase tracking-tight mb-4 leading-tight select-none">
            <span className="arcade-title-cyan inline-block mr-2 sm:mr-4">BYTE</span>
            <span className="arcade-title-pink inline-block">BATTLE</span>
          </h1>

          {/* Supporting Tagline */}
          <p className="max-w-2xl mx-auto text-sm sm:text-base text-[#8A8AB8] leading-relaxed mb-6 font-sans">
            Your next high-score obsession starts here. Solve puzzles, master reflex challenges, survive arcade chaos, and beat your personal best.
          </p>

          {/* Prominent Action Cluster: Install Button + Random Game Button */}
          <div className="flex flex-wrap items-center justify-center gap-3.5">
            <ArcadeInstallButton />
            <button
              type="button"
              onClick={handleRandomGame}
              id="random-game-hero-btn"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-full bg-[#0D0D22]/90 hover:bg-[#12122A] border border-[#A855F7]/70 hover:border-[#00F0FF] text-[#E8E8FF] hover:text-[#00F0FF] shadow-[0_0_15px_rgba(168,85,247,0.25)] hover:shadow-[0_0_20px_rgba(0,240,255,0.35)] transition-all font-pixel text-xs tracking-wider focus:outline-none focus:ring-2 focus:ring-[#00F0FF] active:scale-95 group cursor-pointer"
              aria-label="Launch a random arcade game (Shortcut: Press R)"
            >
              <Dices className="w-4 h-4 text-[#FFE45E] group-hover:rotate-45 transition-transform duration-300" />
              <span>RANDOM GAME</span>
            </button>
          </div>
        </div>
      </section>

      {/* Main Game Catalog Section with GH-Arcade Toolbar & Category Filters */}
      <section id="game-catalog" className="w-full max-w-[1720px] mx-auto px-3 sm:px-5 lg:px-6 py-6 mb-16 scroll-mt-20 relative z-10">
        {/* Toolbar: Section Title on left + Category Filters on right */}
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 mb-8 pb-4 border-b border-[#24244A]">
          <div className="flex items-center gap-3">
            <h2 className="font-pixel text-xs sm:text-sm tracking-wider uppercase text-[#E8E8FF]">
              ARCADE GAMES
            </h2>
            <span className="hidden sm:inline-block w-2 h-2 rounded-full bg-[#00F0FF] animate-pulse" />
          </div>

          {/* Category Filter Pills */}
          <div
            className="flex items-center gap-2 overflow-x-auto pb-1 max-w-full no-scrollbar"
            role="toolbar"
            aria-label="Filter games by category"
          >
            {ARCADE_CATEGORIES.map((cat) => {
              const isSelected = activeCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setActiveCategory(cat.id)}
                  aria-pressed={isSelected}
                  className={`arcade-filter-pill ${isSelected ? 'active' : ''}`}
                >
                  {cat.label}
                </button>
              );
            })}
          </div>
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
                      {/* Title & Badge */}
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

                  {/* Footer: Personal Best + Info + Leaderboard + Play Trigger */}
                  <div className="px-5 pb-5 pt-3 border-t border-[#24244A] flex items-center justify-between">
                    <div>
                      <span className="text-[9px] font-sans text-[#8A8AB8] block uppercase">
                        Personal Best
                      </span>
                      <span className="text-xs sm:text-sm font-pixel font-bold text-[#FFE45E]">
                        {pb > 0 ? `${pb.toLocaleString()} PTS` : '—'}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => setSelectedInfoGame(game.id)}
                        className="p-2.5 rounded-xl bg-[#05050D] hover:bg-[#141432] border border-[#24244A] text-[#8A8AB8] hover:text-[#00F0FF] hover:border-[#00F0FF]/50 transition-colors cursor-pointer"
                        title={`How to play ${game.title}`}
                        aria-label={`Instructions for ${game.title}`}
                      >
                        <Info className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => {
                          setSelectedLeaderboardGame(game.id);
                          setSelectedLeaderboardTitle(game.title);
                        }}
                        className="p-2.5 rounded-xl bg-[#05050D] hover:bg-[#141432] border border-[#24244A] text-[#8A8AB8] hover:text-[#FFE45E] hover:border-[#FFE45E]/50 transition-colors cursor-pointer"
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
          /* Graceful Empty State for categories without implemented games (e.g. 2-Player) */
          <div className="py-16 px-6 text-center rounded-2xl bg-[#0D0D22] border border-[#24244A] flex flex-col items-center max-w-lg mx-auto">
            <div className="w-14 h-14 rounded-2xl bg-[#05050D] border border-[#24244A] flex items-center justify-center text-[#00F0FF] mb-4 shadow-[0_0_20px_rgba(0,240,255,0.2)]">
              <Gamepad2 className="w-7 h-7" />
            </div>
            <h3 className="font-pixel text-xs sm:text-sm text-[#00F0FF] uppercase mb-2">
              NO {activeCategory.toUpperCase()} ARENAS FOUND
            </h3>
            <p className="text-xs text-[#8A8AB8] leading-relaxed font-sans mb-5">
              All active arenas are currently optimized for single-player tournament runs and individual personal bests.
            </p>
            <button
              onClick={() => setActiveCategory('all')}
              className="px-5 py-2.5 rounded-full bg-[#00F0FF] text-[#05050D] font-sans font-bold text-xs shadow-[0_0_16px_rgba(0,240,255,0.4)] cursor-pointer"
            >
              Show All Arenas
            </button>
          </div>
        )}
      </section>

      {/* Dedicated Game Leaderboard Modal */}
      {selectedLeaderboardGame && (
        <GameLeaderboardModal
          gameId={selectedLeaderboardGame}
          gameTitle={selectedLeaderboardTitle}
          isOpen={true}
          onClose={() => setSelectedLeaderboardGame(null)}
          currentParticipantId="practice-user"
        />
      )}

      {/* Universal How To Play Guide Modal */}
      {selectedInfoGame && (
        <HowToPlayModal
          isOpen={true}
          gameId={selectedInfoGame}
          onClose={() => setSelectedInfoGame(null)}
        />
      )}
    </div>
  );
}
