import { lightColors, darkColors } from './theme';

export default {
  light: {
    ...lightColors,
    tint: lightColors.primary,
    tabIconDefault: lightColors.textSecondary,
    tabIconSelected: lightColors.primary,
  },
  dark: {
    ...darkColors,
    tint: darkColors.primary,
    tabIconDefault: darkColors.textSecondary,
    tabIconSelected: darkColors.primary,
  },
};
