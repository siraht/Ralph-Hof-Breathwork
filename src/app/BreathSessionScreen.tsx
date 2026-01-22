import { useEffect, useMemo, useRef, useState } from 'react';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { activateKeepAwake, deactivateKeepAwake } from 'expo-keep-awake';
import * as Haptics from 'expo-haptics';

import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { Screen } from '../components/Screen';
import { ScaledText } from '../components/ScaledText';
import { useSettingsStore } from '../state/settingsStore';
import { useBreathingStore, type SessionStartOptions } from '../state/breathingStore';
import { colors, radius, spacing, typography } from '../theme';
import type { HomeStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<HomeStackParamList, 'BreathSession'>;

const phaseLabels = {
  inhale: 'Inhale',
  exhale: 'Exhale',
  hold: 'Hold',
  recovery: 'Recovery breath',
};

const phaseHints = {
  inhale: 'Breathe in calmly through the nose.',
  exhale: 'Let the breath flow out with ease.',
  hold: 'Hold on empty lungs. Relax your shoulders.',
  recovery: 'Inhale deeply and hold the recovery breath.',
};

export function BreathSessionScreen({ navigation }: Props) {
  const defaults = useSettingsStore((state) => state.defaults);
  const emptyHoldGoalSec = useSettingsStore((state) => state.emptyHoldGoalSec);
  const recoveryHoldGoalSec = useSettingsStore((state) => state.recoveryHoldGoalSec);
  const reducedMotionPreferred = useSettingsStore((state) => state.reducedMotionPreferred);

  const status = useBreathingStore((state) => state.status);
  const snapshot = useBreathingStore((state) => state.snapshot);
  const timeline = useBreathingStore((state) => state.timeline);
  const isHoldPhase = useBreathingStore((state) => state.isHoldPhase);
  const holdElapsedSec = useBreathingStore((state) => state.holdElapsedSec);
  const goalReached = useBreathingStore((state) => state.goalReached);
  const startSession = useBreathingStore((state) => state.startSession);
  const pauseSession = useBreathingStore((state) => state.pauseSession);
  const resumeSession = useBreathingStore((state) => state.resumeSession);
  const stopSession = useBreathingStore((state) => state.stopSession);
  const resetSession = useBreathingStore((state) => state.reset);
  const advanceFromHold = useBreathingStore((state) => state.advanceFromHold);
  const tick = useBreathingStore((state) => state.tick);

  const [sessionSafetyConfirmed, setSessionSafetyConfirmed] = useState(false);
  const lastCueKey = useRef<string | null>(null);
  const lastGoalReachedState = useRef(false);

  const activeTimeline = timeline;
  const activeSnapshot = snapshot;

  // Animated circle for breathing cadence
  const circleScale = useRef(new Animated.Value(1)).current;
  const circleOpacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    if (status === 'running' && activeSnapshot) {
      tick(Date.now());
      const id = setInterval(() => tick(Date.now()), 250);
      return () => clearInterval(id);
    }
  }, [status, tick, activeSnapshot]);

  useEffect(() => {
    if (status === 'running') {
      activateKeepAwake().catch(() => {});
      return () => {
        deactivateKeepAwake().catch(() => {});
      };
    }
    deactivateKeepAwake().catch(() => {});
  }, [status]);

  useEffect(() => {
    if (status === 'idle') {
      lastCueKey.current = null;
      lastGoalReachedState.current = false;
    }
  }, [status]);

  useEffect(() => {
    if (status !== 'running' || !activeSnapshot || activeSnapshot.isComplete) {
      return;
    }

    // Phase change haptic/audio cue
    const segment = activeSnapshot.segment;
    const cueKey = `${segment.type}-${segment.roundIndex}-${segment.breathIndex ?? 0}`;
    if (cueKey !== lastCueKey.current) {
      lastCueKey.current = cueKey;
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    // Goal reached haptic
    if (goalReached && !lastGoalReachedState.current) {
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      lastGoalReachedState.current = true;
    } else if (!goalReached) {
      lastGoalReachedState.current = false;
    }

    // Animate circle for breathing phases
    const segmentType = activeSnapshot.segment.type;
    const isInhale = segmentType === 'inhale';
    const isExhale = segmentType === 'exhale';

    if (!reducedMotionPreferred && (isInhale || isExhale)) {
      const duration = (segmentType === 'inhale' ? activeSnapshot.segmentRemainingSec : activeSnapshot.segmentElapsedSec) * 1000;
      const targetScale = isInhale ? 1.3 : 0.7;
      const targetOpacity = isInhale ? 0.6 : 0.3;

      Animated.timing(circleScale, {
        toValue: targetScale,
        duration: Math.max(100, duration),
        useNativeDriver: true,
      }).start();
      Animated.timing(circleOpacity, {
        toValue: targetOpacity,
        duration: Math.max(100, duration),
        useNativeDriver: true,
      }).start();
    }
  }, [status, activeSnapshot, goalReached, reducedMotionPreferred, circleScale, circleOpacity]);

  useEffect(() => {
    if (status === 'idle') {
      setSessionSafetyConfirmed(false);
    }
  }, [status]);

  const handleStart = () => {
    const options: SessionStartOptions = {
      ...defaults,
      emptyHoldGoalSec,
      recoveryHoldGoalSec,
    };
    startSession(options);
  };

  const handleFinishEarly = () => {
    stopSession();
    navigation.navigate('SessionSummary');
  };

  const handleViewSummary = () => {
    navigation.navigate('SessionSummary');
  };

  const handleRestart = () => {
    resetSession();
  };

  const handleContinue = () => {
    advanceFromHold();
  };

  // Format time display based on phase type
  const getTimerDisplay = () => {
    if (!activeSnapshot || status === 'idle') {
      return activeTimeline ? formatTimer(activeTimeline.totalDurationSec) : '0:00';
    }

    const segmentType = activeSnapshot.segment.type;

    if (segmentType === 'hold' || segmentType === 'recovery') {
      // Stopwatch mode: show elapsed time
      const elapsed = Math.round(holdElapsedSec);
      return formatTimer(elapsed);
    }

    // Breathing phases: show remaining time for current breath
    return formatTimer(activeSnapshot.segmentRemainingSec);
  };

  // Determine breath label - simplified version
  const getBreathLabel = () => {
    if (!activeSnapshot) return '';

    const segmentType = activeSnapshot.segment.type;

    if (segmentType === 'hold') {
      return 'Hold on empty lungs';
    }

    if (segmentType === 'recovery') {
      return 'Recovery breath';
    }

    // During breathing, show breath count with remaining phase time
    if (activeSnapshot.breathIndex) {
      const remainingPhase = Math.ceil(activeSnapshot.segmentRemainingSec);
      const verb = segmentType === 'inhale' ? 'Inhale' : 'Exhale';
      return `${verb} · ${remainingPhase}s`;
    }

    return '';
  };

  // Fixed "next up" label - don't flip during breathing
  const getNextLabel = () => {
    if (!activeSnapshot) return 'Complete';

    const segmentType = activeSnapshot.segment.type;

    // During breathing, always point to hold
    if (segmentType === 'inhale' || segmentType === 'exhale') {
      return 'Hold on empty lungs';
    }

    return 'Complete';
  };

  const formatTimer = (seconds: number): string => {
    if (seconds < 60) return `${Math.round(seconds)}s`;
    const mins = Math.floor(seconds / 60);
    const secs = Math.round(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const phaseLabel = activeSnapshot ? phaseLabels[activeSnapshot.segment.type] : 'Breathwork';
  const isInhale = activeSnapshot?.segment.type === 'inhale';
  const isExhale = activeSnapshot?.segment.type === 'exhale';
  const isHold = activeSnapshot?.segment.type === 'hold' || activeSnapshot?.segment.type === 'recovery';
  const isBreathing = isInhale || isExhale;

  // Update preview timer when idle - calculate based on hold goals
  const previewSeconds = useMemo(() => {
    if (!activeTimeline) return 0;
    return activeTimeline.totalDurationSec;
  }, [activeTimeline]);

  return (
    <Screen variant="deep" style={styles.container}>
      <Text style={styles.title}>Breathwork</Text>
      <Text style={styles.subtitle}>Follow the cadence. Let your breath stay soft and circular.</Text>

      {/* Animated Breathing Circle */}
      <View style={styles.circleContainer}>
        <Animated.View
          style={[
            styles.breathCircle,
            {
              transform: [{ scale: reducedMotionPreferred ? 1 : circleScale }],
              opacity: reducedMotionPreferred ? 0.3 : circleOpacity,
              backgroundColor: isHold ? colors.teal : colors.seafoam,
            },
          ]}
        />
        {isHold && goalReached && <View style={styles.goalRing} />}
      </View>

      {/* Timer Display */}
      <View style={styles.timerWrap}>
        {activeTimeline && (
          <ScaledText variant="caption" style={styles.round}>{`Round ${activeSnapshot?.roundIndex ?? 1} of ${activeTimeline.totalRounds}`}</ScaledText>
        )}
        <ScaledText variant="timer" style={[styles.timer, isHold && goalReached && styles.timerGoalReached]}>
          {getTimerDisplay()}
        </ScaledText>
        <ScaledText variant="title" style={styles.phase}>{phaseLabel}</ScaledText>
        <ScaledText variant="body" style={styles.breath}>{getBreathLabel()}</ScaledText>
        {activeTimeline && status !== 'idle' && (
          <ScaledText variant="caption" style={styles.next}>
            {isBreathing ? `Next: ${getNextLabel()}` : ''}
          </ScaledText>
        )}
      </View>

      {/* Hold Phase Info */}
      {isHold && activeSnapshot && (
        <Card style={[styles.phaseCard, styles.holdCard]} tone="light">
          <Text style={styles.phaseTitle}>Phase info</Text>
          <Text style={styles.phaseCopy}>
            {activeSnapshot.segment.type === 'hold'
              ? `Hold on empty lungs. Goal: ${activeSnapshot.segment.holdGoalSec ?? emptyHoldGoalSec}s`
              : `Recovery breath. Goal: ${activeSnapshot.segment.holdGoalSec ?? recoveryHoldGoalSec}s`
            }
          </Text>
          {goalReached && (
            <Text style={styles.goalReached}>✓ Goal reached!</Text>
          )}
        </Card>
      )}

      {/* Safety Card (idle only) */}
      {status === 'idle' ? (
        <Card style={styles.safetyCard} tone="mist">
          <Text style={styles.safetyTitle}>Safety reminder</Text>
          <Text style={styles.safetyCopy}>Always practice seated or lying down. Never in water or while driving.</Text>
          <Pressable style={styles.safetyRow} onPress={() => setSessionSafetyConfirmed((prev) => !prev)}>
            <View style={[styles.safetyCheck, sessionSafetyConfirmed && styles.safetyCheckActive]} />
            <Text style={styles.safetyLabel}>I am in a safe, comfortable space.</Text>
          </Pressable>
        </Card>
      ) : null}

      {/* Action Buttons */}
      <View style={styles.actions}>
        {status === 'idle' ? (
          <Button
            label="Start session"
            onPress={handleStart}
            disabled={!sessionSafetyConfirmed}
            style={styles.primaryButton}
          />
        ) : null}

        {status === 'running' ? (
          <>
            {isHold && goalReached ? (
              <Button label="Continue" onPress={handleContinue} style={styles.primaryButton} variant="secondary" />
            ) : (
              <Button label="Pause" onPress={pauseSession} style={styles.primaryButton} />
            )}
            <Button label="Finish early" onPress={handleFinishEarly} variant="ghost" style={styles.ghostButton} />
          </>
        ) : null}

        {status === 'paused' ? (
          <>
            <Button label="Resume" onPress={resumeSession} style={styles.primaryButton} />
            <Button label="Finish early" onPress={handleFinishEarly} variant="ghost" style={styles.ghostButton} />
          </>
        ) : null}

        {status === 'completed' ? (
          <>
            <Button label="View summary" onPress={handleViewSummary} style={styles.primaryButton} />
            <Button label="Start again" onPress={handleRestart} variant="ghost" style={styles.ghostButton} />
          </>
        ) : null}

        {status === 'idle' ? (
          <Button
            label="Back home"
            onPress={() => navigation.navigate('Home')}
            variant="ghost"
            style={styles.ghostButton}
          />
        ) : null}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: spacing.xl,
  },
  title: {
    ...typography.display,
    color: colors.cloud,
  },
  subtitle: {
    ...typography.body,
    color: 'rgba(255, 255, 255, 0.7)',
    marginTop: spacing.sm,
  },
  circleContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 200,
    marginVertical: spacing.lg,
  },
  breathCircle: {
    width: 150,
    height: 150,
    borderRadius: 75,
  },
  goalRing: {
    position: 'absolute',
    width: 170,
    height: 170,
    borderRadius: 85,
    borderWidth: 3,
    borderColor: colors.teal,
  },
  timerWrap: {
    marginTop: spacing.xl,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    padding: spacing.xl,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    alignItems: 'center',
  },
  round: {
    ...typography.caption,
    color: 'rgba(255, 255, 255, 0.7)',
    textTransform: 'uppercase',
    letterSpacing: 1.6,
  },
  timer: {
    fontFamily: 'SpaceMono_400Regular',
    fontSize: 54,
    lineHeight: 58,
    color: colors.cloud,
    marginTop: spacing.sm,
  },
  phase: {
    ...typography.title,
    color: 'rgba(255, 255, 255, 0.85)',
    marginTop: spacing.sm,
  },
  breath: {
    ...typography.body,
    color: 'rgba(255, 255, 255, 0.7)',
    marginTop: spacing.xs,
  },
  next: {
    ...typography.caption,
    color: 'rgba(255, 255, 255, 0.6)',
    marginTop: spacing.sm,
  },
  phaseCard: {
    marginTop: spacing.lg,
    borderColor: 'rgba(255, 255, 255, 0.4)',
  },
  holdCard: {
    backgroundColor: 'rgba(20, 184, 166, 0.1)',
    borderColor: colors.seafoam,
  },
  phaseTitle: {
    ...typography.title,
    color: colors.deep,
  },
  phaseCopy: {
    ...typography.body,
    color: colors.textMuted,
    marginTop: spacing.xs,
  },
  goalReached: {
    ...typography.body,
    color: colors.teal,
    marginTop: spacing.sm,
    fontWeight: '600',
  },
  timerGoalReached: {
    color: colors.seafoam,
  },
  safetyCard: {
    marginTop: spacing.lg,
  },
  safetyTitle: {
    ...typography.title,
    color: colors.deep,
  },
  safetyCopy: {
    ...typography.body,
    color: colors.textMuted,
    marginTop: spacing.xs,
  },
  safetyRow: {
    marginTop: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
  },
  safetyCheck: {
    width: 20,
    height: 20,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: colors.stroke,
    backgroundColor: colors.cloud,
  },
  safetyCheckActive: {
    backgroundColor: colors.deep,
    borderColor: colors.deep,
  },
  safetyLabel: {
    ...typography.body,
    marginLeft: spacing.sm,
    color: colors.text,
  },
  actions: {
    marginTop: spacing.xl,
  },
  primaryButton: {
    marginBottom: spacing.sm,
  },
  ghostButton: {
    borderColor: 'rgba(255, 255, 255, 0.4)',
  },
});
