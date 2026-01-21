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

type BreathingState = {
  config: Required<BreathConfig>;
  timeline: BreathingTimeline | null;
  snapshot: BreathingSnapshot | null;
  status: SessionStatus;
  startedAt: number | null;
  sessionStartedAt: number | null;
  accumulatedMs: number;
  result: SessionResult | null;
  startSession: (config?: BreathConfig) => void;
  tick: (now: number) => void;
  pauseSession: () => void;
  resumeSession: () => void;
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
  startSession: (config) => {
    const nextConfig: Required<BreathConfig> = { ...breathDefaults, ...config };
    const timeline = buildBreathingTimeline(nextConfig);
    const now = Date.now();
    set({
      config: nextConfig,
      timeline,
      status: 'running',
      startedAt: now,
      sessionStartedAt: now,
      accumulatedMs: 0,
      snapshot: getBreathingSnapshot(timeline, 0),
      result: null,
    });
  },
  tick: (now) => {
    const { status, timeline, startedAt, accumulatedMs } = get();
    if (status !== 'running' || !timeline || startedAt === null) {
      return;
    }
    const elapsedMs = accumulatedMs + (now - startedAt);
    const snapshot = getBreathingSnapshot(timeline, elapsedMs);
    if (snapshot.isComplete) {
      const stats = getBreathingStats(timeline, elapsedMs);
      set({
        snapshot,
        status: 'completed',
        startedAt: null,
        accumulatedMs: elapsedMs,
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
    set({ snapshot });
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
    });
  },
}));
