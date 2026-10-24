'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Home,
  Gamepad2,
  Sparkles,
  Cpu,
  Compass,
  UserCheck,
  Clock,
  Orbit,
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
    { href: '/games', label: 'Games', icon: Gamepad2, isGames: true },
    { href: '/future', label: 'Future Lab', icon: Sparkles },
    { href: '/ai-studio', label: 'AI Studio', icon: Cpu },
    { href: '/discover', label: 'Discover', icon: Compass },
    { href: '/identity', label: 'Identity', icon: UserCheck },
    { href: '/time-capsule', label: 'Time Capsule', icon: Clock },
    { href: '/neonverse', label: 'Neonverse', icon: Orbit },
  ];

  return (
    <header className="sticky top-0 z-40 w-full bg-[#090A0F]/95 backdrop-blur-xl border-b border-[#1E2235] shadow-[0_4px_30px_rgba(0,0,0,0.85)] transition-all">
      <div className="w-full max-w-[1720px] mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand Logo */}
        <Link
          href="/"
          className="flex items-center h-10 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#A78BFA] rounded-xl flex-shrink-0"
          aria-label="AFTERHOURS Home"
        >
          <AfterhoursLogo size="md" />
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden xl:flex items-center gap-1.5" aria-label="Main Navigation">
          {navLinks.map((link) => {
            const isActive =
              pathname === link.href ||
              (link.href !== '/' && (pathname.startsWith(link.href) || (link.href === '/games' && pathname.startsWith('/play'))));
            const Icon = link.icon;

            return (
              <Link
                key={link.href}
                href={link.href}
                className={`h-9 flex items-center gap-1.5 px-3.5 rounded-full text-xs font-sans transition-all ${
                  isActive
                    ? 'bg-[#A78BFA] text-[#090A0F] font-bold shadow-[0_0_16px_rgba(167,139,250,0.4)] border border-[#A78BFA]'
                    : link.isGames
                    ? 'text-[#00F0FF] hover:text-white bg-[#00F0FF]/10 hover:bg-[#00F0FF]/20 border border-[#00F0FF]/30 font-medium'
                    : 'text-[#A4A6B8] hover:text-[#F4F4F8] bg-[#10121B]/80 hover:bg-[#171A25] border border-[#1E2235] hover:border-[#A78BFA]/50 font-normal'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{link.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Condensed Tablet Navigation (visible on md to lg) */}
        <nav className="hidden md:flex xl:hidden items-center gap-1.5" aria-label="Compact Navigation">
          {navLinks.slice(0, 4).map((link) => {
            const isActive =
              pathname === link.href ||
              (link.href !== '/' && (pathname.startsWith(link.href) || (link.href === '/games' && pathname.startsWith('/play'))));
            const Icon = link.icon;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`h-8 flex items-center gap-1.5 px-3 rounded-full text-xs font-sans transition-all ${
                  isActive
                    ? 'bg-[#A78BFA] text-[#090A0F] font-bold'
                    : 'text-[#A4A6B8] hover:text-[#F4F4F8] bg-[#10121B] border border-[#1E2235]'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{link.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Right Section: Offline Badge & Mobile Menu Trigger */}
        <div className="flex items-center gap-3">
          {isOffline && (
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-950/60 border border-amber-500/40 text-amber-400 text-xs font-sans font-medium">
              <WifiOff className="w-3.5 h-3.5" />
              <span>Offline Mode</span>
            </div>
          )}

          {/* Mobile / Tablet menu button */}
          <button
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            className="xl:hidden w-10 h-10 flex items-center justify-center rounded-xl text-[#A4A6B8] hover:text-white bg-[#10121B] border border-[#1E2235] hover:border-[#A78BFA]/50 focus:outline-none focus:ring-2 focus:ring-[#A78BFA]"
            aria-label="Toggle navigation menu"
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="xl:hidden px-4 pt-3 pb-5 bg-[#090A0F] border-b border-[#1E2235] space-y-1.5 animate-fadeIn">
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
                className={`flex items-center justify-between px-4 py-2.5 rounded-xl text-sm font-sans transition-all ${
                  isActive
                    ? 'bg-[#A78BFA] text-[#090A0F] font-bold shadow-[0_0_16px_rgba(167,139,250,0.3)]'
                    : link.isGames
                    ? 'text-[#00F0FF] bg-[#00F0FF]/10 border border-[#00F0FF]/30 font-medium'
                    : 'text-[#A4A6B8] hover:text-white hover:bg-[#171A25] border border-[#1E2235]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-4 h-4" />
                  <span>{link.label}</span>
                </div>
                {link.isGames && (
                  <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-[#00F0FF]/20 text-[#00F0FF]">
                    Arcade
                  </span>
                )}
              </Link>
            );
          })}
        </div>
      )}
    </header>
  );
};
