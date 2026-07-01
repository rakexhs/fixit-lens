// FixIt Lens design tokens — a restrained, high-contrast dark system.
// Neutrals carry the UI; the accent is used sparingly for emphasis and state.

export const palette = {
  // Layered near-black neutrals (background -> raised surfaces)
  ink900: '#08090D',
  ink800: '#0C0E13',
  ink700: '#12141B',
  ink600: '#171A22',
  ink500: '#1E222C',
  ink400: '#272C38',

  // Hairline borders / dividers
  line: 'rgba(255,255,255,0.08)',
  lineStrong: 'rgba(255,255,255,0.14)',

  // Text
  white: '#F5F7FA',
  slate200: '#C4CAD6',
  slate400: '#8A92A6',
  slate500: '#5C6373',

  // Brand accent — indigo → cyan
  indigo: '#6D5EF6',
  indigoSoft: '#8B7CFF',
  cyan: '#22D3EE',
  cyanSoft: '#5FE3F2',

  // Semantic
  green: '#2FD48A',
  greenSoft: '#7BE8B8',
  lime: '#8FE23D',
  amber: '#F5B84E',
  red: '#FB5C63',
  redSoft: '#FF8A8F',
} as const;

export const colors = {
  background: palette.ink900,
  backgroundGradientStart: '#0A0B12',
  backgroundGradientMid: '#0B0D14',
  backgroundGradientEnd: '#0E1420',

  surface: palette.ink700,
  surfaceRaised: palette.ink600,
  surfaceHigh: palette.ink500,
  surfaceBorder: palette.line,
  surfaceBorderStrong: palette.lineStrong,

  textPrimary: palette.white,
  textSecondary: palette.slate200,
  textTertiary: palette.slate400,
  textFaint: palette.slate500,

  accent: palette.indigo,
  accentAlt: palette.cyan,

  riskSafe: palette.green,
  riskLow: palette.lime,
  riskModerate: palette.amber,
  riskHigh: palette.red,

  success: palette.green,
  warning: palette.amber,
  danger: palette.red,

  overlay: 'rgba(6,7,11,0.78)',
  scrim: 'rgba(0,0,0,0.55)',
  divider: palette.line,
} as const;

export const gradients = {
  background: [colors.backgroundGradientStart, colors.backgroundGradientMid, colors.backgroundGradientEnd] as const,
  accent: [palette.indigo, palette.cyan] as const,
  accentVertical: [palette.indigoSoft, palette.indigo] as const,
  success: [palette.green, '#1FA76B'] as const,
  danger: ['#FB5C63', '#C7343B'] as const,
  cardSheen: ['rgba(255,255,255,0.07)', 'rgba(255,255,255,0.015)'] as const,
  scanBeam: ['rgba(34,211,238,0)', 'rgba(34,211,238,0.9)', 'rgba(34,211,238,0)'] as const,
};

// Per-risk-level color helper shared across badges/rings.
export function riskColor(level: number): string {
  switch (level) {
    case 0:
      return colors.riskSafe;
    case 1:
      return colors.riskLow;
    case 2:
      return colors.riskModerate;
    default:
      return colors.riskHigh;
  }
}
