import type { BreathConfig } from '../logic/breathingConfig';
import type { BreathingStats } from '../logic/breathingEngine';
import type { SessionResult } from '../state/breathingStore';
import AsyncStorage from '@react-native-async-storage/async-storage';

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

const SESSIONS_KEY = 'wimhof_sessions';

/**
 * Platform-agnostic storage adapter.
 * This web version uses AsyncStorage as a fallback since expo-sqlite
 * doesn't work reliably for web exports due to WASM resolution issues.
 */
export class StorageAdapter {
  private initialized = false;

  async init(): Promise<void> {
    if (this.initialized) {
      return;
    }
    await AsyncStorage.getItem(SESSIONS_KEY);
    this.initialized = true;
  }

  private async getSessions(): Promise<SessionEntry[]> {
    const raw = await AsyncStorage.getItem(SESSIONS_KEY);
    return raw ? JSON.parse(raw) : [];
  }

  private async saveSessions(sessions: SessionEntry[]): Promise<void> {
    await AsyncStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions));
  }

  async listSessions(limit = 50): Promise<SessionEntry[]> {
    await this.init();
    const sessions = await this.getSessions();
    const safeLimit = Math.max(1, Math.min(200, Math.floor(limit)));
    return sessions
      .sort((a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime())
      .slice(0, safeLimit);
  }

  async saveBreathSession(
    result: SessionResult,
    rating: number | null,
    notes: string | null,
  ): Promise<SessionEntry> {
    await this.init();
    const id = `breath_${result.startedAt}_${Math.floor(Math.random() * 100000)}`;
    const startedAt = new Date(result.startedAt).toISOString();
    const endedAt = new Date(result.endedAt).toISOString();
    const stats = result.stats;
    const durationSec = Math.max(0, Math.round(stats.totalDurationSec));
    const roundsCompleted = Math.round(stats.roundsCompleted);

    const session: SessionEntry = {
      id,
      type: 'breathwork',
      startedAt,
      endedAt,
      roundsCompleted,
      config: result.config,
      stats,
      rating,
      notes,
      durationSec,
      completed: result.completed,
    };

    const sessions = await this.getSessions();
    sessions.push(session);
    await this.saveSessions(sessions);

    return session;
  }

  async saveColdSession(params: {
    durationSec: number;
    startedAt: number;
    endedAt: number;
    completed: boolean;
  }): Promise<SessionEntry> {
    await this.init();
    const id = `cold_${params.startedAt}_${Math.floor(Math.random() * 100000)}`;
    const startedAt = new Date(params.startedAt).toISOString();
    const endedAt = new Date(params.endedAt).toISOString();
    const durationSec = Math.max(0, Math.round(params.durationSec));

    const session: SessionEntry = {
      id,
      type: 'cold',
      startedAt,
      endedAt,
      roundsCompleted: null,
      config: null,
      stats: null,
      rating: null,
      notes: null,
      durationSec,
      completed: params.completed,
    };

    const sessions = await this.getSessions();
    sessions.push(session);
    await this.saveSessions(sessions);

    return session;
  }
}

// Single instance
let adapterInstance: StorageAdapter | null = null;

export function getStorageAdapter(): StorageAdapter {
  if (!adapterInstance) {
    adapterInstance = new StorageAdapter();
  }
  return adapterInstance;
}
