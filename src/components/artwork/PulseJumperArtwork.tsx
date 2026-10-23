import React from 'react';

interface ArtworkProps {
  className?: string;
}

export const PulseJumperArtwork: React.FC<ArtworkProps> = ({ className = '' }) => {
  return (
    <div className={`relative w-full h-full overflow-hidden rounded-2xl bg-[#0F1218] flex items-center justify-center ${className}`}>
      <svg
        viewBox="0 0 400 220"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full object-cover select-none"
      >
        <defs>
          <linearGradient id="pj-bg-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#141926" />
            <stop offset="100%" stopColor="#0B0D13" />
          </linearGradient>
          <linearGradient id="pj-ground-grad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#252D40" />
            <stop offset="100%" stopColor="#11141D" />
          </linearGradient>
          <linearGradient id="pj-spike-grad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#FF647C" />
            <stop offset="100%" stopColor="#9B6BFF" />
          </linearGradient>
          <radialGradient id="pj-jump-glow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#C8FF3D" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#C8FF3D" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Deep Horizon Background */}
        <rect width="400" height="220" fill="url(#pj-bg-grad)" />

        {/* Pulse Audio Equalizer Waves in Background */}
        <g opacity="0.18">
          <rect x="30" y="70" width="8" height="80" rx="4" fill="#C8FF3D" />
          <rect x="50" y="50" width="8" height="100" rx="4" fill="#C8FF3D" />
          <rect x="70" y="90" width="8" height="60" rx="4" fill="#C8FF3D" />
          <rect x="90" y="40" width="8" height="110" rx="4" fill="#9B6BFF" />
          <rect x="110" y="75" width="8" height="75" rx="4" fill="#9B6BFF" />
          <rect x="130" y="30" width="8" height="120" rx="4" fill="#9B6BFF" />
          <rect x="150" y="85" width="8" height="65" rx="4" fill="#C8FF3D" />
          <rect x="170" y="60" width="8" height="90" rx="4" fill="#C8FF3D" />
          <rect x="190" y="100" width="8" height="50" rx="4" fill="#9B6BFF" />
          <rect x="210" y="45" width="8" height="105" rx="4" fill="#FF647C" />
          <rect x="230" y="80" width="8" height="70" rx="4" fill="#FF647C" />
          <rect x="250" y="35" width="8" height="115" rx="4" fill="#9B6BFF" />
          <rect x="270" y="65" width="8" height="85" rx="4" fill="#C8FF3D" />
          <rect x="290" y="95" width="8" height="55" rx="4" fill="#C8FF3D" />
          <rect x="310" y="55" width="8" height="95" rx="4" fill="#9B6BFF" />
          <rect x="330" y="80" width="8" height="70" rx="4" fill="#FF647C" />
          <rect x="350" y="40" width="8" height="110" rx="4" fill="#C8FF3D" />
        </g>

        {/* Synthwave Sunset / Beat Horizon Ring */}
        <ellipse cx="200" cy="150" rx="130" ry="60" fill="none" stroke="#2D2248" strokeWidth="1" strokeDasharray="6 4" opacity="0.5" />

        {/* Running Platform / Ground Floor */}
        <rect x="0" y="150" width="400" height="70" fill="url(#pj-ground-grad)" />
        <line x1="0" y1="150" x2="400" y2="150" stroke="#C8FF3D" strokeWidth="3" filter="drop-shadow(0 0 8px rgba(200, 255, 61, 0.7))" />

        {/* Elevated Rhythm Platform Block */}
        <rect x="280" y="115" width="70" height="35" rx="6" fill="#1C2130" stroke="#9B6BFF" strokeWidth="2" filter="drop-shadow(0 0 10px rgba(155, 107, 255, 0.4))" />
        <line x1="280" y1="115" x2="350" y2="115" stroke="#FFFFFF" strokeWidth="2" />

        {/* Floating Energy Orb on Platform */}
        <circle cx="315" cy="95" r="8" fill="#C8FF3D" filter="drop-shadow(0 0 10px rgba(200, 255, 61, 0.9))" />
        <circle cx="315" cy="95" r="4" fill="#FFFFFF" />

        {/* Neon Hazard Spikes (Coral / Magenta Gradient) */}
        <polygon points="175,150 190,118 205,150" fill="url(#pj-spike-grad)" stroke="#FF647C" strokeWidth="2" filter="drop-shadow(0 0 8px rgba(255, 100, 124, 0.6))" />
        <polygon points="205,150 220,118 235,150" fill="url(#pj-spike-grad)" stroke="#FF647C" strokeWidth="2" filter="drop-shadow(0 0 8px rgba(255, 100, 124, 0.6))" />

        {/* JUMP ARC TRAIL (Parabolic dash path) */}
        <path
          d="M 60 146 Q 100 50, 140 76"
          stroke="#C8FF3D"
          strokeWidth="3"
          strokeDasharray="6 4"
          fill="none"
          opacity="0.8"
        />

        {/* Jumping Player Cube (Mid-air rotation) */}
        <circle cx="140" cy="76" r="40" fill="url(#pj-jump-glow)" />

        <g transform="translate(140, 76) rotate(32)">
          {/* Neon Cube Body */}
          <rect x="-18" y="-18" width="36" height="36" rx="8" fill="#C8FF3D" stroke="#FFFFFF" strokeWidth="2" filter="drop-shadow(0 0 14px rgba(200, 255, 61, 0.9))" />
          {/* Inner Cyber Core */}
          <rect x="-8" y="-8" width="16" height="16" rx="4" fill="#101116" />
          <rect x="-3" y="-3" width="6" height="6" rx="1.5" fill="#C8FF3D" />
        </g>

        {/* Particle Sparks behind player */}
        <circle cx="115" cy="92" r="3" fill="#C8FF3D" opacity="0.9" />
        <circle cx="100" cy="110" r="2.5" fill="#9B6BFF" opacity="0.8" />
        <circle cx="85" cy="130" r="2" fill="#FF647C" opacity="0.7" />
        <circle cx="70" cy="144" r="1.5" fill="#C8FF3D" opacity="0.5" />

        {/* Beat Tag Badge */}
        <g transform="translate(20, 20)">
          <rect width="115" height="22" rx="6" fill="#161B27" stroke="#2B344B" strokeWidth="1" />
          <text x="57" y="15" textAnchor="middle" fill="#C8FF3D" fontFamily="monospace" fontSize="10" fontWeight="bold">
            128 BPM • LEVEL 1
          </text>
        </g>
      </svg>
    </div>
  );
};
