'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Gamepad2,
  Sparkles,
  ArrowRight,
  Zap,
  Camera,
  Shuffle,
  ShieldCheck,
  ChevronRight,
} from 'lucide-react';
import { ACTIVE_GAMES } from '@/data/gamesList';

export default function AfterhoursHomePage() {
  const router = useRouter();
  const [activeCategory, setActiveCategory] = useState<string>('all');

  // Surprise Me / Random Game launcher
  const launchRandomGame = () => {
    const randomIndex = Math.floor(Math.random() * ACTIVE_GAMES.length);
    const chosenGame = ACTIVE_GAMES[randomIndex];
    router.push(`/play/${chosenGame.routeId}`);
  };

  // Filter games for quick launch
  const displayedGames =
    activeCategory === 'all'
      ? ACTIVE_GAMES.slice(0, 8)
      : ACTIVE_GAMES.filter((g) => g.categories.includes(activeCategory as any)).slice(0, 8);

  return (
    <div className="w-full bg-[#090A0F] text-[#F4F4F8] font-sans selection:bg-[#00F0FF] selection:text-[#090A0F] relative overflow-hidden">
      {/* Ambient Lighting & Atmospheric Gradients (contained to avoid horizontal overflow) */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-[1200px] h-[500px] bg-gradient-to-b from-[#8B5CF6]/15 via-[#0066FF]/10 to-transparent rounded-full blur-[140px] pointer-events-none" />

      {/* HERO SECTION */}
      <section className="relative z-10 w-full max-w-[1720px] mx-auto px-4 sm:px-6 lg:px-8 pt-10 sm:pt-16 pb-12 text-center">
        {/* Editorial Subtitle Pill */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#131726] border border-[#252E4A] shadow-md mb-6 animate-fadeIn">
          <span className="w-2 h-2 rounded-full bg-[#00F0FF] animate-pulse" />
          <span className="text-xs font-mono tracking-widest uppercase text-[#94A3B8]">
            AFTERHOURS // DIGITAL DESTINATION
          </span>
          <span className="text-[#38BDF8] text-xs font-mono font-bold pl-1">
            v2.4 ONLINE
          </span>
        </div>

        {/* Headline */}
        <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-black tracking-tight text-white mb-4 sm:mb-6 uppercase break-words">
          AFTERHOURS
        </h1>

        {/* Tagline */}
        <p className="max-w-2xl mx-auto text-lg sm:text-2xl text-[#E2E8F0] font-medium leading-relaxed mb-2">
          A place for the unexpected.
        </p>
        <p className="max-w-xl mx-auto text-xs sm:text-sm text-[#94A3B8] leading-relaxed mb-8">
          Explore digital worlds, project your future self, survive brutal cognitive challenges, and discover experiences beyond the ordinary.
        </p>

        {/* Primary Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 mb-10">
          {/* Future Lab (Spotlight) */}
          <Link
            href="/future"
            className="px-6 py-3 rounded-2xl bg-gradient-to-r from-[#0066FF] to-[#00F0FF] text-white font-bold text-xs sm:text-sm shadow-[0_0_24px_rgba(0,102,255,0.4)] hover:brightness-110 active:scale-95 transition-all flex items-center gap-2 cursor-pointer"
          >
            <Camera className="w-4 h-4" />
            <span>Launch Future Lab</span>
            <ArrowRight className="w-4 h-4 ml-0.5" />
          </Link>

          {/* Championship Arcade */}
          <Link
            href="/games"
            className="px-6 py-3 rounded-2xl bg-[#131726] hover:bg-[#1C233B] border border-[#2B3558] hover:border-[#38BDF8] text-white font-semibold text-xs sm:text-sm shadow-md active:scale-95 transition-all flex items-center gap-2 cursor-pointer"
          >
            <Gamepad2 className="w-4 h-4 text-[#38BDF8]" />
            <span>Arcade Arena (12 Games)</span>
          </Link>

          {/* Surprise Me / Random Game */}
          <button
            onClick={launchRandomGame}
            className="px-5 py-3 rounded-2xl bg-[#131726] hover:bg-[#1C233B] border border-[#2B3558] hover:border-[#A855F7] text-[#C084FC] hover:text-white font-semibold text-xs sm:text-sm shadow-md active:scale-95 transition-all flex items-center gap-2 cursor-pointer"
            title="Launch a surprise random arcade mini-game instantly"
          >
            <Shuffle className="w-4 h-4 text-[#A855F7]" />
            <span>Random Game</span>
          </button>
        </div>

        {/* Live Metrics Highlights */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 max-w-5xl mx-auto pt-6 border-t border-[#1E253E] text-left">
          <div className="p-3 rounded-2xl bg-[#0D1220]/60 border border-[#1A233D]">
            <span className="text-[10px] font-mono text-[#00F0FF] uppercase tracking-wider block font-bold">
              FUTURE OBSERVATORY
            </span>
            <p className="text-xs font-bold text-white mt-0.5">6 Future Horizons</p>
            <span className="text-[10px] text-[#64748B]">Camera & Canvas Biometrics</span>
          </div>

          <div className="p-3 rounded-2xl bg-[#0D1220]/60 border border-[#1A233D]">
            <span className="text-[10px] font-mono text-[#A855F7] uppercase tracking-wider block font-bold">
              CHAMPIONSHIP ARCADE
            </span>
            <p className="text-xs font-bold text-white mt-0.5">12 Mini-Games</p>
            <span className="text-[10px] text-[#64748B]">Math, Reflex & Puzzle</span>
          </div>

          <div className="p-3 rounded-2xl bg-[#0D1220]/60 border border-[#1A233D]">
            <span className="text-[10px] font-mono text-[#10B981] uppercase tracking-wider block font-bold">
              LATENCY BENCHMARK
            </span>
            <p className="text-xs font-bold text-white mt-0.5">Zero Input Delay</p>
            <span className="text-[10px] text-[#64748B]">&lt;40ms Instant Response</span>
          </div>

          <div className="p-3 rounded-2xl bg-[#0D1220]/60 border border-[#1A233D]">
            <span className="text-[10px] font-mono text-[#F59E0B] uppercase tracking-wider block font-bold">
              LOCAL PERSISTENCE
            </span>
            <p className="text-xs font-bold text-white mt-0.5">IndexedDB Storage</p>
            <span className="text-[10px] text-[#64748B]">100% Offline-Ready</span>
          </div>
        </div>
      </section>

      {/* FEATURE SPOTLIGHT 01: FUTURE LAB (FUTURE SELF VISUALIZER) */}
      <section className="relative z-10 w-full max-w-[1720px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="p-6 sm:p-10 rounded-3xl bg-gradient-to-r from-[#0C1224] via-[#101933] to-[#0C1224] border border-[#202C52] shadow-2xl relative overflow-hidden group">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left Content (7 cols) */}
            <div className="lg:col-span-7 space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#00F0FF]/10 text-[#00F0FF] border border-[#00F0FF]/30 text-xs font-mono font-bold">
                <Sparkles className="w-3.5 h-3.5" />
                FLAGSHIP EXPERIENCE • FUTURE LAB
              </div>

              <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
                How Will You Look 10 Years in the Future?
              </h2>

              <p className="text-xs sm:text-base text-[#94A3B8] leading-relaxed max-w-xl">
                Activate your camera or upload a portrait to project yourself across multiple speculative timelines. Transform into a 2036 Tech Vanguard, a 2051 Distinguished Strategist, a Cybernetic Neural-Augmented Specialist, or an Interplanetary Mars Pioneer with client-side HTML5 canvas synthesis.
              </p>

              {/* 4 Quick Horizon Chips */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2">
                <div className="p-2.5 rounded-xl bg-[#090D18] border border-[#1E293B] text-center">
                  <span className="text-[10px] font-mono font-bold text-[#38BDF8] block">
                    +10 YEARS
                  </span>
                  <span className="text-xs font-semibold text-white">2036 Vanguard</span>
                </div>
                <div className="p-2.5 rounded-xl bg-[#090D18] border border-[#1E293B] text-center">
                  <span className="text-[10px] font-mono font-bold text-[#A855F7] block">
                    +25 YEARS
                  </span>
                  <span className="text-xs font-semibold text-white">2051 Strategist</span>
                </div>
                <div className="p-2.5 rounded-xl bg-[#090D18] border border-[#1E293B] text-center">
                  <span className="text-[10px] font-mono font-bold text-[#00F0FF] block">
                    CYBERNETIC
                  </span>
                  <span className="text-xs font-semibold text-white">Neural Optics</span>
                </div>
                <div className="p-2.5 rounded-xl bg-[#090D18] border border-[#1E293B] text-center">
                  <span className="text-[10px] font-mono font-bold text-[#FB923C] block">
                    MARS COLONY
                  </span>
                  <span className="text-xs font-semibold text-white">2040 Pioneer</span>
                </div>
              </div>

              <div className="pt-3 flex flex-wrap items-center gap-4">
                <Link
                  href="/future"
                  className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#0066FF] to-[#00F0FF] text-white font-bold text-xs sm:text-sm shadow-[0_0_20px_rgba(0,240,255,0.35)] hover:brightness-110 active:scale-95 transition-all flex items-center gap-2 cursor-pointer"
                >
                  <Camera className="w-4 h-4" />
                  <span>Open Future Self Camera</span>
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Link>
                <span className="text-xs text-[#64748B] flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-[#10B981]" />
                  Zero server upload • 100% Client-Side Privacy
                </span>
              </div>
            </div>

            {/* Right Interactive Visual Card (5 cols) */}
            <div className="lg:col-span-5 flex justify-center">
              <Link
                href="/future"
                className="w-full max-w-sm aspect-square rounded-2xl bg-[#090D18] border border-[#252E4A] hover:border-[#00F0FF] p-4 relative overflow-hidden transition-all group/card shadow-2xl flex flex-col justify-between cursor-pointer"
              >
                {/* Simulated HUD Reticle */}
                <div className="w-full h-full rounded-xl border border-dashed border-[#334155] relative flex flex-col items-center justify-center p-6 bg-gradient-to-br from-[#0F172A] to-[#090D18]">
                  <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full border-2 border-[#00F0FF]/60 flex items-center justify-center relative shadow-[0_0_30px_rgba(0,240,255,0.25)] group-hover/card:scale-110 transition-transform">
                    <Camera className="w-10 h-10 sm:w-12 sm:h-12 text-[#00F0FF]" />
                    <div className="absolute inset-0 rounded-full border-t-2 border-[#38BDF8] animate-spin" />
                  </div>

                  <span className="text-xs font-mono text-[#00F0FF] font-bold mt-4">
                    BIOMETRIC CAMERA READY
                  </span>
                  <p className="text-[11px] text-[#94A3B8] text-center mt-1">
                    Click to activate live camera and project your age & cybernetic augmentations.
                  </p>

                  <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-[10px] font-mono text-[#64748B] border-t border-[#1E293B] pt-2">
                    <span>HORIZON 2036 - 2076</span>
                    <span className="text-[#38BDF8] group-hover/card:underline">Launch →</span>
                  </div>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURE SPOTLIGHT 02: CHAMPIONSHIP ARCADE & QUICK LAUNCHER */}
      <section className="relative z-10 w-full max-w-[1720px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 mb-6 pb-4 border-b border-[#1E253E]">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Gamepad2 className="w-4 h-4 text-[#A855F7]" />
              <span className="text-xs font-mono uppercase tracking-widest text-[#A855F7] font-bold">
                12 VERIFIED MINI-GAMES
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Championship Arcade Arena
            </h2>
            <p className="text-xs sm:text-sm text-[#94A3B8] mt-1">
              Brutal cognitive speed, rhythm reflexes, spatial navigation, and puzzle deductions.
            </p>
          </div>

          {/* Quick Filter Category Pills */}
          <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-2xl bg-[#0D1220] border border-[#1E293B]">
            {[
              { id: 'all', label: 'All (12)' },
              { id: 'puzzle', label: 'Puzzle' },
              { id: 'action', label: 'Action' },
              { id: 'arcade', label: 'Arcade' },
              { id: 'endless', label: 'Endless' },
            ].map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  activeCategory === cat.id
                    ? 'bg-[#A855F7] text-white shadow-md'
                    : 'text-[#94A3B8] hover:text-white'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Quick Games Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {displayedGames.map((game) => {
            const Icon = game.icon;
            const isHardcore = game.id === 'number-blitz';

            return (
              <Link
                key={game.id}
                href={`/play/${game.routeId}`}
                className="group p-5 rounded-2xl bg-[#0E1322] border border-[#1E293B] hover:border-[#38BDF8] transition-all hover:-translate-y-1 shadow-lg flex flex-col justify-between relative overflow-hidden cursor-pointer"
              >
                <div
                  className="absolute -top-10 -right-10 w-24 h-24 rounded-full blur-2xl pointer-events-none opacity-20 group-hover:opacity-40 transition-opacity"
                  style={{ backgroundColor: game.accentColor }}
                />

                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span
                      className="w-9 h-9 rounded-xl flex items-center justify-center border text-white"
                      style={{
                        backgroundColor: `${game.accentColor}18`,
                        borderColor: `${game.accentColor}40`,
                        color: game.accentColor,
                      }}
                    >
                      <Icon className="w-4 h-4" />
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-[#171A25] text-slate-300 border border-[#2B3048]">
                      {isHardcore ? '🔥 HARDCORE' : game.badge}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-white group-hover:text-[#38BDF8] transition-colors">
                    {game.title}
                  </h3>
                  <p className="text-xs text-[#94A3B8] line-clamp-2 mt-1 leading-relaxed">
                    {game.desc}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-[#1E293B] flex items-center justify-between">
                  <span className="text-[10px] font-mono text-slate-500">
                    {game.controls.split('/')[0]}
                  </span>
                  <span
                    className="flex items-center gap-1 text-xs font-mono font-bold group-hover:translate-x-1 transition-transform"
                    style={{ color: game.accentColor }}
                  >
                    <span>Play</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </Link>
            );
          })}
        </div>

        {/* View All Games Banner Link */}
        <div className="mt-8 text-center">
          <Link
            href="/games"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-[#131726] hover:bg-[#1C233B] border border-[#2B3558] hover:border-[#00F0FF] text-white text-xs font-bold transition-all shadow-md group cursor-pointer"
          >
            <span>Explore full retro arcade catalog & high scores</span>
            <ChevronRight className="w-4 h-4 text-[#00F0FF] group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </section>

      {/* PLATFORM ARCHITECTURE & PERFORMANCE GUARANTEES */}
      <section className="relative z-10 w-full max-w-[1720px] mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="p-6 sm:p-8 rounded-3xl bg-[#0B0F1C] border border-[#1A233D] shadow-xl">
          <div className="flex items-center gap-2 mb-2">
            <Zap className="w-4 h-4 text-[#00F0FF]" />
            <span className="text-xs font-mono uppercase tracking-widest text-[#00F0FF] font-bold">
              ENGINE ARCHITECTURE
            </span>
          </div>

          <h3 className="text-xl sm:text-2xl font-bold text-white mb-1.5">
            Why AFTERHOURS Feels Lightning Fast
          </h3>
          <p className="text-xs sm:text-sm text-[#94A3B8] max-w-2xl mb-6">
            Engineered specifically for fluid responsiveness, zero delay, and uncompromised privacy.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-2xl bg-[#070A13] border border-[#161F36]">
              <span className="text-[10px] font-mono text-[#00F0FF] font-bold block mb-1">
                01 // ZERO ARTIFICIAL DELAY
              </span>
              <h4 className="text-sm font-bold text-white mb-1">
                Sub-40ms Keystroke Engine
              </h4>
              <p className="text-xs text-[#94A3B8] leading-relaxed">
                All gameplay transitions, math problem generations, and user interactions execute instantaneously without artificial timeouts or sluggish animations.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-[#070A13] border border-[#161F36]">
              <span className="text-[10px] font-mono text-[#A855F7] font-bold block mb-1">
                02 // CLIENT-SIDE PRIVACY
              </span>
              <h4 className="text-sm font-bold text-white mb-1">
                Hardware Canvas Synthesis
              </h4>
              <p className="text-xs text-[#94A3B8] leading-relaxed">
                Future Lab facial processing runs strictly inside your local browser GPU/Canvas buffer. Zero photographs or video streams ever touch external cloud servers.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-[#070A13] border border-[#161F36]">
              <span className="text-[10px] font-mono text-[#10B981] font-bold block mb-1">
                03 // DUAL TYPOGRAPHY MATRIX
              </span>
              <h4 className="text-sm font-bold text-white mb-1">
                Contextual Visual Hierarchy
              </h4>
              <p className="text-xs text-[#94A3B8] leading-relaxed">
                Modern sleek <code className="text-[#38BDF8]">Inter</code> typography powers the platform dashboard and Future Lab, while retro scanlines and pixel fonts remain strictly scoped to arcade game arenas.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
