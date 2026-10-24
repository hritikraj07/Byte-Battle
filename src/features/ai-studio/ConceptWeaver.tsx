'use client';

import React, { useState } from 'react';
import { Sparkles, Check } from 'lucide-react';
import { CONCEPT_PAIRS } from './aiStudioData';

export const ConceptWeaver: React.FC = () => {
  const [conceptA, setConceptA] = useState('Bioluminescent Fungi');
  const [conceptB, setConceptB] = useState('Brutalist Architecture');
  const [wovenResult, setWovenResult] = useState<string | null>(null);

  const handleSynthesizeWeave = () => {
    const result = `Conceptual Synthesis: "${conceptA}" × "${conceptB}"
    
• Architectural Core: Monolithic brutalist concrete pillars intersected by organic mycelial channels that pulse with soft cyan and emerald bioluminescence during dusk.
• Spatial Mood: Heavy industrial permanence softened by delicate, living photosynthetic veining.
• Recommended Palette: #0F172A (Deep Slate), #64748B (Raw Concrete), #06B6D4 (Bio-Cyan), #10B981 (Spore Emerald).
• Master Prompt: "An imposing brutalist structure where raw geometric concrete facades are overgrown with ${conceptA.toLowerCase()}, harmonizing with ${conceptB.toLowerCase()}, natural sunlight spilling across textured mineral surfaces, cinematic architectural editorial."`;
    setWovenResult(result);
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="p-4 sm:p-5 rounded-2xl bg-white border border-[#E2E8F0] shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-[#0F172A]">
            Neural Concept Synthesis & Dialectics
          </h2>
          <p className="text-xs text-[#64748B]">
            Collide two seemingly irreconcilable concepts to generate an aesthetic and philosophical synthesis blueprint.
          </p>
        </div>
      </div>

      {/* Quick Presets Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
        <span className="text-xs font-mono text-[#64748B] font-bold flex-shrink-0">Presets:</span>
        {CONCEPT_PAIRS.map((pair, idx) => (
          <button
            key={idx}
            onClick={() => {
              setConceptA(pair.a);
              setConceptB(pair.b);
              setWovenResult(null);
            }}
            className="px-3 py-1.5 rounded-xl bg-white hover:bg-[#EDE9FE] border border-[#CBD5E1] hover:border-[#7C3AED] text-xs font-sans text-[#334155] flex-shrink-0 transition-colors"
          >
            {pair.a} + {pair.b}
          </button>
        ))}
      </div>

      {/* Dialectic Inputs */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
        <div className="p-6 rounded-3xl bg-white border border-[#E2E8F0] shadow-sm space-y-2">
          <span className="text-xs font-mono text-[#7C3AED] font-bold uppercase tracking-wider">Concept Alpha</span>
          <input
            type="text"
            value={conceptA}
            onChange={(e) => setConceptA(e.target.value)}
            className="w-full p-3.5 rounded-xl bg-[#F8FAFC] border border-[#CBD5E1] text-[#0F172A] font-bold text-base focus:outline-none focus:ring-2 focus:ring-[#7C3AED]"
          />
        </div>

        <div className="p-6 rounded-3xl bg-white border border-[#E2E8F0] shadow-sm space-y-2">
          <span className="text-xs font-mono text-[#7C3AED] font-bold uppercase tracking-wider">Concept Beta</span>
          <input
            type="text"
            value={conceptB}
            onChange={(e) => setConceptB(e.target.value)}
            className="w-full p-3.5 rounded-xl bg-[#F8FAFC] border border-[#CBD5E1] text-[#0F172A] font-bold text-base focus:outline-none focus:ring-2 focus:ring-[#7C3AED]"
          />
        </div>
      </div>

      {/* Action Trigger */}
      <div className="flex justify-center">
        <button
          onClick={handleSynthesizeWeave}
          className="px-8 py-3.5 rounded-2xl bg-[#7C3AED] hover:bg-[#6D28D9] text-white font-bold text-sm tracking-wide shadow-md transition-all active:scale-95 flex items-center gap-2 cursor-pointer"
        >
          <Sparkles className="w-4 h-4" />
          <span>SYNTHESIZE DIALECTIC WEAVE</span>
        </button>
      </div>

      {/* Synthesis Results Output */}
      {wovenResult && (
        <div className="p-6 sm:p-8 rounded-3xl bg-white border-2 border-[#7C3AED]/40 shadow-lg space-y-4 animate-scaleIn">
          <div className="flex items-center gap-2 text-[#7C3AED] font-mono text-xs font-bold uppercase tracking-wider">
            <Check className="w-4 h-4" />
            <span>SYNTHESIS BLUEPRINT GENERATED</span>
          </div>
          <pre className="p-5 rounded-2xl bg-[#0F172A] text-[#E2E8F0] font-sans text-xs sm:text-sm leading-relaxed whitespace-pre-wrap font-normal border border-[#334155]">
            {wovenResult}
          </pre>
        </div>
      )}
    </div>
  );
};
