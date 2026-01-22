import { DefaultTheme, type Theme } from '@react-navigation/native';

export const colors = {
  // Base colors from original design
  night: '#102027',
  deep: '#0E3C4A',
  glacier: '#7BC6C9',
  ember: '#F07A4C',
  sun: '#FFD59C',
  mist: '#E6F1F3',
  sand: '#F6F2EA',
  cloud: '#FFFFFF',
  text: '#102027',
  textMuted: '#42545C',
  stroke: '#D6E0E4',
  overlay: 'rgba(16, 32, 39, 0.08)',

  // NEW: UI Refresh colors for airy, low-contrast aesthetic
  seafoam: '#94D0C9',    // Soft teal-green for accents
  teal: '#5BA8A0',       // Muted teal for secondary actions
  frost: '#F5FAFA',     // Very light teal-tinted white
  border: '#EDF2F2',    // Ultra-subtle border
  borderSoft: '#F0F4F4', // Even softer border for subtle elements
  badgeGold: '#F5D598',
  badgeCoral: '#F49B7A',
  badgeLime: '#B8E098',
  badgePurple: '#C4A7E3',
  badgeBlue: '#8FC7EB',
};

export const spacing = {
  xs: 8,
  sm: 12,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 40,
};

export const radius = {
  sm: 12,
  md: 20,  // Increased from 18
  lg: 28,
  xl: 36,
  pill: 999, // NEW: Pill radius for buttons and controls
};

export const shadow = {
  // NEW: Subtle shadow for airy feel - reduced opacity
  subtle: {
    shadowColor: '#0B1F27',
    shadowOpacity: 0.04, // Reduced from 0.08
    shadowRadius: 8,     // Reduced from 12
    shadowOffset: { width: 0, height: 2 }, // Reduced from 6
    elevation: 2,        // Reduced from 4
  },
  // Keep original for backward compatibility
  soft: {
    shadowColor: '#0B1F27',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },
};

// NEW: Screen gradient presets for airy looks
export const screenGradient = {
  default: ['#FFFFFF', '#F5FAFA'], // White to frost
  mist: ['#F5FAFA', '#EDF2F2'],    // Frost to light border
  deep: ['#1B3944', '#0E2D37'],    // Original dark for sessions
  warm: ['#F6F2EA', '#E6F1F3'],    // Original warm tone for legacy
};

const baseTypography = {
  display: {
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 36,
    lineHeight: 40,
    letterSpacing: -0.6,
  },
  title: {
    fontFamily: 'SpaceGrotesk_600SemiBold',
    fontSize: 22,
    lineHeight: 28,
    letterSpacing: -0.2,
  },
  body: {
    fontFamily: 'SpaceGrotesk_400Regular',
    fontSize: 16,
    lineHeight: 22,
  },
  caption: {
    fontFamily: 'SpaceGrotesk_400Regular',
    fontSize: 13,
    lineHeight: 18,
  },
  mono: {
    fontFamily: 'SpaceMono_400Regular',
    fontSize: 20,
    lineHeight: 24,
  },
};

export const typography = baseTypography;

/**
 * Get typography with font scale applied.
 * Use this to dynamically scale fonts based on user accessibility settings.
 */
export function getScaledTypography(fontScale: number) {
  return {
    display: {
      ...baseTypography.display,
      fontSize: baseTypography.display.fontSize * fontScale,
      lineHeight: baseTypography.display.lineHeight * fontScale,
    },
    title: {
      ...baseTypography.title,
      fontSize: baseTypography.title.fontSize * fontScale,
      lineHeight: baseTypography.title.lineHeight * fontScale,
    },
    body: {
      ...baseTypography.body,
      fontSize: baseTypography.body.fontSize * fontScale,
      lineHeight: baseTypography.body.lineHeight * fontScale,
    },
    caption: {
      ...baseTypography.caption,
      fontSize: baseTypography.caption.fontSize * fontScale,
      lineHeight: baseTypography.caption.lineHeight * fontScale,
    },
    mono: {
      ...baseTypography.mono,
      fontSize: baseTypography.mono.fontSize * fontScale,
      lineHeight: baseTypography.mono.lineHeight * fontScale,
    },
    timer: {
      fontFamily: 'SpaceMono_400Regular',
      fontSize: 48 * fontScale,
      lineHeight: 54 * fontScale,
    },
  };
}

export const navigationTheme: Theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: colors.deep,
    background: colors.frost,
    card: colors.cloud,
    text: colors.text,
    border: colors.border,
    notification: colors.ember,
  },
};
