'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Compass } from 'lucide-react';
import { RadarFeed } from '@/features/discover';

export default function TomorrowRadarPage() {
  return (
    <div className="w-full min-h-screen bg-[#04150E] text-[#ECFDF5] font-sans selection:bg-[#10B981] selection:text-[#04150E] relative overflow-hidden">
      {/* Ambient Forest & Emerald Glows */}
      <div className="absolute top-0 right-1/4 w-[600px] h-[600px] bg-[#10B981]/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-20 left-10 w-[500px] h-[500px] bg-[#059669]/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Header Bar */}
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-6 relative z-10">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[#0D3823] pb-6">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="p-2 rounded-xl bg-[#082015] hover:bg-[#0D3322] border border-[#0D3823] text-[#10B981] hover:text-white transition-all"
              title="Return to AFTERHOURS Home"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono tracking-widest uppercase bg-[#10B981]/15 text-[#10B981] border border-[#10B981]/30">
                  GLOBAL HORIZON RADAR
                </span>
                <span className="text-xs text-[#059669] font-mono">INTELLIGENCE BRIEF</span>
              </div>
              <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-white mt-1">
                TOMORROW RADAR
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono text-[#10B981] bg-[#082015] px-3.5 py-2 rounded-xl border border-[#0D3823]">
            <Compass className="w-4 h-4 animate-spin text-[#10B981]" style={{ animationDuration: '12s' }} />
            <span>Scanning 6 Science & Tech Vectors</span>
          </div>
        </div>
      </div>

      {/* Main Radar Feed */}
      <main className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 relative z-10">
        <RadarFeed />
      </main>
    </div>
  );
}
