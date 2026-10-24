'use client';

import React from 'react';
import Link from 'next/link';
import {
  Gamepad2,
  Sparkles,
  Cpu,
  Compass,
  UserCheck,
  Clock,
  Orbit,
  ArrowRight,
  Shield,
  Zap,
  Activity,
  Layers,
  Award,
} from 'lucide-react';
import { AfterhoursLogo } from '@/components/common/AfterhoursLogo';

interface PortalCard {
  id: string;
  title: string;
  category: string;
  desc: string;
  route: string;
  icon: React.ElementType;
  accent: string;
  badge: string;
  ambientGrad: string;
  borderHover: string;
  previewTags: string[];
}

const PORTALS: PortalCard[] = [
  {
    id: 'games',
    title: 'Arcade Arena',
    category: 'RETRO & REFLEX ARENA',
    desc: 'The complete 12-game championship arcade. Solve mathematical puzzles, survive laser barrages, dodge orbital debris, and beat high scores.',
    route: '/games',
    icon: Gamepad2,
    accent: '#00F0FF',
    badge: '12 Mini-Games',
    ambientGrad: 'from-[#00F0FF]/15 via-[#0D1528] to-[#090A0F]',
    borderHover: 'hover:border-[#00F0FF]/70 shadow-[0_0_30px_rgba(0,240,255,0.15)]',
    previewTags: ['Pattern Shift', 'Pulse Jumper', '2048 Neo', 'Reflex Rush'],
  },
  {
    id: 'future',
    title: 'Future Lab',
    category: 'TEMPORAL OBSERVATORY',
    desc: 'Experience life in 2036 across 7 societal vectors. Run the multi-branch Future Simulator to test energy singularities and machine rights.',
    route: '/future',
    icon: Sparkles,
    accent: '#0066FF',
    badge: 'Interactive Lab',
    ambientGrad: 'from-[#0066FF]/15 via-[#0A1028] to-[#090A0F]',
    borderHover: 'hover:border-[#0066FF]/70 shadow-[0_0_30px_rgba(0,102,255,0.15)]',
    previewTags: ['Life in 2036', 'Civilization Metrics', 'Branching Policies'],
  },
  {
    id: 'ai-studio',
    title: 'AI Studio',
    category: 'NEURAL WORKBENCH',
    desc: 'Experimental laboratory for generative prompt transformation, dialectic concept weaving, and real-time cognitive tone analysis.',
    route: '/ai-studio',
    icon: Cpu,
    accent: '#A78BFA',
    badge: 'Experimental Tools',
    ambientGrad: 'from-[#A78BFA]/15 via-[#151228] to-[#090A0F]',
    borderHover: 'hover:border-[#A78BFA]/70 shadow-[0_0_30px_rgba(167,139,250,0.15)]',
    previewTags: ['Prompt Expander', 'Dialectic Weaver', 'Tone Gauge'],
  },
  {
    id: 'discover',
    title: 'Tomorrow Radar',
    category: 'FRONTIER INTELLIGENCE',
    desc: 'Curated scientific discovery radar monitoring breakthroughs in topological quantum qubits, JWST plume spectrometry, and clean fusion.',
    route: '/discover',
    icon: Compass,
    accent: '#10B981',
    badge: 'Science Intel',
    ambientGrad: 'from-[#10B981]/15 via-[#081812] to-[#090A0F]',
    borderHover: 'hover:border-[#10B981]/70 shadow-[0_0_30px_rgba(16,185,129,0.15)]',
    previewTags: ['Majorana Modes', 'TRL Gauges', 'Astrobiology'],
  },
  {
    id: 'identity',
    title: 'Digital Identity Lab',
    category: 'CYBERNETIC FORGE',
    desc: 'Design, customize, and mint your sovereign holographic ID card. Select archetypes, avatar glyphs, bio manifestos, and luminous foils.',
    route: '/identity',
    icon: UserCheck,
    accent: '#EC4899',
    badge: 'Cyber Persona',
    ambientGrad: 'from-[#EC4899]/15 via-[#1E0B25] to-[#090A0F]',
    borderHover: 'hover:border-[#EC4899]/70 shadow-[0_0_30px_rgba(236,72,153,0.15)]',
    previewTags: ['Holo Foil', 'Vector Glyphs', 'Local Persistence'],
  },
  {
    id: 'time-capsule',
    title: 'Time Capsule',
    category: 'COSMIC VAULT',
    desc: 'Seal letters, predictions, and milestones for your future self. Encrypted with temporal countdown locks to be opened in 2030 and beyond.',
    route: '/time-capsule',
    icon: Clock,
    accent: '#818CF8',
    badge: 'Reflective Journal',
    ambientGrad: 'from-[#818CF8]/15 via-[#0E1230] to-[#090A0F]',
    borderHover: 'hover:border-[#818CF8]/70 shadow-[0_0_30px_rgba(129,140,248,0.15)]',
    previewTags: ['Temporal Padlock', 'Horizon 2036', 'Personal Archive'],
  },
  {
    id: 'neonverse',
    title: 'Neonverse',
    category: 'IMMERSIVE WORLDS',
    desc: 'Three interactive digital universes: The Synthwave Nebula, The Quantum Expanse, and The Chrono Spire, powered by kinetic particle physics.',
    route: '/neonverse',
    icon: Orbit,
    accent: '#F59E0B',
    badge: 'Kinetic Canvas',
    ambientGrad: 'from-[#F59E0B]/15 via-[#1C1408] to-[#090A0F]',
    borderHover: 'hover:border-[#F59E0B]/70 shadow-[0_0_30px_rgba(245,158,11,0.15)]',
    previewTags: ['N-Body Gravity', 'Audio Harmonics', 'Perspective Warp'],
  },
];

export default function AfterhoursHomePage() {
  const scrollToPortals = () => {
    const el = document.getElementById('portals');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="w-full bg-[#090A0F] text-[#F4F4F8] font-sans selection:bg-[#A78BFA] selection:text-[#090A0F] relative overflow-hidden">
      {/* Ambient Lighting & Atmospheric Gradients */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[450px] bg-gradient-to-b from-[#A78BFA]/15 via-[#818CF8]/5 to-transparent rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute top-[40%] right-[-10%] w-[600px] h-[600px] bg-[#00F0FF]/10 rounded-full blur-[160px] pointer-events-none" />
      <div className="absolute top-[70%] left-[-10%] w-[600px] h-[600px] bg-[#8B5CF6]/10 rounded-full blur-[160px] pointer-events-none" />

      {/* HERO SECTION */}
      <section className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 sm:pt-24 pb-16 text-center">
        {/* Editorial Subtitle Pill */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#171A25] border border-[#2B3048] shadow-sm mb-6 animate-fadeIn">
          <span className="w-1.5 h-1.5 rounded-full bg-[#A78BFA] shadow-[0_0_8px_#A78BFA]" />
          <span className="text-xs font-mono tracking-widest uppercase text-[#D5D7E0]">
            DIGITAL DESTINATION • AFTER DARK
          </span>
        </div>

        {/* Exact Headline */}
        <h1 className="text-5xl sm:text-7xl lg:text-8xl font-extrabold tracking-tight text-white mb-6 uppercase">
          AFTERHOURS
        </h1>

        {/* Exact Supporting Copy */}
        <p className="max-w-2xl mx-auto text-base sm:text-xl text-[#A4A6B8] leading-relaxed mb-10 font-normal">
          A place for the unexpected. Explore digital worlds, imagine the future, experiment with AI, and discover experiences beyond the ordinary.
        </p>

        {/* Call to Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
          {/* Primary CTA: Explore the worlds */}
          <button
            onClick={scrollToPortals}
            className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-[#A78BFA] hover:bg-[#9061F9] text-[#090A0F] font-bold text-sm tracking-wide shadow-[0_0_30px_rgba(167,139,250,0.35)] transition-all hover:scale-102 active:scale-98 flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>Explore the worlds</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          {/* Secondary CTA: Enter the arcade (Navigates directly to /games) */}
          <Link
            href="/games"
            className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-[#171A25] hover:bg-[#202434] border border-[#2B3048] hover:border-[#00F0FF]/60 text-[#F4F4F8] hover:text-[#00F0FF] font-bold text-sm tracking-wide shadow-md transition-all flex items-center justify-center gap-2.5 group"
          >
            <Gamepad2 className="w-4 h-4 text-[#00F0FF] group-hover:scale-110 transition-transform" />
            <span>Enter the arcade</span>
          </Link>
        </div>

        {/* Brand Principles Highlights Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 max-w-4xl mx-auto pt-8 border-t border-[#1E2235]/60 text-left">
          <div className="p-3">
            <span className="text-[10px] font-mono text-[#A78BFA] uppercase tracking-wider block font-bold">
              Autonomous Hub
            </span>
            <p className="text-xs text-[#D5D7E0] mt-0.5">7 Unique Digital Labs</p>
          </div>
          <div className="p-3">
            <span className="text-[10px] font-mono text-[#00F0FF] uppercase tracking-wider block font-bold">
              Championship Arcade
            </span>
            <p className="text-xs text-[#D5D7E0] mt-0.5">12 Verified Mini-Games</p>
          </div>
          <div className="p-3">
            <span className="text-[10px] font-mono text-[#10B981] uppercase tracking-wider block font-bold">
              Local Persistence
            </span>
            <p className="text-xs text-[#D5D7E0] mt-0.5">100% Offline-Ready</p>
          </div>
          <div className="p-3">
            <span className="text-[10px] font-mono text-[#EC4899] uppercase tracking-wider block font-bold">
              Independent Identity
            </span>
            <p className="text-xs text-[#D5D7E0] mt-0.5">Crafted by Hritik Raj</p>
          </div>
        </div>
      </section>

      {/* FEATURE DISCOVERY DASHBOARD: PORTAL CARDS */}
      <section id="portals" className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 scroll-mt-20">
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-3 mb-10 pb-4 border-b border-[#1E2235]">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2 h-2 rounded-full bg-[#A78BFA]" />
              <span className="text-xs font-mono tracking-widest uppercase text-[#A78BFA] font-bold">
                EXPERIENCE MATRIX
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Select Your Destination
            </h2>
          </div>
          <p className="text-xs text-[#A4A6B8] max-w-md">
            Step through dedicated portals into simulations, creative neural tools, interactive futures, and arcade games.
          </p>
        </div>

        {/* Asymmetrical Editorial Portal Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {PORTALS.map((portal, idx) => {
            const Icon = portal.icon;
            const isFeatured = idx === 0 || idx === 1;

            return (
              <Link
                key={portal.id}
                href={portal.route}
                className={`group p-6 sm:p-7 rounded-3xl bg-[#10121B] border border-[#1E2235] ${portal.borderHover} transition-all duration-300 flex flex-col justify-between relative overflow-hidden shadow-xl hover:-translate-y-1 ${
                  isFeatured ? 'md:col-span-1 lg:col-span-1' : ''
                }`}
              >
                {/* Ambient Radial Accent Backlight */}
                <div
                  className={`absolute -top-20 -right-20 w-48 h-48 rounded-full blur-3xl pointer-events-none opacity-40 group-hover:opacity-80 transition-opacity bg-gradient-to-br ${portal.ambientGrad}`}
                />

                <div>
                  {/* Top Meta Line: Category & Badge */}
                  <div className="flex items-center justify-between gap-2 mb-4">
                    <span className="text-[10px] font-mono tracking-widest uppercase font-bold" style={{ color: portal.accent }}>
                      {portal.category}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#171A25] border border-[#2B3048] text-[#D5D7E0]">
                      {portal.badge}
                    </span>
                  </div>

                  {/* Icon & Title */}
                  <div className="flex items-center gap-3 mb-3">
                    <div
                      className="w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0 border"
                      style={{
                        backgroundColor: `${portal.accent}15`,
                        borderColor: `${portal.accent}40`,
                        color: portal.accent,
                      }}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                    <h3 className="text-xl font-bold text-white group-hover:text-white transition-colors">
                      {portal.title}
                    </h3>
                  </div>

                  {/* Description */}
                  <p className="text-xs sm:text-sm text-[#A4A6B8] leading-relaxed mb-6">
                    {portal.desc}
                  </p>
                </div>

                {/* Footer: Preview Tags & Arrow Action */}
                <div className="pt-4 border-t border-[#1E2235] flex items-center justify-between gap-2">
                  <div className="flex flex-wrap gap-1.5">
                    {portal.previewTags.slice(0, 2).map((tag, tIdx) => (
                      <span
                        key={tIdx}
                        className="px-2 py-0.5 rounded-md text-[10px] font-mono bg-[#171A25] text-[#A4A6B8] border border-[#2B3048]"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  <span
                    className="flex items-center gap-1 text-xs font-mono font-bold transition-transform group-hover:translate-x-1"
                    style={{ color: portal.accent }}
                  >
                    <span>Enter</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* CURATED EXPLORATION PATHS */}
      <section className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="p-8 sm:p-10 rounded-3xl bg-gradient-to-r from-[#10121B] via-[#171A25] to-[#10121B] border border-[#1E2235] shadow-2xl">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-4 h-4 text-[#A78BFA]" />
            <span className="text-xs font-mono uppercase tracking-widest text-[#A78BFA] font-bold">
              CURATED AFTERHOURS JOURNEYS
            </span>
          </div>

          <h3 className="text-xl sm:text-2xl font-bold text-white mb-2">
            Suggested Nightly Exploration Pathways
          </h3>
          <p className="text-xs sm:text-sm text-[#A4A6B8] max-w-2xl mb-8">
            Tailored trajectories through interconnected experiences, pairing analytical forecasts with creative simulations.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-5 rounded-2xl bg-[#090A0F] border border-[#1E2235] flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-mono text-[#0066FF] uppercase font-bold block mb-1">
                  PATH 01 • THE FUTURIST
                </span>
                <h4 className="text-sm font-bold text-white mb-1.5">
                  Future Lab → Tomorrow Radar
                </h4>
                <p className="text-xs text-[#A4A6B8] leading-relaxed mb-4">
                  Explore 2036 societal forecasts, run civilization simulations, and inspect verified quantum and space intelligence.
                </p>
              </div>
              <Link
                href="/future"
                className="text-xs font-mono text-[#0066FF] hover:underline flex items-center gap-1 font-bold"
              >
                Begin Journey →
              </Link>
            </div>

            <div className="p-5 rounded-2xl bg-[#090A0F] border border-[#1E2235] flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-mono text-[#A78BFA] uppercase font-bold block mb-1">
                  PATH 02 • THE SYNTHESIST
                </span>
                <h4 className="text-sm font-bold text-white mb-1.5">
                  Digital Identity → AI Studio
                </h4>
                <p className="text-xs text-[#A4A6B8] leading-relaxed mb-4">
                  Forge a sovereign cyber ID card, then experiment with dialectic concept collision and semantic prompt expansion.
                </p>
              </div>
              <Link
                href="/identity"
                className="text-xs font-mono text-[#A78BFA] hover:underline flex items-center gap-1 font-bold"
              >
                Begin Journey →
              </Link>
            </div>

            <div className="p-5 rounded-2xl bg-[#090A0F] border border-[#1E2235] flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-mono text-[#00F0FF] uppercase font-bold block mb-1">
                  PATH 03 • THE ARCADE VETERAN
                </span>
                <h4 className="text-sm font-bold text-white mb-1.5">
                  Arcade Arena → Neonverse
                </h4>
                <p className="text-xs text-[#A4A6B8] leading-relaxed mb-4">
                  Engage 12 retro puzzle and reflex arenas, then plunge into gravitational n-body particle fields in Neonverse.
                </p>
              </div>
              <Link
                href="/games"
                className="text-xs font-mono text-[#00F0FF] hover:underline flex items-center gap-1 font-bold"
              >
                Enter Arcade →
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
