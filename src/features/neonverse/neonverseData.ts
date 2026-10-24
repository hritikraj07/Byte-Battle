export type WorldId = 'nebula' | 'quantum' | 'spire';

export interface WorldDefinition {
  id: WorldId;
  name: string;
  tagline: string;
  accent: string;
  glow: string;
  description: string;
}

export const WORLDS: WorldDefinition[] = [
  {
    id: 'nebula',
    name: 'The Synthwave Nebula',
    tagline: 'Infinite horizon perspective warp with dimensional polygonal nodes',
    accent: '#00F0FF',
    glow: 'rgba(0, 240, 255, 0.4)',
    description: 'An endless kinetic perspective horizon sweeping through a hyper-dimensional neon cosmos.',
  },
  {
    id: 'quantum',
    name: 'The Quantum Expanse',
    tagline: 'Interactive n-body gravitational particle field reacting to touch',
    accent: '#A855F7',
    glow: 'rgba(168, 85, 247, 0.4)',
    description: 'A swirling fluid matrix of charged cosmic particles that orbit and warp around your pointer.',
  },
  {
    id: 'spire',
    name: 'The Chrono Spire',
    tagline: 'Cybernetic monolith pulsing with cascading algorithmic runes',
    accent: '#FF2E97',
    glow: 'rgba(255, 46, 151, 0.4)',
    description: 'A monumental data obelisk piercing an infinite dark sea, radiating concentric energy harmonics.',
  },
];
