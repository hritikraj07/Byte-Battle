export interface DigitalPersona {
  displayName: string;
  callsign: string;
  archetype: string;
  bio: string;
  accentColor: string;
  foilStyle: string;
  glyphId: number;
  skills: string[];
}

export const ARCHETYPES = [
  'Quantum Architect',
  'Neon Drifter',
  'Cybernetician',
  'Void Navigator',
  'Neural Synthesist',
  'Synthetic Empath',
  'Zero-Knowledge Cypherpunk',
];

export const ACCENTS = [
  { name: 'Ultraviolet', hex: '#A855F7', glow: 'shadow-[0_0_24px_rgba(168,85,247,0.5)]' },
  { name: 'Neon Cyan', hex: '#00F0FF', glow: 'shadow-[0_0_24px_rgba(0,240,255,0.5)]' },
  { name: 'Plasma Magenta', hex: '#EC4899', glow: 'shadow-[0_0_24px_rgba(236,72,153,0.5)]' },
  { name: 'Acid Lime', hex: '#C8FF3D', glow: 'shadow-[0_0_24px_rgba(200,255,61,0.5)]' },
  { name: 'Solar Amber', hex: '#F59E0B', glow: 'shadow-[0_0_24px_rgba(245,158,11,0.5)]' },
];

export const GLYPHS = [
  '◈', '⌬', '⏣', '⎈', '✦', '⧉', '⚛', '❂', '✺', '🜲', '⨂', '⛊'
];

export const FOIL_STYLES = [
  { id: 'prismatic', name: 'Prismatic Grid', bg: 'bg-gradient-to-br from-[#1C0D30] via-[#2A1046] to-[#0E061A]' },
  { id: 'carbon', name: 'Carbon Stealth', bg: 'bg-gradient-to-br from-[#151020] via-[#1E1430] to-[#0B0814]' },
  { id: 'starlight', name: 'Cosmic Nebula', bg: 'bg-gradient-to-br from-[#2E0854] via-[#1B0533] to-[#0A0214]' },
];

export const DEFAULT_PERSONA: DigitalPersona = {
  displayName: 'Aria Thorne',
  callsign: 'CYBER-7X',
  archetype: 'Quantum Architect',
  bio: 'Synthesizing decentralized cognitive systems and ambient spatial interfaces for the next civilizational horizon.',
  accentColor: '#A855F7',
  foilStyle: 'prismatic',
  glyphId: 1,
  skills: ['Quantum Logic', 'Zero-Knowledge Cryptography', 'Neural World Models', 'Bio-Kinetic UI'],
};
