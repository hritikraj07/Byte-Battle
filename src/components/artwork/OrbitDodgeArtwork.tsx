import React from 'react';

interface ArtworkProps {
  className?: string;
}

export const OrbitDodgeArtwork: React.FC<ArtworkProps> = ({ className = '' }) => {
  return (
    <div className={`relative w-full h-full overflow-hidden rounded-2xl bg-[#12141D] flex items-center justify-center ${className}`}>
      <svg
        viewBox="0 0 400 220"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full object-cover select-none"
      >
        <defs>
          <linearGradient id="od-bg" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#141829" />
            <stop offset="100%" stopColor="#0B0D17" />
          </linearGradient>
          <radialGradient id="od-core" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#00E5FF" stopOpacity="0.8" />
            <stop offset="50%" stopColor="#9B6BFF" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#0B0D17" stopOpacity="0" />
          </radialGradient>
        </defs>

        <rect width="400" height="220" fill="url(#od-bg)" />

        {/* Gravitational Core Glow */}
        <circle cx="200" cy="110" r="80" fill="url(#od-core)" />
        <circle cx="200" cy="110" r="16" fill="#00E5FF" className="drop-shadow-[0_0_12px_rgba(0,229,255,0.9)]" />

        {/* Elliptical Orbital Tracks */}
        <ellipse cx="200" cy="110" rx="140" ry="60" stroke="#1F2842" strokeWidth="1.5" strokeDasharray="6 6" />
        <ellipse cx="200" cy="110" rx="95" ry="42" stroke="#2B3658" strokeWidth="1.5" />
        <ellipse cx="200" cy="110" rx="55" ry="24" stroke="#00E5FF" strokeWidth="1" strokeDasharray="3 3" opacity="0.6" />

        {/* Player Neon Vessel maneuvering along orbit */}
        <g transform="translate(285, 125)">
          <polygon points="0,-10 14,0 0,10 -4,0" fill="#C8FF3D" className="drop-shadow-[0_0_8px_rgba(200,255,61,0.8)]" />
          <circle cx="-6" cy="0" r="3" fill="#00E5FF" />
          {/* Particle Propulsion Trail */}
          <path d="M-6 0 L-22 -4 M-6 0 L-26 0 M-6 0 L-22 4" stroke="#00E5FF" strokeWidth="2" strokeLinecap="round" opacity="0.7" />
        </g>

        {/* Incoming Cosmic Hazards / Space Debris */}
        <g transform="translate(130, 80)">
          <polygon points="0,-12 10,-4 8,8 -8,10 -12,-2" fill="#EF4444" stroke="#FCA5A5" strokeWidth="1.5" className="drop-shadow-[0_0_8px_rgba(239,68,68,0.7)]" />
        </g>
        <g transform="translate(230, 60)">
          <polygon points="0,-8 7,-2 5,6 -5,7 -8,-1" fill="#EF4444" stroke="#FCA5A5" strokeWidth="1.5" />
        </g>
        <g transform="translate(150, 150)">
          <polygon points="0,-10 8,-3 6,7 -6,8 -9,-2" fill="#F59E0B" stroke="#FDE68A" strokeWidth="1.5" />
        </g>

        {/* Energy Shards to Collect */}
        <polygon points="215,35 220,45 215,55 210,45" fill="#C8FF3D" className="drop-shadow-[0_0_6px_rgba(200,255,61,0.9)]" />
        <polygon points="120,115 125,123 120,131 115,123" fill="#C8FF3D" className="drop-shadow-[0_0_6px_rgba(200,255,61,0.9)]" />
      </svg>
    </div>
  );
};
