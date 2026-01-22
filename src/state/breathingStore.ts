import { create } from 'zustand';

import { breathDefaults, type BreathConfig } from '../logic/breathingConfig';
import {
  buildBreathingTimeline,
  getBreathingSnapshot,
  getBreathingStats,
  type BreathingSnapshot,
  type BreathingTimeline,
  type BreathingStats,
} from '../logic/breathingEngine';

type SessionStatus = 'idle' | 'running' | 'paused' | 'completed';

export type SessionResult = {
  config: Required<BreathConfig>;
  stats: BreathingStats;
  startedAt: number;
  endedAt: number;
  completed: boolean;
};

// Options for starting a session with hold goals
export type SessionStartOptions = BreathConfig & {
  emptyHoldGoalSec?: number;
  recoveryHoldGoalSec?: number;
};

type BreathingState = {
  config: Required<BreathConfig>;
  timeline: BreathingTimeline | null;
  snapshot: BreathingSnapshot | null;
  status: SessionStatus;
  startedAt: number | null;
  sessionStartedAt: number | null;
  accumulatedMs: number;
  result: SessionResult | null;
  // Hold tracking for stopwatch functionality
  holdPhaseStartElapsedSec: number | null;
  holdElapsedSec: number;
  goalReached: boolean;
  isHoldPhase: boolean;
  startSession: (options?: SessionStartOptions) => void;
  tick: (now: number) => void;
  pauseSession: () => void;
  resumeSession: () => void;
  advanceFromHold: () => void;
  stopSession: () => void;
  reset: () => void;
};

export const useBreathingStore = create<BreathingState>((set, get) => ({
  config: breathDefaults,
  timeline: null,
  snapshot: null,
  status: 'idle',
  startedAt: null,
  sessionStartedAt: null,
  accumulatedMs: 0,
  result: null,
  holdPhaseStartElapsedSec: null,
  holdElapsedSec: 0,
  goalReached: false,
  isHoldPhase: false,
  startSession: (options) => {
    const nextConfig: Required<BreathConfig> = { ...breathDefaults, ...options };
    const timeline = buildBreathingTimeline(nextConfig, {
      emptyHoldGoalSec: options?.emptyHoldGoalSec,
      recoveryHoldGoalSec: options?.recoveryHoldGoalSec,
    });
    const now = Date.now();
    const snapshot = getBreathingSnapshot(timeline, 0);
    set({
      config: nextConfig,
      timeline,
      status: 'running',
      startedAt: now,
      sessionStartedAt: now,
      accumulatedMs: 0,
      snapshot,
      result: null,
      holdPhaseStartElapsedSec: null,
      holdElapsedSec: 0,
      goalReached: false,
      isHoldPhase: false,
    });
  },
  tick: (now) => {
    const { status, timeline, startedAt, accumulatedMs } = get();
    if (status !== 'running' || !timeline || startedAt === null) {
      return;
    }
    const elapsedMs = accumulatedMs + (now - startedAt);
    const elapsedSec = elapsedMs / 1000;
    const snapshot = getBreathingSnapshot(timeline, elapsedMs);
    const isHoldPhase = snapshot.segment.type === 'hold' || snapshot.segment.type === 'recovery';
    const holdGoalSec = snapshot.segment.holdGoalSec;

    // Track hold phase state
    const current = get();
    let holdPhaseStartElapsedSec = current.holdPhaseStartElapsedSec;
    let holdElapsedSec = current.holdElapsedSec;
    let goalReached = current.goalReached;

    if (isHoldPhase) {
      if (holdPhaseStartElapsedSec === null) {
        // Just entered a hold phase
        holdPhaseStartElapsedSec = elapsedSec - snapshot.segmentElapsedSec;
      }
      holdElapsedSec = elapsedSec - holdPhaseStartElapsedSec;

      // Check if goal reached
      if (holdGoalSec !== undefined) {
        goalReached = holdElapsedSec >= holdGoalSec;
      }
    } else {
      // Exit hold phase (entered breathing segments)
      holdPhaseStartElapsedSec = null;
      holdElapsedSec = 0;
      goalReached = false;
    }

    if (snapshot.isComplete) {
      const stats = getBreathingStats(timeline, elapsedMs);
      set({
        snapshot,
        status: 'completed',
        startedAt: null,
        accumulatedMs: elapsedMs,
        holdPhaseStartElapsedSec: null,
        holdElapsedSec: 0,
        goalReached: false,
        isHoldPhase: false,
        result: {
          config: get().config,
          stats,
          startedAt: get().sessionStartedAt ?? now - elapsedMs,
          endedAt: now,
          completed: true,
        },
      });
      return;
    }

    set({
      snapshot,
      holdPhaseStartElapsedSec,
      holdElapsedSec,
      goalReached,
      isHoldPhase,
    });
  },
  pauseSession: () => {
    const { status, startedAt, accumulatedMs } = get();
    if (status !== 'running' || startedAt === null) {
      return;
    }
    const now = Date.now();
    set({
      status: 'paused',
      accumulatedMs: accumulatedMs + (now - startedAt),
      startedAt: null,
    });
  },
  resumeSession: () => {
    const { status } = get();
    if (status !== 'paused') {
      return;
    }
    const now = Date.now();
    set({ status: 'running', startedAt: now });
  },
  advanceFromHold: () => {
    const { status, timeline, accumulatedMs, startedAt, snapshot } = get();
    if (status !== 'running' || !timeline || !snapshot) {
      return;
    }

    // Only allow advancing from hold phases
    if (snapshot.segment.type !== 'hold' && snapshot.segment.type !== 'recovery') {
      return;
    }

    const now = Date.now();
    // Calculate elapsed time including time remaining in segment
    const currentElapsedMs = accumulatedMs + (startedAt ? now - startedAt : 0);
    const segmentIndex = timeline.segments.findIndex((s) => s === snapshot.segment);
    const nextSegment = timeline.segments[segmentIndex + 1];

    if (!nextSegment) {
      // No more segments, end the session
      get().stopSession();
      return;
    }

    // Jump to the start of the next segment
    const elapsedMs = currentElapsedMs + snapshot.segmentRemainingSec * 1000;
    const newSnapshot = getBreathingSnapshot(timeline, elapsedMs);

    set({
      snapshot: newSnapshot,
      startedAt: now,
      accumulatedMs: elapsedMs,
      holdPhaseStartElapsedSec: null,
      holdElapsedSec: 0,
      goalReached: false,
      isHoldPhase:
        newSnapshot.segment.type === 'hold' || newSnapshot.segment.type === 'recovery',
    });
  },
  stopSession: () => {
    const { timeline, accumulatedMs, startedAt, status } = get();
    if (!timeline) {
      return;
    }
    const now = Date.now();
    const elapsedMs = accumulatedMs + (status === 'running' && startedAt ? now - startedAt : 0);
    const snapshot = getBreathingSnapshot(timeline, elapsedMs);
    const stats = getBreathingStats(timeline, elapsedMs);
    set({
      snapshot,
      status: 'completed',
      startedAt: null,
      accumulatedMs: elapsedMs,
      holdPhaseStartElapsedSec: null,
      holdElapsedSec: 0,
      goalReached: false,
      isHoldPhase: false,
      result: {
        config: get().config,
        stats,
        startedAt: get().sessionStartedAt ?? now - elapsedMs,
        endedAt: now,
        completed: false,
      },
    });
  },
  reset: () => {
    set({
      timeline: null,
      snapshot: null,
      status: 'idle',
      startedAt: null,
      sessionStartedAt: null,
      accumulatedMs: 0,
      result: null,
      holdPhaseStartElapsedSec: null,
      holdElapsedSec: 0,
      goalReached: false,
      isHoldPhase: false,
    });
  },
}));
