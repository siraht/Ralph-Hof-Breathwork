import { create } from 'zustand';

import {
  breathingPacePresets,
  breathLimits,
  breathDefaults,
  clampValue,
  getPaceConfig,
  type BreathConfig,
  type BreathingPace,
} from '../logic/breathingConfig';
import { defaultSettings, loadSettings, saveSettings, type StoredSettings } from '../storage/settingsStorage';

const holdGoalLimits = {
  emptyHold: { min: 0, max: 180 },
  recoveryHold: { min: 5, max: 30 },
};

type SettingsState = StoredSettings & {
  loaded: boolean;
  load: () => Promise<void>;
  updateDefaults: (next: Partial<BreathConfig>) => void;
  updateBreathingPace: (pace: BreathingPace) => void;
  updateEmptyHoldGoal: (seconds: number) => void;
  updateRecoveryHoldGoal: (seconds: number) => void;
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
    breathingPace: state.breathingPace,
    emptyHoldGoalSec: state.emptyHoldGoalSec,
    recoveryHoldGoalSec: state.recoveryHoldGoalSec,
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
  updateBreathingPace: (pace) => {
    const current = get();
    const paceConfig = breathingPacePresets[pace];
    const updated: StoredSettings = {
      ...toStoredSettings(current),
      breathingPace: pace,
      defaults: {
        ...current.defaults,
        inhaleSec: paceConfig.inhaleSec,
        exhaleSec: paceConfig.exhaleSec,
      },
    };
    set(updated);
    void saveSettings(updated);
  },
  updateEmptyHoldGoal: (seconds) => {
    const current = get();
    const clamped = clampValue(seconds, holdGoalLimits.emptyHold);
    const updated: StoredSettings = {
      ...toStoredSettings(current),
      emptyHoldGoalSec: clamped,
    };
    set(updated);
    void saveSettings(updated);
  },
  updateRecoveryHoldGoal: (seconds) => {
    const current = get();
    const clamped = clampValue(seconds, holdGoalLimits.recoveryHold);
    const updated: StoredSettings = {
      ...toStoredSettings(current),
      recoveryHoldGoalSec: clamped,
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
