import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="w-full bg-[#090A0F] border-t border-[#1E2235] py-3.5 px-4 sm:px-6 lg:px-8 text-xs text-[#A4A6B8] font-sans relative z-10">
      <div className="w-full max-w-[1720px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
        {/* Author Credit & Brand Statement */}
        <div className="flex items-center gap-2.5 flex-wrap justify-center sm:justify-start">
          <p className="text-xs text-[#A4A6B8] m-0">
            Built by{' '}
            <a
              href="https://github.com/hritikraj07"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#F4F4F8] hover:text-[#A78BFA] font-medium underline decoration-[#33374E] hover:decoration-[#A78BFA] transition-colors focus:outline-none focus:ring-1 focus:ring-[#A78BFA] rounded px-0.5"
            >
              Hritik Raj
            </a>
          </p>
          <span className="text-[#2B3048]">•</span>
          <span className="tracking-widest font-sans font-bold text-xs text-[#F4F4F8] uppercase">
            AFTERHOURS
          </span>
          <span className="text-[#2B3048] hidden md:inline">•</span>
          <span className="text-[11px] text-[#A4A6B8] hidden md:inline italic">
            A place for the unexpected
          </span>
        </div>

        {/* Platform Status */}
        <div className="flex items-center gap-3 text-[11px] text-[#717488]">
          <span>Explore beyond the ordinary</span>
          <span className="text-[#2B3048]">•</span>
          <span className="text-[#A78BFA]/90 font-mono text-[10px]">v2.4.0</span>
        </div>
      </div>
    </footer>
  );
};
