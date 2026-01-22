import type { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View, type TextStyle, type ViewStyle } from 'react-native';

import { colors, radius, spacing, typography } from '../theme';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'pill';

type ButtonProps = {
  label: string;
  onPress: () => void;
  variant?: ButtonVariant;
  icon?: ReactNode;
  style?: ViewStyle;
  textStyle?: TextStyle;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
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
  pill: {
    container: {
      backgroundColor: 'transparent',
      borderColor: colors.borderSoft,
      borderRadius: radius.pill,
    },
    text: {
      color: colors.textMuted,
    },
  },
};

const sizeStyles = {
  sm: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
  },
  md: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
  },
  lg: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
  },
};

export function Button({
  label,
  onPress,
  variant = 'primary',
  icon,
  style,
  textStyle,
  disabled,
  size = 'md',
}: ButtonProps) {
  const baseStyle = variant === 'pill' ? styles.pillBase : styles.base;

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        baseStyle,
        sizeStyles[size],
        variants[variant].container,
        pressed && styles.pressed,
        disabled && styles.disabled,
        style,
      ]}
    >
      <View style={styles.row}>
        {icon ? <View style={styles.icon}>{icon}</View> : null}
        <Text style={[styles.label, variants[variant].text, disabled && styles.disabledText, textStyle]}>
          {label}
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: radius.lg,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pillBase: {
    borderRadius: radius.pill,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: {
    opacity: 0.85,
    transform: [{ scale: 0.98 }],
  },
  disabled: {
    opacity: 0.5,
  },
  disabledText: {
    color: colors.textMuted,
  },
  label: {
    fontFamily: 'SpaceGrotesk_500Medium',
    fontSize: 14,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    marginRight: spacing.xs,
  },
});
