import { Platform } from 'react-native';
import type { BreathConfig } from '../logic/breathingConfig';
import type { BreathingStats } from '../logic/breathingEngine';
import type { SessionResult } from '../state/breathingStore';
import { getStorageAdapter } from './storageAdapter';

export type SessionType = 'breathwork' | 'cold';

export type SessionEntry = {
  id: string;
  type: SessionType;
  startedAt: string;
  endedAt: string;
  roundsCompleted: number | null;
  config: Required<BreathConfig> | null;
  stats: BreathingStats | null;
  rating: number | null;
  notes: string | null;
  durationSec: number;
  completed: boolean;
};

/**
 * Platform check to determine which storage to use.
 * Web uses AsyncStorage adapter due to expo-sqlite WASM limitations.
 * iOS/Android use SQLite for proper database functionality.
 */
const IS_WEB = Platform.OS === 'web';

async function initSessionStorage(): Promise<void> {
  if (IS_WEB) {
    await getStorageAdapter().init();
  } else {
    const { initDatabase } = await import('./sqliteStorage');
    await initDatabase();
  }
}

export async function listSessions(limit = 50): Promise<SessionEntry[]> {
  await initSessionStorage();
  if (IS_WEB) {
    return getStorageAdapter().listSessions(limit);
  } else {
    const { listSqliteSessions } = await import('./sqliteStorage');
    return listSqliteSessions(limit);
  }
}

export async function saveBreathSession(
  result: SessionResult,
  rating: number | null,
  notes: string | null,
): Promise<SessionEntry> {
  await initSessionStorage();
  if (IS_WEB) {
    return getStorageAdapter().saveBreathSession(result, rating, notes);
  } else {
    const { saveSqliteBreathSession } = await import('./sqliteStorage');
    return saveSqliteBreathSession(result, rating, notes);
  }
}

export async function saveColdSession(params: {
  durationSec: number;
  startedAt: number;
  endedAt: number;
  completed: boolean;
}): Promise<SessionEntry> {
  await initSessionStorage();
  if (IS_WEB) {
    return getStorageAdapter().saveColdSession(params);
  } else {
    const { saveSqliteColdSession } = await import('./sqliteStorage');
    return saveSqliteColdSession(params);
  }
}
