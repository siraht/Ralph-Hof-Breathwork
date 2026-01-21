import { create } from 'zustand';

import type { SessionResult } from './breathingStore';
import {
  listSessions,
  saveBreathSession,
  saveColdSession,
  type SessionEntry,
} from '../storage/sessionStorage';

type SessionStats = {
  totalSessions: number;
  breathworkSessions: number;
  coldSessions: number;
  currentStreak: number;
  lastSessionDay: string | null;
};

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

const defaultStats: SessionStats = {
  totalSessions: 0,
  breathworkSessions: 0,
  coldSessions: 0,
  currentStreak: 0,
  lastSessionDay: null,
};

function pad(value: number): string {
  return value.toString().padStart(2, '0');
}

function dayKeyFromIso(iso: string): string {
  const date = new Date(iso);
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

function diffDays(dayA: string, dayB: string): number {
  const [y1, m1, d1] = dayA.split('-').map(Number);
  const [y2, m2, d2] = dayB.split('-').map(Number);
  const dateA = new Date(y1, m1 - 1, d1);
  const dateB = new Date(y2, m2 - 1, d2);
  return Math.round((dateA.getTime() - dateB.getTime()) / 86400000);
}

function computeStats(sessions: SessionEntry[]): SessionStats {
  if (sessions.length === 0) {
    return defaultStats;
  }
  const totalSessions = sessions.length;
  const breathworkSessions = sessions.filter((session) => session.type === 'breathwork').length;
  const coldSessions = sessions.filter((session) => session.type === 'cold').length;
  const days = Array.from(new Set(sessions.map((session) => dayKeyFromIso(session.endedAt)))).sort((a, b) =>
    a < b ? 1 : -1,
  );
  let currentStreak = 1;
  for (let index = 1; index < days.length; index += 1) {
    if (diffDays(days[index - 1], days[index]) === 1) {
      currentStreak += 1;
    } else {
      break;
    }
  }
  return {
    totalSessions,
    breathworkSessions,
    coldSessions,
    currentStreak,
    lastSessionDay: days[0] ?? null,
  };
}

async function loadSessions(): Promise<SessionEntry[]> {
  return listSessions(120);
}

export const useSessionStore = create<SessionState>((set) => ({
  loaded: false,
  sessions: [],
  stats: defaultStats,
  load: async () => {
    const sessions = await loadSessions();
    set({ sessions, stats: computeStats(sessions), loaded: true });
  },
  addBreathSession: async (result, rating, notes) => {
    await saveBreathSession(result, rating, notes);
    const sessions = await loadSessions();
    set({ sessions, stats: computeStats(sessions), loaded: true });
  },
  addColdSession: async (params) => {
    await saveColdSession(params);
    const sessions = await loadSessions();
    set({ sessions, stats: computeStats(sessions), loaded: true });
  },
}));
