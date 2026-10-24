'use client';

import React from 'react';

interface AfterhoursLogoProps {
  size?: 'sm' | 'md' | 'lg';
  showTagline?: boolean;
  className?: string;
}

export const AfterhoursLogo: React.FC<AfterhoursLogoProps> = ({
  size = 'md',
  showTagline = false,
  className = '',
}) => {
  const isSm = size === 'sm';
  const isLg = size === 'lg';

  return (
    <div className={`flex items-center gap-2.5 select-none ${className}`}>
      {/* Symbolic Celestial Eclipse / Gateway Glyph */}
      <div
        className={`relative flex items-center justify-center rounded-xl overflow-hidden transition-transform duration-500 hover:scale-105 ${
          isSm ? 'w-7 h-7' : isLg ? 'w-11 h-11' : 'w-9 h-9'
        } bg-gradient-to-br from-[#1E1B4B] via-[#0F0E26] to-[#0A0918] border border-[#A78BFA]/30 shadow-[0_0_20px_rgba(167,139,250,0.25)]`}
      >
        {/* Ambient celestial glow */}
        <div className="absolute inset-0 bg-radial from-[#A78BFA]/20 to-transparent blur-sm" />

        {/* Crescent Horizon Ring */}
        <svg
          viewBox="0 0 32 32"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full p-1.5"
        >
          <circle
            cx="16"
            cy="16"
            r="11"
            stroke="url(#eclipseGrad)"
            strokeWidth="1.75"
            strokeDasharray="45 15"
            strokeLinecap="round"
          />
          <circle
            cx="16"
            cy="16"
            r="4.5"
            fill="#F4F4F8"
            className="animate-pulse"
          />
          <circle
            cx="18.5"
            cy="14"
            r="3.5"
            fill="#0F0E26"
          />
          <defs>
            <linearGradient id="eclipseGrad" x1="4" y1="4" x2="28" y2="28" gradientUnits="userSpaceOnUse">
              <stop stopColor="#A78BFA" />
              <stop offset="0.5" stopColor="#818CF8" />
              <stop offset="1" stopColor="#38BDF8" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {/* Typography Brandmark */}
      <div className="flex flex-col">
        <div className="flex items-center gap-1.5 leading-none">
          <span
            className={`font-sans font-bold tracking-[0.22em] text-[#F4F4F8] uppercase transition-colors hover:text-[#A78BFA] ${
              isSm ? 'text-xs' : isLg ? 'text-xl' : 'text-sm sm:text-base'
            }`}
          >
            AFTERHOURS
          </span>
          <span className="w-1.5 h-1.5 rounded-full bg-[#A78BFA] shadow-[0_0_8px_#A78BFA] animate-pulse" />
        </div>
        {showTagline && (
          <span className="text-[10px] tracking-wider text-[#A4A6B8] font-sans font-normal mt-0.5">
            A place for the unexpected
          </span>
        )}
      </div>
    </div>
  );
};
