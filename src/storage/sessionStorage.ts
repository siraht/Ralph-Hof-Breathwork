import * as SQLite from 'expo-sqlite';

import type { BreathConfig } from '../logic/breathingConfig';
import type { BreathingStats } from '../logic/breathingEngine';
import type { SessionResult } from '../state/breathingStore';

const db = SQLite.openDatabase('wimhof.db');
let initialized = false;

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

type DbSessionRow = {
  id: string;
  type: string;
  startedAt: string;
  endedAt: string;
  roundsCompleted: number | null;
  config: string | null;
  stats: string | null;
  rating: number | null;
  notes: string | null;
  durationSec: number | null;
  completed: number | null;
};

function runAsync(sql: string, params: Array<string | number | null> = []): Promise<SQLite.SQLResultSet> {
  return new Promise((resolve, reject) => {
    db.transaction((tx) => {
      tx.executeSql(
        sql,
        params,
        (_, result) => resolve(result),
        (_, error) => {
          reject(error);
          return false;
        },
      );
    });
  });
}

function toIsoString(value: number): string {
  return new Date(value).toISOString();
}

function parseJson<T>(value: string | null): T | null {
  if (!value) {
    return null;
  }
  try {
    return JSON.parse(value) as T;
  } catch (error) {
    return null;
  }
}

function mapRow(row: DbSessionRow): SessionEntry {
  const durationSec = row.durationSec ?? 0;
  const isCold = row.type === 'cold';
  return {
    id: row.id,
    type: isCold ? 'cold' : 'breathwork',
    startedAt: row.startedAt,
    endedAt: row.endedAt,
    roundsCompleted: row.roundsCompleted ?? null,
    config: isCold ? null : parseJson<Required<BreathConfig>>(row.config),
    stats: isCold ? null : parseJson<BreathingStats>(row.stats),
    rating: row.rating ?? null,
    notes: row.notes ?? null,
    durationSec,
    completed: Boolean(row.completed ?? 0),
  };
}

function buildId(prefix: string): string {
  return `${prefix}_${Date.now()}_${Math.floor(Math.random() * 100000)}`;
}

export async function initSessionStorage(): Promise<void> {
  if (initialized) {
    return;
  }
  await runAsync(
    `CREATE TABLE IF NOT EXISTS sessions (
      id TEXT PRIMARY KEY NOT NULL,
      type TEXT NOT NULL,
      startedAt TEXT NOT NULL,
      endedAt TEXT NOT NULL,
      roundsCompleted INTEGER,
      config TEXT,
      stats TEXT,
      rating INTEGER,
      notes TEXT,
      durationSec INTEGER,
      completed INTEGER DEFAULT 1
    );`,
  );
  await runAsync('CREATE INDEX IF NOT EXISTS idx_sessions_startedAt ON sessions(startedAt);');
  initialized = true;
}

export async function listSessions(limit = 50): Promise<SessionEntry[]> {
  await initSessionStorage();
  const safeLimit = Math.max(1, Math.min(200, Math.floor(limit)));
  const result = await runAsync(`SELECT * FROM sessions ORDER BY startedAt DESC LIMIT ${safeLimit};`);
  const rows = result.rows?._array ?? [];
  return rows.map(mapRow);
}

export async function saveBreathSession(
  result: SessionResult,
  rating: number | null,
  notes: string | null,
): Promise<SessionEntry> {
  await initSessionStorage();
  const id = buildId('breath');
  const startedAt = toIsoString(result.startedAt);
  const endedAt = toIsoString(result.endedAt);
  const stats = result.stats;
  const durationSec = Math.max(0, Math.round(stats.totalDurationSec));
  const roundsCompleted = Math.round(stats.roundsCompleted);
  const completed = result.completed ? 1 : 0;
  const configJson = JSON.stringify(result.config);
  const statsJson = JSON.stringify(stats);
  await runAsync(
    `INSERT INTO sessions (
      id, type, startedAt, endedAt, roundsCompleted, config, stats, rating, notes, durationSec, completed
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
    [
      id,
      'breathwork',
      startedAt,
      endedAt,
      roundsCompleted,
      configJson,
      statsJson,
      rating,
      notes,
      durationSec,
      completed,
    ],
  );
  return {
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
    completed: Boolean(completed),
  };
}

export async function saveColdSession(params: {
  durationSec: number;
  startedAt: number;
  endedAt: number;
  completed: boolean;
}): Promise<SessionEntry> {
  await initSessionStorage();
  const id = buildId('cold');
  const startedAt = toIsoString(params.startedAt);
  const endedAt = toIsoString(params.endedAt);
  const durationSec = Math.max(0, Math.round(params.durationSec));
  const configJson = null;
  const statsJson = JSON.stringify({ totalDurationSec: durationSec });
  const completed = params.completed ? 1 : 0;
  await runAsync(
    `INSERT INTO sessions (
      id, type, startedAt, endedAt, roundsCompleted, config, stats, rating, notes, durationSec, completed
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
    [
      id,
      'cold',
      startedAt,
      endedAt,
      null,
      configJson,
      statsJson,
      null,
      null,
      durationSec,
      completed,
    ],
  );
  return {
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
    completed: Boolean(completed),
  };
}
