export interface ThemeColors {
  primary: string;
  primaryPressed: string;
  primaryTint: string;
  background: string;
  surfaceAlt: string;
  text: string;
  textSecondary: string;
  border: string;
  savings: string;
  urgency: string;
  star: string;
}

export const Palette = {
  light: {
    primary: '#806AEC',
    primaryPressed: '#6A52D9',
    primaryTint: '#F1EEFD',
    background: '#FFFFFF',
    surfaceAlt: '#F6F6F9',
    text: '#17171F',
    textSecondary: '#6C6C7A',
    border: '#E8E8EF',
    savings: '#0E9F6E',
    urgency: '#E5484D',
    star: '#F5A623',
  } satisfies ThemeColors,
  dark: {
    primary: '#9B88F2',
    primaryPressed: '#806AEC',
    primaryTint: '#241F3D',
    background: '#0F0E17',
    surfaceAlt: '#1A1926',
    text: '#F5F5FA',
    textSecondary: '#A3A3B5',
    border: '#2B2A3A',
    savings: '#34D399',
    urgency: '#FF6B70',
    star: '#FFC24D',
  } satisfies ThemeColors,
};

export const Radius = {
  card: 16,
  image: 16,
  button: 14,
  sheetTop: 24,
  pill: 999,
} as const;

export const Spacing = {
  4: 4,
  8: 8,
  12: 12,
  16: 16,
  20: 20,
  24: 24,
  32: 32,
  40: 40,
  xs: 4,
  sm: 8,
  md: 12,
  base: 16,
  lg: 20,
  xl: 24,
  xxl: 32,
  xxxl: 40,
} as const;

export const FontFamilies = {
  regular: 'PlusJakartaSans_400Regular',
  medium: 'PlusJakartaSans_500Medium',
  semiBold: 'PlusJakartaSans_600SemiBold',
  bold: 'PlusJakartaSans_700Bold',
  extraBold: 'PlusJakartaSans_800ExtraBold',
} as const;

export const Typography = {
  display: {
    fontSize: 28,
    fontFamily: FontFamilies.extraBold,
    fontWeight: '800' as const,
    lineHeight: 34,
  },
  title: {
    fontSize: 22,
    fontFamily: FontFamilies.bold,
    fontWeight: '700' as const,
    lineHeight: 28,
  },
  heading: {
    fontSize: 18,
    fontFamily: FontFamilies.bold,
    fontWeight: '700' as const,
    lineHeight: 24,
  },
  body: {
    fontSize: 15,
    fontFamily: FontFamilies.medium,
    fontWeight: '500' as const,
    lineHeight: 22,
  },
  caption: {
    fontSize: 13,
    fontFamily: FontFamilies.medium,
    fontWeight: '500' as const,
    lineHeight: 18,
  },
  micro: {
    fontSize: 11,
    fontFamily: FontFamilies.semiBold,
    fontWeight: '600' as const,
    lineHeight: 14,
  },
} as const;

export const Shadows = {
  soft: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 16,
    elevation: 2,
  },
  card: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 18,
    elevation: 3,
  },
} as const;

export const Colors = Palette;