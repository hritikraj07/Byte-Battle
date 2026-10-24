import type { Metadata, Viewport } from 'next';
import './globals.css';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';

export const metadata: Metadata = {
  title: 'AFTERHOURS — A place for the unexpected.',
  description: 'A place for the unexpected. Explore digital worlds, imagine the future, experiment with AI, and discover experiences beyond the ordinary.',
  manifest: '/manifest.webmanifest',
  icons: {
    icon: '/favicon.ico',
    apple: '/icons/icon-192x192.png',
  },
};

export const viewport: Viewport = {
  themeColor: '#090A0F',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

import { Press_Start_2P, Space_Grotesk } from 'next/font/google';

const pressStart2P = Press_Start_2P({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-pixel',
  display: 'swap',
});

const spaceGrotesk = Space_Grotesk({
  weight: ['400', '500', '700'],
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <head>
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      </head>
      <body className={`${spaceGrotesk.variable} ${pressStart2P.variable} font-sans bg-[#05050D] text-[#E8E8FF] flex flex-col min-h-screen selection:bg-[#00F0FF] selection:text-slate-950 relative`}>
        {/* Subtle retro arcade CRT scanlines overlay (pointer-events: none) */}
        <div className="scanlines" aria-hidden="true" />
        <Navbar />
        <main className="flex-1 w-full flex flex-col relative z-10">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
