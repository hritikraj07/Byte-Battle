'use client';

import React, { useState } from 'react';
import { Activity } from 'lucide-react';
import { PREDICTIONS } from './futureData';

export const LifeIn2036: React.FC = () => {
  const [selectedDomain, setSelectedDomain] = useState<string>('homes');
  const [timelineYear, setTimelineYear] = useState<number>(2036);

  const currentDomain = PREDICTIONS.find((p) => p.id === selectedDomain) || PREDICTIONS[0];

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Sub-hero note */}
      <div className="p-4 sm:p-6 rounded-3xl bg-gradient-to-r from-[#0B1536] to-[#0A1028] border border-[#1E2E5D] flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xl">
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-white mb-1">
            Chronicle of Possibility: Earth 2036
          </h2>
          <p className="text-xs sm:text-sm text-[#818CF8] max-w-2xl">
            Interactive speculative forecasts across seven societal vectors. These models represent plausible extrapolations of current research, framed as possibilities rather than guarantees.
          </p>
        </div>

        {/* Timeline Year Slider */}
        <div className="flex items-center gap-3 bg-[#050B1A]/80 p-3 rounded-2xl border border-[#1E2E5D] w-full md:w-auto">
          <span className="text-xs font-mono text-[#00F0FF] font-bold">HORIZON:</span>
          <input
            type="range"
            min={2026}
            max={2036}
            step={1}
            value={timelineYear}
            onChange={(e) => setTimelineYear(Number(e.target.value))}
            className="w-32 accent-[#00F0FF] cursor-pointer"
          />
          <span className="font-mono text-sm font-black text-white bg-[#0066FF] px-2.5 py-1 rounded-lg">
            {timelineYear}
          </span>
        </div>
      </div>

      {/* Domain Navigation Pills */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5">
        {PREDICTIONS.map((domain) => {
          const Icon = domain.icon;
          const isSelected = selectedDomain === domain.id;
          return (
            <button
              key={domain.id}
              onClick={() => setSelectedDomain(domain.id)}
              className={`p-3.5 rounded-2xl border text-left transition-all flex flex-col justify-between gap-3 ${
                isSelected
                  ? 'bg-[#0066FF]/25 border-[#00F0FF] text-white shadow-[0_0_20px_rgba(0,240,255,0.25)] scale-102'
                  : 'bg-[#0B1536]/80 border-[#1E2E5D] text-[#818CF8] hover:text-white hover:border-[#818CF8]/50'
              }`}
            >
              <Icon className={`w-5 h-5 ${isSelected ? 'text-[#00F0FF]' : 'text-[#818CF8]'}`} />
              <div>
                <span className="text-xs font-bold block">{domain.name}</span>
                <span className="text-[10px] text-[#00F0FF] font-mono">{domain.prob}% Likelihood</span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Selected Domain Deep Dive Card */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Left Column: Forecast Breakdown */}
        <div className="lg:col-span-7 p-6 sm:p-8 rounded-3xl bg-[#0B1536]/90 border border-[#1E2E5D] flex flex-col justify-between shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#0066FF]/10 rounded-full blur-3xl pointer-events-none" />

          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-[#8B5CF6]/20 text-[#A78BFA] border border-[#8B5CF6]/40 uppercase">
                Impact: {currentDomain.impact}
              </span>
              <span className="text-xs text-[#818CF8] font-mono">• Vector 2036</span>
            </div>

            <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight mb-2">
              {currentDomain.name}
            </h3>
            <p className="text-sm font-medium text-[#00F0FF] mb-5">
              {currentDomain.tagline}
            </p>

            <p className="text-sm text-[#C7D2FE] leading-relaxed mb-6">
              {currentDomain.breakdown}
            </p>

            {/* Core Technologies Required */}
            <div className="pt-4 border-t border-[#1E2E5D]">
              <span className="text-xs font-mono text-[#818CF8] uppercase tracking-wider block mb-2 font-bold">
                Enabling Core Technologies:
              </span>
              <div className="flex flex-wrap gap-2">
                {currentDomain.keyTech.map((tech, i) => (
                  <span
                    key={i}
                    className="px-3 py-1 rounded-xl text-xs font-mono bg-[#050B1A] border border-[#1E2E5D] text-[#E0E7FF]"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-8 flex items-center justify-between pt-4 border-t border-[#1E2E5D]/60 text-xs text-[#818CF8]">
            <span>Algorithmic Confidence: <strong className="text-white">{currentDomain.prob}%</strong></span>
            <span>Horizon Horizon: 2036 CE</span>
          </div>
        </div>

        {/* Right Column: Progressive Milestone Trajectory */}
        <div className="lg:col-span-5 p-6 sm:p-8 rounded-3xl bg-[#0B1536]/60 border border-[#1E2E5D] flex flex-col justify-between shadow-xl">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Activity className="w-4 h-4 text-[#00F0FF]" />
              <h4 className="text-sm font-mono font-bold text-white uppercase tracking-wider">
                Decade Milestone Trajectory
              </h4>
            </div>

            <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-[#1E2E5D]">
              {currentDomain.timeline.map((step, i) => {
                const isPastOrPresent = step.year <= timelineYear;
                return (
                  <div key={i} className="relative">
                    {/* Dot marker */}
                    <div
                      className={`absolute -left-[29px] top-0.5 w-4 h-4 rounded-full border-2 transition-all ${
                        isPastOrPresent
                          ? 'bg-[#00F0FF] border-white shadow-[0_0_10px_#00F0FF]'
                          : 'bg-[#050B1A] border-[#1E2E5D]'
                      }`}
                    />
                    <span
                      className={`text-xs font-mono font-black block mb-0.5 ${
                        isPastOrPresent ? 'text-[#00F0FF]' : 'text-[#818CF8]'
                      }`}
                    >
                      {step.year} CE
                    </span>
                    <p
                      className={`text-xs leading-relaxed ${
                        isPastOrPresent ? 'text-[#E0E7FF]' : 'text-[#6366F1]/70'
                      }`}
                    >
                      {step.event}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-6 p-3 rounded-xl bg-[#050B1A] border border-[#1E2E5D] text-[11px] text-[#818CF8]">
            Slider position: <strong className="text-white">{timelineYear}</strong>. Events highlighted in cyan are active under this horizon.
          </div>
        </div>
      </div>
    </div>
  );
};
