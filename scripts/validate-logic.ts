import assert from 'node:assert/strict';

import { buildBreathingTimeline, getBreathingSnapshot, getBreathingStats } from '../src/logic/breathingEngine';
import { computeSessionStats } from '../src/logic/sessionStats';
import type { SessionEntry } from '../src/storage/sessionStorage';

function pad(value: number): string {
  return value.toString().padStart(2, '0');
}

function dayKey(date: Date): string {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

function buildSession(params: {
  id: string;
  type: 'breathwork' | 'cold';
  endedAt: Date;
}): SessionEntry {
  const endedAtIso = params.endedAt.toISOString();
  return {
    id: params.id,
    type: params.type,
    startedAt: endedAtIso,
    endedAt: endedAtIso,
    roundsCompleted: params.type === 'breathwork' ? 3 : null,
    config: null,
    stats: null,
    rating: null,
    notes: null,
    durationSec: 120,
    completed: true,
  };
}

const timeline = buildBreathingTimeline({
  rounds: 2,
  breaths: 3,
  holdSec: 10,
  recoverySec: 15,
  inhaleSec: 2,
  exhaleSec: 3,
});

assert.equal(timeline.totalRounds, 2);
assert.equal(timeline.breathsPerRound, 3);
assert.equal(timeline.segments.length, 16);
assert.equal(timeline.totalDurationSec, 80);

const boundaryTimeline = buildBreathingTimeline({
  rounds: 1,
  breaths: 1,
  holdSec: 5,
  recoverySec: 4,
  inhaleSec: 2,
  exhaleSec: 3,
});

const inhaleSnapshot = getBreathingSnapshot(boundaryTimeline, 1000);
assert.equal(inhaleSnapshot.segment.type, 'inhale');
assert.equal(inhaleSnapshot.segmentRemainingSec, 1);

const exhaleSnapshot = getBreathingSnapshot(boundaryTimeline, 2000);
assert.equal(exhaleSnapshot.segment.type, 'exhale');
assert.equal(exhaleSnapshot.segmentElapsedSec, 0);

const holdSnapshot = getBreathingSnapshot(boundaryTimeline, 6000);
assert.equal(holdSnapshot.segment.type, 'hold');
assert.equal(holdSnapshot.segmentElapsedSec, 1);

const midStats = getBreathingStats(boundaryTimeline, 5000);
assert.equal(midStats.roundsCompleted, 0);
assert.equal(midStats.longestHoldSec, 0);

const holdStats = getBreathingStats(boundaryTimeline, 10000);
assert.equal(holdStats.longestHoldSec, 5);
assert.equal(holdStats.roundsCompleted, 0);

const fullStats = getBreathingStats(boundaryTimeline, 14000);
assert.equal(fullStats.roundsCompleted, 1);
assert.equal(fullStats.totalDurationSec, 14);

const day0 = new Date(2026, 0, 21, 10, 0, 0);
const day1 = new Date(2026, 0, 20, 9, 0, 0);
const day2 = new Date(2026, 0, 19, 8, 0, 0);
const dayGap = new Date(2026, 0, 15, 12, 0, 0);

const sessions: SessionEntry[] = [
  buildSession({ id: 'a', type: 'breathwork', endedAt: day0 }),
  buildSession({ id: 'b', type: 'cold', endedAt: day1 }),
  buildSession({ id: 'c', type: 'breathwork', endedAt: day2 }),
  buildSession({ id: 'd', type: 'cold', endedAt: dayGap }),
];

const stats = computeSessionStats(sessions);
assert.equal(stats.totalSessions, 4);
assert.equal(stats.breathworkSessions, 2);
assert.equal(stats.coldSessions, 2);
assert.equal(stats.currentStreak, 3);
assert.equal(stats.lastSessionDay, dayKey(day0));

const emptyStats = computeSessionStats([]);
assert.equal(emptyStats.totalSessions, 0);
assert.equal(emptyStats.currentStreak, 0);
assert.equal(emptyStats.lastSessionDay, null);

console.log('Logic checks passed.');
