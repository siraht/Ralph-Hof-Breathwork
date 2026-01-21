import { StyleSheet, Text, View } from 'react-native';

import { Card } from '../components/Card';
import { Screen } from '../components/Screen';
import { colors, spacing, typography } from '../theme';

export function HistoryScreen() {
  return (
    <Screen>
      <Text style={styles.title}>History</Text>
      <Text style={styles.subtitle}>Track your sessions and keep your momentum.</Text>

      <View style={styles.list}>
        <Card style={styles.listCard}>
          <Text style={styles.cardTitle}>Breathwork</Text>
          <Text style={styles.cardMeta}>No sessions yet</Text>
        </Card>
        <Card style={styles.listCard} tone="mist">
          <Text style={styles.cardTitle}>Cold exposure</Text>
          <Text style={styles.cardMeta}>Start a timer to log your first entry</Text>
        </Card>
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
  list: {
    marginTop: spacing.lg,
  },
  listCard: {
    marginBottom: spacing.md,
  },
  cardTitle: {
    ...typography.title,
  },
  cardMeta: {
    ...typography.body,
    color: colors.textMuted,
    marginTop: spacing.xs,
  },
});
