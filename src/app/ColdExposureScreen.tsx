import { StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { Screen } from '../components/Screen';
import { colors, spacing, typography } from '../theme';
import type { HomeStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<HomeStackParamList, 'ColdExposure'>;

export function ColdExposureScreen({ navigation }: Props) {
  return (
    <Screen>
      <Text style={styles.title}>Cold exposure</Text>
      <Text style={styles.subtitle}>Choose a timer and settle your breath before you step into the cold.</Text>

      <Card style={styles.timerCard}>
        <Text style={styles.timerLabel}>Countdown</Text>
        <Text style={styles.timerValue}>02:00</Text>
        <Text style={styles.timerHint}>Cold shower · beginner preset</Text>
      </Card>

      <View style={styles.presetRow}>
        <Card style={[styles.presetCard, styles.presetCardLeft]} tone="mist">
          <Text style={styles.presetTitle}>60 sec</Text>
          <Text style={styles.presetCopy}>Quick reset</Text>
        </Card>
        <Card style={styles.presetCard}>
          <Text style={styles.presetTitle}>180 sec</Text>
          <Text style={styles.presetCopy}>Deep focus</Text>
        </Card>
      </View>

      <View style={styles.actions}>
        <Button label="Start Timer" onPress={() => {}} />
        <Button label="Back Home" onPress={() => navigation.navigate('Home')} variant="ghost" style={styles.secondary} />
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
  presetCard: {
    flex: 1,
  },
  presetCardLeft: {
    marginRight: spacing.sm,
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
