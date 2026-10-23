export interface AppSettings {
  // Audio
  masterVolume: number; // 0 - 100
  musicVolume: number;  // 0 - 100
  sfxVolume: number;    // 0 - 100
  isMuted: boolean;
  interfaceSounds: boolean;
}

export const DEFAULT_SETTINGS: AppSettings = {
  masterVolume: 80,
  musicVolume: 60,
  sfxVolume: 80,
  isMuted: false,
  interfaceSounds: true,
};

const SETTINGS_KEY = 'byte_battle_app_settings_v3';

export function getStoredSettings(): AppSettings {
  if (typeof window === 'undefined') return DEFAULT_SETTINGS;
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) return DEFAULT_SETTINGS;
    const parsed = JSON.parse(raw);
    return { ...DEFAULT_SETTINGS, ...parsed };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function saveStoredSettings(settings: Partial<AppSettings>): AppSettings {
  if (typeof window === 'undefined') return DEFAULT_SETTINGS;
  try {
    const current = getStoredSettings();
    const updated = { ...current, ...settings };
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(updated));
    // Trigger custom event for reactivity across components
    window.dispatchEvent(new CustomEvent('bytebattle:settings-changed', { detail: updated }));
    return updated;
  } catch {
    return DEFAULT_SETTINGS;
  }
}
