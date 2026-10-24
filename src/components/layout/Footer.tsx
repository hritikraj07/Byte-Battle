import React from 'react';
import Link from 'next/link';

export const Footer: React.FC = () => {
  return (
    <footer className="w-full bg-[#060610] border-t border-[#24244A] py-2 sm:py-2.5 px-4 sm:px-6 lg:px-8 text-xs text-[#8A8AB8] font-sans relative z-10">
      <div className="w-full max-w-[1720px] mx-auto flex items-center justify-between gap-3">
        {/* Bottom-left aligned credit */}
        <div className="flex items-center gap-2.5">
          <p className="text-[11px] sm:text-xs text-[#8A8AB8] m-0">
            Built by{' '}
            <a
              href="https://github.com/hritikraj07"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#F4F4FF] hover:text-[#00F0FF] underline decoration-[#343460] hover:decoration-[#00F0FF] transition-colors focus:outline-none focus:ring-1 focus:ring-[#00F0FF] rounded px-0.5"
            >
              Hritik Raj
            </a>
          </p>
          <span className="text-[#24244A]">•</span>
          <span className="font-pixel text-[9px] sm:text-[10px] text-[#00F0FF]/80 tracking-wider">BYTE BATTLE</span>
        </div>

        {/* Shortcuts Hint Bar: strictly hidden on mobile devices (< sm breakpoint) since mobile has no physical keyboard */}
        <div className="hidden sm:flex items-center gap-2 text-xs font-sans text-[#8A8AB8]">
          <span className="px-3 py-0.5 rounded-full bg-[#0D0D22] border border-[#24244A] text-[#8A8AB8] flex items-center gap-1.5 flex-wrap">
            <span>Press</span>
            <kbd className="px-1.5 py-0.5 rounded bg-[#101023] border border-[#24244A] text-[#00F0FF] font-mono text-[10px] font-bold">/</kbd>
            <span>to search</span>
            <span className="text-[#24244A] mx-0.5">·</span>
            <kbd className="px-1.5 py-0.5 rounded bg-[#101023] border border-[#24244A] text-[#FFE45E] font-mono text-[10px] font-bold">Esc</kbd>
            <span>to close</span>
            <span className="text-[#24244A] mx-0.5">·</span>
            <kbd className="px-1.5 py-0.5 rounded bg-[#101023] border border-[#24244A] text-[#FF2E97] font-mono text-[10px] font-bold">R</kbd>
            <span>for random</span>
          </span>
        </div>
      </div>
    </footer>
  );
};


