import { useColorScheme } from 'react-native';
import {
  Palette,
  Radius,
  Spacing,
  Typography,
  Shadows,
  ThemeColors,
  FontFamilies,
} from '@/constants/theme';
import { useProfileStore } from '@/store/profileStore';

export function useTheme() {
  const systemScheme = useColorScheme();
  const themeMode = useProfileStore((s) => s.profile?.themeMode) ?? 'system';

  const isDark =
    themeMode === 'system' ? systemScheme === 'dark' : themeMode === 'dark';
  const colors: ThemeColors = isDark ? Palette.dark : Palette.light;

  return {
    isDark,
    themeMode,
    colorScheme: isDark ? ('dark' as const) : ('light' as const),
    colors,
    radius: Radius,
    spacing: Spacing,
    typography: Typography,
    shadows: Shadows,
    fonts: FontFamilies,
  };
}

export default useTheme;
