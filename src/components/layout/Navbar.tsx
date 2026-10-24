'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Home,
  Gamepad2,
  Sparkles,
  Trophy,
  WifiOff,
  Menu,
  X,
} from 'lucide-react';
import { AfterhoursLogo } from '@/components/common/AfterhoursLogo';
import { usePWA } from '@/hooks/usePWA';

export const Navbar: React.FC = () => {
  const pathname = usePathname();
  const { isOffline } = usePWA();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Suppress navbar during active full-viewport gameplay
  if (pathname === '/host/display' || pathname.startsWith('/play')) {
    return null;
  }

  const navLinks = [
    { href: '/', label: 'Home', icon: Home },
    { href: '/future', label: 'Future Self', icon: Sparkles },
    { href: '/games', label: 'Games', icon: Gamepad2 },
    { href: '/leaderboard', label: 'Leaderboard', icon: Trophy },
  ];

  return (
    <header className="sticky top-0 z-40 w-full bg-[#090A0F]/95 backdrop-blur-xl border-b border-[#1E2235] shadow-[0_4px_30px_rgba(0,0,0,0.85)]">
      <div className="w-full max-w-[1720px] mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand Logo */}
        <Link
          href="/"
          className="flex items-center h-10 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#A78BFA] rounded-xl flex-shrink-0 cursor-pointer"
          aria-label="AFTERHOURS Home"
        >
          <AfterhoursLogo size="md" />
        </Link>

        {/* Desktop Navigation - Clean, modern, unhighlighted */}
        <nav className="hidden md:flex items-center gap-2" aria-label="Main Navigation">
          {navLinks.map((link) => {
            const isActive =
              pathname === link.href ||
              (link.href !== '/' && (pathname.startsWith(link.href) || (link.href === '/games' && pathname.startsWith('/play'))));
            const Icon = link.icon;

            return (
              <Link
                key={link.href}
                href={link.href}
                className={`h-9 flex items-center gap-2 px-4 rounded-xl text-xs font-medium transition-colors cursor-pointer ${
                  isActive
                    ? 'bg-[#A78BFA] text-[#090A0F] font-bold shadow-[0_0_16px_rgba(167,139,250,0.35)]'
                    : 'text-[#A4A6B8] hover:text-[#F4F4F8] bg-[#10121B]/80 hover:bg-[#171A25] border border-[#1E2235] hover:border-[#A78BFA]/40'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{link.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Right Section: Offline Status & Mobile Menu Toggle */}
        <div className="flex items-center gap-3">
          {isOffline && (
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-950/60 border border-amber-500/40 text-amber-400 text-xs font-medium">
              <WifiOff className="w-3.5 h-3.5" />
              <span>Offline Mode</span>
            </div>
          )}

          {/* Mobile menu button */}
          <button
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            className="md:hidden w-10 h-10 flex items-center justify-center rounded-xl text-[#A4A6B8] hover:text-white bg-[#10121B] border border-[#1E2235] hover:border-[#A78BFA]/50 focus:outline-none focus:ring-2 focus:ring-[#A78BFA] cursor-pointer"
            aria-label="Toggle navigation menu"
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden px-4 pt-3 pb-5 bg-[#090A0F] border-b border-[#1E2235] space-y-1.5">
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
                className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm transition-colors cursor-pointer ${
                  isActive
                    ? 'bg-[#A78BFA] text-[#090A0F] font-bold shadow-[0_0_16px_rgba(167,139,250,0.3)]'
                    : 'text-[#A4A6B8] hover:text-white hover:bg-[#171A25] border border-[#1E2235]'
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
