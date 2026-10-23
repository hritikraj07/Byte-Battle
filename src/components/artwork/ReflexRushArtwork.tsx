import React from 'react';

interface ArtworkProps {
  className?: string;
}

export const ReflexRushArtwork: React.FC<ArtworkProps> = ({ className = '' }) => {
  return (
    <div className={`relative w-full h-full overflow-hidden rounded-2xl bg-[#12141D] flex items-center justify-center ${className}`}>
      <svg
        viewBox="0 0 400 220"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full object-cover select-none"
      >
        <defs>
          <linearGradient id="rr-bg" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#141824" />
            <stop offset="100%" stopColor="#0B0D14" />
          </linearGradient>
          <linearGradient id="rr-lightning" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#C8FF3D" />
            <stop offset="100%" stopColor="#00E5FF" />
          </linearGradient>
          <linearGradient id="rr-meter" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#22C55E" />
            <stop offset="50%" stopColor="#EAB308" />
            <stop offset="100%" stopColor="#EF4444" />
          </linearGradient>
          <radialGradient id="rr-glow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#C8FF3D" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#C8FF3D" stopOpacity="0" />
          </radialGradient>
        </defs>

        <rect width="400" height="220" fill="url(#rr-bg)" />
        <circle cx="200" cy="110" r="110" fill="url(#rr-glow)" />

        {/* Circular Speedometer Arc */}
        <circle
          cx="200"
          cy="110"
          r="75"
          stroke="#1F2538"
          strokeWidth="12"
          strokeDasharray="360 120"
          transform="rotate(135 200 110)"
          strokeLinecap="round"
        />
        <circle
          cx="200"
          cy="110"
          r="75"
          stroke="url(#rr-meter)"
          strokeWidth="10"
          strokeDasharray="260 220"
          transform="rotate(135 200 110)"
          strokeLinecap="round"
          className="drop-shadow-[0_0_8px_rgba(200,255,61,0.6)]"
        />

        {/* Speedometer ticks */}
        {[0, 30, 60, 90, 120, 150, 180, 210].map((deg, i) => (
          <line
            key={i}
            x1="200"
            y1="40"
            x2="200"
            y2="48"
            stroke={i > 5 ? '#EF4444' : '#C8FF3D'}
            strokeWidth="2.5"
            transform={`rotate(${deg - 105} 200 110)`}
          />
        ))}

        {/* Center Target Rings */}
        <circle cx="200" cy="110" r="45" fill="#181C28" stroke="#2B344D" strokeWidth="2" />
        <circle cx="200" cy="110" r="32" fill="#0E111A" stroke="#C8FF3D" strokeWidth="1.5" strokeDasharray="4 3" />

        {/* High-voltage Reaction Lightning Bolt */}
        <path
          d="M205 82 L188 112 H202 L195 138 L216 106 H200 Z"
          fill="url(#rr-lightning)"
          className="drop-shadow-[0_0_12px_rgba(200,255,61,0.8)]"
        />

        {/* Precision Digital Readout */}
        <g transform="translate(200, 175)">
          <rect x="-45" y="-12" width="90" height="24" rx="6" fill="#0C0E14" stroke="#283146" strokeWidth="1.5" />
          <text x="0" y="5" fill="#C8FF3D" fontSize="13" fontFamily="monospace" fontWeight="900" textAnchor="middle" letterSpacing="1">
            0.184s
          </text>
        </g>

        {/* Impulse shockwaves */}
        <circle cx="200" cy="110" r="92" stroke="#00E5FF" strokeWidth="1" strokeDasharray="6 8" opacity="0.4" />
      </svg>
    </div>
  );
};
