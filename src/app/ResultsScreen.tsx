import { useEffect, useState } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Card } from '../components/Card';
import { SegmentedTabs, type TabOption } from '../components/SegmentedTabs';
import { BadgeTile } from '../components/BadgeTile';
import { Screen } from '../components/Screen';
import { colors, spacing, typography } from '../theme';
import { useSessionStore } from '../state/sessionStore';

type ResultsTab = 'chart' | 'calendar' | 'badges';

const tabOptions: TabOption[] = [
  { label: 'Chart', value: 'chart' },
  { label: 'Calendar', value: 'calendar' },
  { label: 'Badges', value: 'badges' },
];

// Mock badge data for the UI
const BADGE_CATEGORIES = {
  Streaks: [
    { label: 'First Week', color: 'gold' as const, acquired: true },
    { label: '30 Day Streak', color: 'coral' as const, acquired: true },
    { label: '100 Day Streak', color: 'lime' as const, acquired: false, locked: true },
    { label: '365 Day Legend', color: 'purple' as const, acquired: false, locked: true },
  ],
  'Breathing Exercise': [
    { label: 'Beginner', color: 'blue' as const, acquired: true },
    { label: '10 Rounds', color: 'gold' as const, acquired: true },
    { label: 'Deep Holder', color: 'coral' as const, acquired: false, locked: true },
    { label: 'Master Breather', color: 'purple' as const, acquired: false, locked: true },
  ],
  'Breathing Accumulation': [
    { label: '100 Breaths', color: 'lime' as const, acquired: true },
    { label: '1K Breaths', color: 'gold' as const, acquired: false, locked: true },
    { label: '10K Breaths', color: 'coral' as const, acquired: false, locked: true },
  ],
};

function pad(value: number): string {
  return value.toString().padStart(2, '0');
}

function getDaysInMonth(year: number, month: number): number[] {
  const days = new Date(year, month + 1, 0).getDate();
  return Array.from({ length: days }, (_, i) => i + 1);
}

export function ResultsScreen({ navigation }: any) {
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState<ResultsTab>('chart');
  const { sessions, stats, load } = useSessionStore();

  useEffect(() => {
    load();
  }, [load]);

  // Get days with sessions for the calendar
  const now = new Date();
  const [currentYear, currentMonth] = [now.getFullYear(), now.getMonth()];
  const daysInMonth = getDaysInMonth(currentYear, currentMonth);
  const completedDays = sessions
    .filter(s => {
      const d = new Date(s.endedAt);
      return d.getFullYear() === currentYear && d.getMonth() === currentMonth;
    })
    .map(s => new Date(s.endedAt).getDate());

  const renderChartView = () => (
    <View style={styles.tabContent}>
      {/* Small metric strip */}
      <Card style={styles.metricsRow}>
        <View style={styles.metric}>
          <Text style={styles.metricValue}>{stats.breathworkSessions}</Text>
          <Text style={styles.metricLabel}>Breathing</Text>
        </View>
        <View style={styles.metricDivider} />
        <View style={styles.metric}>
          <Text style={styles.metricValue}>{stats.coldSessions}</Text>
          <Text style={styles.metricLabel}>Cold Showers</Text>
        </View>
        <View style={styles.metricDivider} />
        <View style={styles.metric}>
          <Text style={styles.metricValue}>{stats.currentStreak}</Text>
          <Text style={styles.metricLabel}>Streak</Text>
        </View>
      </Card>

      {/* Total time cards - mock data */}
      <View style={styles.grid}>
        <Card>
          <Text style={styles.cardTitle}>Total Time</Text>
          <Text style={styles.cardValue}>2h 15m</Text>
        </Card>
        <Card tone="frost">
          <Text style={styles.cardTitle}>This Week</Text>
          <Text style={styles.cardValue}>45m</Text>
        </Card>
      </View>

      {/* Chart card - mock bar chart */}
      <Card style={styles.chartCard}>
        <Text style={styles.chartTitle}>Weekly Activity</Text>
        <View style={styles.chartBars}>
          {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, i) => (
            <View key={day} style={styles.chartBarWrap}>
              <View
                style={[
                  styles.chartBar,
                  { height: [40, 60, 30, 80, 50, 90, 45][i] },
                ]}
              />
              <Text style={styles.chartBarLabel}>{day}</Text>
            </View>
          ))}
        </View>
      </Card>
    </View>
  );

  const renderCalendarView = () => (
    <View style={styles.tabContent}>
      {/* Month selector */}
      <View style={styles.monthRow}>
        <TouchableOpacity style={styles.monthNav}>
          <Text style={styles.monthNavText}>&lt;</Text>
        </TouchableOpacity>
        <Text style={styles.monthTitle}>
          {new Date(currentYear, currentMonth).toLocaleDateString('en-US', {
            month: 'long',
            year: 'numeric',
          })}
        </Text>
        <TouchableOpacity style={styles.monthNav}>
          <Text style={styles.monthNavText}>&gt;</Text>
        </TouchableOpacity>
      </View>

      {/* Calendar grid */}
      <Card style={styles.calendarGrid}>
        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(day => (
          <Text key={day} style={styles.dayHeader}>{day}</Text>
        ))}
        {daysInMonth.map(day => {
          const isCompleted = completedDays.includes(day);
          const isToday = day === now.getDate();
          const dayOfWeek = new Date(currentYear, currentMonth, day).getDay();
          // Grid positioning
          const firstDayOffset = new Date(currentYear, currentMonth, 1).getDay();
          const gridPosition = firstDayOffset + day - 1;

          return (
            <View
              key={day}
              style={[
                styles.dayCell,
                gridPosition % 7 === 0 && styles.dayCellLast,
              ]}
            >
              <Text
                style={[
                  styles.dayNumber,
                  isToday && styles.dayNumberToday,
                ]}
              >
                {day}
              </Text>
              {isCompleted && <View style={styles.dayDot} />}
            </View>
          );
        })}
      </Card>

      {/* Breathing basics card */}
      <Card tone="frost">
        <Text style={styles.cardTitle}>Breathing Basics</Text>
        <View style={styles.basicsRow}>
          <View style={styles.basicItem}>
            <Text style={styles.basicValue}>{stats.currentStreak}</Text>
            <Text style={styles.basicLabel}>Avg Streak</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.basicItem}>
            <Text style={styles.basicValue}>3m</Text>
            <Text style={styles.basicLabel}>Longest Hold</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.logPill}>
          <Text style={styles.logPillText}>Log Exercise</Text>
        </TouchableOpacity>
      </Card>
    </View>
  );

  const renderBadgesView = () => (
    <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
      {Object.entries(BADGE_CATEGORIES).map(([category, badges]) => (
        <View key={category} style={styles.badgeSection}>
          <Text style={styles.badgeSectionTitle}>{category}</Text>
          <View style={styles.badgeGrid}>
            {badges.map((badge, index) => (
              <BadgeTile
                key={index}
                label={badge.label}
                color={badge.color}
                acquired={badge.acquired}
                locked={badge.locked}
                size="md"
              />
            ))}
          </View>
        </View>
      ))}
      <View style={{ height: insets.bottom + spacing.lg }} />
    </ScrollView>
  );

  return (
    <Screen variant="default">
      <View style={styles.header}>
        <Text style={styles.kicker}>Your Progress</Text>
        <Text style={styles.title}>Results</Text>
      </View>

      <SegmentedTabs
        options={tabOptions}
        selectedValue={activeTab}
        onSelect={(val) => setActiveTab(val as ResultsTab)}
      />

      {activeTab === 'chart' && renderChartView()}
      {activeTab === 'calendar' && renderCalendarView()}
      {activeTab === 'badges' && renderBadgesView()}
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    marginBottom: spacing.lg,
  },
  kicker: {
    ...typography.caption,
    fontFamily: 'SpaceGrotesk_600SemiBold',
    color: colors.seafoam,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    marginBottom: spacing.xs,
  },
  title: {
    ...typography.display,
    color: colors.text,
  },
  tabContent: {
    flex: 1,
  },
  metricsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
  },
  metric: {
    flex: 1,
    alignItems: 'center',
  },
  metricValue: {
    ...typography.title,
    color: colors.deep,
  },
  metricLabel: {
    ...typography.caption,
    color: colors.textMuted,
    marginTop: 4,
  },
  metricDivider: {
    width: 1,
    height: 32,
    backgroundColor: colors.border,
  },
  grid: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  gridItem: {
    flex: 1,
  },
  cardTitle: {
    ...typography.caption,
    color: colors.textMuted,
    marginBottom: spacing.xs,
  },
  cardValue: {
    ...typography.title,
    color: colors.deep,
  },
  chartCard: {
    padding: spacing.lg,
  },
  chartTitle: {
    ...typography.title,
    color: colors.text,
    marginBottom: spacing.lg,
  },
  chartBars: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
    height: 120,
  },
  chartBarWrap: {
    alignItems: 'center',
    gap: spacing.xs,
  },
  chartBar: {
    width: 20,
    backgroundColor: colors.seafoam,
    borderRadius: 8,
  },
  chartBarLabel: {
    ...typography.caption,
    color: colors.textMuted,
  },
  monthRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
  },
  monthTitle: {
    ...typography.title,
    color: colors.text,
  },
  monthNav: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.frost,
    alignItems: 'center',
    justifyContent: 'center',
  },
  monthNavText: {
    ...typography.title,
    color: colors.textMuted,
  },
  calendarGrid: {
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  dayHeader: {
    ...typography.caption,
    color: colors.textMuted,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  dayCell: {
    width: '14.28%',
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xs,
  },
  dayCellLast: {
    marginRight: 0,
  },
  dayNumber: {
    ...typography.caption,
    fontFamily: 'SpaceGrotesk_500Medium',
    color: colors.text,
  },
  dayNumberToday: {
    color: colors.seafoam,
    fontFamily: 'SpaceGrotesk_600SemiBold',
  },
  dayDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.teal,
    marginTop: 2,
  },
  basicsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.md,
    marginBottom: spacing.lg,
  },
  basicItem: {
    flex: 1,
    alignItems: 'center',
  },
  basicValue: {
    ...typography.title,
    color: colors.deep,
  },
  basicLabel: {
    ...typography.caption,
    color: colors.textMuted,
    marginTop: 4,
  },
  divider: {
    width: 1,
    height: 32,
    backgroundColor: colors.border,
  },
  logPill: {
    alignSelf: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: 999,
    backgroundColor: colors.frost,
    borderWidth: 1,
    borderColor: colors.borderSoft,
  },
  logPillText: {
    ...typography.body,
    fontFamily: 'SpaceGrotesk_500Medium',
    color: colors.textMuted,
  },
  badgeSection: {
    marginBottom: spacing.xl,
  },
  badgeSectionTitle: {
    ...typography.caption,
    fontFamily: 'SpaceGrotesk_600SemiBold',
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: spacing.md,
  },
  badgeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.lg,
  },
});
