import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { Screen } from '../components/Screen';
import { useSettingsStore } from '../state/settingsStore';
import { colors, radius, shadow, spacing, typography } from '../theme';
import type { HomeStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<HomeStackParamList, 'Home'>;

export function HomeScreen({ navigation }: Props) {
  const safetyAcknowledgedAt = useSettingsStore((state) => state.safetyAcknowledgedAt);
  const nextBreathRoute = safetyAcknowledgedAt ? 'BreathSession' : 'Safety';

  return (
    <Screen>
      <View style={styles.header}>
        <Text style={styles.kicker}>WIM HOF METHOD</Text>
        <Text style={styles.title}>Breathe deep. Reset fast.</Text>
        <Text style={styles.subtitle}>
          Guided breathwork, cold exposure timers, and a calm space to build your daily ritual.
        </Text>
      </View>

      <LinearGradient colors={[colors.deep, '#1E5461']} style={styles.hero}>
        <Text style={styles.heroTitle}>Breathing Session</Text>
        <Text style={styles.heroCopy}>Follow the rhythm, track your rounds, and finish with a steady recovery breath.</Text>
        <View style={styles.heroActions}>
          <Button
            label="Start Breathwork"
            onPress={() => navigation.navigate(nextBreathRoute)}
            variant="secondary"
            style={styles.heroButton}
          />
          <Button
            label="Cold Exposure"
            onPress={() => navigation.navigate('ColdExposure')}
            variant="ghost"
            style={styles.heroButtonGhost}
            textStyle={styles.heroGhostText}
          />
        </View>
      </LinearGradient>

      <View style={styles.row}>
        <Card style={[styles.statCard, styles.statCardLeft]}>
          <Text style={styles.statLabel}>Current streak</Text>
          <Text style={styles.statValue}>0 days</Text>
        </Card>
        <Card style={styles.statCard} tone="mist">
          <Text style={styles.statLabel}>Sessions logged</Text>
          <Text style={styles.statValue}>0</Text>
        </Card>
      </View>

      <Card style={styles.tipCard}>
        <Text style={styles.tipTitle}>Safety first</Text>
        <Text style={styles.tipCopy}>Always practice breathwork seated or lying down. Never in water or while driving.</Text>
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    marginBottom: spacing.lg,
  },
  kicker: {
    ...typography.caption,
    color: colors.textMuted,
    letterSpacing: 2,
  },
  title: {
    ...typography.display,
    marginTop: spacing.xs,
  },
  subtitle: {
    ...typography.body,
    color: colors.textMuted,
    marginTop: spacing.sm,
  },
  hero: {
    borderRadius: radius.xl,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    ...shadow.soft,
  },
  heroTitle: {
    ...typography.title,
    color: colors.cloud,
  },
  heroCopy: {
    ...typography.body,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: spacing.xs,
  },
  heroActions: {
    marginTop: spacing.md,
  },
  heroButton: {
    backgroundColor: colors.glacier,
    borderColor: colors.glacier,
    marginBottom: spacing.sm,
  },
  heroButtonGhost: {
    borderColor: 'rgba(255, 255, 255, 0.5)',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  heroGhostText: {
    color: colors.cloud,
  },
  row: {
    flexDirection: 'row',
    marginBottom: spacing.lg,
  },
  statCard: {
    flex: 1,
  },
  statCardLeft: {
    marginRight: spacing.sm,
  },
  statLabel: {
    ...typography.caption,
    color: colors.textMuted,
  },
  statValue: {
    ...typography.title,
    marginTop: spacing.xs,
  },
  tipCard: {
    backgroundColor: colors.sand,
    borderColor: colors.sun,
  },
  tipTitle: {
    ...typography.title,
  },
  tipCopy: {
    ...typography.body,
    color: colors.textMuted,
    marginTop: spacing.xs,
  },
});
