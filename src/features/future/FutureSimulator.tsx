'use client';

import React, { useState } from 'react';
import {
  RotateCcw,
  ChevronRight,
  CheckCircle2,
} from 'lucide-react';
import { SCENARIOS } from './futureData';

export const FutureSimulator: React.FC = () => {
  const [activeScenarioIdx, setActiveScenarioIdx] = useState(0);
  const [currentStepIdx, setCurrentStepIdx] = useState(0);
  const [metrics, setMetrics] = useState({ stability: 50, tech: 50, ecology: 50, flourishing: 50 });
  const [log, setLog] = useState<{ stepTitle: string; choice: string; consequence: string }[]>([]);
  const [simCompleted, setSimCompleted] = useState(false);

  const scenario = SCENARIOS[activeScenarioIdx];
  const currentStep = scenario.steps[currentStepIdx];

  const handleSimChoice = (optionIdx: number) => {
    const opt = currentStep.options[optionIdx];
    const newMetrics = {
      stability: Math.min(100, Math.max(0, metrics.stability + opt.impacts.stability)),
      tech: Math.min(100, Math.max(0, metrics.tech + opt.impacts.tech)),
      ecology: Math.min(100, Math.max(0, metrics.ecology + opt.impacts.ecology)),
      flourishing: Math.min(100, Math.max(0, metrics.flourishing + opt.impacts.flourishing)),
    };
    setMetrics(newMetrics);

    const newLog = [
      ...log,
      { stepTitle: currentStep.title, choice: opt.label, consequence: opt.consequence },
    ];
    setLog(newLog);

    if (currentStepIdx + 1 < scenario.steps.length) {
      setCurrentStepIdx((prev) => prev + 1);
    } else {
      setSimCompleted(true);
    }
  };

  const resetSimulator = () => {
    setCurrentStepIdx(0);
    setMetrics({ stability: 50, tech: 50, ecology: 50, flourishing: 50 });
    setLog([]);
    setSimCompleted(false);
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Scenario Header */}
      <div className="p-6 rounded-3xl bg-[#0B1536] border border-[#1E2E5D] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#8B5CF6]/20 text-[#A78BFA] border border-[#8B5CF6]/40 uppercase">
              SIMULATION ENGINE
            </span>
            <span className="text-xs text-[#818CF8] font-mono">{scenario.era}</span>
          </div>
          <h2 className="text-2xl font-black text-white">{scenario.name}</h2>
          <p className="text-xs sm:text-sm text-[#C7D2FE] mt-1 max-w-2xl">{scenario.description}</p>
        </div>

        {/* Scenario Selector */}
        <div className="flex gap-2">
          {SCENARIOS.map((sc, idx) => (
            <button
              key={sc.id}
              onClick={() => {
                setActiveScenarioIdx(idx);
                resetSimulator();
              }}
              className={`px-3.5 py-2 rounded-xl text-xs font-mono font-bold transition-all ${
                activeScenarioIdx === idx
                  ? 'bg-[#8B5CF6] text-white shadow-[0_0_16px_rgba(139,92,246,0.4)]'
                  : 'bg-[#050B1A] text-[#818CF8] hover:text-white border border-[#1E2E5D]'
              }`}
            >
              Scenario {idx + 1}
            </button>
          ))}
        </div>
      </div>

      {/* Vital Metrics Status Dashboard */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Biosphere Equilibrium', value: metrics.ecology, color: 'text-emerald-400', bar: 'bg-emerald-400' },
          { label: 'Civilization Stability', value: metrics.stability, color: 'text-[#00F0FF]', bar: 'bg-[#00F0FF]' },
          { label: 'Technological Velocity', value: metrics.tech, color: 'text-[#8B5CF6]', bar: 'bg-[#8B5CF6]' },
          { label: 'Human Flourishing', value: metrics.flourishing, color: 'text-[#FF8B3D]', bar: 'bg-[#FF8B3D]' },
        ].map((m, i) => (
          <div key={i} className="p-4 rounded-2xl bg-[#0B1536]/80 border border-[#1E2E5D]">
            <div className="flex items-center justify-between text-xs font-mono mb-2">
              <span className="text-[#818CF8]">{m.label}</span>
              <span className={`font-black ${m.color}`}>{m.value}%</span>
            </div>
            <div className="w-full h-2 rounded-full bg-[#050B1A] overflow-hidden">
              <div
                className={`h-full ${m.bar} transition-all duration-500 rounded-full`}
                style={{ width: `${m.value}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      {!simCompleted ? (
        /* Active Step Decision Card */
        <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-[#0B1536] to-[#0D183D] border-2 border-[#8B5CF6]/40 shadow-2xl space-y-6">
          <div>
            <span className="text-xs font-mono text-[#00F0FF] uppercase tracking-wider block mb-1 font-bold">
              DECISION POINT {currentStepIdx + 1} OF {scenario.steps.length}: {currentStep.title}
            </span>
            <p className="text-sm text-[#C7D2FE] leading-relaxed mb-4">{currentStep.brief}</p>
            <h3 className="text-lg sm:text-xl font-bold text-white border-l-4 border-[#8B5CF6] pl-3 py-1">
              {currentStep.question}
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            {currentStep.options.map((opt, oIdx) => (
              <button
                key={oIdx}
                onClick={() => handleSimChoice(oIdx)}
                className="p-5 rounded-2xl bg-[#050B1A]/90 hover:bg-[#122154] border border-[#1E2E5D] hover:border-[#8B5CF6] text-left transition-all hover:scale-101 active:scale-98 flex flex-col justify-between group shadow-lg"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-bold text-white group-hover:text-[#A78BFA] transition-colors">
                      {opt.label}
                    </span>
                    <ChevronRight className="w-4 h-4 text-[#818CF8] group-hover:translate-x-1 transition-transform" />
                  </div>
                  <p className="text-xs text-[#C7D2FE] leading-relaxed mb-4">
                    {opt.description}
                  </p>
                </div>

                <div className="pt-3 border-t border-[#1E2E5D] flex items-center justify-between text-[10px] font-mono text-[#818CF8]">
                  <span>Projected Shift:</span>
                  <span className="text-[#00F0FF]">Execute Policy →</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      ) : (
        /* Simulation Completed Outcome Card */
        <div className="p-8 rounded-3xl bg-[#0B1536] border-2 border-[#00F0FF]/40 shadow-2xl text-center space-y-6 animate-scaleIn">
          <CheckCircle2 className="w-16 h-16 text-[#00F0FF] mx-auto animate-bounce" />
          <div>
            <span className="text-xs font-mono text-[#00F0FF] uppercase tracking-widest block mb-1">
              TRAJECTORY SYNTHESIS COMPLETE
            </span>
            <h3 className="text-2xl sm:text-3xl font-black text-white">
              2036 Planetary Equilibrium Reached
            </h3>
            <p className="text-sm text-[#C7D2FE] max-w-xl mx-auto mt-2">
              Your sequence of policy directives formed a unique civilization outcome. Review the resultant timeline below:
            </p>
          </div>

          {/* Outcome Log */}
          <div className="max-w-2xl mx-auto space-y-3 text-left">
            {log.map((item, i) => (
              <div key={i} className="p-4 rounded-xl bg-[#050B1A] border border-[#1E2E5D]">
                <span className="text-[10px] font-mono text-[#8B5CF6] block uppercase">
                  {item.stepTitle} • Chosen: {item.choice}
                </span>
                <p className="text-xs text-[#E0E7FF] mt-1 font-sans">
                  {item.consequence}
                </p>
              </div>
            ))}
          </div>

          <div className="flex justify-center gap-3 pt-4">
            <button
              onClick={resetSimulator}
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-[#0066FF] hover:bg-[#1E75FF] text-white font-mono text-xs font-bold transition-all shadow-[0_0_16px_rgba(0,102,255,0.4)]"
            >
              <RotateCcw className="w-4 h-4" />
              <span>RERUN SIMULATION</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
