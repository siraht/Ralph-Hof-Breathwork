import { useEffect } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useIsFocused } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { Card } from '../components/Card';
import { Screen } from '../components/Screen';
import { formatTimer } from '../logic/time';
import { useSessionStore } from '../state/sessionStore';
import { colors, spacing, typography } from '../theme';
import type { HistoryStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<HistoryStackParamList, 'History'>;

export function HistoryScreen({ navigation }: Props) {
  const isFocused = useIsFocused();
  const sessions = useSessionStore((state) => state.sessions);
  const stats = useSessionStore((state) => state.stats);
  const loaded = useSessionStore((state) => state.loaded);
  const load = useSessionStore((state) => state.load);

  useEffect(() => {
    if (!loaded) {
      void load();
    }
  }, [load, loaded]);

  useEffect(() => {
    if (isFocused) {
      void load();
    }
  }, [isFocused, load]);

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  const formatTime = (iso: string) =>
    new Date(iso).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });

  return (
    <Screen>
      <Text style={styles.title}>History</Text>
      <Text style={styles.subtitle}>Track your sessions and keep your momentum.</Text>
      <Text style={styles.helper}>Tap a session to see the details.</Text>

      <View style={styles.grid}>
        <Card style={[styles.gridCard, styles.gridCardLeft]}>
          <Text style={styles.gridLabel}>Current streak</Text>
          <Text style={styles.gridValue}>{`${stats.currentStreak} days`}</Text>
        </Card>
        <Card style={styles.gridCard} tone="mist">
          <Text style={styles.gridLabel}>Sessions logged</Text>
          <Text style={styles.gridValue}>{stats.totalSessions}</Text>
        </Card>
      </View>

      <View style={styles.list}>
        {sessions.length === 0 ? (
          <Card style={styles.listCard}>
            <Text style={styles.cardTitle}>No sessions yet</Text>
            <Text style={styles.cardMeta}>Start a breathwork or cold exposure timer to log your first entry.</Text>
          </Card>
        ) : (
          sessions.map((session) => {
            const sessionTitle = session.type === 'breathwork' ? 'Breathwork' : 'Cold exposure';
            const durationLabel = formatTimer(session.durationSec);
            const meta = `${formatDate(session.endedAt)} · ${formatTime(session.endedAt)} · ${durationLabel}`;
            const rounds = session.roundsCompleted ? ` · ${session.roundsCompleted} rounds` : '';
            return (
              <Pressable
                key={session.id}
                onPress={() => navigation.navigate('SessionDetail', { sessionId: session.id })}
                style={({ pressed }) => pressed ? [styles.listButton, styles.listButtonPressed] : styles.listButton}
                accessibilityRole="button"
                accessibilityLabel={`${sessionTitle} session details`}
              >
                <Card style={styles.listCard} tone={session.type === 'cold' ? 'mist' : 'light'}>
                  <Text style={styles.cardTitle}>{sessionTitle}</Text>
                  <Text style={styles.cardMeta}>{meta}</Text>
                  {session.type === 'breathwork' ? <Text style={styles.cardMeta}>{`Breathing${rounds}`}</Text> : null}
                </Card>
              </Pressable>
            );
          })
        )}
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
  helper: {
    ...typography.caption,
    color: colors.textMuted,
    marginTop: spacing.xs,
  },
  list: {
    marginTop: spacing.lg,
  },
  grid: {
    flexDirection: 'row',
    marginTop: spacing.lg,
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
  listCard: {
    marginBottom: spacing.md,
  },
  listButton: {},
  listButtonPressed: {
    opacity: 0.82,
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
