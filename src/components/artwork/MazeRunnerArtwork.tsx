import React from 'react';

interface ArtworkProps {
  className?: string;
}

export const MazeRunnerArtwork: React.FC<ArtworkProps> = ({ className = '' }) => {
  return (
    <div className={`relative w-full h-full overflow-hidden rounded-2xl bg-[#12141D] flex items-center justify-center ${className}`}>
      <svg
        viewBox="0 0 400 220"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full object-cover select-none"
      >
        <defs>
          <linearGradient id="mr-bg" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#101924" />
            <stop offset="100%" stopColor="#0B0F17" />
          </linearGradient>
          <radialGradient id="mr-glow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#10B981" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#10B981" stopOpacity="0" />
          </radialGradient>
        </defs>

        <rect width="400" height="220" fill="url(#mr-bg)" />
        <circle cx="200" cy="110" r="100" fill="url(#mr-glow)" />

        {/* Cyber Labyrinth Maze Wall Segments */}
        <g stroke="#1F3444" strokeWidth="4" strokeLinecap="round">
          <rect x="90" y="30" width="220" height="160" rx="8" stroke="#264459" strokeWidth="3" fill="none" />
          {/* Internal Maze corridors */}
          <path d="M 130 30 V 90 H 180 V 60" />
          <path d="M 180 90 V 130 H 140" />
          <path d="M 220 30 V 80 H 260 V 110" />
          <path d="M 170 160 H 220 V 130 H 270" />
          <path d="M 90 120 H 130 V 160" />
          <path d="M 220 160 V 190" />
          <path d="M 270 140 V 190" />
        </g>

        {/* Light Path Solved Trail */}
        <path
          d="M 105 45 H 115 V 105 H 160 V 75 H 205 V 115 H 245 V 145 H 205 V 175 H 185"
          stroke="#10B981"
          strokeWidth="3.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="drop-shadow-[0_0_8px_rgba(16,185,129,0.8)]"
        />

        {/* Player Runner Beacon */}
        <g transform="translate(185, 175)">
          <circle cx="0" cy="0" r="8" fill="#10B981" className="drop-shadow-[0_0_12px_rgba(16,185,129,1)]" />
          <circle cx="0" cy="0" r="3" fill="#FFFFFF" />
        </g>

        {/* Maze Exit Portal */}
        <g transform="translate(105, 45)">
          <circle cx="0" cy="0" r="10" fill="#EC4899" fillOpacity="0.4" stroke="#F472B6" strokeWidth="2" className="drop-shadow-[0_0_10px_rgba(236,72,153,0.8)]" />
          <circle cx="0" cy="0" r="4" fill="#FFFFFF" />
        </g>

        {/* Compass radar indicator */}
        <g transform="translate(345, 45)">
          <circle cx="0" cy="0" r="16" fill="#141F2B" stroke="#253D52" strokeWidth="1.5" />
          <polygon points="0,-12 4,0 0,2 -4,0" fill="#10B981" />
          <polygon points="0,12 4,0 0,-2 -4,0" fill="#64748B" />
        </g>
      </svg>
    </div>
  );
};
