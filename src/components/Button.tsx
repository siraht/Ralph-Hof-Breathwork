import type { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View, type TextStyle, type ViewStyle } from 'react-native';

import { colors, radius, spacing, typography } from '../theme';

type ButtonVariant = 'primary' | 'secondary' | 'ghost';

type ButtonProps = {
  label: string;
  onPress: () => void;
  variant?: ButtonVariant;
  icon?: ReactNode;
  style?: ViewStyle;
  textStyle?: TextStyle;
};

const variants: Record<ButtonVariant, { container: ViewStyle; text: TextStyle }> = {
  primary: {
    container: {
      backgroundColor: colors.deep,
      borderColor: colors.deep,
    },
    text: {
      color: colors.cloud,
    },
  },
  secondary: {
    container: {
      backgroundColor: colors.glacier,
      borderColor: colors.glacier,
    },
    text: {
      color: colors.deep,
    },
  },
  ghost: {
    container: {
      backgroundColor: 'transparent',
      borderColor: colors.deep,
    },
    text: {
      color: colors.deep,
    },
  },
};

export function Button({ label, onPress, variant = 'primary', icon, style, textStyle }: ButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.base,
        variants[variant].container,
        pressed && styles.pressed,
        style,
      ]}
    >
      <View style={styles.row}>
        {icon ? <View style={styles.icon}>{icon}</View> : null}
        <Text style={[styles.label, variants[variant].text, textStyle]}>{label}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: radius.lg,
    borderWidth: 1,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: {
    opacity: 0.85,
    transform: [{ scale: 0.98 }],
  },
  label: {
    ...typography.title,
    fontSize: 16,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    marginRight: spacing.xs,
  },
});
