export interface RadarArticle {
  id: string;
  category: 'ai' | 'space' | 'robotics' | 'computing' | 'climate' | 'culture';
  categoryLabel: string;
  title: string;
  abstract: string;
  source: string;
  sourceOrg: string;
  date: string;
  trlLevel: number; // 1 to 9 (NASA Technology Readiness Level)
  tags: string[];
  impactScore: number;
}

export const RADAR_ITEMS: RadarArticle[] = [
  {
    id: 'rad-01',
    category: 'computing',
    categoryLabel: 'Quantum Computing',
    title: 'Topological Quantum Qubits Demonstrate Fault-Tolerant Braiding Under Thermal Stress',
    abstract: 'Majorana zero-mode quasi-particles stabilized across semiconductor-superconductor nanowires demonstrate 100x lower decoherence rates, bringing scalable topological fault-tolerance closer to commercial viability.',
    source: 'Nature Quantum Information',
    sourceOrg: 'CERN & Delft Quantum Labs',
    date: 'Q3 2026',
    trlLevel: 5,
    tags: ['Topological Qubits', 'Majorana Modes', 'Decoherence Mitigation'],
    impactScore: 94,
  },
  {
    id: 'rad-02',
    category: 'climate',
    categoryLabel: 'Clean Energy',
    title: 'Perovskite-Silicon Tandem Solar Cells Exceed 34.6% Operational Photovoltaic Efficiency',
    abstract: 'Commercial-grade roll-to-roll manufacturing protocols solved the long-standing moisture degradation vulnerability of halide perovskites, paving the way for ultra-dense building-integrated photovoltaics.',
    source: 'Renewable Energy Progress Journal',
    sourceOrg: 'Fraunhofer ISE & NREL',
    date: 'Q3 2026',
    trlLevel: 7,
    tags: ['Tandem Cells', 'Perovskite Halides', 'Grid Parity'],
    impactScore: 91,
  },
  {
    id: 'rad-03',
    category: 'ai',
    categoryLabel: 'Artificial Intelligence',
    title: 'Sparse Mixture-of-Depths Transformers Drastically Reduce Inference Energy by 62%',
    abstract: 'Dynamic routing algorithms dynamically bypass unneeded compute layers for deterministic sub-tasks, matching frontier LLM reasoning benchmarks while slashing data center power consumption.',
    source: 'DeepMind Technical Papers',
    sourceOrg: 'Google DeepMind Research',
    date: 'Q2 2026',
    trlLevel: 8,
    tags: ['Mixture-of-Depths', 'Energy Efficiency', 'Algorithmic Pruning'],
    impactScore: 96,
  },
  {
    id: 'rad-04',
    category: 'space',
    categoryLabel: 'Space Exploration',
    title: 'James Webb Spectrometry Confirms Atmospheric Hydrothermal Vent Signatures on Enceladus',
    abstract: 'Direct infrared absorption spectroscopy of water vapor plumes erupting from the south polar tiger stripes of Saturn’s moon Enceladus detects complex organic macromolecules and molecular methane ratios.',
    source: 'Astrophysical Journal Letters',
    sourceOrg: 'NASA Jet Propulsion Laboratory',
    date: 'Q3 2026',
    trlLevel: 9,
    tags: ['Astrobiology', 'Enceladus Plumes', 'JWST Spectroscopy'],
    impactScore: 98,
  },
  {
    id: 'rad-05',
    category: 'robotics',
    categoryLabel: 'Robotics & Bio-Kinetic',
    title: 'Electro-Hydraulic Soft Actuators Emulate Human Tendon Elasticity with Sub-Millimeter Compliance',
    abstract: 'Synthetic muscle bundles operating via electrostatic fluid displacement achieve power-to-weight ratios four times higher than conventional brushless motors, eliminating heavy gearboxes in bipedal locomotion.',
    source: 'IEEE Transactions on Robotics',
    sourceOrg: 'MIT Biomimetic Robotics Lab',
    date: 'Q2 2026',
    trlLevel: 6,
    tags: ['HASEL Actuators', 'Bipedal Balance', 'Soft Robotics'],
    impactScore: 89,
  },
  {
    id: 'rad-06',
    category: 'culture',
    categoryLabel: 'Digital Culture & Ethics',
    title: 'Zero-Knowledge Cryptographic Watermarks Establish Provable Provenance for Human-Authored Works',
    abstract: 'An open decentralized consensus protocol allows digital artists and journalists to mathematically prove temporal human authorship without exposing proprietary source files or private biographical data.',
    source: 'Berkman Klein Center for Internet & Society',
    sourceOrg: 'Harvard Cyberlaw Initiative',
    date: 'Q3 2026',
    trlLevel: 7,
    tags: ['zk-SNARKs', 'Human Provenance', 'Content Authenticity'],
    impactScore: 88,
  },
];

export interface RadarCategory {
  id: string;
  label: string;
}

export const CATEGORIES: RadarCategory[] = [
  { id: 'all', label: 'All Intel' },
  { id: 'ai', label: 'AI & Cognition' },
  { id: 'computing', label: 'Quantum & Computing' },
  { id: 'space', label: 'Deep Space' },
  { id: 'climate', label: 'Climate & Energy' },
  { id: 'robotics', label: 'Robotics' },
  { id: 'culture', label: 'Cyber Culture' },
];
