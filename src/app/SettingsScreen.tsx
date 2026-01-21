import { useMemo } from 'react';
import { Pressable, StyleSheet, Switch, Text, View } from 'react-native';

import { Card } from '../components/Card';
import { Screen } from '../components/Screen';
import { breathLimits, type BreathConfig } from '../logic/breathingConfig';
import { useSettingsStore } from '../state/settingsStore';
import { colors, spacing, typography } from '../theme';

export function SettingsScreen() {
  const audioEnabled = useSettingsStore((state) => state.audioEnabled);
  const hapticsEnabled = useSettingsStore((state) => state.hapticsEnabled);
  const reducedMotionPreferred = useSettingsStore((state) => state.reducedMotionPreferred);
  const defaults = useSettingsStore((state) => state.defaults);
  const toggleAudio = useSettingsStore((state) => state.toggleAudio);
  const toggleHaptics = useSettingsStore((state) => state.toggleHaptics);
  const toggleReducedMotion = useSettingsStore((state) => state.toggleReducedMotion);
  const updateDefaults = useSettingsStore((state) => state.updateDefaults);

  const steppers = useMemo(
    () => [
      {
        label: 'Rounds',
        key: 'rounds' as const,
        min: breathLimits.rounds.min,
        max: breathLimits.rounds.max,
      },
      {
        label: 'Breaths per round',
        key: 'breaths' as const,
        min: breathLimits.breaths.min,
        max: breathLimits.breaths.max,
      },
      {
        label: 'Hold time (sec)',
        key: 'holdSec' as const,
        min: breathLimits.holdSec.min,
        max: breathLimits.holdSec.max,
      },
      {
        label: 'Recovery (sec)',
        key: 'recoverySec' as const,
        min: breathLimits.recoverySec.min,
        max: breathLimits.recoverySec.max,
      },
    ],
    [],
  );

  const handleStep = (key: keyof BreathConfig, delta: number) => {
    const current = defaults[key] ?? 0;
    updateDefaults({ [key]: current + delta } as Partial<BreathConfig>);
  };

  return (
    <Screen>
      <Text style={styles.title}>Settings</Text>
      <Text style={styles.subtitle}>Tune your default session setup.</Text>

      <Card style={styles.section}>
        <Text style={styles.sectionTitle}>Breathwork defaults</Text>
        {steppers.map((stepper) => {
          const value = defaults[stepper.key] ?? 0;
          return (
            <View key={stepper.key} style={styles.row}>
              <Text style={styles.rowLabel}>{stepper.label}</Text>
              <View style={styles.stepper}>
                <Pressable
                  onPress={() => handleStep(stepper.key, -1)}
                  disabled={value <= stepper.min}
                  style={({ pressed }) => [styles.stepperButton, pressed && styles.stepperPressed]}
                >
                  <Text style={styles.stepperText}>-</Text>
                </Pressable>
                <Text style={styles.rowValue}>{value}</Text>
                <Pressable
                  onPress={() => handleStep(stepper.key, 1)}
                  disabled={value >= stepper.max}
                  style={({ pressed }) => [styles.stepperButton, pressed && styles.stepperPressed]}
                >
                  <Text style={styles.stepperText}>+</Text>
                </Pressable>
              </View>
            </View>
          );
        })}
      </Card>

      <Card style={styles.section} tone="mist">
        <Text style={styles.sectionTitle}>Guidance</Text>
        <View style={styles.toggleRow}>
          <Text style={styles.rowLabel}>Audio cues</Text>
          <Switch
            value={audioEnabled}
            onValueChange={toggleAudio}
            trackColor={{ false: colors.stroke, true: colors.glacier }}
            thumbColor={audioEnabled ? colors.deep : colors.textMuted}
          />
        </View>
        <View style={styles.toggleRow}>
          <Text style={styles.rowLabel}>Haptic cues</Text>
          <Switch
            value={hapticsEnabled}
            onValueChange={toggleHaptics}
            trackColor={{ false: colors.stroke, true: colors.glacier }}
            thumbColor={hapticsEnabled ? colors.deep : colors.textMuted}
          />
        </View>
      </Card>

      <Card style={styles.section}>
        <Text style={styles.sectionTitle}>Accessibility</Text>
        <View style={styles.toggleRow}>
          <View style={styles.labelWrapper}>
            <Text style={styles.rowLabel}>Reduce motion</Text>
            <Text style={styles.toggleHint}>Minimize animations for vestibular comfort</Text>
          </View>
          <Switch
            value={reducedMotionPreferred}
            onValueChange={toggleReducedMotion}
            trackColor={{ false: colors.stroke, true: colors.glacier }}
            thumbColor={reducedMotionPreferred ? colors.deep : colors.textMuted}
          />
        </View>
      </Card>
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
  section: {
    marginTop: spacing.lg,
  },
  sectionTitle: {
    ...typography.title,
    marginBottom: spacing.sm,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.xs,
    alignItems: 'center',
  },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.xs,
  },
  labelWrapper: {
    flex: 1,
    marginRight: spacing.sm,
  },
  rowLabel: {
    ...typography.body,
  },
  toggleHint: {
    ...typography.caption,
    color: colors.textMuted,
    marginTop: 2,
  },
  rowValue: {
    ...typography.title,
    color: colors.deep,
  },
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stepperButton: {
    width: 30,
    height: 30,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.stroke,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.cloud,
  },
  stepperPressed: {
    opacity: 0.7,
  },
  stepperText: {
    ...typography.title,
    fontSize: 18,
    color: colors.deep,
  },
});
