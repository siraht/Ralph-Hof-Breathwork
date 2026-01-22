import { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { SegmentedTabs, type TabOption } from '../components/SegmentedTabs';
import { Screen } from '../components/Screen';
import { BadgeTile } from '../components/BadgeTile';
import { colors, radius, spacing, typography } from '../theme';
import { breathDefaults, type BreathConfig } from '../logic/breathingConfig';
import { useBreathingStore, type SessionStartOptions } from '../state/breathingStore';
import { useSettingsStore } from '../state/settingsStore';
import type { HomeStackParamList } from '../navigation/types';

type BreathingSpeed = 'slow' | 'standard' | 'fast';

const SPEED_CONFIGS: Record<BreathingSpeed, { inhale: number; exhale: number }> = {
  slow: { inhale: 3, exhale: 3 },
  standard: { inhale: 2, exhale: 2 },
  fast: { inhale: 1, exhale: 1 },
};

const speedOptions: TabOption[] = [
  { label: 'Slow', value: 'slow' },
  { label: 'Standard', value: 'standard' },
  { label: 'Fast', value: 'fast' },
];

const BENEFITS = [
  'Enhanced focus and mental clarity',
  'Reduced stress and anxiety',
  'Increased energy and alertness',
  'Better sleep quality',
];

export function GuidedBreathingScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NativeStackNavigationProp<HomeStackParamList>>();
  const startSession = useBreathingStore((state) => state.startSession);

  const [speed, setSpeed] = useState<BreathingSpeed>('standard');
  const [breathsBeforeRetention, setBreathsBeforeRetention] = useState(breathDefaults.breaths);
  const [holdTime, setHoldTime] = useState(breathDefaults.holdSec);

  const handleStartSession = () => {
    const speedConfig = SPEED_CONFIGS[speed];
    const newConfig: SessionStartOptions = {
      rounds: breathDefaults.rounds,
      breaths: breathsBeforeRetention,
      holdSec: holdTime,
      recoverySec: breathDefaults.recoverySec,
      inhaleSec: speedConfig.inhale,
      exhaleSec: speedConfig.exhale,
      emptyHoldGoalSec: holdTime,
      recoveryHoldGoalSec: breathDefaults.recoverySec,
    };
    startSession(newConfig);
    navigation.navigate('BreathSession');
  };

  const adjustBreathCount = (delta: number) => {
    const newValue = breathsBeforeRetention + delta;
    if (newValue >= 10 && newValue <= 60) {
      setBreathsBeforeRetention(newValue);
    }
  };

  const adjustHoldTime = (delta: number) => {
    const newValue = holdTime + delta;
    if (newValue >= 0 && newValue <= 180) {
      setHoldTime(newValue);
    }
  };

  const formatTime = (seconds: number): string => {
    if (seconds === 0) return 'No hold';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    if (mins > 0) return `${mins}:${secs.toString().padStart(2, '0')}`;
    return `${secs}s`;
  };

  return (
    <Screen variant="default">
      <View style={[styles.header, { paddingTop: insets.top }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Feather name="arrow-left" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Guided Breathing</Text>
        <View style={styles.backButtonSpacer} />
      </View>

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Hero Card */}
        <Card style={styles.heroCard} tone="frost">
          <View style={styles.heroContent}>
            <View style={styles.avatarWrap}>
              <BadgeTile
                label=""
                color="teal"
                acquired={true}
                size="lg"
                subtext={undefined}
              />
            </View>
            <Text style={styles.heroTitle}>Breath & Hold</Text>
            <Text style={styles.heroSubtitle}>
              Master the Wim Hof breathing technique with guided sessions
            </Text>
          </View>
        </Card>

        {/* Speed Selection */}
        <Card>
          <Text style={styles.sectionTitle}>Breathing Speed</Text>
          <SegmentedTabs
            options={speedOptions}
            selectedValue={speed}
            onSelect={(val) => setSpeed(val as BreathingSpeed)}
            style={styles.speedTabs}
          />
          <Text style={styles.sectionHint}>
            {speed === 'slow' && 'Relaxed pace, ideal for beginners'}
            {speed === 'standard' && 'Classic Wim Hof method timing'}
            {speed === 'fast' && 'Quick cycles for advanced practitioners'}
          </Text>
        </Card>

        {/* Breath Count Stepper */}
        <Card>
          <Text style={styles.sectionLabel}>Breaths before retention</Text>
          <View style={styles.stepperRow}>
            <TouchableOpacity
              onPress={() => adjustBreathCount(-1)}
              style={styles.stepperButton}
              disabled={breathsBeforeRetention <= 10}
            >
              <Feather name="minus" size={20} color={breathsBeforeRetention > 10 ? colors.text : colors.border} />
            </TouchableOpacity>
            <View style={styles.stepperValue}>
              <Text style={styles.stepperNumber}>{breathsBeforeRetention}</Text>
              <Text style={styles.stepperUnit}>breaths</Text>
            </View>
            <TouchableOpacity
              onPress={() => adjustBreathCount(1)}
              style={styles.stepperButton}
              disabled={breathsBeforeRetention >= 60}
            >
              <Feather name="plus" size={20} color={breathsBeforeRetention < 60 ? colors.text : colors.border} />
            </TouchableOpacity>
          </View>
        </Card>

        {/* Hold Time Stepper */}
        <Card>
          <Text style={styles.sectionLabel}>Hold time</Text>
          <View style={styles.stepperRow}>
            <TouchableOpacity
              onPress={() => adjustHoldTime(-30)}
              style={styles.stepperButton}
              disabled={holdTime <= 0}
            >
              <Feather name="minus" size={20} color={holdTime > 0 ? colors.text : colors.border} />
            </TouchableOpacity>
            <View style={styles.stepperValue}>
              <Text style={styles.stepperNumber}>{formatTime(holdTime)}</Text>
            </View>
            <TouchableOpacity
              onPress={() => adjustHoldTime(30)}
              style={styles.stepperButton}
              disabled={holdTime >= 180}
            >
              <Feather name="plus" size={20} color={holdTime < 180 ? colors.text : colors.border} />
            </TouchableOpacity>
          </View>
        </Card>

        {/* Music Row */}
        <View style={styles.musicRow}>
          <View style={styles.musicInfo}>
            <Feather name="music" size={20} color={colors.textMuted} />
            <Text style={styles.musicLabel}>Background sound</Text>
          </View>
          <Button label="Change" variant="pill" size="sm" onPress={() => {}} />
        </View>

        {/* Benefits List */}
        <View style={styles.benefitsSection}>
          <Text style={styles.benefitsTitle}>Benefits</Text>
          {BENEFITS.map((benefit, index) => (
            <View key={index} style={styles.benefitItem}>
              <View style={styles.benefitCheck}>
                <Feather name="check" size={16} color={colors.teal} />
              </View>
              <Text style={styles.benefitText}>{benefit}</Text>
            </View>
          ))}
        </View>

        {/* Safety Notice */}
        <Card tone="frost" style={styles.safetyCard}>
          <Text style={styles.safetyTitle}>Safety First</Text>
          <Text style={styles.safetyText}>
            Never practice while driving or operating machinery. Always perform in a safe environment.
          </Text>
        </Card>

        <View style={{ height: insets.bottom + spacing.lg }} />
      </ScrollView>

      {/* Start Button */}
      <View style={[styles.bottomBar, { paddingBottom: insets.bottom + spacing.md }]}>
        <Button label="Start Session" onPress={handleStartSession} size="lg" />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.lg,
    paddingHorizontal: spacing.xs,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.frost,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backButtonSpacer: {
    width: 40,
  },
  headerTitle: {
    flex: 1,
    ...typography.title,
    textAlign: 'center',
  },
  scroll: {
    flex: 1,
  },
  heroCard: {
    marginBottom: spacing.lg,
    padding: spacing.lg,
  },
  heroContent: {
    alignItems: 'center',
  },
  avatarWrap: {
    marginBottom: spacing.md,
  },
  heroTitle: {
    ...typography.display,
    marginBottom: spacing.sm,
  },
  heroSubtitle: {
    ...typography.body,
    color: colors.textMuted,
    textAlign: 'center',
  },
  sectionTitle: {
    ...typography.title,
    marginBottom: spacing.md,
  },
  speedTabs: {
    marginBottom: spacing.md,
  },
  sectionHint: {
    ...typography.caption,
    color: colors.textMuted,
  },
  sectionLabel: {
    ...typography.body,
    fontFamily: 'SpaceGrotesk_500Medium',
    marginBottom: spacing.md,
  },
  stepperRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  stepperButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.frost,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepperValue: {
    alignItems: 'center',
    flex: 1,
  },
  stepperNumber: {
    ...typography.display,
    color: colors.deep,
  },
  stepperUnit: {
    ...typography.caption,
    color: colors.textMuted,
    marginTop: 2,
  },
  musicRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.xl,
    paddingHorizontal: spacing.md,
  },
  musicInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  musicLabel: {
    ...typography.body,
  },
  benefitsSection: {
    marginBottom: spacing.xl,
  },
  benefitsTitle: {
    ...typography.title,
    marginBottom: spacing.md,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  benefitCheck: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.frost,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  benefitText: {
    flex: 1,
    ...typography.body,
    color: colors.textMuted,
    paddingTop: 2,
  },
  safetyCard: {
    marginBottom: spacing.xl,
  },
  safetyTitle: {
    ...typography.title,
    marginBottom: spacing.xs,
    color: colors.ember,
  },
  safetyText: {
    ...typography.caption,
    color: colors.textMuted,
  },
  bottomBar: {
    backgroundColor: colors.frost,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingHorizontal: spacing.lg,
  },
});
