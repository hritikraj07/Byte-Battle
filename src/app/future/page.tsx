'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Sparkles } from 'lucide-react';
import { FutureSelfEngine } from '@/features/future';

export default function FutureLabPage() {
  return (
    <div className="w-full min-h-screen bg-[#070A13] text-[#E0E7FF] font-sans selection:bg-[#00F0FF] selection:text-[#050B1A] relative overflow-hidden">
      {/* Header Banner */}
      <div className="w-full max-w-[1720px] mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-4 relative z-10">
        <div className="flex items-center justify-between gap-4 border-b border-[#1E293B] pb-4">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="p-2.5 rounded-xl bg-[#0E1322] hover:bg-[#1A233D] border border-[#1E293B] text-[#94A3B8] hover:text-white transition-all shadow-sm cursor-pointer"
              title="Return to AFTERHOURS Home"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono tracking-widest uppercase bg-[#00F0FF]/15 text-[#00F0FF] border border-[#00F0FF]/30 font-bold">
                  TEMPORAL OBSERVATORY
                </span>
                <span className="text-xs text-[#94A3B8] font-mono">FUTURE LAB</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white mt-1">
                FUTURE SELF VISUALIZER
              </h1>
            </div>
          </div>

          <div className="hidden sm:flex items-center gap-2 text-xs font-mono text-[#38BDF8] bg-[#0E1322] border border-[#1E293B] px-3 py-1.5 rounded-xl">
            <Sparkles className="w-3.5 h-3.5 text-[#00F0FF]" />
            <span>Project your age & cybernetics</span>
          </div>
        </div>
      </div>

      {/* Main Experience Container */}
      <main className="w-full max-w-[1720px] mx-auto px-4 sm:px-6 lg:px-8 py-4 relative z-10">
        <FutureSelfEngine />
      </main>
    </div>
  );
}
