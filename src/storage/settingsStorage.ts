import AsyncStorage from '@react-native-async-storage/async-storage';

import { breathDefaults, type BreathConfig } from '../logic/breathingConfig';

const SETTINGS_KEY = 'wimhof.settings.v1';

export type StoredSettings = {
  defaults: Required<BreathConfig>;
  audioEnabled: boolean;
  hapticsEnabled: boolean;
  safetyAcknowledgedAt: string | null;
};

export const defaultSettings: StoredSettings = {
  defaults: breathDefaults,
  audioEnabled: true,
  hapticsEnabled: true,
  safetyAcknowledgedAt: null,
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
