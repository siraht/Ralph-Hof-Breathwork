import { DefaultTheme, type Theme } from '@react-navigation/native';

export const colors = {
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
  md: 18,
  lg: 28,
  xl: 36,
};

export const shadow = {
  soft: {
    shadowColor: '#0B1F27',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },
};

export const typography = {
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

export const navigationTheme: Theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: colors.deep,
    background: colors.sand,
    card: colors.cloud,
    text: colors.text,
    border: colors.stroke,
    notification: colors.ember,
  },
};
