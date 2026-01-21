import { useState } from 'react';
import { StyleSheet, Switch, Text, View } from 'react-native';

import { Card } from '../components/Card';
import { Screen } from '../components/Screen';
import { colors, spacing, typography } from '../theme';

export function SettingsScreen() {
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [hapticsEnabled, setHapticsEnabled] = useState(true);

  return (
    <Screen>
      <Text style={styles.title}>Settings</Text>
      <Text style={styles.subtitle}>Tune your default session setup.</Text>

      <Card style={styles.section}>
        <Text style={styles.sectionTitle}>Breathwork defaults</Text>
        <View style={styles.row}>
          <Text style={styles.rowLabel}>Rounds</Text>
          <Text style={styles.rowValue}>3</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.rowLabel}>Breaths per round</Text>
          <Text style={styles.rowValue}>30</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.rowLabel}>Hold time</Text>
          <Text style={styles.rowValue}>60 sec</Text>
        </View>
      </Card>

      <Card style={styles.section} tone="mist">
        <Text style={styles.sectionTitle}>Guidance</Text>
        <View style={styles.toggleRow}>
          <Text style={styles.rowLabel}>Audio cues</Text>
          <Switch
            value={audioEnabled}
            onValueChange={setAudioEnabled}
            trackColor={{ false: colors.stroke, true: colors.glacier }}
            thumbColor={audioEnabled ? colors.deep : colors.textMuted}
          />
        </View>
        <View style={styles.toggleRow}>
          <Text style={styles.rowLabel}>Haptic cues</Text>
          <Switch
            value={hapticsEnabled}
            onValueChange={setHapticsEnabled}
            trackColor={{ false: colors.stroke, true: colors.glacier }}
            thumbColor={hapticsEnabled ? colors.deep : colors.textMuted}
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
  },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.xs,
  },
  rowLabel: {
    ...typography.body,
  },
  rowValue: {
    ...typography.title,
    color: colors.deep,
  },
});
