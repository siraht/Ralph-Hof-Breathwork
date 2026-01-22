export type BreathConfig = {
  rounds: number;
  breaths: number;
  holdSec: number;
  recoverySec: number;
  inhaleSec?: number;
  exhaleSec?: number;
};

export type BreathingPace = 'slow' | 'standard' | 'fast';

export interface BreathingPaceConfig {
  inhaleSec: number;
  exhaleSec: number;
}

export const breathingPacePresets: Record<BreathingPace, BreathingPaceConfig> = {
  slow: { inhaleSec: 3, exhaleSec: 3 },
  standard: { inhaleSec: 2, exhaleSec: 2 },
  fast: { inhaleSec: 1.5, exhaleSec: 1.5 },
};

export function getPaceConfig(pace: BreathingPace): Required<BreathConfig> {
  const paceConfig = breathingPacePresets[pace];
  return {
    rounds: breathDefaults.rounds,
    breaths: breathDefaults.breaths,
    holdSec: breathDefaults.holdSec,
    recoverySec: breathDefaults.recoverySec,
    inhaleSec: paceConfig.inhaleSec,
    exhaleSec: paceConfig.exhaleSec,
  };
}

type Limit = { min: number; max: number };

export const breathLimits: Record<keyof Omit<BreathConfig, 'inhaleSec' | 'exhaleSec'>, Limit> & {
  inhaleSec: Limit;
  exhaleSec: Limit;
} = {
  rounds: { min: 1, max: 8 },
  breaths: { min: 10, max: 60 },
  holdSec: { min: 0, max: 180 },
  recoverySec: { min: 10, max: 20 },
  inhaleSec: { min: 1, max: 4 },
  exhaleSec: { min: 1, max: 4 },
};

export const breathDefaults: Required<BreathConfig> = {
  rounds: 3,
  breaths: 30,
  holdSec: 60,
  recoverySec: 15,
  inhaleSec: 2,
  exhaleSec: 2,
};

export function clampValue(value: number, limit: Limit): number {
  return Math.min(limit.max, Math.max(limit.min, value));
}
