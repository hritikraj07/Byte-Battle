import React from 'react';
import Link from 'next/link';

export const Footer: React.FC = () => {
  return (
    <footer className="w-full bg-[#05050D] border-t border-[#24244A] py-8 px-4 sm:px-6 lg:px-8 text-xs text-[#8A8AB8] font-sans relative z-10">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        {/* Bottom-left aligned credit */}
        <div className="flex items-center gap-3">
          <p className="text-xs text-[#8A8AB8] m-0">
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
          <span className="font-pixel text-[10px] text-[#00F0FF]/80 tracking-wider">BYTE BATTLE</span>
        </div>

        <div className="flex items-center gap-4 text-xs font-sans">
          <span className="px-3 py-1 rounded-full bg-[#0D0D22] border border-[#24244A] text-[#FFE45E]">
            100% Offline-Ready • IndexedDB
          </span>
          <Link
            href="/settings"
            className="hover:text-[#00F0FF] transition-colors focus:outline-none focus:ring-1 focus:ring-[#00F0FF] rounded px-1"
          >
            Settings & Controls
          </Link>
        </div>
      </div>
    </footer>
  );
};

