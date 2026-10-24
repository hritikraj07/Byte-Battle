'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Gamepad2, Settings, Home, Trophy, WifiOff, Menu, X } from 'lucide-react';
import { ByteBattleLogo } from '@/components/common/ByteBattleLogo';
import { usePWA } from '@/hooks/usePWA';

export const Navbar: React.FC = () => {
  const pathname = usePathname();
  const { isOffline } = usePWA();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Suppress navbar during active full-viewport gameplay
  if (
    pathname === '/host/display' ||
    pathname.startsWith('/play')
  ) {
    return null;
  }

  const navLinks = [
    { href: '/', label: 'Home', icon: Home },
    { href: '/games', label: 'Games', icon: Gamepad2 },
    { href: '/leaderboard', label: 'Trophies', icon: Trophy },
    { href: '/settings', label: 'Settings', icon: Settings },
  ];

  return (
    <header className="sticky top-0 z-40 w-full bg-[#080816]/95 backdrop-blur-xl border-b border-[#24244A] shadow-[0_4px_30px_rgba(0,0,0,0.85)] transition-all">
      <div className="w-full max-w-[1720px] mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo - Preserved Exactly with original proportions */}
        <Link
          href="/"
          className="flex items-center h-10 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#00F0FF] rounded-xl"
          aria-label="BYTE BATTLE Home"
        >
          <ByteBattleLogo size="md" />
        </Link>

        {/* Desktop Navigation - Pill style matching GH-Arcade */}
        <nav className="hidden md:flex items-center gap-2.5" aria-label="Main Navigation">
          {navLinks.map((link) => {
            const isActive =
              pathname === link.href ||
              (link.href !== '/' && (pathname.startsWith(link.href) || (link.href === '/games' && pathname.startsWith('/play'))));
            const Icon = link.icon;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`h-9 flex items-center gap-2 px-4 rounded-full text-xs font-sans font-medium transition-all ${
                  isActive
                    ? 'bg-[#00F0FF] text-[#05050D] font-bold shadow-[0_0_16px_-4px_#00F0FF] border border-[#00F0FF]'
                    : 'text-[#8A8AB8] hover:text-[#E8E8FF] bg-[#0D0D22]/80 hover:bg-[#141432] border border-[#24244A] hover:border-[#00F0FF]'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{link.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Offline Badge & Mobile Menu Trigger */}
        <div className="flex items-center gap-3">
          {isOffline && (
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-950/60 border border-amber-500/40 text-amber-400 text-xs font-sans font-medium">
              <WifiOff className="w-3.5 h-3.5" />
              <span>Offline Mode</span>
            </div>
          )}

          {/* Touch-Friendly Mobile menu button (>=44px touch target) */}
          <button
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            className="md:hidden w-11 h-11 flex items-center justify-center rounded-xl text-[#8A8AB8] hover:text-white bg-[#0D0D22] border border-[#24244A] focus:outline-none focus:ring-2 focus:ring-[#00F0FF]"
            aria-label="Toggle navigation menu"
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden px-4 pt-3 pb-5 bg-[#0D0D22] border-b border-[#24244A] space-y-2 animate-fadeIn">
          {navLinks.map((link) => {
            const isActive =
              pathname === link.href ||
              (link.href !== '/' && (pathname.startsWith(link.href) || (link.href === '/games' && pathname.startsWith('/play'))));
            const Icon = link.icon;
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-sans font-medium transition-all ${
                  isActive
                    ? 'bg-[#00F0FF] text-[#05050D] font-bold shadow-[0_0_16px_-4px_#00F0FF]'
                    : 'text-[#8A8AB8] hover:text-white hover:bg-[#141432] border border-[#24244A]'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{link.label}</span>
              </Link>
            );
          })}
        </div>
      )}
    </header>
  );
};
