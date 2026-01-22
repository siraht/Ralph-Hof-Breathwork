import type { ReactNode } from 'react';
import { StyleSheet, View, type ViewStyle } from 'react-native';

import { colors, radius, shadow, spacing } from '../theme';

type CardProps = {
  children: ReactNode;
  style?: ViewStyle | ViewStyle[];
  tone?: 'light' | 'mist' | 'deep' | 'frost';
};

const toneStyles: Record<NonNullable<CardProps['tone']>, ViewStyle> = {
  light: {
    backgroundColor: colors.cloud,
  },
  mist: {
    backgroundColor: colors.mist,
  },
  deep: {
    backgroundColor: colors.deep,
  },
  frost: {
    backgroundColor: colors.frost,
  },
};

export function Card({ children, style, tone = 'light' }: CardProps) {
  return (
    <View style={[styles.card, toneStyles[tone], style]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadow.subtle,
  },
});
