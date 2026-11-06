export const colors = {
  brand: '#806AEC',
  brandPressed: '#6A55D6',
  primary: '#9B88F2',
  primaryTint: '#241F3D',
  background: '#0F0E17',
  surfaceAlt: '#1A1926',
  surface: '#141320',
  surfaceHighlight: '#222033',
  text: '#F5F5FA',
  textSecondary: '#A3A3B5',
  textMuted: '#8A89A0',
  border: '#2B2A3A',
  borderLight: '#38364D',
  savings: '#34D399',
  savingsTint: '#0C2D20',
  urgency: '#FF6B70',
  urgencyTint: '#381417',
  star: '#FFC24D',
  disabled: '#2E2D3D',
  disabledText: '#68677B',
  white: '#FFFFFF',
  black: '#000000',
  overlay: 'rgba(0, 0, 0, 0.7)',
  transparent: 'transparent',
} as const;

export type ColorToken = keyof typeof colors;

