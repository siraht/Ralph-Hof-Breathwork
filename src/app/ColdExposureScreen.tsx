import { useEffect, useMemo, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { activateKeepAwake, deactivateKeepAwake } from 'expo-keep-awake';
import * as Haptics from 'expo-haptics';

import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { Screen } from '../components/Screen';
import { ScaledText } from '../components/ScaledText';
import { playCue } from '../logic/audioCue';
import { formatTimer } from '../logic/time';
import { useSessionStore } from '../state/sessionStore';
import { useSettingsStore } from '../state/settingsStore';
import { colors, spacing, typography } from '../theme';
import type { HomeStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<HomeStackParamList, 'ColdExposure'>;

const presets = [
  { id: 'quick', seconds: 60, label: '60 sec', copy: 'Quick reset' },
  { id: 'steady', seconds: 120, label: '120 sec', copy: 'Daily build' },
  { id: 'deep', seconds: 180, label: '180 sec', copy: 'Deep focus' },
];

export function ColdExposureScreen({ navigation }: Props) {
  const addColdSession = useSessionStore((state) => state.addColdSession);
  const audioEnabled = useSettingsStore((state) => state.audioEnabled);
  const hapticsEnabled = useSettingsStore((state) => state.hapticsEnabled);
  const [selectedPreset, setSelectedPreset] = useState(presets[1]);
  const [status, setStatus] = useState<'idle' | 'running' | 'paused' | 'completed'>('idle');
  const [startedAt, setStartedAt] = useState<number | null>(null);
  const [sessionStartedAt, setSessionStartedAt] = useState<number | null>(null);
  const [accumulatedMs, setAccumulatedMs] = useState(0);
  const [elapsedMs, setElapsedMs] = useState(0);
  const completingRef = useRef(false);

  const totalMs = useMemo(() => selectedPreset.seconds * 1000, [selectedPreset.seconds]);
  const remainingSec = Math.max(0, Math.ceil((totalMs - elapsedMs) / 1000));
  const timerLabel = formatTimer(remainingSec);

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
    if (status !== 'running' || startedAt === null) {
      return;
    }
    const update = () => {
      const now = Date.now();
      const currentElapsed = accumulatedMs + (now - startedAt);
      setElapsedMs(currentElapsed);
      if (currentElapsed >= totalMs && !completingRef.current) {
        void handleFinish(true, currentElapsed);
      }
    };
    update();
    const id = setInterval(update, 250);
    return () => clearInterval(id);
  }, [accumulatedMs, startedAt, status, totalMs]);

  const resetTimer = () => {
    setStatus('idle');
    setStartedAt(null);
    setSessionStartedAt(null);
    setAccumulatedMs(0);
    setElapsedMs(0);
    completingRef.current = false;
  };

  const handleStart = () => {
    const now = Date.now();
    setStatus('running');
    setStartedAt(now);
    setSessionStartedAt(now);
    setAccumulatedMs(0);
    setElapsedMs(0);
  };

  const handlePause = () => {
    if (status !== 'running' || startedAt === null) {
      return;
    }
    const now = Date.now();
    setAccumulatedMs(accumulatedMs + (now - startedAt));
    setStartedAt(null);
    setStatus('paused');
  };

  const handleResume = () => {
    if (status !== 'paused') {
      return;
    }
    setStatus('running');
    setStartedAt(Date.now());
  };

  const handleFinish = async (completed: boolean, elapsedOverride?: number) => {
    if (completingRef.current) {
      return;
    }
    completingRef.current = true;
    const endTime = Date.now();
    const elapsed =
      elapsedOverride ??
      (status === 'running' && startedAt ? accumulatedMs + (endTime - startedAt) : elapsedMs);
    const durationSec = Math.max(0, Math.round(Math.min(totalMs, elapsed) / 1000));
    const startTime = sessionStartedAt ?? endTime - elapsed;
    setStatus('completed');
    setStartedAt(null);
    setAccumulatedMs(Math.min(totalMs, elapsed));
    setElapsedMs(Math.min(totalMs, elapsed));
    await addColdSession({
      durationSec,
      startedAt: startTime,
      endedAt: endTime,
      completed,
    });
    if (completed && hapticsEnabled) {
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
    if (completed && audioEnabled) {
      void playCue();
    }
    completingRef.current = false;
  };

  return (
    <Screen>
      <Text style={styles.title}>Cold exposure</Text>
      <Text style={styles.subtitle}>Choose a timer and settle your breath before you step into the cold.</Text>

      <Card style={styles.timerCard}>
        <ScaledText variant="caption" style={styles.timerLabel}>Countdown</ScaledText>
        <ScaledText variant="timer" style={styles.timerValue}>{timerLabel}</ScaledText>
        <ScaledText variant="body" style={styles.timerHint}>{`Cold shower · ${selectedPreset.copy.toLowerCase()}`}</ScaledText>
      </Card>

      <View style={styles.presetRow}>
        {presets.slice(0, 2).map((preset, index) => {
          const isActive = preset.id === selectedPreset.id;
          return (
            <Pressable
              key={preset.id}
              onPress={() => setSelectedPreset(preset)}
              disabled={status !== 'idle'}
              style={index === 0 ? [styles.presetCardWrap, styles.presetCardLeft] : styles.presetCardWrap}
            >
              <Card style={isActive ? [styles.presetCard, styles.presetCardActive] : styles.presetCard} tone="mist">
                <Text style={styles.presetTitle}>{preset.label}</Text>
                <Text style={styles.presetCopy}>{preset.copy}</Text>
              </Card>
            </Pressable>
          );
        })}
      </View>
      <View style={styles.presetRow}>
        {presets.slice(2).map((preset) => {
          const isActive = preset.id === selectedPreset.id;
          return (
            <Pressable
              key={preset.id}
              onPress={() => setSelectedPreset(preset)}
              disabled={status !== 'idle'}
              style={styles.presetCardWrap}
            >
              <Card style={isActive ? [styles.presetCard, styles.presetCardActive] : styles.presetCard} tone="mist">
                <Text style={styles.presetTitle}>{preset.label}</Text>
                <Text style={styles.presetCopy}>{preset.copy}</Text>
              </Card>
            </Pressable>
          );
        })}
      </View>

      <View style={styles.actions}>
        {status === 'idle' ? <Button label="Start Timer" onPress={handleStart} /> : null}
        {status === 'running' ? (
          <>
            <Button label="Pause" onPress={handlePause} />
            <Button label="Finish early" onPress={() => void handleFinish(false)} variant="ghost" style={styles.secondary} />
          </>
        ) : null}
        {status === 'paused' ? (
          <>
            <Button label="Resume" onPress={handleResume} />
            <Button label="Finish early" onPress={() => void handleFinish(false)} variant="ghost" style={styles.secondary} />
          </>
        ) : null}
        {status === 'completed' ? (
          <>
            <Button label="Log another timer" onPress={resetTimer} />
            <Button
              label="View History"
              onPress={() => {
                resetTimer();
                navigation.getParent()?.navigate('History');
              }}
              variant="ghost"
              style={styles.secondary}
            />
          </>
        ) : null}
        {status === 'idle' ? (
          <Button
            label="Back Home"
            onPress={() => navigation.navigate('Home')}
            variant="ghost"
            style={styles.secondary}
          />
        ) : null}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: {
    ...typography.display,
  },
  subtitle: {
    ...typography.body,
    color: colors.textMuted,
    marginTop: spacing.sm,
  },
  timerCard: {
    marginTop: spacing.lg,
  },
  timerLabel: {
    ...typography.caption,
    color: colors.textMuted,
  },
  timerValue: {
    fontFamily: 'SpaceMono_400Regular',
    fontSize: 48,
    lineHeight: 54,
    color: colors.deep,
    marginTop: spacing.xs,
  },
  timerHint: {
    ...typography.body,
    color: colors.textMuted,
    marginTop: spacing.xs,
  },
  presetRow: {
    flexDirection: 'row',
    marginTop: spacing.lg,
  },
  presetCardWrap: {
    flex: 1,
  },
  presetCard: {
    flex: 1,
  },
  presetCardLeft: {
    marginRight: spacing.sm,
  },
  presetCardActive: {
    borderColor: colors.deep,
    backgroundColor: colors.sand,
  },
  presetTitle: {
    ...typography.title,
  },
  presetCopy: {
    ...typography.caption,
    color: colors.textMuted,
    marginTop: spacing.xs,
  },
  actions: {
    marginTop: spacing.xl,
  },
  secondary: {
    marginTop: spacing.sm,
  },
});
