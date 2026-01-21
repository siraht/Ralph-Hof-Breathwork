import { StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { Screen } from '../components/Screen';
import { colors, radius, spacing, typography } from '../theme';
import type { HomeStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<HomeStackParamList, 'BreathSession'>;

export function BreathSessionScreen({ navigation }: Props) {
  return (
    <Screen variant="deep" style={styles.container}>
      <Text style={styles.title}>Breathwork</Text>
      <Text style={styles.subtitle}>Follow the cadence. Let your breath stay soft and circular.</Text>

      <View style={styles.timerWrap}>
        <Text style={styles.round}>Round 1 of 3</Text>
        <Text style={styles.timer}>00:45</Text>
        <Text style={styles.phase}>Inhale · Exhale</Text>
      </View>

      <Card style={styles.phaseCard} tone="light">
        <Text style={styles.phaseTitle}>Next up</Text>
        <Text style={styles.phaseCopy}>Hold on empty lungs for up to 60 seconds. Stay relaxed.</Text>
      </Card>

      <View style={styles.actions}>
        <Button label="Start Session" onPress={() => {}} style={styles.primaryButton} />
        <Button
          label="Finish Early"
          onPress={() => navigation.navigate('SessionSummary')}
          variant="ghost"
          style={styles.ghostButton}
        />
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
    ...typography.body,
    color: 'rgba(255, 255, 255, 0.8)',
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
