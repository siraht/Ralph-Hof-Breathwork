import { useContext, createContext, useState, useEffect, type ReactNode } from 'react';
import { AccessibilityInfo, Platform, PixelRatio } from 'react-native';

interface AccessibilityContextValue {
  fontScale: number;
  reducedMotion: boolean;
  isLargeTextEnabled: boolean;
}

const AccessibilityContext = createContext<AccessibilityContextValue>({
  fontScale: 1,
  reducedMotion: false,
  isLargeTextEnabled: false,
});

interface AccessibilityProviderProps {
  children: ReactNode;
  reducedMotionOverride?: boolean;
}

export function AccessibilityProvider({
  children,
  reducedMotionOverride,
}: AccessibilityProviderProps) {
  const [fontScale, setFontScale] = useState(1);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [isLargeTextEnabled, setIsLargeTextEnabled] = useState(false);

  useEffect(() => {
    // Get the system font scale (from Accessibility settings)
    const fetchFontScale = () => {
      const scale = PixelRatio.getFontScale();
      setFontScale(scale);
    };
    fetchFontScale();
  }, []);

  useEffect(() => {
    // Check if Reduced Motion is enabled
    const fetchReducedMotion = async () => {
      const isReducedMotionEnabled = await AccessibilityInfo.isReduceMotionEnabled();
      setReducedMotion(isReducedMotionEnabled);
    };
    fetchReducedMotion();

    const subscription = AccessibilityInfo.addEventListener('reduceMotionChanged', fetchReducedMotion);
    return () => subscription.remove();
  }, []);

  useEffect(() => {
    // Check if Large Text / Accessibility font is enabled
    const fetchLargeText = async () => {
      const isLargeText = await AccessibilityInfo.isBoldTextEnabled();
      setIsLargeTextEnabled(isLargeText);
    };
    fetchLargeText();

    const subscription = AccessibilityInfo.addEventListener('boldTextChanged', fetchLargeText);
    return () => subscription.remove();
  }, []);

  const value: AccessibilityContextValue = {
    fontScale,
    reducedMotion: reducedMotionOverride ?? reducedMotion,
    isLargeTextEnabled,
  };

  return <AccessibilityContext.Provider value={value}>{children}</AccessibilityContext.Provider>;
}

export function useAccessibility() {
  const context = useContext(AccessibilityContext);
  if (!context) {
    return { fontScale: 1, reducedMotion: false, isLargeTextEnabled: false };
  }
  return context;
}
