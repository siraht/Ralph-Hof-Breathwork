import type { ReactNode } from 'react';
import { StyleSheet, View, Text, Pressable, type ViewStyle } from 'react-native';

import { colors, spacing, typography } from '../theme';

export interface TabOption {
  label: string;
  value: string;
  icon?: ReactNode;
}

type SegmentedTabsProps = {
  options: TabOption[];
  selectedValue: string;
  onSelect: (value: string) => void;
  style?: ViewStyle;
};

export function SegmentedTabs({ options, selectedValue, onSelect, style }: SegmentedTabsProps) {
  const selectedIndex = options.findIndex(opt => opt.value === selectedValue);

  return (
    <View style={[styles.container, style]}>
      {options.map((option, index) => (
        <Pressable
          key={option.value}
          onPress={() => onSelect(option.value)}
          style={({ pressed }) => [
            styles.tab,
            pressed && styles.pressed,
            index === selectedIndex && styles.tabSelected,
          ]}
          accessibilityRole="tab"
          accessibilityState={{ selected: index === selectedIndex }}
          accessibilityLabel={option.label}
        >
          <View style={styles.tabContent}>
            {option.icon}
            <Text
              style={[
                styles.tabLabel,
                index === selectedIndex && styles.tabLabelSelected,
              ]}
            >
              {option.label}
            </Text>
          </View>
          {index === selectedIndex && <View style={styles.indicator} />}
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: colors.frost,
    borderRadius: 16,
    padding: 4,
    gap: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  tabSelected: {
    backgroundColor: colors.cloud,
  },
  pressed: {
    opacity: 0.7,
  },
  tabContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  tabLabel: {
    ...typography.caption,
    fontFamily: 'SpaceGrotesk_500Medium',
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  tabLabelSelected: {
    color: colors.deep,
  },
  indicator: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: colors.seafoam,
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
  },
});
