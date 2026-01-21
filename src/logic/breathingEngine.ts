import { breathDefaults, type BreathConfig } from './breathingConfig';

export type BreathSegmentType = 'inhale' | 'exhale' | 'hold' | 'recovery';

export type BreathSegment = {
  type: BreathSegmentType;
  durationSec: number;
  roundIndex: number;
  breathIndex?: number;
};

export type BreathingTimeline = {
  segments: BreathSegment[];
  totalDurationSec: number;
  totalRounds: number;
  breathsPerRound: number;
};

export type BreathingSnapshot = {
  segment: BreathSegment;
  nextSegment: BreathSegment | null;
  segmentElapsedSec: number;
  segmentRemainingSec: number;
  roundIndex: number;
  totalRounds: number;
  breathIndex: number | null;
  totalBreaths: number;
  elapsedSec: number;
  totalDurationSec: number;
  isComplete: boolean;
};

export type BreathingStats = {
  roundsCompleted: number;
  totalDurationSec: number;
  longestHoldSec: number;
};

export function buildBreathingTimeline(config: BreathConfig): BreathingTimeline {
  const inhaleSec = config.inhaleSec ?? breathDefaults.inhaleSec;
  const exhaleSec = config.exhaleSec ?? breathDefaults.exhaleSec;
  const segments: BreathSegment[] = [];
  let totalDurationSec = 0;

  for (let round = 1; round <= config.rounds; round += 1) {
    for (let breath = 1; breath <= config.breaths; breath += 1) {
      segments.push({ type: 'inhale', durationSec: inhaleSec, roundIndex: round, breathIndex: breath });
      segments.push({ type: 'exhale', durationSec: exhaleSec, roundIndex: round, breathIndex: breath });
    }
    segments.push({ type: 'hold', durationSec: config.holdSec, roundIndex: round });
    segments.push({ type: 'recovery', durationSec: config.recoverySec, roundIndex: round });
  }

  totalDurationSec = segments.reduce((sum, segment) => sum + segment.durationSec, 0);

  return {
    segments,
    totalDurationSec,
    totalRounds: config.rounds,
    breathsPerRound: config.breaths,
  };
}

export function getBreathingSnapshot(timeline: BreathingTimeline, elapsedMs: number): BreathingSnapshot {
  const elapsedSec = Math.max(0, elapsedMs / 1000);
  const cappedElapsed = Math.min(elapsedSec, timeline.totalDurationSec);
  let remaining = cappedElapsed;

  for (let index = 0; index < timeline.segments.length; index += 1) {
    const segment = timeline.segments[index];
    if (remaining < segment.durationSec || index === timeline.segments.length - 1) {
      const segmentElapsedSec = Math.min(remaining, segment.durationSec);
      const segmentRemainingSec = Math.max(0, segment.durationSec - segmentElapsedSec);
      return {
        segment,
        nextSegment: timeline.segments[index + 1] ?? null,
        segmentElapsedSec,
        segmentRemainingSec,
        roundIndex: segment.roundIndex,
        totalRounds: timeline.totalRounds,
        breathIndex: segment.breathIndex ?? null,
        totalBreaths: timeline.breathsPerRound,
        elapsedSec: cappedElapsed,
        totalDurationSec: timeline.totalDurationSec,
        isComplete: elapsedSec >= timeline.totalDurationSec,
      };
    }
    remaining -= segment.durationSec;
  }

  const fallbackSegment = timeline.segments[timeline.segments.length - 1];
  return {
    segment: fallbackSegment,
    nextSegment: null,
    segmentElapsedSec: fallbackSegment.durationSec,
    segmentRemainingSec: 0,
    roundIndex: fallbackSegment.roundIndex,
    totalRounds: timeline.totalRounds,
    breathIndex: fallbackSegment.breathIndex ?? null,
    totalBreaths: timeline.breathsPerRound,
    elapsedSec: cappedElapsed,
    totalDurationSec: timeline.totalDurationSec,
    isComplete: true,
  };
}

export function getBreathingStats(timeline: BreathingTimeline, elapsedMs: number): BreathingStats {
  const elapsedSec = Math.max(0, Math.min(timeline.totalDurationSec, elapsedMs / 1000));
  let remaining = elapsedSec;
  let roundsCompleted = 0;
  let longestHoldSec = 0;

  for (let index = 0; index < timeline.segments.length; index += 1) {
    const segment = timeline.segments[index];
    const timeInSegment = Math.min(remaining, segment.durationSec);

    if (segment.type === 'hold') {
      longestHoldSec = Math.max(longestHoldSec, timeInSegment);
    }

    if (segment.type === 'recovery' && remaining >= segment.durationSec) {
      roundsCompleted = Math.max(roundsCompleted, segment.roundIndex);
    }

    remaining -= segment.durationSec;
    if (remaining <= 0) {
      break;
    }
  }

  return {
    roundsCompleted,
    totalDurationSec: Math.round(elapsedSec),
    longestHoldSec: Math.round(longestHoldSec),
  };
}
