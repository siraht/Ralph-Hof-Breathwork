import { create } from 'zustand';

import { breathLimits, breathDefaults, clampValue, type BreathConfig } from '../logic/breathingConfig';
import { defaultSettings, loadSettings, saveSettings, type StoredSettings } from '../storage/settingsStorage';

type SettingsState = StoredSettings & {
  loaded: boolean;
  load: () => Promise<void>;
  updateDefaults: (next: Partial<BreathConfig>) => void;
  toggleAudio: () => void;
  toggleHaptics: () => void;
  acknowledgeSafety: () => void;
  toggleReducedMotion: () => void;
};

function clampDefaults(defaults: Required<BreathConfig>): Required<BreathConfig> {
  return {
    rounds: clampValue(defaults.rounds, breathLimits.rounds),
    breaths: clampValue(defaults.breaths, breathLimits.breaths),
    holdSec: clampValue(defaults.holdSec, breathLimits.holdSec),
    recoverySec: clampValue(defaults.recoverySec, breathLimits.recoverySec),
    inhaleSec: clampValue(defaults.inhaleSec ?? breathDefaults.inhaleSec, breathLimits.inhaleSec),
    exhaleSec: clampValue(defaults.exhaleSec ?? breathDefaults.exhaleSec, breathLimits.exhaleSec),
  };
}

function toStoredSettings(state: SettingsState): StoredSettings {
  return {
    defaults: state.defaults,
    audioEnabled: state.audioEnabled,
    hapticsEnabled: state.hapticsEnabled,
    safetyAcknowledgedAt: state.safetyAcknowledgedAt,
    reducedMotionPreferred: state.reducedMotionPreferred,
  };
}

export const useSettingsStore = create<SettingsState>((set, get) => ({
  ...defaultSettings,
  loaded: false,
  load: async () => {
    const stored = await loadSettings();
    set({ ...stored, defaults: clampDefaults(stored.defaults), loaded: true });
  },
  updateDefaults: (next) => {
    const current = get();
    const updated: StoredSettings = {
      ...toStoredSettings(current),
      defaults: clampDefaults({ ...current.defaults, ...next }),
    };
    set(updated);
    void saveSettings(updated);
  },
  toggleAudio: () => {
    const current = get();
    const updated: StoredSettings = { ...toStoredSettings(current), audioEnabled: !current.audioEnabled };
    set(updated);
    void saveSettings(updated);
  },
  toggleHaptics: () => {
    const current = get();
    const updated: StoredSettings = { ...toStoredSettings(current), hapticsEnabled: !current.hapticsEnabled };
    set(updated);
    void saveSettings(updated);
  },
  acknowledgeSafety: () => {
    const current = get();
    const updated: StoredSettings = {
      ...toStoredSettings(current),
      safetyAcknowledgedAt: new Date().toISOString(),
    };
    set(updated);
    void saveSettings(updated);
  },
  toggleReducedMotion: () => {
    const current = get();
    const updated: StoredSettings = {
      ...toStoredSettings(current),
      reducedMotionPreferred: !current.reducedMotionPreferred,
    };
    set(updated);
    void saveSettings(updated);
  },
}));
