import { useEffect, useMemo, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { activateKeepAwake, deactivateKeepAwake } from 'expo-keep-awake';
import * as Haptics from 'expo-haptics';

import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { Screen } from '../components/Screen';
import { playCue } from '../logic/audioCue';
import { buildBreathingTimeline, getBreathingSnapshot } from '../logic/breathingEngine';
import { formatTimer } from '../logic/time';
import { useBreathingStore } from '../state/breathingStore';
import { useSettingsStore } from '../state/settingsStore';
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
  const status = useBreathingStore((state) => state.status);
  const snapshot = useBreathingStore((state) => state.snapshot);
  const timeline = useBreathingStore((state) => state.timeline);
  const startSession = useBreathingStore((state) => state.startSession);
  const pauseSession = useBreathingStore((state) => state.pauseSession);
  const resumeSession = useBreathingStore((state) => state.resumeSession);
  const stopSession = useBreathingStore((state) => state.stopSession);
  const resetSession = useBreathingStore((state) => state.reset);
  const tick = useBreathingStore((state) => state.tick);
  const audioEnabled = useSettingsStore((state) => state.audioEnabled);
  const hapticsEnabled = useSettingsStore((state) => state.hapticsEnabled);

  const [sessionSafetyConfirmed, setSessionSafetyConfirmed] = useState(false);
  const lastCueKey = useRef<string | null>(null);

  const previewTimeline = useMemo(() => buildBreathingTimeline(defaults), [defaults]);
  const activeTimeline = timeline ?? previewTimeline;
  const activeSnapshot = snapshot ?? getBreathingSnapshot(activeTimeline, 0);

  useEffect(() => {
    if (status !== 'running') {
      return;
    }
    tick(Date.now());
    const id = setInterval(() => tick(Date.now()), 250);
    return () => clearInterval(id);
  }, [status, tick]);

  useEffect(() => {
    if (status === 'running') {
      activateKeepAwake();
      return () => deactivateKeepAwake();
    }
    deactivateKeepAwake();
    return undefined;
  }, [status]);

  useEffect(() => {
    if (status === 'idle') {
      lastCueKey.current = null;
    }
  }, [status]);

  useEffect(() => {
    if (status !== 'running' || !snapshot || snapshot.isComplete) {
      return;
    }
    const segment = snapshot.segment;
    const cueKey = `${segment.type}-${segment.roundIndex}-${segment.breathIndex ?? 0}`;
    if (cueKey === lastCueKey.current) {
      return;
    }
    lastCueKey.current = cueKey;
    if (hapticsEnabled) {
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    if (audioEnabled) {
      void playCue();
    }
  }, [audioEnabled, hapticsEnabled, snapshot, status]);

  useEffect(() => {
    if (status === 'idle') {
      setSessionSafetyConfirmed(false);
    }
  }, [status]);

  const handleStart = () => {
    startSession(defaults);
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

  const phaseLabel = phaseLabels[activeSnapshot.segment.type];
  const breathLabel = activeSnapshot.breathIndex
    ? `Breath ${activeSnapshot.breathIndex} of ${activeSnapshot.totalBreaths}`
    : activeSnapshot.segment.type === 'hold'
      ? 'Hold on empty lungs'
      : 'Recovery breath';
  const nextLabel = activeSnapshot.nextSegment ? phaseLabels[activeSnapshot.nextSegment.type] : 'Complete';
  const nextHint = activeSnapshot.nextSegment ? phaseHints[activeSnapshot.nextSegment.type] : 'Session complete.';
  const timerValue =
    status === 'idle'
      ? formatTimer(activeTimeline.totalDurationSec)
      : formatTimer(activeSnapshot.segmentRemainingSec);

  const totalRemaining = Math.max(0, activeTimeline.totalDurationSec - activeSnapshot.elapsedSec);
  const totalRemainingLabel = formatTimer(totalRemaining);

  return (
    <Screen variant="deep" style={styles.container}>
      <Text style={styles.title}>Breathwork</Text>
      <Text style={styles.subtitle}>Follow the cadence. Let your breath stay soft and circular.</Text>

      <View style={styles.timerWrap}>
        <Text style={styles.round}>{`Round ${activeSnapshot.roundIndex} of ${activeTimeline.totalRounds}`}</Text>
        <Text style={styles.timer}>{timerValue}</Text>
        <Text style={styles.phase}>{phaseLabel}</Text>
        <Text style={styles.breath}>{breathLabel}</Text>
        <Text style={styles.total}>{`Total remaining ${totalRemainingLabel}`}</Text>
      </View>

      <Card style={styles.phaseCard} tone="light">
        <Text style={styles.phaseTitle}>Next up</Text>
        <Text style={styles.phaseCopy}>{`${nextLabel} · ${nextHint}`}</Text>
      </Card>

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

      <View style={styles.actions}>
        {status === 'idle' ? (
          <Button label="Start session" onPress={handleStart} disabled={!sessionSafetyConfirmed} style={styles.primaryButton} />
        ) : null}
        {status === 'running' ? (
          <>
            <Button label="Pause" onPress={pauseSession} style={styles.primaryButton} />
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
  timerWrap: {
    marginTop: spacing.xl,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    padding: spacing.xl,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
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
  total: {
    ...typography.caption,
    color: 'rgba(255, 255, 255, 0.6)',
    marginTop: spacing.sm,
  },
  phaseCard: {
    marginTop: spacing.lg,
    borderColor: 'rgba(255, 255, 255, 0.4)',
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
