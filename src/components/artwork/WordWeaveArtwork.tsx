import React from 'react';

interface ArtworkProps {
  className?: string;
}

export const WordWeaveArtwork: React.FC<ArtworkProps> = ({ className = '' }) => {
  return (
    <div className={`relative w-full h-full overflow-hidden rounded-2xl bg-[#12141D] flex items-center justify-center ${className}`}>
      <svg
        viewBox="0 0 400 220"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full object-cover select-none"
      >
        <defs>
          <linearGradient id="ww-bg-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#171524" />
            <stop offset="100%" stopColor="#0E0D17" />
          </linearGradient>
          <linearGradient id="ww-purple-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#9B6BFF" />
            <stop offset="100%" stopColor="#6D28D9" />
          </linearGradient>
          <linearGradient id="ww-lime-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#C8FF3D" />
            <stop offset="100%" stopColor="#84CC16" />
          </linearGradient>
          <radialGradient id="ww-glow" cx="40%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#9B6BFF" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#9B6BFF" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Background */}
        <rect width="400" height="220" fill="url(#ww-bg-grad)" />

        {/* Ambient Glow */}
        <circle cx="160" cy="110" r="110" fill="url(#ww-glow)" />

        {/* Neural / Circuit Synapse Web */}
        <g stroke="#2C2742" strokeWidth="1.5" opacity="0.6">
          <path d="M 80 60 L 160 85 L 240 60 L 320 85" />
          <path d="M 80 155 L 160 135 L 240 160 L 320 135" />
          <path d="M 160 85 L 160 135" />
          <path d="M 240 60 L 240 160" />
          <path d="M 80 60 L 80 155" />
          <path d="M 320 85 L 320 135" />
        </g>

        {/* Active Golden Synapse Path */}
        <path
          d="M 80 60 L 160 85 L 240 160 L 320 135"
          stroke="url(#ww-purple-grad)"
          strokeWidth="3"
          strokeLinecap="round"
        />

        {/* Word Tile 1: "BYTE" (Top Left) */}
        <g transform="translate(45, 38)">
          <rect width="70" height="42" rx="12" fill="#1C182B" stroke="#9B6BFF" strokeWidth="2" filter="drop-shadow(0 4px 10px rgba(155, 107, 255, 0.25))" />
          <text x="35" y="27" textAnchor="middle" fill="#FFFFFF" fontFamily="monospace" fontSize="14" fontWeight="900" letterSpacing="2">
            BYTE
          </text>
        </g>

        {/* Word Tile 2: "BITE" (Center Top) */}
        <g transform="translate(125, 64)">
          <rect width="70" height="42" rx="12" fill="#1C182B" stroke="#483B6B" strokeWidth="1.5" />
          <text x="35" y="27" textAnchor="middle" fill="#C4B5FD" fontFamily="monospace" fontSize="14" fontWeight="800" letterSpacing="2">
            B<tspan fill="#C8FF3D">I</tspan>TE
          </text>
        </g>

        {/* Word Tile 3: "SITE" (Center Bottom) */}
        <g transform="translate(205, 138)">
          <rect width="70" height="42" rx="12" fill="#1C182B" stroke="#C8FF3D" strokeWidth="2" filter="drop-shadow(0 0 12px rgba(200, 255, 61, 0.35))" />
          <text x="35" y="27" textAnchor="middle" fill="#FFFFFF" fontFamily="monospace" fontSize="14" fontWeight="900" letterSpacing="2">
            <tspan fill="#C8FF3D">S</tspan>ITE
          </text>
        </g>

        {/* Word Tile 4: "SIZE" (Right) */}
        <g transform="translate(285, 114)">
          <rect width="70" height="42" rx="12" fill="#1C182B" stroke="#9B6BFF" strokeWidth="2" filter="drop-shadow(0 4px 10px rgba(155, 107, 255, 0.25))" />
          <text x="35" y="27" textAnchor="middle" fill="#FFFFFF" fontFamily="monospace" fontSize="14" fontWeight="900" letterSpacing="2">
            SI<tspan fill="#9B6BFF">Z</tspan>E
          </text>
        </g>

        {/* Cluster Decoy Tag: "CPU" */}
        <g transform="translate(45, 135)">
          <rect width="60" height="34" rx="10" fill="#13121C" stroke="#2F2B45" strokeWidth="1.5" />
          <text x="30" y="22" textAnchor="middle" fill="#6B658A" fontFamily="monospace" fontSize="11" fontWeight="700">
            CPU
          </text>
        </g>

        {/* Cluster Decoy Tag: "RAM" */}
        <g transform="translate(285, 42)">
          <rect width="60" height="34" rx="10" fill="#13121C" stroke="#2F2B45" strokeWidth="1.5" />
          <text x="30" y="22" textAnchor="middle" fill="#6B658A" fontFamily="monospace" fontSize="11" fontWeight="700">
            RAM
          </text>
        </g>

        {/* Step Progression Indicators */}
        <circle cx="80" cy="60" r="5" fill="#C8FF3D" />
        <circle cx="160" cy="85" r="5" fill="#9B6BFF" />
        <circle cx="240" cy="160" r="5" fill="#C8FF3D" />
        <circle cx="320" cy="135" r="5" fill="#9B6BFF" />

        {/* Semantic Badge */}
        <g transform="translate(130, 192)">
          <rect width="140" height="20" rx="6" fill="#1C182B" stroke="#3D3558" strokeWidth="1" />
          <text x="70" y="14" textAnchor="middle" fill="#9B6BFF" fontFamily="monospace" fontSize="9" fontWeight="bold">
            WORD LADDER • 3 STEPS
          </text>
        </g>
      </svg>
    </div>
  );
};
