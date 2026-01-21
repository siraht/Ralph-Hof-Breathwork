import { Text as RNText, type TextProps } from 'react-native';
import { useAccessibility } from '../hooks/useAccessibility';
import { getScaledTypography } from '../theme';

type ScaledTextProps = TextProps & {
  variant?: keyof ReturnType<typeof getScaledTypography> | 'timer';
};

/**
 * A text component that automatically scales according to user accessibility settings.
 * Supports typography variants (display, title, body, caption, mono, timer).
 */
export function ScaledText({ variant = 'body', style, allowFontScaling = true, ...props }: ScaledTextProps) {
  const { fontScale } = useAccessibility();
  const scaledTypography = getScaledTypography(fontScale);

  // Timer variant uses mono font but with explicit sizing for timers
  const timerStyle = {
    fontFamily: 'SpaceMono_400Regular',
    fontSize: 48 * fontScale,
    lineHeight: 54 * fontScale,
  };

  let textStyle: Record<string, number | string>;
  switch (variant) {
    case 'display':
    case 'title':
    case 'body':
    case 'caption':
    case 'mono':
      textStyle = scaledTypography[variant];
      break;
    case 'timer':
      textStyle = timerStyle;
      break;
    default:
      textStyle = scaledTypography.body;
  }

  return (
    <RNText
      style={[textStyle, style]}
      allowFontScaling={allowFontScaling}
      {...props}
    />
  );
}
