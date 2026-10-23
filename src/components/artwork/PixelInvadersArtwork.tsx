import React from 'react';

interface ArtworkProps {
  className?: string;
}

export const PixelInvadersArtwork: React.FC<ArtworkProps> = ({ className = '' }) => {
  return (
    <div className={`relative w-full h-full overflow-hidden rounded-2xl bg-[#12141D] flex items-center justify-center ${className}`}>
      <svg
        viewBox="0 0 400 220"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full object-cover select-none"
      >
        <defs>
          <linearGradient id="pi-bg" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#141424" />
            <stop offset="100%" stopColor="#0B0B14" />
          </linearGradient>
          <radialGradient id="pi-glow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#8B5CF6" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#8B5CF6" stopOpacity="0" />
          </radialGradient>
        </defs>

        <rect width="400" height="220" fill="url(#pi-bg)" />
        <circle cx="200" cy="110" r="100" fill="url(#pi-glow)" />

        {/* Retro Starfield */}
        {[
          [50, 40], [90, 160], [140, 25], [260, 30], [330, 80], [360, 150], [80, 100], [310, 190]
        ].map(([sx, sy], i) => (
          <rect key={i} x={sx} y={sy} width="2.5" height="2.5" fill="#FFFFFF" opacity={0.6 + (i % 3) * 0.2} />
        ))}

        {/* Mystery Bonus UFO Flying Across Top */}
        <g transform="translate(200, 35)">
          <ellipse cx="0" cy="0" rx="22" ry="7" fill="#EC4899" className="drop-shadow-[0_0_8px_rgba(236,72,153,0.8)]" />
          <ellipse cx="0" cy="-3" rx="10" ry="5" fill="#F472B6" />
          <circle cx="-10" cy="0" r="1.5" fill="#FFFFFF" />
          <circle cx="0" cy="0" r="1.5" fill="#FFFFFF" />
          <circle cx="10" cy="0" r="1.5" fill="#FFFFFF" />
        </g>

        {/* Alien Invaders Wave Rows (Pixel Grid format) */}
        {/* Row 1 - Octo Invaders */}
        {[-80, -30, 20, 70].map((offX, i) => (
          <g key={i} transform={`translate(${200 + offX}, 75)`} fill="#A855F7" className="drop-shadow-[0_0_6px_rgba(168,85,247,0.7)]">
            {/* 8x6 pixel alien */}
            <rect x="-10" y="-8" width="20" height="12" rx="2" />
            <rect x="-14" y="-2" width="28" height="6" rx="1" />
            <rect x="-10" y="4" width="4" height="4" />
            <rect x="6" y="4" width="4" height="4" />
            {/* Eyes */}
            <rect x="-6" y="-4" width="3" height="3" fill="#FFFFFF" />
            <rect x="3" y="-4" width="3" height="3" fill="#FFFFFF" />
          </g>
        ))}

        {/* Row 2 - Crab Invaders */}
        {[-80, -30, 20, 70].map((offX, i) => (
          <g key={i} transform={`translate(${200 + offX}, 115)`} fill="#06B6D4" className="drop-shadow-[0_0_6px_rgba(6,182,212,0.7)]">
            <rect x="-12" y="-6" width="24" height="10" rx="2" />
            <rect x="-15" y="-10" width="4" height="6" />
            <rect x="11" y="-10" width="4" height="6" />
            <rect x="-15" y="4" width="5" height="4" />
            <rect x="10" y="4" width="5" height="4" />
            {/* Eyes */}
            <rect x="-6" y="-3" width="3" height="3" fill="#FFFFFF" />
            <rect x="3" y="-3" width="3" height="3" fill="#FFFFFF" />
          </g>
        ))}

        {/* Plasma Projectiles */}
        <line x1="170" y1="125" x2="170" y2="145" stroke="#F43F5E" strokeWidth="2.5" strokeLinecap="round" className="drop-shadow-[0_0_6px_rgba(244,63,94,0.9)]" />
        <line x1="220" y1="140" x2="220" y2="165" stroke="#C8FF3D" strokeWidth="2.5" strokeLinecap="round" className="drop-shadow-[0_0_6px_rgba(200,255,61,0.9)]" />

        {/* Player Defender Space Cannon */}
        <g transform="translate(200, 185)" fill="#C8FF3D" className="drop-shadow-[0_0_10px_rgba(200,255,61,0.8)]">
          <rect x="-16" y="4" width="32" height="10" rx="2" />
          <rect x="-10" y="-2" width="20" height="8" rx="1" />
          <rect x="-3" y="-8" width="6" height="8" />
        </g>
      </svg>
    </div>
  );
};
