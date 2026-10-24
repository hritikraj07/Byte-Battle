export type TransformationMode =
  | 'hyper-cinematic'
  | 'algorithmic'
  | 'philosophical'
  | 'cyberpunk'
  | 'minimalist';

export interface ModePreset {
  name: string;
  tag: string;
  template: (input: string) => string;
}

export const MODE_PRESETS: Record<TransformationMode, ModePreset> = {
  'hyper-cinematic': {
    name: 'Hyper-Cinematic',
    tag: '35mm Panavision • Volumetric Lighting',
    template: (input) =>
      `Cinematic establishing shot of ${input}, shot on 35mm anamorphic lens, f/1.8 aperture, deep depth of field, chiaroscuro lighting with volumetric twilight atmospheric mist, hyper-detailed micro-textures, 8K photorealistic render, color graded in muted teal and amber tones.`,
  },
  'algorithmic': {
    name: 'Algorithmic Precision',
    tag: 'Strict Structural Specifications',
    template: (input) =>
      `Technical schematic and conceptual visualization of ${input}: isometric projection, clean vector linework with layered wireframe transparency, labeled node telemetry, strict modular geometric symmetry, rendered on matte dark titanium surface with phosphor cyan coordinate annotations.`,
  },
  'philosophical': {
    name: 'Philosophical Depth',
    tag: 'Conceptual Metaphor & Ethereal Tone',
    template: (input) =>
      `A contemplative meditation exploring the boundary of ${input}: ethereal atmospheric haze, gentle chiaroscuro contrasts, solitary presence in an infinite void, whispering light rays through ancient celestial dust, evocative of existential wonder and tranquil permanence.`,
  },
  'cyberpunk': {
    name: 'Cyberpunk Noir',
    tag: 'Rain-Slicked Neon & Megastructures',
    template: (input) =>
      `Neo-metropolitan night scene featuring ${input}, drenched in torrential acid rain, flickering neon kanji signage reflected in slick asphalt puddles, dense layered cybernetic cables, towering brutalist megastructure backdrop, chromatic aberration and high-contrast ultraviolet glow.`,
  },
  'minimalist': {
    name: 'Minimalist Editorial',
    tag: 'Bauhaus Purity & Negative Space',
    template: (input) =>
      `Architectural minimalism embodying ${input}: pure geometric forms, vast balanced negative space, natural diffused sunlight across raw cast concrete and white linen, balanced Scandinavian composition, zero visual clutter, timeless editorial aesthetic.`,
  },
};

export const CONCEPT_PAIRS = [
  { a: 'Bioluminescent Fungi', b: 'Brutalist Architecture' },
  { a: 'Quantum Superposition', b: 'Art Nouveau Glasswork' },
  { a: 'Cybernetic Neural Networks', b: 'Ancient Zen Stone Garden' },
  { a: 'Sub-Zero Cryogenics', b: 'Warm Analog Vinyl Hi-Fi' },
  { a: 'Deep Oceanic Trench', b: 'Orbital Solar Collector Station' },
];
