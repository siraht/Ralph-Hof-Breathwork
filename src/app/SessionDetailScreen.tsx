import { useEffect, useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { Screen } from '../components/Screen';
import { formatTimer } from '../logic/time';
import { useSessionStore } from '../state/sessionStore';
import { colors, spacing, typography } from '../theme';
import type { HistoryStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<HistoryStackParamList, 'SessionDetail'>;

export function SessionDetailScreen({ route, navigation }: Props) {
  const { sessionId } = route.params;
  const sessions = useSessionStore((state) => state.sessions);
  const loaded = useSessionStore((state) => state.loaded);
  const load = useSessionStore((state) => state.load);

  useEffect(() => {
    if (!loaded) {
      void load();
    }
  }, [load, loaded]);

  const session = useMemo(() => sessions.find((item) => item.id === sessionId), [sessions, sessionId]);

  if (!session) {
    return (
      <Screen>
        <Text style={styles.title}>Session details</Text>
        <Card style={styles.emptyCard}>
          <Text style={styles.sectionTitle}>Session not found</Text>
          <Text style={styles.sectionCopy}>We could not locate this entry. Return to history to refresh the list.</Text>
          <Button label="Back to History" onPress={() => navigation.goBack()} variant="ghost" style={styles.emptyAction} />
        </Card>
      </Screen>
    );
  }

  const endedAt = new Date(session.endedAt);
  const dateLabel = endedAt.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
  const timeLabel = endedAt.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  const sessionTitle = session.type === 'breathwork' ? 'Breathwork' : 'Cold exposure';
  const durationLabel = formatTimer(session.durationSec);
  const statusLabel = session.completed ? 'Completed' : 'Stopped early';

  const roundsCompleted = session.roundsCompleted ?? 0;
  const longestHold = session.stats ? formatTimer(session.stats.longestHoldSec) : '--:--';
  const config = session.config;
  const cadenceLabel = config ? `${config.inhaleSec}s inhale / ${config.exhaleSec}s exhale` : '--';

  const ratingLabel = session.rating ? `${session.rating} / 5` : 'Not rated';
  const noteText = session.notes && session.notes.trim().length > 0 ? session.notes.trim() : 'No notes added.';

  return (
    <Screen>
      <Text style={styles.title}>{`${sessionTitle} session`}</Text>
      <Text style={styles.subtitle}>{`${dateLabel} | ${timeLabel}`}</Text>

      <View style={styles.grid}>
        <Card style={[styles.gridCard, styles.gridCardLeft]}>
          <Text style={styles.gridLabel}>Duration</Text>
          <Text style={styles.gridValue}>{durationLabel}</Text>
        </Card>
        <Card style={styles.gridCard} tone="mist">
          <Text style={styles.gridLabel}>Status</Text>
          <Text style={styles.gridValue}>{statusLabel}</Text>
        </Card>
      </View>

      {session.type === 'breathwork' ? (
        <>
          <View style={styles.grid}>
            <Card style={[styles.gridCard, styles.gridCardLeft]}>
              <Text style={styles.gridLabel}>Rounds</Text>
              <Text style={styles.gridValue}>{roundsCompleted}</Text>
            </Card>
            <Card style={styles.gridCard} tone="mist">
              <Text style={styles.gridLabel}>Longest hold</Text>
              <Text style={styles.gridValue}>{longestHold}</Text>
            </Card>
          </View>

          <Card style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Breathing setup</Text>
            {config ? (
              <>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Breaths per round</Text>
                  <Text style={styles.detailValue}>{config.breaths}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Rounds planned</Text>
                  <Text style={styles.detailValue}>{config.rounds}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Hold</Text>
                  <Text style={styles.detailValue}>{formatTimer(config.holdSec)}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Recovery</Text>
                  <Text style={styles.detailValue}>{formatTimer(config.recoverySec)}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Cadence</Text>
                  <Text style={styles.detailValue}>{cadenceLabel}</Text>
                </View>
              </>
            ) : (
              <Text style={styles.sectionCopy}>No breathing configuration was saved for this session.</Text>
            )}
          </Card>
        </>
      ) : (
        <Card style={styles.sectionCard} tone="mist">
          <Text style={styles.sectionTitle}>Cold exposure</Text>
          <Text style={styles.sectionCopy}>Keep building tolerance with consistent, safe exposure.</Text>
        </Card>
      )}

      {session.type === 'breathwork' ? (
        <Card style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Reflection</Text>
          <Text style={styles.detailLabel}>Rating</Text>
          <Text style={styles.detailValue}>{ratingLabel}</Text>
          <View style={styles.ratingRow}>
            {[1, 2, 3, 4, 5].map((value) => (
              <View key={value} style={[styles.ratingDot, session.rating && value <= session.rating ? styles.ratingDotActive : null]}>
                <Text style={styles.ratingText}>{value}</Text>
              </View>
            ))}
          </View>
          <Text style={styles.detailLabel}>Notes</Text>
          <Text style={styles.sectionCopy}>{noteText}</Text>
        </Card>
      ) : null}

      <View style={styles.actions}>
        <Button label="Back to History" onPress={() => navigation.goBack()} variant="ghost" />
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
  sectionCard: {
    marginTop: spacing.lg,
  },
  sectionTitle: {
    ...typography.title,
  },
  sectionCopy: {
    ...typography.body,
    color: colors.textMuted,
    marginTop: spacing.xs,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.sm,
  },
  detailLabel: {
    ...typography.caption,
    color: colors.textMuted,
  },
  detailValue: {
    ...typography.body,
  },
  ratingRow: {
    flexDirection: 'row',
    marginTop: spacing.sm,
    marginBottom: spacing.md,
  },
  ratingDot: {
    width: 28,
    height: 28,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.stroke,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.xs,
    backgroundColor: colors.cloud,
  },
  ratingDotActive: {
    borderColor: colors.deep,
    backgroundColor: colors.mist,
  },
  ratingText: {
    ...typography.caption,
    color: colors.textMuted,
  },
  actions: {
    marginTop: spacing.xl,
  },
  emptyCard: {
    marginTop: spacing.lg,
  },
  emptyAction: {
    marginTop: spacing.md,
  },
});
