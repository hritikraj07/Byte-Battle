import React from 'react';

interface ArtworkProps {
  className?: string;
}

export const ColorClashArtwork: React.FC<ArtworkProps> = ({ className = '' }) => {
  return (
    <div className={`relative w-full h-full overflow-hidden rounded-2xl bg-[#12141D] flex items-center justify-center ${className}`}>
      <svg
        viewBox="0 0 400 220"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full object-cover select-none"
      >
        <defs>
          <linearGradient id="cc-bg" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#171426" />
            <stop offset="100%" stopColor="#0E0D17" />
          </linearGradient>
          <radialGradient id="cc-glow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#EC4899" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#EC4899" stopOpacity="0" />
          </radialGradient>
        </defs>

        <rect width="400" height="220" fill="url(#cc-bg)" />
        <circle cx="200" cy="110" r="110" fill="url(#cc-glow)" />

        {/* 4 Color Quadrant Overlapping Rings */}
        <circle cx="170" cy="85" r="42" fill="#EF4444" fillOpacity="0.3" stroke="#EF4444" strokeWidth="2.5" />
        <circle cx="230" cy="85" r="42" fill="#3B82F6" fillOpacity="0.3" stroke="#3B82F6" strokeWidth="2.5" />
        <circle cx="170" cy="135" r="42" fill="#22C55E" fillOpacity="0.3" stroke="#22C55E" strokeWidth="2.5" />
        <circle cx="230" cy="135" r="42" fill="#EAB308" fillOpacity="0.3" stroke="#EAB308" strokeWidth="2.5" />

        {/* Central Stroop Conflict Typography */}
        <g transform="translate(200, 115)">
          <rect x="-80" y="-22" width="160" height="44" rx="12" fill="#13141F" stroke="#2D3045" strokeWidth="2" />
          {/* Word says BLUE, but text color is neon RED/PINK! */}
          <text
            x="0"
            y="7"
            fill="#EF4444"
            fontSize="22"
            fontFamily="monospace"
            fontWeight="900"
            textAnchor="middle"
            letterSpacing="3"
            className="drop-shadow-[0_0_10px_rgba(239,68,68,0.8)]"
          >
            BLUE
          </text>
        </g>

        {/* Rule Prompt Pill */}
        <g transform="translate(200, 42)">
          <rect x="-65" y="-10" width="130" height="20" rx="10" fill="#201C33" stroke="#9B6BFF" strokeWidth="1" />
          <text x="0" y="4" fill="#9B6BFF" fontSize="10" fontFamily="monospace" fontWeight="700" textAnchor="middle" letterSpacing="1">
            MATCH INK COLOR
          </text>
        </g>

        {/* Rapid decision selector dots */}
        <circle cx="120" cy="188" r="10" fill="#EF4444" stroke="#FFF" strokeWidth="1.5" />
        <circle cx="173" cy="188" r="10" fill="#3B82F6" />
        <circle cx="227" cy="188" r="10" fill="#22C55E" />
        <circle cx="280" cy="188" r="10" fill="#EAB308" />
      </svg>
    </div>
  );
};
