import React from 'react';
import {
  Binary,
  FileCode,
  Zap,
  Timer,
  Grid,
  Palette,
  Compass,
  Layers,
  Calculator,
  Navigation,
  Crosshair,
} from 'lucide-react';
import { GameId } from '@/types/puzzle';
import {
  PatternShiftArtwork,
  WordWeaveArtwork,
  PulseJumperArtwork,
  ReflexRushArtwork,
  MemoryMatrixArtwork,
  ColorClashArtwork,
  OrbitDodgeArtwork,
  StackSprintArtwork,
  NumberBlitzArtwork,
  MazeRunnerArtwork,
  PixelInvadersArtwork,
} from '@/components/artwork';

export type ArcadeCategory =
  | 'all'
  | 'action'
  | 'arcade'
  | 'classic'
  | 'endless'
  | 'puzzle'
  | 'shooter';

export interface ArcadeCategoryItem {
  id: ArcadeCategory;
  name: string;
  label: string;
  count: number;
}

export interface GameDefinition {
  id: GameId;
  routeId: string;
  title: string;
  tagline: string;
  desc: string;
  icon: React.ElementType;
  artwork: React.ComponentType<{ className?: string }>;
  accentColor: string;
  accent: string;
  borderClass: string;
  bgGrad: string;
  textClass: string;
  badge: string;
  type: 'puzzle' | 'rhythm' | 'reflex' | 'memory' | 'arcade' | 'action';
  categories: ArcadeCategory[];
  controls: string;
  supportsDifficulty: boolean;
}

export const ACTIVE_GAMES: GameDefinition[] = [
  {
    id: 'pattern-shift',
    routeId: 'pattern-shift',
    title: 'Pattern Shift',
    tagline: 'Sequence & Mathematical Deduction',
    desc: 'Identify progressive mathematical series, Fibonacci variants, quadratic rules, and visual matrix rotations.',
    icon: Binary,
    artwork: PatternShiftArtwork,
    accentColor: '#00F0FF',
    accent: '#00F0FF',
    borderClass: 'border-[#00F0FF]/40 hover:border-[#00F0FF]',
    bgGrad: 'from-[#00F0FF]/20 to-transparent',
    textClass: 'text-[#00F0FF]',
    badge: 'Logic Sequence',
    type: 'puzzle',
    categories: ['puzzle', 'classic', 'arcade'],
    controls: 'Click / Keys 1 - 4',
    supportsDifficulty: true,
  },
  {
    id: 'word-weave',
    routeId: 'word-weave',
    title: 'Word Weave',
    tagline: 'Linguistic Logic & Categories',
    desc: 'Climb 1-letter step word ladders and categorize computer science terminology into 4-item clusters.',
    icon: FileCode,
    artwork: WordWeaveArtwork,
    accentColor: '#A855F7',
    accent: '#A855F7',
    borderClass: 'border-[#A855F7]/40 hover:border-[#A855F7]',
    bgGrad: 'from-[#A855F7]/20 to-transparent',
    textClass: 'text-[#A855F7]',
    badge: 'Word Logic',
    type: 'puzzle',
    categories: ['puzzle', 'classic'],
    controls: 'Click / Drag Tiles',
    supportsDifficulty: true,
  },
  {
    id: 'pulse-jumper',
    routeId: 'pulse-jumper',
    title: 'Pulse Jumper',
    tagline: 'Rhythm Platformer • 128 BPM',
    desc: 'One-button rhythm platformer. Leap over neon spikes and obstacles in sync with pulsing synth audio beats.',
    icon: Zap,
    artwork: PulseJumperArtwork,
    accentColor: '#FF2E97',
    accent: '#FF2E97',
    borderClass: 'border-[#FF2E97]/40 hover:border-[#FF2E97]',
    bgGrad: 'from-[#FF2E97]/25 to-transparent',
    textClass: 'text-[#FF2E97]',
    badge: 'Rhythm Runner',
    type: 'rhythm',
    categories: ['arcade', 'endless', 'action'],
    controls: 'Space / Up / Tap screen',
    supportsDifficulty: true,
  },
  {
    id: 'reflex-rush',
    routeId: 'reflex-rush',
    title: 'Reflex Rush',
    tagline: 'Millisecond Reaction Speed Test',
    desc: 'Respond to visual stimuli with lightning reflexes. Avoid premature triggers and clock your best reaction time in ms.',
    icon: Timer,
    artwork: ReflexRushArtwork,
    accentColor: '#FFE45E',
    accent: '#FFE45E',
    borderClass: 'border-[#FFE45E]/40 hover:border-[#FFE45E]',
    bgGrad: 'from-[#FFE45E]/20 to-transparent',
    textClass: 'text-[#FFE45E]',
    badge: 'Reaction Test',
    type: 'reflex',
    categories: ['arcade', 'action', 'classic'],
    controls: 'Click / Tap on Green',
    supportsDifficulty: true,
  },
  {
    id: 'memory-matrix',
    routeId: 'memory-matrix',
    title: 'Memory Matrix',
    tagline: 'Spatial Pattern Recall Challenge',
    desc: 'Memorize flashing cell configurations on an expanding cyber grid and reproduce the illuminated pattern.',
    icon: Grid,
    artwork: MemoryMatrixArtwork,
    accentColor: '#00F0FF',
    accent: '#00F0FF',
    borderClass: 'border-[#00F0FF]/40 hover:border-[#00F0FF]',
    bgGrad: 'from-[#00F0FF]/20 to-transparent',
    textClass: 'text-[#00F0FF]',
    badge: 'Memory Grid',
    type: 'memory',
    categories: ['puzzle', 'arcade', 'classic'],
    controls: 'Click / Tap Matrix Cells',
    supportsDifficulty: true,
  },
  {
    id: 'color-clash',
    routeId: 'color-clash',
    title: 'Color Clash',
    tagline: 'Fast Stroop Effect Color Combat',
    desc: 'Overcome cognitive interference in high-speed rounds matching font colors vs written names under shifting rules.',
    icon: Palette,
    artwork: ColorClashArtwork,
    accentColor: '#FF2E97',
    accent: '#FF2E97',
    borderClass: 'border-[#FF2E97]/40 hover:border-[#FF2E97]',
    bgGrad: 'from-[#FF2E97]/20 to-transparent',
    textClass: 'text-[#FF2E97]',
    badge: 'Focus Battle',
    type: 'reflex',
    categories: ['arcade', 'puzzle', 'action'],
    controls: 'Keys 1 - 4 / R,G,B,Y',
    supportsDifficulty: true,
  },
  {
    id: 'orbit-dodge',
    routeId: 'orbit-dodge',
    title: 'Orbit Dodge',
    tagline: 'Gravitational Arcade Survival',
    desc: 'Pilot a neon probe around gravitational rings, evading incoming space debris while harvesting energy sparks.',
    icon: Compass,
    artwork: OrbitDodgeArtwork,
    accentColor: '#FFE45E',
    accent: '#FFE45E',
    borderClass: 'border-[#FFE45E]/40 hover:border-[#FFE45E]',
    bgGrad: 'from-[#FFE45E]/20 to-transparent',
    textClass: 'text-[#FFE45E]',
    badge: 'Arcade Survival',
    type: 'arcade',
    categories: ['arcade', 'action', 'endless'],
    controls: 'Arrows / WASD / Touch D-Pad',
    supportsDifficulty: true,
  },
  {
    id: 'stack-sprint',
    routeId: 'stack-sprint',
    title: 'Stack Sprint',
    tagline: 'Precision Block Stacking Tower',
    desc: 'Drop oscillating blocks with pinpoint timing. Trim overhanging edges and build the highest neon skyscraper.',
    icon: Layers,
    artwork: StackSprintArtwork,
    accentColor: '#00F0FF',
    accent: '#00F0FF',
    borderClass: 'border-[#00F0FF]/40 hover:border-[#00F0FF]',
    bgGrad: 'from-[#00F0FF]/20 to-transparent',
    textClass: 'text-[#00F0FF]',
    badge: 'Precision Timing',
    type: 'arcade',
    categories: ['arcade', 'endless', 'classic'],
    controls: 'Space / Enter / Tap Screen',
    supportsDifficulty: true,
  },
  {
    id: 'number-blitz',
    routeId: 'number-blitz',
    title: 'Number Blitz',
    tagline: 'Rapid-Fire Mental Arithmetic',
    desc: 'Calculate fast mental math equations under countdown pressure. Rack up combos and test computational speed.',
    icon: Calculator,
    artwork: NumberBlitzArtwork,
    accentColor: '#FF2E97',
    accent: '#FF2E97',
    borderClass: 'border-[#FF2E97]/40 hover:border-[#FF2E97]',
    bgGrad: 'from-[#FF2E97]/20 to-transparent',
    textClass: 'text-[#FF2E97]',
    badge: 'Mental Math',
    type: 'puzzle',
    categories: ['puzzle', 'arcade'],
    controls: 'Keys 1 - 4 / Click Answer',
    supportsDifficulty: true,
  },
  {
    id: 'maze-runner',
    routeId: 'maze-runner',
    title: 'Maze Runner',
    tagline: 'Procedural Solvable Labyrinth',
    desc: 'Navigate procedurally generated cyber mazes using keyboard, touch, or D-pad. Race against the clock to the exit portal.',
    icon: Navigation,
    artwork: MazeRunnerArtwork,
    accentColor: '#22C55E',
    accent: '#22C55E',
    borderClass: 'border-emerald-500/40 hover:border-emerald-400',
    bgGrad: 'from-emerald-500/20 to-transparent',
    textClass: 'text-emerald-400',
    badge: 'Pathfinding',
    type: 'arcade',
    categories: ['puzzle', 'arcade', 'classic'],
    controls: 'Arrows / WASD / Touch D-Pad',
    supportsDifficulty: true,
  },
  {
    id: 'pixel-invaders',
    routeId: 'pixel-invaders',
    title: 'Pixel Invaders',
    tagline: 'Retro Arcade Space Defense',
    desc: 'Defend neon airspace against descending waves of pixel invaders. Dodge plasma salvos and take down mystery UFOs.',
    icon: Crosshair,
    artwork: PixelInvadersArtwork,
    accentColor: '#A855F7',
    accent: '#A855F7',
    borderClass: 'border-[#A855F7]/40 hover:border-[#A855F7]',
    bgGrad: 'from-[#A855F7]/25 to-transparent',
    textClass: 'text-[#A855F7]',
    badge: 'Retro Shooter',
    type: 'action',
    categories: ['shooter', 'arcade', 'classic', 'action'],
    controls: 'Arrows + Space / Touch',
    supportsDifficulty: true,
  },
];

const RAW_CATEGORIES: { id: ArcadeCategory; name: string }[] = [
  { id: 'all', name: 'All' },
  { id: 'action', name: 'Action' },
  { id: 'arcade', name: 'Arcade' },
  { id: 'classic', name: 'Classic' },
  { id: 'endless', name: 'Endless' },
  { id: 'puzzle', name: 'Puzzle' },
  { id: 'shooter', name: 'Shooter' },
];

export const ARCADE_CATEGORIES: ArcadeCategoryItem[] = RAW_CATEGORIES
  .map((cat) => {
    const count =
      cat.id === 'all'
        ? ACTIVE_GAMES.length
        : ACTIVE_GAMES.filter((g) => g.categories.includes(cat.id)).length;
    return {
      id: cat.id,
      name: cat.name,
      label: `${cat.name} (${count})`,
      count,
    };
  })
  .filter((cat) => cat.count > 0);

