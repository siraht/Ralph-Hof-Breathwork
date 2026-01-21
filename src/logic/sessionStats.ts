import type { SessionEntry } from '../storage/sessionStorage';

export type SessionStats = {
  totalSessions: number;
  breathworkSessions: number;
  coldSessions: number;
  currentStreak: number;
  lastSessionDay: string | null;
};

export const defaultSessionStats: SessionStats = {
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

export function computeSessionStats(sessions: SessionEntry[]): SessionStats {
  if (sessions.length === 0) {
    return defaultSessionStats;
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
