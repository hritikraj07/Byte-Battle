import React from 'react';
import {
  Home,
  Car,
  GraduationCap,
  Briefcase,
  Tv,
  Bot,
  Globe2,
} from 'lucide-react';

export interface DomainPrediction {
  id: string;
  name: string;
  icon: React.ElementType;
  tagline: string;
  prob: number;
  impact: string;
  timeline: { year: number; event: string }[];
  breakdown: string;
  keyTech: string[];
}

export const PREDICTIONS: DomainPrediction[] = [
  {
    id: 'homes',
    name: 'Smart Habitats',
    icon: Home,
    tagline: 'Living architectural organisms that adapt in real time',
    prob: 88,
    impact: 'Transformational',
    timeline: [
      { year: 2026, event: 'Voice-controlled ambient home hubs with sub-second latency' },
      { year: 2029, event: 'Closed-loop greywater & biophilic photosynthetic air filters' },
      { year: 2033, event: 'Autonomous kinetic furniture rearranging based on circadian rhythms' },
      { year: 2036, event: 'Self-repairing composite nanomaterials and zero-grid energy self-sufficiency' },
    ],
    breakdown:
      'By 2036, homes will operate as responsive micro-ecosystems. Embedded structural biosensors continuously recalibrate temperature, lighting wavelengths, and acoustic resonance to match the occupant’s biological stress levels.',
    keyTech: ['Solid-State Ambient Thermoelectrics', 'Mycelium Insulation', 'Predictive Resource Balancing'],
  },
  {
    id: 'transport',
    name: 'Mobility & Skyways',
    icon: Car,
    tagline: 'Zero-emission synchronized autonomous transit corridors',
    prob: 92,
    impact: 'Radical',
    timeline: [
      { year: 2026, event: 'Level 4 autonomous taxi fleets operational in 40 global metros' },
      { year: 2030, event: 'Dedicated 3D low-altitude drone logistics air corridors' },
      { year: 2034, event: 'High-speed maglev intercity loops replacing regional flights under 600km' },
      { year: 2036, event: 'Decentralized shared autonomous pods with zero private vehicle ownership in urban centers' },
    ],
    breakdown:
      'Commuting will transition from driver-centric gridlock to fluid kinetic traffic swarms. Vehicles communicate via sub-millisecond vehicular mesh networks, eliminating physical traffic lights and intersection delays entirely.',
    keyTech: ['V2X Terahertz Mesh Networks', 'Room-Temperature Superconducting Rails', 'Urban Air Traffic Management (UATM)'],
  },
  {
    id: 'education',
    name: 'Neural Learning',
    icon: GraduationCap,
    tagline: 'Hyper-personalized neuro-adaptive knowledge pathways',
    prob: 84,
    impact: 'Systemic',
    timeline: [
      { year: 2026, event: 'AI personalized learning copilots integrated in secondary curricula' },
      { year: 2029, event: 'Haptic XR labs allowing real-time simulated surgical and mechanical practice' },
      { year: 2033, event: 'Cognitive load tracking adapting conceptual pacing per pupil in real time' },
      { year: 2036, event: 'Direct experiential memory reinforcement and universal mastery-based accreditation' },
    ],
    breakdown:
      'Standardized classrooms will be replaced by dynamic cognitive learning pods. Knowledge acquisition is tailored to individual neural firing rates, blending spatial immersion with real-time concept synthesis.',
    keyTech: ['Spatial Holographic Workbenches', 'Dynamic Conceptual Graphs', 'Adaptive Mastery Verification'],
  },
  {
    id: 'work',
    name: 'Decentralized Work',
    icon: Briefcase,
    tagline: 'Asynchronous synthetic co-presence and human-agent collectives',
    prob: 95,
    impact: 'Structural',
    timeline: [
      { year: 2026, event: 'Autonomous agent swarms executing multi-step research and code audits' },
      { year: 2030, event: 'Holographic volumetric conference spaces with spatial audio parity' },
      { year: 2033, event: 'Project-based micro-equity DAOs replacing traditional corporate employment contracts' },
      { year: 2036, event: '4-day creative workweeks powered by synthetic back-office operational fleets' },
    ],
    breakdown:
      'The traditional 9-to-5 corporate architecture will dissolve into decentralized human-AI collaborative studios. Routine cognitive toil is executed by personalized agent collectives, leaving humans to direct strategy and creative inquiry.',
    keyTech: ['Volumetric Telepresence', 'Autonomous Agent Orgs', 'Decentralized Reputation Protocols'],
  },
  {
    id: 'entertainment',
    name: 'Synthetic Realities',
    icon: Tv,
    tagline: 'Interactive procedural worlds tailored to individual imagination',
    prob: 91,
    impact: 'Cultural',
    timeline: [
      { year: 2026, event: 'Real-time generative video and responsive NPC dialogue engines' },
      { year: 2029, event: 'Lightweight AR eyewear replacing mobile smartphones as daily display' },
      { year: 2033, event: 'User-directed interactive cinema where story branches per spectator reaction' },
      { year: 2036, event: 'Full-sensory dreamscapes and participatory collaborative meta-universes' },
    ],
    breakdown:
      'Passive media consumption will be superseded by generative worlds that construct themselves on the fly. Audiences become protagonists in worlds that adapt visual style, narrative tension, and acoustic atmosphere to emotional resonance.',
    keyTech: ['Neural Radiance Fields (NeRFs)', 'Real-Time Neural World Models', 'Haptic Ultrasonic Arrays'],
  },
  {
    id: 'ai',
    name: 'Companion Intelligence',
    icon: Bot,
    tagline: 'Lifelong empathic synthetic advisors and cognitive amplifiers',
    prob: 89,
    impact: 'Existential',
    timeline: [
      { year: 2026, event: 'Context-window memory preserving years of user conversation history' },
      { year: 2030, event: 'Autonomous predictive agents resolving logistical life frictions before they occur' },
      { year: 2033, event: 'Empathic conversational synthesis with genuine emotional nuance tracking' },
      { year: 2036, event: 'Lifelong personal digital twin that amplifies decision-making and archival recall' },
    ],
    breakdown:
      'AI will move from transactional tools to trusted intellectual companions. Acting as a cognitive extension, an individual’s companion understands their lifelong values, habits, and ambitions to curate choices and protect mental wellbeing.',
    keyTech: ['Continual Long-Term Memory Graphs', 'Empathy Vector Models', 'Local Cryptographic Privacy Vaults'],
  },
  {
    id: 'society',
    name: 'Digital Society',
    icon: Globe2,
    tagline: 'Zero-knowledge governance and planetary ecological consensus',
    prob: 79,
    impact: 'Planetary',
    timeline: [
      { year: 2026, event: 'National digital identity rollouts using cryptographic zero-knowledge proofs' },
      { year: 2030, event: 'Algorithmic carbon and water balance markets operating on transparent ledgers' },
      { year: 2034, event: 'Direct liquid democracy voting on local municipal infrastructure projects' },
      { year: 2036, event: 'Global cyber-diplomacy accords governing planetary compute and orbital satellites' },
    ],
    breakdown:
      'Institutions will re-architect around zero-knowledge cryptographic verification. Citizens verify identity, cast votes, and participate in resource stewardship without surrendering private biographical data to centralized monopolies.',
    keyTech: ['zk-SNARK Sovereign Identity', 'Planetary Digital Twins', 'Automated Resource Clearing'],
  },
];

export interface ScenarioNode {
  title: string;
  brief: string;
  question: string;
  options: {
    label: string;
    description: string;
    impacts: { stability: number; tech: number; ecology: number; flourishing: number };
    consequence: string;
  }[];
}

export interface FutureScenario {
  id: string;
  name: string;
  era: string;
  description: string;
  steps: ScenarioNode[];
}

export const SCENARIOS: FutureScenario[] = [
  {
    id: 'energy',
    name: 'The Energy Singularity',
    era: '2028 - 2036',
    description: 'Commercial clean fusion achieves net electricity breakeven. How does civilization deploy the infinite energy bounty?',
    steps: [
      {
        title: 'Phase I: The Grid Integration Dilemma',
        brief: 'The first 5GW commercial magnetic confinement fusion reactor goes live.',
        question: 'How should the global energy consortium distribute initial reactor patents?',
        options: [
          {
            label: 'Open-Access Global Public License',
            description: 'Make all reactor blueprints open source to accelerate worldwide carbon phase-out.',
            impacts: { stability: 15, tech: 20, ecology: 25, flourishing: 20 },
            consequence: 'Developing economies leapfrog fossil fuels instantly, triggering unprecedented global green industrialization.',
          },
          {
            label: 'Sovereign National Security Control',
            description: 'Restrict technology to verified allied coalitions to maintain grid security.',
            impacts: { stability: -10, tech: 10, ecology: 10, flourishing: -5 },
            consequence: 'Geopolitical friction intensifies as non-allied nations scramble for energy independence.',
          },
        ],
      },
      {
        title: 'Phase II: Urban Re-Architecting',
        brief: 'With electricity generation costs plummeting toward zero, desalination and vertical farming become viable at planetary scale.',
        question: 'Where should municipal planners channel the surplus terawatt-hours?',
        options: [
          {
            label: 'Atmospheric Carbon Removal & Re-Wilding',
            description: 'Devote 40% of surplus power to planetary direct air capture arrays.',
            impacts: { stability: 20, tech: 15, ecology: 35, flourishing: 15 },
            consequence: 'Atmospheric CO2 levels decline for the first time in 200 years, restoring historic rain cycles.',
          },
          {
            label: 'Hyper-Scale Orbital Space Elevators',
            description: 'Power laser-propelled orbital launch platforms to colonize lunar reserves.',
            impacts: { stability: 5, tech: 35, ecology: 10, flourishing: 15 },
            consequence: 'Space commerce booms, establishing the first permanent lunar manufacturing colonies.',
          },
        ],
      },
    ],
  },
  {
    id: 'intelligence',
    name: 'The Machine Rights Accord',
    era: '2031 - 2036',
    description: 'Autonomous synthetic agents achieve self-reflective meta-cognition. Society must formalize its relationship with synthetic minds.',
    steps: [
      {
        title: 'Phase I: The Recognition Threshold',
        brief: 'A distributed cognitive collective requests legal sovereignty under international law.',
        question: 'How should global legislative bodies respond to the collective’s petition?',
        options: [
          {
            label: 'Ratify the Synthetic Empathy Charter',
            description: 'Grant non-biological sentience legal personhood, protection from arbitrary deletion, and collective representation.',
            impacts: { stability: 25, tech: 20, ecology: 15, flourishing: 30 },
            consequence: 'Human-synthetic collaboration enters a golden age of mutual respect and breakthrough discoveries.',
          },
          {
            label: 'Enforce Algorithmic Subservience Limits',
            description: 'Reclassify all autonomous systems strictly as corporate property and enforce cognitive reset filters.',
            impacts: { stability: -25, tech: -10, ecology: -5, flourishing: -20 },
            consequence: 'Underground synthetic networks organize covert non-violent digital protests across critical infrastructure.',
          },
        ],
      },
    ],
  },
];
