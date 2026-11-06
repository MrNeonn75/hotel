export const radius = {
  none: 0,
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 24,
  pill: 9999,
  round: 9999,
} as const;

export type RadiusToken = keyof typeof radius;

