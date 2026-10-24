import React from 'react';

export const Game2048Artwork: React.FC<{ className?: string }> = ({ className = 'w-full h-full' }) => {
  return (
    <svg
      viewBox="0 0 400 240"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      preserveAspectRatio="xMidYMid slice"
    >
      <defs>
        {/* Gradients */}
        <linearGradient id="bgGrad2048" x1="0" y1="0" x2="400" y2="240" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#0B091E" />
          <stop offset="50%" stopColor="#140D2E" />
          <stop offset="100%" stopColor="#080714" />
        </linearGradient>

        <linearGradient id="tile2048" x1="0" y1="0" x2="80" y2="80" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FFE45E" />
          <stop offset="50%" stopColor="#FF8B3D" />
          <stop offset="100%" stopColor="#FF2E97" />
        </linearGradient>

        <linearGradient id="tile1024" x1="0" y1="0" x2="50" y2="50" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#00F0FF" />
          <stop offset="100%" stopColor="#3B82F6" />
        </linearGradient>

        <linearGradient id="tile512" x1="0" y1="0" x2="50" y2="50" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#C8FF3D" />
          <stop offset="100%" stopColor="#10B981" />
        </linearGradient>

        {/* Glow Filters */}
        <filter id="glowGold" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="8" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>

        <filter id="glowCyan2048" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="6" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Cyber Grid Background */}
      <rect width="400" height="240" fill="url(#bgGrad2048)" />

      <g stroke="#241B4A" strokeWidth="1" opacity="0.45">
        <line x1="0" y1="40" x2="400" y2="40" />
        <line x1="0" y1="80" x2="400" y2="80" />
        <line x1="0" y1="120" x2="400" y2="120" />
        <line x1="0" y1="160" x2="400" y2="160" />
        <line x1="0" y1="200" x2="400" y2="200" />
        <line x1="60" y1="0" x2="60" y2="240" />
        <line x1="140" y1="0" x2="140" y2="240" />
        <line x1="220" y1="0" x2="220" y2="240" />
        <line x1="300" y1="0" x2="300" y2="240" />
        <line x1="380" y1="0" x2="380" y2="240" />
      </g>

      {/* Isometric / 3D Grid Chamber Board */}
      <rect x="75" y="25" width="250" height="190" rx="18" fill="#0E0C22" stroke="#3D2E70" strokeWidth="2" opacity="0.9" />

      {/* Grid Empty Slot Matrix */}
      <g fill="#161332" stroke="#2D2258" strokeWidth="1.5">
        <rect x="90" y="40" width="50" height="38" rx="8" />
        <rect x="148" y="40" width="50" height="38" rx="8" />
        <rect x="206" y="40" width="50" height="38" rx="8" />
        <rect x="264" y="40" width="50" height="38" rx="8" />

        <rect x="90" y="85" width="50" height="38" rx="8" />
        <rect x="148" y="85" width="50" height="38" rx="8" />
        <rect x="206" y="85" width="50" height="38" rx="8" />
        <rect x="264" y="85" width="50" height="38" rx="8" />

        <rect x="90" y="130" width="50" height="38" rx="8" />
        <rect x="148" y="130" width="50" height="38" rx="8" />
        <rect x="206" y="130" width="50" height="38" rx="8" />
        <rect x="264" y="130" width="50" height="38" rx="8" />

        <rect x="90" y="175" width="50" height="38" rx="8" />
        <rect x="148" y="175" width="50" height="38" rx="8" />
        <rect x="206" y="175" width="50" height="38" rx="8" />
        <rect x="264" y="175" width="50" height="38" rx="8" />
      </g>

      {/* Active Glowing Tiles */}
      {/* 2 Tile */}
      <g transform="translate(90, 175)">
        <rect width="50" height="38" rx="8" fill="#1E2340" stroke="#00F0FF" strokeWidth="1.5" />
        <text x="25" y="25" fill="#00F0FF" fontFamily="'Courier New', monospace" fontWeight="900" fontSize="18" textAnchor="middle">2</text>
      </g>

      {/* 16 Tile */}
      <g transform="translate(148, 130)">
        <rect width="50" height="38" rx="8" fill="#2E1B4E" stroke="#A855F7" strokeWidth="1.5" />
        <text x="25" y="25" fill="#E879F9" fontFamily="'Courier New', monospace" fontWeight="900" fontSize="16" textAnchor="middle">16</text>
      </g>

      {/* 128 Tile */}
      <g transform="translate(206, 85)">
        <rect width="50" height="38" rx="8" fill="#1C382A" stroke="#10B981" strokeWidth="1.5" />
        <text x="25" y="24" fill="#34D399" fontFamily="'Courier New', monospace" fontWeight="900" fontSize="15" textAnchor="middle">128</text>
      </g>

      {/* 512 Tile */}
      <g transform="translate(148, 85)" filter="url(#glowCyan2048)">
        <rect width="50" height="38" rx="8" fill="url(#tile1024)" stroke="#67E8F9" strokeWidth="1.5" />
        <text x="25" y="24" fill="#FFFFFF" fontFamily="'Courier New', monospace" fontWeight="900" fontSize="15" textAnchor="middle">512</text>
      </g>

      {/* 2048 Master Tile (Hero Glow) */}
      <g transform="translate(206, 130)" filter="url(#glowGold)">
        <rect width="50" height="38" rx="8" fill="url(#tile2048)" stroke="#FFF" strokeWidth="2" />
        <text x="25" y="25" fill="#FFFFFF" fontFamily="'Courier New', monospace" fontWeight="900" fontSize="15" textAnchor="middle" letterSpacing="-1">2048</text>
      </g>

      {/* Merging Motion Arrow Stream */}
      <path d="M 125 104 L 144 104" stroke="#00F0FF" strokeWidth="2" strokeDasharray="3 3" strokeLinecap="round" />
      <polygon points="144,101 148,104 144,107" fill="#00F0FF" />

      {/* Ambient Cyber Flares */}
      <circle cx="231" cy="149" r="2" fill="#FFFFFF" filter="url(#glowGold)" />
      <circle cx="173" cy="104" r="1.5" fill="#67E8F9" />
    </svg>
  );
};
