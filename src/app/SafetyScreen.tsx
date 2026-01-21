import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { Screen } from '../components/Screen';
import { useSettingsStore } from '../state/settingsStore';
import { colors, spacing, typography } from '../theme';
import type { HomeStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<HomeStackParamList, 'Safety'>;

const safetyBullets = [
  'Only practice seated or lying down.',
  'Never practice in water or while driving.',
  'Stop immediately if you feel lightheaded.',
];

export function SafetyScreen({ navigation }: Props) {
  const acknowledgeSafety = useSettingsStore((state) => state.acknowledgeSafety);
  const safetyAcknowledgedAt = useSettingsStore((state) => state.safetyAcknowledgedAt);
  const [confirmed, setConfirmed] = useState(false);

  const alreadyAcknowledged = useMemo(() => Boolean(safetyAcknowledgedAt), [safetyAcknowledgedAt]);
  const canContinue = confirmed || alreadyAcknowledged;

  const handleContinue = () => {
    if (!alreadyAcknowledged) {
      acknowledgeSafety();
    }
    navigation.navigate('BreathSession');
  };

  return (
    <Screen>
      <Text style={styles.title}>Safety first</Text>
      <Text style={styles.subtitle}>Breathwork is powerful. Create a safe space before you begin.</Text>

      <Card style={styles.card}>
        {safetyBullets.map((line) => (
          <Text key={line} style={styles.bullet}>
            • {line}
          </Text>
        ))}
      </Card>

      {!alreadyAcknowledged ? (
        <Pressable style={styles.checkboxRow} onPress={() => setConfirmed((prev) => !prev)}>
          <View style={[styles.checkbox, confirmed && styles.checkboxChecked]}>
            {confirmed ? <View style={styles.checkboxDot} /> : null}
          </View>
          <Text style={styles.checkboxLabel}>I understand and will practice safely.</Text>
        </Pressable>
      ) : null}

      <View style={styles.actions}>
        <Button label="Continue to breathwork" onPress={handleContinue} disabled={!canContinue} />
        <Button
          label="Back home"
          onPress={() => navigation.navigate('Home')}
          variant="ghost"
          style={styles.secondary}
        />
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
  card: {
    marginTop: spacing.lg,
  },
  bullet: {
    ...typography.body,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.lg,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: colors.stroke,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.cloud,
  },
  checkboxChecked: {
    borderColor: colors.deep,
    backgroundColor: colors.mist,
  },
  checkboxDot: {
    width: 12,
    height: 12,
    borderRadius: 3,
    backgroundColor: colors.deep,
  },
  checkboxLabel: {
    ...typography.body,
    marginLeft: spacing.sm,
    flex: 1,
  },
  actions: {
    marginTop: spacing.xl,
  },
  secondary: {
    marginTop: spacing.sm,
  },
});
