import type { Metadata, Viewport } from 'next';
import './globals.css';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Inter, Press_Start_2P } from 'next/font/google';

export const metadata: Metadata = {
  title: 'AFTERHOURS — A place for the unexpected.',
  description: 'A place for the unexpected. Explore futuristic simulations, age transformations, and championship arcade experiences beyond the ordinary.',
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

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
});

const pressStart2P = Press_Start_2P({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-pixel',
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
      <body className={`${inter.variable} ${pressStart2P.variable} font-sans bg-[#090A0F] text-[#F4F4F8] flex flex-col min-h-screen selection:bg-[#A78BFA] selection:text-[#090A0F] relative`}>
        <Navbar />
        <main className="flex-1 w-full flex flex-col relative z-10">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
