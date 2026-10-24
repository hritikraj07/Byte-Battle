'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Wand2, Layers, Activity } from 'lucide-react';
import { PromptTransformer, ConceptWeaver, ToneAnalyzer } from '@/features/ai-studio';

export default function AIStudioPage() {
  const [activeTab, setActiveTab] = useState<'prompt' | 'weaver' | 'analyzer'>('prompt');

  return (
    <div className="w-full min-h-screen bg-[#F8FAFC] text-[#0F172A] font-sans selection:bg-[#7C3AED] selection:text-white relative">
      {/* Top Banner Header */}
      <header className="w-full bg-white border-b border-[#E2E8F0] shadow-sm sticky top-16 z-30">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="p-2 rounded-xl bg-[#F1F5F9] hover:bg-[#E2E8F0] border border-[#CBD5E1] text-[#475569] hover:text-[#0F172A] transition-all"
              title="Return to AFTERHOURS Home"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono tracking-wider uppercase bg-[#EDE9FE] text-[#7C3AED] font-bold">
                  LOCAL NEURAL WORKSPACE
                </span>
                <span className="text-xs text-[#64748B] font-mono">LAB 02</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#0F172A]">
                AI STUDIO
              </h1>
            </div>
          </div>

          {/* Clean Light-Themed Switcher Tabs */}
          <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-[#F1F5F9] border border-[#E2E8F0]">
            <button
              onClick={() => setActiveTab('prompt')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                activeTab === 'prompt'
                  ? 'bg-white text-[#7C3AED] shadow-sm font-bold'
                  : 'text-[#64748B] hover:text-[#0F172A]'
              }`}
            >
              <Wand2 className="w-3.5 h-3.5" />
              <span>Prompt Transformer</span>
            </button>

            <button
              onClick={() => setActiveTab('weaver')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                activeTab === 'weaver'
                  ? 'bg-white text-[#7C3AED] shadow-sm font-bold'
                  : 'text-[#64748B] hover:text-[#0F172A]'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Concept Weaver</span>
            </button>

            <button
              onClick={() => setActiveTab('analyzer')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                activeTab === 'analyzer'
                  ? 'bg-white text-[#7C3AED] shadow-sm font-bold'
                  : 'text-[#64748B] hover:text-[#0F172A]'
              }`}
            >
              <Activity className="w-3.5 h-3.5" />
              <span>Cognitive Spectrum</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Studio Playfield */}
      <main className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'prompt' && <PromptTransformer />}
        {activeTab === 'weaver' && <ConceptWeaver />}
        {activeTab === 'analyzer' && <ToneAnalyzer />}
      </main>
    </div>
  );
}
