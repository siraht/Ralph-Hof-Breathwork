import { create } from 'zustand';

import type { SessionResult } from './breathingStore';
import { computeSessionStats, defaultSessionStats, type SessionStats } from '../logic/sessionStats';
import { listSessions, saveBreathSession, saveColdSession, type SessionEntry } from '../storage/sessionStorage';

type SessionState = {
  loaded: boolean;
  sessions: SessionEntry[];
  stats: SessionStats;
  load: () => Promise<void>;
  addBreathSession: (result: SessionResult, rating: number | null, notes: string | null) => Promise<void>;
  addColdSession: (params: {
    durationSec: number;
    startedAt: number;
    endedAt: number;
    completed: boolean;
  }) => Promise<void>;
};

async function loadSessions(): Promise<SessionEntry[]> {
  return listSessions(120);
}

export const useSessionStore = create<SessionState>((set) => ({
  loaded: false,
  sessions: [],
  stats: defaultSessionStats,
  load: async () => {
    const sessions = await loadSessions();
    set({ sessions, stats: computeSessionStats(sessions), loaded: true });
  },
  addBreathSession: async (result, rating, notes) => {
    await saveBreathSession(result, rating, notes);
    const sessions = await loadSessions();
    set({ sessions, stats: computeSessionStats(sessions), loaded: true });
  },
  addColdSession: async (params) => {
    await saveColdSession(params);
    const sessions = await loadSessions();
    set({ sessions, stats: computeSessionStats(sessions), loaded: true });
  },
}));
