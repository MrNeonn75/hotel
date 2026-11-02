import { useColorScheme } from 'react-native';

export type ColorPalette = {
  primary: string;
  primaryDark: string;
  accent: string;
  background: string;
  surface: string;
  text: string;
  textSecondary: string;
  border: string;
  success: string;
  warning: string;
};

export const lightColors: ColorPalette = {
  primary: '#4F46E5',
  primaryDark: '#3730A3',
  accent: '#FF6B57',
  background: '#F7F7FB',
  surface: '#FFFFFF',
  text: '#12122B',
  textSecondary: '#6B6F8D',
  border: '#E6E7F0',
  success: '#16A34A',
  warning: '#F59E0B',
};

export const darkColors: ColorPalette = {
  primary: '#818CF8',
  primaryDark: '#6366F1',
  accent: '#FF7F6E',
  background: '#0E0F1F',
  surface: '#181A33',
  text: '#F4F4FB',
  textSecondary: '#A0A4C4',
  border: '#2A2D4D',
  success: '#22C55E',
  warning: '#FBBF24',
};

export const radius = {
  card: 20,
  button: 14,
  pill: 999,
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  4: 4,
  8: 8,
  12: 12,
  16: 16,
  20: 20,
  24: 24,
  32: 32,
} as const;

export const fonts = {
  regular: 'PlusJakartaSans_400Regular',
  medium: 'PlusJakartaSans_500Medium',
  semiBold: 'PlusJakartaSans_600SemiBold',
  bold: 'PlusJakartaSans_700Bold',
  extraBold: 'PlusJakartaSans_800ExtraBold',
} as const;

export const shadows = {
  soft: {
    shadowColor: '#12122B',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 4,
  },
  card: {
    shadowColor: '#12122B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
} as const;

import { useProfileStore } from '@/store/profileStore';

export type ThemeType = 'light' | 'dark';

export function useTheme() {
  const scheme = useColorScheme();
  const preferredTheme = useProfileStore((state) => state.profile.preferredTheme);

  const isDark =
    preferredTheme === 'dark'
      ? true
      : preferredTheme === 'light'
      ? false
      : scheme === 'dark';

  const colors = isDark ? darkColors : lightColors;

  return {
    isDark,
    theme: (isDark ? 'dark' : 'light') as ThemeType,
    preferredTheme: preferredTheme || 'system',
    colors,
    radius,
    spacing,
    fonts,
    shadows,
  };
}

export default {
  light: lightColors,
  dark: darkColors,
  radius,
  spacing,
  fonts,
  shadows,
  useTheme,
};

