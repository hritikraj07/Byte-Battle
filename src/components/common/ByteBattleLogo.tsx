import React from 'react';

interface ByteBattleLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showWordmark?: boolean;
}

export const ByteBattleLogo: React.FC<ByteBattleLogoProps> = ({
  className = '',
  size = 'md',
  showWordmark = true,
}) => {
  const iconDimensions = {
    sm: 'w-7 h-7',
    md: 'w-9 h-9',
    lg: 'w-12 h-12',
  }[size];

  const wordmarkSizes = {
    sm: 'text-sm',
    md: 'text-lg',
    lg: 'text-2xl',
  }[size];

  return (
    <div className={`flex items-center gap-2.5 select-none ${className}`}>
      {/* Neo-Arcade 'B' + Lightning Vector Emblem */}
      <div className={`relative flex-shrink-0 ${iconDimensions}`}>
        <svg
          viewBox="0 0 48 48"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full drop-shadow-[0_0_10px_rgba(200,255,61,0.4)]"
        >
          <defs>
            <linearGradient id="bb-grad-primary" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#C8FF3D" />
              <stop offset="100%" stopColor="#9B6BFF" />
            </linearGradient>
            <linearGradient id="bb-grad-bolt" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#FFFFFF" />
              <stop offset="100%" stopColor="#C8FF3D" />
            </linearGradient>
          </defs>

          {/* Background Octagonal Chip */}
          <path
            d="M10 4 H38 L44 10 V38 L38 44 H10 L4 38 V10 Z"
            fill="#191B24"
            stroke="#282B3A"
            strokeWidth="2"
          />

          {/* Stylized Neo-Arcade 'B' Outer Ribbon */}
          <path
            d="M12 10 H28 C34 10 38 13 38 18 C38 21.5 35.5 24 32 25 C36.5 26 40 29.5 40 34 C40 39.5 35.5 42 29 42 H12 Z"
            fill="url(#bb-grad-primary)"
          />

          {/* Inner Negative Space: Upper B loop */}
          <rect x="20" y="16" width="9" height="6" rx="2" fill="#101116" />

          {/* Inner Negative Space: Lower B loop */}
          <rect x="20" y="28" width="10" height="7" rx="2" fill="#101116" />

          {/* Dynamic Lightning Bolt Slit Cutting Through the B */}
          <polygon
            points="18,7 27,7 21,22 30,22 15,44 20,26 13,26"
            fill="url(#bb-grad-bolt)"
            opacity="0.95"
          />
        </svg>
      </div>

      {/* Brand Wordmark */}
      {showWordmark && (
        <div className="flex flex-col leading-none">
          <span
            className={`font-black tracking-wider uppercase text-neo-text font-mono ${wordmarkSizes}`}
          >
            BYTE<span className="text-neo-lime">BATTLE</span>
          </span>
          <span className="text-[9px] font-mono font-bold tracking-widest text-neo-secondary uppercase">
            ARCADE ARENA
          </span>
        </div>
      )}
    </div>
  );
};
