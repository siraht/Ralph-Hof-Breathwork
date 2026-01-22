import type { ReactNode } from 'react';
import { StyleSheet, View, Text, type ViewStyle } from 'react-native';
import { Svg, Path } from 'react-native-svg';

import { colors, radius, spacing, typography } from '../theme';

export type BadgeColor =
  | 'gold'
  | 'coral'
  | 'lime'
  | 'purple'
  | 'blue'
  | 'gray'
  | 'teal';

type BadgeTileProps = {
  label: string;
  acquired?: boolean;
  locked?: boolean;
  color?: BadgeColor;
  size?: 'sm' | 'md' | 'lg';
  icon?: ReactNode;
  subtext?: string;
  style?: ViewStyle;
};

const colorMap: Record<BadgeColor, string> = {
  gold: colors.badgeGold,
  coral: colors.badgeCoral,
  lime: colors.badgeLime,
  purple: colors.badgePurple,
  blue: colors.badgeBlue,
  gray: colors.borderSoft,
  teal: colors.teal,
};

const sizeMap = {
  sm: 56,
  md: 80,
  lg: 104,
};

// Hexagon path generator
function getHexPath(size: number): string {
  const r = size / 2;
  const points: [number, number][] = [
    [r, 0],
    [size - r * 0.577, r * 0.5],
    [size - r * 0.577, size - r * 0.5],
    [r, size],
    [r * 0.577, size - r * 0.5],
    [r * 0.577, r * 0.5],
  ];
  return `M${points.map(p => p.join(',')).join(' L')} Z`;
}

export function BadgeTile({
  label,
  acquired = false,
  locked = false,
  color = 'gold',
  size = 'md',
  icon,
  subtext,
  style,
}: BadgeTileProps) {
  const badgeSize = sizeMap[size];
  const bgColor = locked ? colors.borderSoft : (acquired ? colorMap[color] : colors.borderSoft);
  const opacity = locked || !acquired ? 0.5 : 1;

  return (
    <View style={[styles.container, style]}>
      <View style={[styles.hexWrap, { width: badgeSize, height: badgeSize }]}>
        <Svg width={badgeSize} height={badgeSize} style={{ opacity }}>
          <Path
            d={getHexPath(badgeSize)}
            fill={bgColor}
            stroke={locked ? colors.border : colors.cloud}
            strokeWidth={locked ? 1 : 2}
          />
        </Svg>
        {icon && !locked && (
          <View style={[styles.iconWrap, { opacity }]}>
            {icon}
          </View>
        )}
        {locked && (
          <View style={styles.lockedOverlay}>
            <Text style={styles.lockIcon}>🔒</Text>
          </View>
        )}
      </View>
      <View style={styles.labelWrap}>
        <Text style={[styles.label, !acquired && styles.labelMuted]} numberOfLines={1}>
          {label}
        </Text>
        {subtext && (
          <Text style={styles.subtext} numberOfLines={1}>
            {subtext}
          </Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  hexWrap: {
    position: 'relative',
  },
  iconWrap: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  lockedOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  lockIcon: {
    fontSize: 16,
  },
  labelWrap: {
    marginTop: spacing.xs,
    alignItems: 'center',
  },
  label: {
    ...typography.caption,
    fontFamily: 'SpaceGrotesk_500Medium',
    color: colors.text,
    textAlign: 'center',
  },
  labelMuted: {
    color: colors.textMuted,
  },
  subtext: {
    ...typography.caption,
    fontSize: 11,
    color: colors.textMuted,
    textAlign: 'center',
  },
});
