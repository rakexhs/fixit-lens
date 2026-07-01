export const colors = {
  background: '#0B0C10',
  backgroundGradientStart: '#0B0C10',
  backgroundGradientEnd: '#171A23',

  surface: 'rgba(255,255,255,0.06)',
  surfaceBorder: 'rgba(255,255,255,0.10)',
  surfaceElevated: 'rgba(255,255,255,0.09)',

  textPrimary: '#F3F4F8',
  textSecondary: '#A8ADBB',
  textTertiary: '#6E7383',

  cyan: '#38E1E8',
  violet: '#8B7CFF',
  green: '#39E68C',
  amber: '#F5B94D',
  red: '#F45C5C',

  riskSafe: '#39E68C',
  riskLow: '#8FE23D',
  riskModerate: '#F5B94D',
  riskHigh: '#F45C5C',

  overlay: 'rgba(6,7,10,0.72)',
  divider: 'rgba(255,255,255,0.08)',
} as const;

export const gradients = {
  background: [colors.backgroundGradientStart, colors.backgroundGradientEnd] as const,
  cyanViolet: [colors.cyan, colors.violet] as const,
  card: ['rgba(255,255,255,0.10)', 'rgba(255,255,255,0.02)'] as const,
  danger: ['#3A1414', '#1A0B0B'] as const,
};
