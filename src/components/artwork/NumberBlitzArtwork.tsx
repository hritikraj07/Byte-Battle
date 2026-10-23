import React from 'react';

interface ArtworkProps {
  className?: string;
}

export const NumberBlitzArtwork: React.FC<ArtworkProps> = ({ className = '' }) => {
  return (
    <div className={`relative w-full h-full overflow-hidden rounded-2xl bg-[#12141D] flex items-center justify-center ${className}`}>
      <svg
        viewBox="0 0 400 220"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full object-cover select-none"
      >
        <defs>
          <linearGradient id="nb-bg" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#141824" />
            <stop offset="100%" stopColor="#0B0D15" />
          </linearGradient>
          <linearGradient id="nb-math" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#F59E0B" />
            <stop offset="100%" stopColor="#EF4444" />
          </linearGradient>
          <radialGradient id="nb-glow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#F59E0B" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#F59E0B" stopOpacity="0" />
          </radialGradient>
        </defs>

        <rect width="400" height="220" fill="url(#nb-bg)" />
        <circle cx="200" cy="110" r="105" fill="url(#nb-glow)" />

        {/* Floating Mathematical Operator Glyphs in background */}
        <text x="60" y="60" fill="#252F47" fontSize="28" fontFamily="monospace" fontWeight="900">+</text>
        <text x="330" y="70" fill="#252F47" fontSize="32" fontFamily="monospace" fontWeight="900">×</text>
        <text x="70" y="180" fill="#252F47" fontSize="30" fontFamily="monospace" fontWeight="900">÷</text>
        <text x="320" y="175" fill="#252F47" fontSize="32" fontFamily="monospace" fontWeight="900">−</text>

        {/* Central Mental Equation Card */}
        <g transform="translate(200, 95)">
          <rect x="-110" y="-35" width="220" height="70" rx="16" fill="#171C2B" stroke="#2E3955" strokeWidth="2" />
          <text x="0" y="10" fill="#FFFFFF" fontSize="30" fontFamily="monospace" fontWeight="900" textAnchor="middle" letterSpacing="2">
            14 × 7 = <tspan fill="#F59E0B" className="drop-shadow-[0_0_8px_rgba(245,158,11,0.8)]">?</tspan>
          </text>
        </g>

        {/* Four Rapid Choice Answer Pills */}
        <g transform="translate(200, 172)">
          {[-75, -25, 25, 75].map((x, i) => {
            const isCorrect = i === 2;
            const vals = ['88', '94', '98', '108'];
            return (
              <g key={i} transform={`translate(${x}, 0)`}>
                <rect
                  x="-20"
                  y="-14"
                  width="40"
                  height="28"
                  rx="8"
                  fill={isCorrect ? '#F59E0B' : '#141824'}
                  stroke={isCorrect ? '#FCD34D' : '#2A334B'}
                  strokeWidth="1.5"
                  className={isCorrect ? 'drop-shadow-[0_0_8px_rgba(245,158,11,0.7)]' : ''}
                />
                <text
                  x="0"
                  y="4"
                  fill={isCorrect ? '#000000' : '#E2E8F0'}
                  fontSize="12"
                  fontFamily="monospace"
                  fontWeight="900"
                  textAnchor="middle"
                >
                  {vals[i]}
                </text>
              </g>
            );
          })}
        </g>

        {/* Streak Blitz Multiplier */}
        <g transform="translate(200, 32)">
          <rect x="-45" y="-10" width="90" height="20" rx="10" fill="#2A1E14" stroke="#F59E0B" strokeWidth="1" />
          <text x="0" y="4" fill="#F59E0B" fontSize="10" fontFamily="monospace" fontWeight="900" textAnchor="middle" letterSpacing="1">
            STREAK ×5 🔥
          </text>
        </g>
      </svg>
    </div>
  );
};
