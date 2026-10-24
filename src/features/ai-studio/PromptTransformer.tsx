'use client';

import React, { useState } from 'react';
import { Terminal, Copy, Check } from 'lucide-react';
import { TransformationMode, MODE_PRESETS } from './aiStudioData';

export const PromptTransformer: React.FC = () => {
  const [rawPrompt, setRawPrompt] = useState('a secret laboratory hidden inside a mountain');
  const [selectedMode, setSelectedMode] = useState<TransformationMode>('hyper-cinematic');
  const [copied, setCopied] = useState(false);

  const transformedPrompt = MODE_PRESETS[selectedMode].template(rawPrompt.trim() || 'an enigmatic subject');

  const handleCopyPrompt = () => {
    navigator.clipboard.writeText(transformedPrompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="p-4 sm:p-5 rounded-2xl bg-white border border-[#E2E8F0] shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-[#0F172A]">
            Semantic Prompt Expansion & Optimization
          </h2>
          <p className="text-xs text-[#64748B]">
            Transform plain text concepts into mathematically weighted, high-fidelity prompt directives ready for modern generative models.
          </p>
        </div>
        <span className="text-[11px] font-mono text-[#7C3AED] bg-[#EDE9FE] px-2.5 py-1 rounded-lg font-bold">
          Deterministic Client-Side Engine
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Input & Mode Configuration */}
        <div className="lg:col-span-5 space-y-5">
          <div className="p-6 rounded-3xl bg-white border border-[#E2E8F0] shadow-sm space-y-4">
            <label className="block text-xs font-mono uppercase tracking-wider text-[#475569] font-bold">
              1. Input Seed Concept
            </label>
            <textarea
              rows={4}
              value={rawPrompt}
              onChange={(e) => setRawPrompt(e.target.value)}
              placeholder="Enter your seed idea, subject, or scene..."
              className="w-full p-4 rounded-2xl bg-[#F8FAFC] border border-[#CBD5E1] text-[#0F172A] text-sm font-sans focus:outline-none focus:ring-2 focus:ring-[#7C3AED] resize-none"
            />

            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-[#475569] font-bold mb-2.5">
                2. Optimization Filter Mode
              </label>
              <div className="space-y-2">
                {(Object.keys(MODE_PRESETS) as TransformationMode[]).map((modeKey) => {
                  const mode = MODE_PRESETS[modeKey];
                  const isSelected = selectedMode === modeKey;
                  return (
                    <button
                      key={modeKey}
                      onClick={() => setSelectedMode(modeKey)}
                      className={`w-full p-3 rounded-xl border text-left transition-all flex items-center justify-between ${
                        isSelected
                          ? 'bg-[#EDE9FE] border-[#7C3AED] text-[#5B21B6] shadow-sm'
                          : 'bg-[#F8FAFC] border-[#E2E8F0] text-[#334155] hover:bg-[#F1F5F9]'
                      }`}
                    >
                      <div>
                        <span className="text-xs font-bold block">{mode.name}</span>
                        <span className="text-[10px] text-[#64748B]">{mode.tag}</span>
                      </div>
                      {isSelected && <Check className="w-4 h-4 text-[#7C3AED]" />}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Output Preview & Actions */}
        <div className="lg:col-span-7 flex flex-col">
          <div className="flex-1 p-6 sm:p-8 rounded-3xl bg-white border border-[#E2E8F0] shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-[#E2E8F0] mb-5">
                <div className="flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-[#7C3AED]" />
                  <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#0F172A]">
                    Generated Prompt Specification
                  </span>
                </div>
                <button
                  onClick={handleCopyPrompt}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#7C3AED] hover:bg-[#6D28D9] text-white text-xs font-semibold shadow-sm transition-all active:scale-95 cursor-pointer"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-300" />
                      <span>COPIED!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>COPY PROMPT</span>
                    </>
                  )}
                </button>
              </div>

              <div className="p-5 rounded-2xl bg-[#0F172A] text-[#E2E8F0] font-mono text-xs sm:text-sm leading-relaxed border border-[#334155] shadow-inner select-all">
                {transformedPrompt}
              </div>

              {/* Telemetry info */}
              <div className="grid grid-cols-3 gap-3 mt-6">
                <div className="p-3 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] text-center">
                  <span className="text-[10px] uppercase font-mono text-[#64748B] block">Char Count</span>
                  <span className="text-sm font-bold text-[#0F172A]">{transformedPrompt.length}</span>
                </div>
                <div className="p-3 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] text-center">
                  <span className="text-[10px] uppercase font-mono text-[#64748B] block">Estimated Tokens</span>
                  <span className="text-sm font-bold text-[#7C3AED]">{Math.round(transformedPrompt.length / 4)}</span>
                </div>
                <div className="p-3 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] text-center">
                  <span className="text-[10px] uppercase font-mono text-[#64748B] block">Compatibility</span>
                  <span className="text-sm font-bold text-emerald-600">Midjourney / SDXL</span>
                </div>
              </div>
            </div>

            <p className="text-[11px] text-[#64748B] mt-6 italic">
              Note: This synthesizer runs entirely on client-side rules without sending data to external cloud servers.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
