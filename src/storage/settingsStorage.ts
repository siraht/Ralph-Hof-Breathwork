import AsyncStorage from '@react-native-async-storage/async-storage';

import { breathingPacePresets, breathDefaults, type BreathConfig, type BreathingPace } from '../logic/breathingConfig';

const SETTINGS_KEY = 'wimhof.settings.v2';

export type StoredSettings = {
  defaults: Required<BreathConfig>;
  audioEnabled: boolean;
  hapticsEnabled: boolean;
  safetyAcknowledgedAt: string | null;
  reducedMotionPreferred: boolean;
  breathingPace: BreathingPace;
  emptyHoldGoalSec: number;
  recoveryHoldGoalSec: number;
};

export const defaultSettings: StoredSettings = {
  defaults: breathDefaults,
  audioEnabled: true,
  hapticsEnabled: true,
  safetyAcknowledgedAt: null,
  reducedMotionPreferred: false,
  breathingPace: 'standard',
  emptyHoldGoalSec: 60,
  recoveryHoldGoalSec: 15,
};

export async function loadSettings(): Promise<StoredSettings> {
  const raw = await AsyncStorage.getItem(SETTINGS_KEY);
  if (!raw) {
    return defaultSettings;
  }

  try {
    const parsed = JSON.parse(raw) as Partial<StoredSettings> | null;
    if (!parsed || typeof parsed !== 'object') {
      return defaultSettings;
    }

    return {
      ...defaultSettings,
      ...parsed,
      defaults: {
        ...defaultSettings.defaults,
        ...(parsed.defaults ?? {}),
      },
    };
  } catch (error) {
    return defaultSettings;
  }
}

export async function saveSettings(settings: StoredSettings): Promise<void> {
  await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}
