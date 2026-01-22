import type { ReactNode } from 'react';
import { StyleSheet, View, type ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView, type Edge } from 'react-native-safe-area-context';

import { colors, screenGradient, spacing } from '../theme';

type ScreenProps = {
  children: ReactNode;
  style?: ViewStyle;
  edges?: Edge[];
  variant?: 'default' | 'mist' | 'deep' | 'warm';
};

export function Screen({ children, style, edges = ['top', 'bottom'], variant = 'default' }: ScreenProps) {
  return (
    <LinearGradient colors={screenGradient[variant] as any} style={styles.gradient}>
      <SafeAreaView edges={edges} style={[styles.safe, style]}>
        <View style={styles.content}>{children}</View>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  safe: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: spacing.md + 4, // 20px to align with existing spacing
  },
});
