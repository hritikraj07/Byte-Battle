export type FutureHorizonId =
  | 'future-10'
  | 'future-25'
  | 'cybernetic'
  | 'mars-pioneer'
  | 'elysium'
  | 'grand-elder';

export interface FutureHorizonOption {
  id: FutureHorizonId;
  title: string;
  year: number;
  badge: string;
  tagline: string;
  description: string;
  accentColor: string;
  iconName: string;
  telemetry: {
    ageOffset: number;
    cellularMaturation: string;
    cyberAugmentation: string;
    environment: string;
  };
}

export interface BiometricProfile {
  name: string;
  capturedImage: string | null; // dataURL
  selectedHorizon: FutureHorizonId;
  generatedImage: string | null; // dataURL
  isGenerating: boolean;
  activeStep: 'capture' | 'select' | 'reveal';
}
