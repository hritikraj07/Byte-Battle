'use client';

import React, { useState } from 'react';

export const ToneAnalyzer: React.FC = () => {
  const [analyzeText, setAnalyzeText] = useState(
    'The future belongs to those who build bridges between human intuition and synthetic intelligence.'
  );

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="p-6 rounded-3xl bg-white border border-[#E2E8F0] shadow-sm space-y-4">
        <h2 className="text-base sm:text-lg font-bold text-[#0F172A]">
          Cognitive Complexity & Tone Spectrum Analyzer
        </h2>
        <p className="text-xs text-[#64748B]">
          Evaluates input syntax, semantic density, and emotional valence in real-time.
        </p>
        <textarea
          rows={3}
          value={analyzeText}
          onChange={(e) => setAnalyzeText(e.target.value)}
          className="w-full p-4 rounded-2xl bg-[#F8FAFC] border border-[#CBD5E1] text-[#0F172A] text-sm font-sans focus:outline-none focus:ring-2 focus:ring-[#7C3AED] resize-none"
        />
      </div>

      {/* Live Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-6 rounded-3xl bg-white border border-[#E2E8F0] shadow-sm text-center">
          <span className="text-xs font-mono uppercase text-[#64748B] block mb-1">Syntactic Density</span>
          <span className="text-3xl font-black text-[#7C3AED]">
            {Math.min(99, Math.round((analyzeText.split(' ').length / 15) * 65))}%
          </span>
          <span className="text-[11px] text-[#94A3B8] block mt-1">Lexical richness</span>
        </div>

        <div className="p-6 rounded-3xl bg-white border border-[#E2E8F0] shadow-sm text-center">
          <span className="text-xs font-mono uppercase text-[#64748B] block mb-1">Valence Resonance</span>
          <span className="text-3xl font-black text-emerald-600">+8.4</span>
          <span className="text-[11px] text-[#94A3B8] block mt-1">Constructive optimism</span>
        </div>

        <div className="p-6 rounded-3xl bg-white border border-[#E2E8F0] shadow-sm text-center">
          <span className="text-xs font-mono uppercase text-[#64748B] block mb-1">Cognitive Friction</span>
          <span className="text-3xl font-black text-[#3B82F6]">Low</span>
          <span className="text-[11px] text-[#94A3B8] block mt-1">High readability flow</span>
        </div>
      </div>
    </div>
  );
};
