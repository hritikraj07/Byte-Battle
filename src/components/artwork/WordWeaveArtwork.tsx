import React from 'react';

interface ArtworkProps {
  className?: string;
}

export const WordWeaveArtwork: React.FC<ArtworkProps> = ({ className = '' }) => {
  return (
    <div className={`relative w-full h-full overflow-hidden rounded-2xl bg-[#090A14] flex items-center justify-center ${className}`}>
      <svg
        viewBox="0 0 400 220"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full object-cover select-none"
      >
        <defs>
          {/* Neon Gradients */}
          <linearGradient id="ww-bg-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#0B0918" />
            <stop offset="50%" stopColor="#120E28" />
            <stop offset="100%" stopColor="#06050C" />
          </linearGradient>

          <linearGradient id="ww-cyan-flow" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#00F0FF" />
            <stop offset="50%" stopColor="#9B6BFF" />
            <stop offset="100%" stopColor="#FF2E97" />
          </linearGradient>

          <linearGradient id="ww-pink-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FF2E97" />
            <stop offset="100%" stopColor="#9B6BFF" />
          </linearGradient>

          <linearGradient id="ww-tile-grad-w" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#1C1838" />
            <stop offset="100%" stopColor="#0E0D20" />
          </linearGradient>

          <radialGradient id="ww-core-glow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#9B6BFF" stopOpacity="0.35" />
            <stop offset="60%" stopColor="#00F0FF" stopOpacity="0.15" />
            <stop offset="100%" stopColor="#090A14" stopOpacity="0" />
          </radialGradient>

          {/* Glow Filters */}
          <filter id="ww-glow-strong" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="6" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          <filter id="ww-glow-soft" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Cyber Backdrop */}
        <rect width="400" height="220" fill="url(#ww-bg-gradient)" />

        {/* Ambient Center Aura */}
        <circle cx="200" cy="110" r="140" fill="url(#ww-core-glow)" />

        {/* Perspective Digital Grid Floor */}
        <g stroke="#1F1B3E" strokeWidth="1" opacity="0.6">
          <line x1="0" y1="180" x2="400" y2="180" />
          <line x1="0" y1="200" x2="400" y2="200" />
          <line x1="200" y1="120" x2="20" y2="220" />
          <line x1="200" y1="120" x2="110" y2="220" />
          <line x1="200" y1="120" x2="200" y2="220" />
          <line x1="200" y1="120" x2="290" y2="220" />
          <line x1="200" y1="120" x2="380" y2="220" />
        </g>

        {/* Floating Binary / Runes in the Background */}
        <g fontFamily="monospace" fontSize="9" fill="#9B6BFF" opacity="0.3" fontWeight="bold">
          <text x="30" y="35">01010111</text>
          <text x="310" y="40">01000101</text>
          <text x="40" y="160">ANAGRAM</text>
          <text x="325" y="165">SYNAPSE</text>
        </g>

        {/* Glowing Weave Laser Streams */}
        <g filter="url(#ww-glow-strong)">
          <path
            d="M 60 75 Q 130 30 200 95 T 340 70"
            stroke="url(#ww-cyan-flow)"
            strokeWidth="3.5"
            strokeLinecap="round"
            fill="none"
          />
          <path
            d="M 60 145 Q 130 185 200 125 T 340 140"
            stroke="url(#ww-pink-grad)"
            strokeWidth="3.5"
            strokeLinecap="round"
            fill="none"
          />
          {/* Vertical Interconnecting Strands */}
          <path
            d="M 90 75 L 155 135 L 245 75 L 310 135"
            stroke="#00F0FF"
            strokeWidth="2"
            strokeDasharray="4 4"
            opacity="0.8"
            fill="none"
          />
        </g>

        {/* Interconnection Laser Nodes */}
        <circle cx="90" cy="75" r="5" fill="#00F0FF" filter="url(#ww-glow-soft)" />
        <circle cx="155" cy="135" r="5" fill="#FF2E97" filter="url(#ww-glow-soft)" />
        <circle cx="245" cy="75" r="5" fill="#C8FF3D" filter="url(#ww-glow-soft)" />
        <circle cx="310" cy="135" r="5" fill="#00F0FF" filter="url(#ww-glow-soft)" />

        {/* TILE 1: 'W' (Top Left) */}
        <g transform="translate(65, 45)" filter="url(#ww-glow-soft)">
          <rect
            width="54"
            height="54"
            rx="14"
            fill="url(#ww-tile-grad-w)"
            stroke="#00F0FF"
            strokeWidth="2"
          />
          <rect x="5" y="5" width="44" height="44" rx="9" stroke="#00F0FF" strokeWidth="0.8" strokeDasharray="3 2" opacity="0.5" />
          <text
            x="27"
            y="36"
            textAnchor="middle"
            fill="#FFFFFF"
            fontFamily="monospace"
            fontSize="26"
            fontWeight="900"
          >
            W
          </text>
          <circle cx="45" cy="9" r="3" fill="#00F0FF" />
        </g>

        {/* TILE 2: 'E' (Bottom Center-Left) */}
        <g transform="translate(130, 105)" filter="url(#ww-glow-soft)">
          <rect
            width="54"
            height="54"
            rx="14"
            fill="url(#ww-tile-grad-w)"
            stroke="#FF2E97"
            strokeWidth="2"
          />
          <rect x="5" y="5" width="44" height="44" rx="9" stroke="#FF2E97" strokeWidth="0.8" strokeDasharray="3 2" opacity="0.5" />
          <text
            x="27"
            y="36"
            textAnchor="middle"
            fill="#FFFFFF"
            fontFamily="monospace"
            fontSize="26"
            fontWeight="900"
          >
            E
          </text>
          <circle cx="45" cy="9" r="3" fill="#FF2E97" />
        </g>

        {/* TILE 3: 'A' (Top Center-Right) */}
        <g transform="translate(220, 45)" filter="url(#ww-glow-soft)">
          <rect
            width="54"
            height="54"
            rx="14"
            fill="url(#ww-tile-grad-w)"
            stroke="#9B6BFF"
            strokeWidth="2"
          />
          <rect x="5" y="5" width="44" height="44" rx="9" stroke="#9B6BFF" strokeWidth="0.8" strokeDasharray="3 2" opacity="0.5" />
          <text
            x="27"
            y="36"
            textAnchor="middle"
            fill="#FFFFFF"
            fontFamily="monospace"
            fontSize="26"
            fontWeight="900"
          >
            A
          </text>
          <circle cx="45" cy="9" r="3" fill="#9B6BFF" />
        </g>

        {/* TILE 4: 'V' (Bottom Right) */}
        <g transform="translate(285, 105)" filter="url(#ww-glow-soft)">
          <rect
            width="54"
            height="54"
            rx="14"
            fill="url(#ww-tile-grad-w)"
            stroke="#C8FF3D"
            strokeWidth="2"
          />
          <rect x="5" y="5" width="44" height="44" rx="9" stroke="#C8FF3D" strokeWidth="0.8" strokeDasharray="3 2" opacity="0.5" />
          <text
            x="27"
            y="36"
            textAnchor="middle"
            fill="#FFFFFF"
            fontFamily="monospace"
            fontSize="26"
            fontWeight="900"
          >
            V
          </text>
          <circle cx="45" cy="9" r="3" fill="#C8FF3D" />
        </g>

        {/* Semantic Neo-Arcade Pill */}
        <g transform="translate(125, 182)">
          <rect
            width="150"
            height="24"
            rx="12"
            fill="#0E0D22"
            stroke="#342B5C"
            strokeWidth="1.5"
          />
          <circle cx="20" cy="12" r="4" fill="#00F0FF" />
          <text
            x="85"
            y="16"
            textAnchor="middle"
            fill="#C4B5FD"
            fontFamily="monospace"
            fontSize="10"
            fontWeight="800"
            letterSpacing="1.5"
          >
            NEON WORD WEAVE
          </text>
        </g>
      </svg>
    </div>
  );
};
