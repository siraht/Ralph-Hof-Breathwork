import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { Screen } from '../components/Screen';
import { formatTimer } from '../logic/time';
import { useBreathingStore } from '../state/breathingStore';
import { useSessionStore } from '../state/sessionStore';
import { colors, spacing, typography } from '../theme';
import type { HomeStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<HomeStackParamList, 'SessionSummary'>;

export function SessionSummaryScreen({ navigation }: Props) {
  const result = useBreathingStore((state) => state.result);
  const resetSession = useBreathingStore((state) => state.reset);
  const addBreathSession = useSessionStore((state) => state.addBreathSession);
  const [rating, setRating] = useState<number | null>(null);
  const [note, setNote] = useState('');

  const canSave = Boolean(result);
  const totalTime = result ? formatTimer(result.stats.totalDurationSec) : '--:--';
  const longestHold = result ? formatTimer(result.stats.longestHoldSec) : '--:--';
  const completionCopy = result ? (result.completed ? 'Session complete' : 'Stopped early') : 'Complete a session to see stats.';
  const roundsCompleted = result ? `${result.stats.roundsCompleted} rounds` : '-- rounds';

  useEffect(() => {
    setRating(null);
    setNote('');
  }, [result?.startedAt]);

  const handleSave = async () => {
    if (!result) {
      return;
    }
    const trimmedNote = note.trim();
    await addBreathSession(result, rating, trimmedNote.length > 0 ? trimmedNote : null);
    resetSession();
    navigation.navigate('History');
  };

  return (
    <Screen>
      <Text style={styles.title}>Session summary</Text>
      <Text style={styles.subtitle}>{completionCopy}</Text>

      <View style={styles.grid}>
        <Card style={[styles.gridCard, styles.gridCardLeft]}>
          <Text style={styles.gridLabel}>Total time</Text>
          <Text style={styles.gridValue}>{totalTime}</Text>
        </Card>
        <Card style={styles.gridCard} tone="mist">
          <Text style={styles.gridLabel}>Longest hold</Text>
          <Text style={styles.gridValue}>{longestHold}</Text>
        </Card>
      </View>

      <Card>
        <Text style={styles.noteTitle}>Reflection</Text>
        <Text style={styles.noteCopy}>{`Completed ${roundsCompleted}. Rate the session and add a note.`}</Text>
        <View style={styles.ratingRow}>
          {[1, 2, 3, 4, 5].map((value) => {
            const isActive = rating === value;
            return (
              <Pressable
                key={value}
                onPress={() => setRating(value)}
                style={[styles.ratingDot, isActive && styles.ratingDotActive]}
              >
                <Text style={[styles.ratingText, isActive && styles.ratingTextActive]}>{value}</Text>
              </Pressable>
            );
          })}
        </View>
        <TextInput
          placeholder="Add a short note (optional)"
          placeholderTextColor={colors.textMuted}
          style={styles.noteInput}
          value={note}
          onChangeText={setNote}
          multiline
        />
      </Card>

      <View style={styles.actions}>
        <Button label="Save Session" onPress={handleSave} disabled={!canSave} />
        <Button
          label="Back Home"
          onPress={() => {
            resetSession();
            navigation.navigate('Home');
          }}
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
  ratingRow: {
    flexDirection: 'row',
    marginTop: spacing.md,
  },
  ratingDot: {
    width: 34,
    height: 34,
    borderRadius: 12,
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
    ...typography.body,
    color: colors.textMuted,
  },
  ratingTextActive: {
    color: colors.deep,
  },
  noteInput: {
    ...typography.body,
    marginTop: spacing.md,
    minHeight: 88,
    padding: spacing.sm,
    borderWidth: 1,
    borderColor: colors.stroke,
    borderRadius: 12,
    backgroundColor: colors.cloud,
    textAlignVertical: 'top',
    color: colors.text,
  },
  actions: {
    marginTop: spacing.xl,
  },
  secondary: {
    marginTop: spacing.sm,
  },
});
