import { StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { Screen } from '../components/Screen';
import { colors, spacing, typography } from '../theme';
import type { HomeStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<HomeStackParamList, 'SessionSummary'>;

export function SessionSummaryScreen({ navigation }: Props) {
  return (
    <Screen>
      <Text style={styles.title}>Session summary</Text>
      <Text style={styles.subtitle}>Nice work. Your breath stayed steady throughout the round.</Text>

      <View style={styles.grid}>
        <Card style={[styles.gridCard, styles.gridCardLeft]}>
          <Text style={styles.gridLabel}>Total time</Text>
          <Text style={styles.gridValue}>08:32</Text>
        </Card>
        <Card style={styles.gridCard} tone="mist">
          <Text style={styles.gridLabel}>Longest hold</Text>
          <Text style={styles.gridValue}>01:20</Text>
        </Card>
      </View>

      <Card>
        <Text style={styles.noteTitle}>Reflection</Text>
        <Text style={styles.noteCopy}>Add a note and rate this session once tracking is enabled.</Text>
      </Card>

      <View style={styles.actions}>
        <Button label="Save Session" onPress={() => navigation.navigate('Home')} />
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
  grid: {
    flexDirection: 'row',
    marginTop: spacing.lg,
    marginBottom: spacing.lg,
  },
  gridCard: {
    flex: 1,
  },
  gridCardLeft: {
    marginRight: spacing.sm,
  },
  gridLabel: {
    ...typography.caption,
    color: colors.textMuted,
  },
  gridValue: {
    ...typography.title,
    marginTop: spacing.xs,
  },
  noteTitle: {
    ...typography.title,
  },
  noteCopy: {
    ...typography.body,
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
