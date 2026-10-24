'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Sparkles, Sliders } from 'lucide-react';
import { LifeIn2036, FutureSimulator } from '@/features/future';

export default function FutureLabPage() {
  const [activeTab, setActiveTab] = useState<'life2036' | 'simulator'>('life2036');

  return (
    <div className="w-full min-h-screen bg-[#050B1A] text-[#E0E7FF] font-sans selection:bg-[#00F0FF] selection:text-[#050B1A] relative overflow-hidden">
      {/* Cinematic Sci-Fi Starfield & Ambient Glow */}
      <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-[#0066FF]/15 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute top-1/3 right-10 w-[500px] h-[500px] bg-[#8B5CF6]/15 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-10 left-10 w-[450px] h-[450px] bg-[#00F0FF]/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Header Banner */}
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-6 relative z-10">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[#1E2E5D] pb-6">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="p-2 rounded-xl bg-[#0B1536] hover:bg-[#122154] border border-[#1E2E5D] text-[#818CF8] hover:text-white transition-all"
              title="Return to AFTERHOURS Home"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono tracking-widest uppercase bg-[#00F0FF]/15 text-[#00F0FF] border border-[#00F0FF]/30">
                  TEMPORAL OBSERVATORY
                </span>
                <span className="text-xs text-[#818CF8] font-mono">SPECULATIVE LAB 01</span>
              </div>
              <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-white mt-1">
                FUTURE LAB
              </h1>
            </div>
          </div>

          {/* Mode Switcher */}
          <div className="flex items-center gap-2 p-1 rounded-2xl bg-[#0B1536] border border-[#1E2E5D]">
            <button
              onClick={() => setActiveTab('life2036')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                activeTab === 'life2036'
                  ? 'bg-[#0066FF] text-white shadow-[0_0_16px_rgba(0,102,255,0.4)]'
                  : 'text-[#818CF8] hover:text-white'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Life in 2036</span>
            </button>
            <button
              onClick={() => setActiveTab('simulator')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                activeTab === 'simulator'
                  ? 'bg-[#8B5CF6] text-white shadow-[0_0_16px_rgba(139,92,246,0.4)]'
                  : 'text-[#818CF8] hover:text-white'
              }`}
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>Future Simulator</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Experience Container */}
      <main className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 relative z-10">
        {activeTab === 'life2036' ? <LifeIn2036 /> : <FutureSimulator />}
      </main>
    </div>
  );
}
