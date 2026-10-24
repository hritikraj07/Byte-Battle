'use client';

import React from 'react';
import { DigitalPersona, FOIL_STYLES, GLYPHS } from './identityData';

interface IdentityBadgeProps {
  persona: DigitalPersona;
}

export const IdentityBadge: React.FC<IdentityBadgeProps> = ({ persona }) => {
  const activeFoil = FOIL_STYLES.find((f) => f.id === persona.foilStyle) || FOIL_STYLES[0];

  return (
    <div className="sticky top-24">
      <span className="text-xs font-mono text-[#A855F7] uppercase tracking-wider block mb-3 font-bold text-center lg:text-left">
        Real-Time Holographic Telemetry
      </span>

      {/* The Badge */}
      <div
        className={`p-7 rounded-3xl border-2 shadow-2xl relative overflow-hidden transition-all duration-300 ${activeFoil.bg}`}
        style={{
          borderColor: persona.accentColor,
          boxShadow: `0 0 35px ${persona.accentColor}40`,
        }}
      >
        {/* Prismatic Shimmer Scanline */}
        <div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full animate-[shimmer_4s_infinite]"
          style={{ pointerEvents: 'none' }}
        />

        {/* Top Row: Issuer & Glyph */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <span
              className="text-[10px] font-mono tracking-widest uppercase block"
              style={{ color: persona.accentColor }}
            >
              AFTERHOURS SOVEREIGN ID
            </span>
            <span className="text-xs font-mono text-[#A855F7]/80">CLASS-A VERIFIED</span>
          </div>
          <div
            className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl font-black border"
            style={{
              backgroundColor: `${persona.accentColor}20`,
              borderColor: persona.accentColor,
              color: persona.accentColor,
              boxShadow: `0 0 16px ${persona.accentColor}50`,
            }}
          >
            {GLYPHS[persona.glyphId] || '◈'}
          </div>
        </div>

        {/* Persona Identity */}
        <div className="mb-5">
          <h3 className="text-2xl font-black text-white tracking-tight leading-tight">
            {persona.displayName || 'Unnamed Drifter'}
          </h3>
          <div className="flex items-center gap-2 mt-1">
            <span
              className="font-mono text-xs px-2 py-0.5 rounded bg-black/40 border border-white/10"
              style={{ color: persona.accentColor }}
            >
              {persona.callsign || 'UNKNOWN'}
            </span>
            <span className="text-xs font-mono text-slate-300">
              {persona.archetype}
            </span>
          </div>
        </div>

        {/* Bio */}
        <p className="text-xs text-[#E9D5FF]/90 leading-relaxed mb-6 font-sans">
          {persona.bio}
        </p>

        {/* Skills / Specializations */}
        <div className="mb-6">
          <span className="text-[10px] font-mono uppercase text-[#A855F7] tracking-wider block mb-2">
            Cognitive Accreditations
          </span>
          <div className="flex flex-wrap gap-1.5">
            {persona.skills.map((s, i) => (
              <span
                key={i}
                className="px-2.5 py-0.5 rounded-md text-[10px] font-mono bg-black/50 border border-white/15 text-white"
              >
                {s}
              </span>
            ))}
          </div>
        </div>

        {/* Badge Footer Telemetry */}
        <div className="pt-4 border-t border-white/10 flex items-center justify-between text-[10px] font-mono text-slate-400">
          <span>SEC-HASH: 8F7A...22E9</span>
          <span>PERSISTED LOCALLY</span>
        </div>
      </div>

      <p className="text-[11px] text-[#A855F7]/70 text-center mt-4">
        Stored client-side in browser storage. No account creation required.
      </p>
    </div>
  );
};
