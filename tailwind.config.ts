import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        neo: {
          bg: '#05050D',
          surface: '#0D0D22',
          elevated: '#101023',
          card: '#0D0D22',
          cardHover: '#141432',
          border: '#24244A',
          line: '#24244A',
          cyan: '#00F0FF',
          pink: '#FF2E97',
          purple: '#A855F7',
          yellow: '#FFE45E',
          text: '#E8E8FF',
          secondary: '#8A8AB8',
          muted: '#8A8AB8',
          lime: '#00F0FF', // Mapped to primary cyan
          coral: '#FF2E97', // Mapped to hot pink
        },
        arena: {
          dark: '#05050D',
          card: '#0D0D22',
          cardBorder: '#24244A',
          hover: '#141432',
          cyan: '#00F0FF',
          blue: '#A855F7',
          purple: '#A855F7',
          green: '#22C55E',
          yellow: '#FFE45E',
          red: '#EF4444',
          coral: '#FF2E97',
          muted: '#8A8AB8',
          text: '#E8E8FF',
        },
      },
      boxShadow: {
        'neon-cyan': '0 0 16px -2px #00F0FF',
        'neon-pink': '0 0 16px -2px #FF2E97',
        'neon-yellow': '0 0 16px -2px #FFE45E',
        'neo-lime': '0 0 16px -2px #00F0FF',
        'neo-purple': '0 0 16px -2px #A855F7',
        'neo-coral': '0 0 16px -2px #FF2E97',
        'arcade-card': '0 0 24px -6px rgba(0, 240, 255, 0.15)',
        'arcade-btn': '0 0 20px -6px #00F0FF',
      },
      fontFamily: {
        pixel: ['var(--font-pixel)', '"Press Start 2P"', 'ui-monospace', 'monospace'],
        sans: ['var(--font-sans)', '"Space Grotesk"', 'system-ui', 'sans-serif'],
        mono: ['var(--font-pixel)', 'ui-monospace', 'monospace'],
      },
      animation: {
        'blink': 'blink 1.2s steps(1) infinite',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glow-pulse': 'glowPulse 2s ease-in-out infinite alternate',
      },
      keyframes: {
        blink: {
          '50%': { opacity: '0.25' },
        },
        glowPulse: {
          '0%': { boxShadow: '0 0 10px rgba(0, 240, 255, 0.2)' },
          '100%': { boxShadow: '0 0 25px rgba(0, 240, 255, 0.5)' },
        },
      },
    },
  },
  plugins: [],
};

export default config;
