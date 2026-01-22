import { openDatabaseSync } from 'expo-sqlite';
import type { SQLiteDatabase } from 'expo-sqlite';

import type { BreathConfig } from '../logic/breathingConfig';
import type { BreathingStats } from '../logic/breathingEngine';
import type { SessionResult } from '../state/breathingStore';

import type { SessionEntry } from './sessionStorage';

let db: SQLiteDatabase | null = null;
let initialized = false;

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

function getDb(): SQLiteDatabase {
  if (!db) {
    db = openDatabaseSync('wimhof.db');
  }
  return db;
}

async function runAsync(sql: string, params: Array<string | number | null> = []): Promise<void> {
  const database = getDb();
  await database.runAsync(sql, params);
}

async function queryAsync<T>(sql: string, params: Array<string | number | null> = []): Promise<T[]> {
  const database = getDb();
  const result = await database.getAllAsync<T>(sql, params);
  return result as T[];
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

export async function initDatabase(): Promise<void> {
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

export async function listSqliteSessions(limit = 50): Promise<SessionEntry[]> {
  await initDatabase();
  const safeLimit = Math.max(1, Math.min(200, Math.floor(limit)));
  const rows = await queryAsync<DbSessionRow>(`SELECT * FROM sessions ORDER BY startedAt DESC LIMIT ${safeLimit};`);
  return rows.map(mapRow);
}

export async function saveSqliteBreathSession(
  result: SessionResult,
  rating: number | null,
  notes: string | null,
): Promise<SessionEntry> {
  await initDatabase();
  const id = buildId('breath');
  const startedAt = new Date(result.startedAt).toISOString();
  const endedAt = new Date(result.endedAt).toISOString();
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

export async function saveSqliteColdSession(params: {
  durationSec: number;
  startedAt: number;
  endedAt: number;
  completed: boolean;
}): Promise<SessionEntry> {
  await initDatabase();
  const id = buildId('cold');
  const startedAt = new Date(params.startedAt).toISOString();
  const endedAt = new Date(params.endedAt).toISOString();
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
