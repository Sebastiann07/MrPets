export const palette = {
  primary: '#FF6B35',
  secondary: '#4CAF50',
  background: '#F9F9F9',
  text: '#333333',
  accent: '#FFC107',
  white: '#FFFFFF',
  border: '#E6E6E6',
  muted: '#6B7280',
  danger: '#D64545',
  surface: '#FFF7F2',
  dark: '#212121',
} as const;

export const colors = {
  background: palette.background,
  surface: palette.white,
  white: palette.white,
  surfaceAlt: palette.surface,
  primary: palette.primary,
  secondary: palette.secondary,
  accent: palette.accent,
  text: palette.text,
  textMuted: palette.muted,
  textOnPrimary: palette.white,
  border: palette.border,
  danger: palette.danger,
  shadow: 'rgba(0,0,0,0.08)',
} as const;
