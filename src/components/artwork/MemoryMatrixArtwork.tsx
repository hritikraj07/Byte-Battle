import React from 'react';

interface ArtworkProps {
  className?: string;
}

export const MemoryMatrixArtwork: React.FC<ArtworkProps> = ({ className = '' }) => {
  return (
    <div className={`relative w-full h-full overflow-hidden rounded-2xl bg-[#12141D] flex items-center justify-center ${className}`}>
      <svg
        viewBox="0 0 400 220"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full object-cover select-none"
      >
        <defs>
          <linearGradient id="mm-bg" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#131726" />
            <stop offset="100%" stopColor="#0B0D15" />
          </linearGradient>
          <linearGradient id="mm-active" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#00E5FF" />
            <stop offset="100%" stopColor="#9B6BFF" />
          </linearGradient>
          <radialGradient id="mm-glow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#00E5FF" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#00E5FF" stopOpacity="0" />
          </radialGradient>
        </defs>

        <rect width="400" height="220" fill="url(#mm-bg)" />
        <circle cx="200" cy="110" r="100" fill="url(#mm-glow)" />

        {/* 4x4 Memory Grid Matrix */}
        <g transform="translate(130, 40)">
          {Array.from({ length: 16 }).map((_, idx) => {
            const col = idx % 4;
            const row = Math.floor(idx / 4);
            const x = col * 36;
            const y = row * 36;
            const isLit = [1, 4, 6, 9, 11, 14].includes(idx);

            return (
              <g key={idx}>
                <rect
                  x={x}
                  y={y}
                  width="30"
                  height="30"
                  rx="6"
                  fill={isLit ? 'url(#mm-active)' : '#191F30'}
                  stroke={isLit ? '#67E8F9' : '#2A334B'}
                  strokeWidth="1.5"
                  className={isLit ? 'drop-shadow-[0_0_8px_rgba(0,229,255,0.7)]' : ''}
                />
                {isLit && (
                  <circle cx={x + 15} cy={y + 15} r="3" fill="#FFFFFF" opacity="0.9" />
                )}
              </g>
            );
          })}
        </g>

        {/* Synapse Connection Circuit Conduits */}
        <path
          d="M 50 110 H 120 M 280 110 H 350 M 200 25 V 35 M 200 185 V 195"
          stroke="#00E5FF"
          strokeWidth="2"
          strokeDasharray="4 4"
          opacity="0.5"
        />

        {/* Holographic Recall Scanline */}
        <line x1="80" y1="85" x2="320" y2="85" stroke="#9B6BFF" strokeWidth="1.5" opacity="0.6" strokeDasharray="8 6" />
        <circle cx="80" cy="85" r="4" fill="#9B6BFF" />
        <circle cx="320" cy="85" r="4" fill="#9B6BFF" />
      </svg>
    </div>
  );
};
