import React from 'react';

interface ArtworkProps {
  className?: string;
}

export const StackSprintArtwork: React.FC<ArtworkProps> = ({ className = '' }) => {
  return (
    <div className={`relative w-full h-full overflow-hidden rounded-2xl bg-[#12141D] flex items-center justify-center ${className}`}>
      <svg
        viewBox="0 0 400 220"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full object-cover select-none"
      >
        <defs>
          <linearGradient id="ss-bg" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#151726" />
            <stop offset="100%" stopColor="#0D0E17" />
          </linearGradient>
          <linearGradient id="ss-block-1" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#3B82F6" />
            <stop offset="100%" stopColor="#00E5FF" />
          </linearGradient>
          <linearGradient id="ss-block-2" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#9B6BFF" />
            <stop offset="100%" stopColor="#C8FF3D" />
          </linearGradient>
          <linearGradient id="ss-block-top" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#C8FF3D" />
            <stop offset="100%" stopColor="#FACC15" />
          </linearGradient>
          <radialGradient id="ss-glow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#C8FF3D" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#C8FF3D" stopOpacity="0" />
          </radialGradient>
        </defs>

        <rect width="400" height="220" fill="url(#ss-bg)" />
        <circle cx="200" cy="110" r="100" fill="url(#ss-glow)" />

        {/* Alignment Guide Lines */}
        <line x1="140" y1="20" x2="140" y2="200" stroke="#1E2438" strokeWidth="1" strokeDasharray="4 4" />
        <line x1="260" y1="20" x2="260" y2="200" stroke="#1E2438" strokeWidth="1" strokeDasharray="4 4" />

        {/* Stack Tower Base & Blocks */}
        {/* Foundation Base */}
        <rect x="130" y="180" width="140" height="20" rx="4" fill="#1C2133" stroke="#2D3652" strokeWidth="1.5" />

        {/* Level 1 Block */}
        <rect x="140" y="156" width="120" height="22" rx="4" fill="url(#ss-block-1)" className="drop-shadow-[0_0_8px_rgba(59,130,246,0.5)]" />

        {/* Level 2 Block */}
        <rect x="145" y="132" width="110" height="22" rx="4" fill="url(#ss-block-2)" className="drop-shadow-[0_0_8px_rgba(155,107,255,0.5)]" />

        {/* Level 3 Block */}
        <rect x="150" y="108" width="100" height="22" rx="4" fill="#00E5FF" className="drop-shadow-[0_0_8px_rgba(0,229,255,0.5)]" />

        {/* Active Moving Block with Kinetic Motion Blur */}
        <g transform="translate(160, 78)">
          <rect x="-10" y="0" width="95" height="22" rx="4" fill="url(#ss-block-top)" className="drop-shadow-[0_0_12px_rgba(200,255,61,0.8)]" />
          {/* Sliced Off Fragment Falling */}
          <rect x="87" y="14" width="18" height="18" rx="2" fill="#F87171" transform="rotate(25 96 23)" opacity="0.8" />
        </g>

        {/* Motion vectors */}
        <path d="M 120 89 H 145" stroke="#C8FF3D" strokeWidth="2" strokeLinecap="round" opacity="0.6" />
        <path d="M 270 89 H 295" stroke="#C8FF3D" strokeWidth="2" strokeLinecap="round" opacity="0.6" />

        {/* Score & Combo Pill */}
        <g transform="translate(200, 36)">
          <rect x="-42" y="-12" width="84" height="24" rx="12" fill="#181B2B" stroke="#C8FF3D" strokeWidth="1.5" />
          <text x="0" y="5" fill="#C8FF3D" fontSize="12" fontFamily="monospace" fontWeight="900" textAnchor="middle" letterSpacing="1">
            STACK 18
          </text>
        </g>
      </svg>
    </div>
  );
};
