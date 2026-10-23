import React from 'react';

interface ArtworkProps {
  className?: string;
}

export const PatternShiftArtwork: React.FC<ArtworkProps> = ({ className = '' }) => {
  return (
    <div className={`relative w-full h-full overflow-hidden rounded-2xl bg-[#12141D] flex items-center justify-center ${className}`}>
      <svg
        viewBox="0 0 400 220"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full object-cover select-none"
      >
        <defs>
          <linearGradient id="ps-bg-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#151824" />
            <stop offset="100%" stopColor="#0D0E15" />
          </linearGradient>
          <linearGradient id="ps-lime-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#C8FF3D" />
            <stop offset="100%" stopColor="#84CC16" />
          </linearGradient>
          <linearGradient id="ps-purple-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#9B6BFF" />
            <stop offset="100%" stopColor="#6D28D9" />
          </linearGradient>
          <radialGradient id="ps-glow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#C8FF3D" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#C8FF3D" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Deep Matrix Canvas */}
        <rect width="400" height="220" fill="url(#ps-bg-grad)" />

        {/* Ambient Glow */}
        <circle cx="280" cy="110" r="100" fill="url(#ps-glow)" />

        {/* Subtle Isometric Background Grid Lines */}
        <g stroke="#1F2433" strokeWidth="1" strokeDasharray="3 3" opacity="0.6">
          <line x1="20" y1="30" x2="380" y2="30" />
          <line x1="20" y1="80" x2="380" y2="80" />
          <line x1="20" y1="140" x2="380" y2="140" />
          <line x1="20" y1="190" x2="380" y2="190" />
          <line x1="60" y1="10" x2="60" y2="210" />
          <line x1="140" y1="10" x2="140" y2="210" />
          <line x1="220" y1="10" x2="220" y2="210" />
          <line x1="300" y1="10" x2="300" y2="210" />
        </g>

        {/* Circuit Data Bus connecting sequence nodes */}
        <path
          d="M 50 110 L 120 110 L 190 110 L 260 110 L 340 110"
          stroke="#2A3146"
          strokeWidth="6"
          strokeLinecap="round"
        />
        <path
          d="M 50 110 L 120 110 L 190 110 L 260 110"
          stroke="url(#ps-lime-grad)"
          strokeWidth="2.5"
          strokeLinecap="round"
        />

        {/* Sequence Node 1: Circle with Binary Pulse */}
        <g transform="translate(60, 110)">
          <circle r="26" fill="#1A1D2A" stroke="#333C52" strokeWidth="2" />
          <circle r="18" fill="#131622" stroke="#C8FF3D" strokeWidth="2" strokeDasharray="4 2" />
          <text x="0" y="5" textAnchor="middle" fill="#C8FF3D" fontFamily="monospace" fontSize="13" fontWeight="900">
            01
          </text>
        </g>

        {/* Sequence Node 2: Diamond Shape with Rotation */}
        <g transform="translate(140, 110)">
          <rect x="-24" y="-24" width="48" height="48" rx="8" fill="#1A1D2A" stroke="#333C52" strokeWidth="2" transform="rotate(45)" />
          <polygon points="0,-14 14,0 0,14 -14,0" fill="#9B6BFF" opacity="0.85" />
          <text x="0" y="5" textAnchor="middle" fill="#FFFFFF" fontFamily="monospace" fontSize="12" fontWeight="900">
            02
          </text>
        </g>

        {/* Sequence Node 3: Hexagon Shape */}
        <g transform="translate(220, 110)">
          <polygon
            points="0,-27 23,-13 23,13 0,27 -23,13 -23,-13"
            fill="#1A1D2A"
            stroke="#9B6BFF"
            strokeWidth="2.5"
          />
          <polygon
            points="0,-16 14,-8 14,8 0,16 -14,8 -14,-8"
            fill="#191B24"
            stroke="#C8FF3D"
            strokeWidth="1.5"
          />
          <text x="0" y="5" textAnchor="middle" fill="#C8FF3D" fontFamily="monospace" fontSize="12" fontWeight="900">
            04
          </text>
        </g>

        {/* Target Missing Register Node (?): Glowing Electric Lime Highlight */}
        <g transform="translate(300, 110)">
          <rect
            x="-30"
            y="-30"
            width="60"
            height="60"
            rx="16"
            fill="#1A1D2A"
            stroke="#C8FF3D"
            strokeWidth="3"
            filter="drop-shadow(0 0 12px rgba(200, 255, 61, 0.6))"
          />
          <rect x="-22" y="-22" width="44" height="44" rx="10" fill="#C8FF3D" fillOpacity="0.15" />
          <text x="0" y="9" textAnchor="middle" fill="#C8FF3D" fontFamily="monospace" fontSize="26" fontWeight="900">
            ?
          </text>
        </g>

        {/* Mathematical Logic Glyphs */}
        <g fontFamily="monospace" fontSize="10" fill="#586380" fontWeight="bold">
          <text x="50" y="165">f(n) = 2ⁿ⁻¹</text>
          <text x="135" y="165">n = 2</text>
          <text x="215" y="165">n = 3</text>
          <text x="295" y="165" fill="#C8FF3D">n = 4 [08]</text>
        </g>

        {/* Floating Particle Dots */}
        <circle cx="95" cy="55" r="2" fill="#C8FF3D" opacity="0.8" />
        <circle cx="170" cy="45" r="2.5" fill="#9B6BFF" opacity="0.9" />
        <circle cx="260" cy="50" r="1.5" fill="#C8FF3D" opacity="0.6" />
        <circle cx="350" cy="65" r="3" fill="#FF647C" opacity="0.8" />
        <circle cx="360" cy="155" r="2" fill="#C8FF3D" opacity="0.7" />
      </svg>
    </div>
  );
};
