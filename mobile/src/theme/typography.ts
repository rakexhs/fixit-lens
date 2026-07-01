import { Platform, TextStyle } from 'react-native';
import { colors } from './colors';

// iOS-native feel: system font (SF Pro on iOS). A tuned scale with deliberate
// tracking gives the "designed by someone who cares" hierarchy.
const systemFont = Platform.select({ ios: undefined, default: undefined });
const monoFont = Platform.select({ ios: 'Menlo', android: 'monospace', default: 'monospace' });

export const typography: Record<string, TextStyle> = {
  largeTitle: { fontFamily: systemFont, fontSize: 34, fontWeight: '800', color: colors.textPrimary, letterSpacing: -0.8, lineHeight: 40 },
  title: { fontFamily: systemFont, fontSize: 26, fontWeight: '700', color: colors.textPrimary, letterSpacing: -0.5, lineHeight: 32 },
  title2: { fontFamily: systemFont, fontSize: 21, fontWeight: '700', color: colors.textPrimary, letterSpacing: -0.3, lineHeight: 27 },
  headline: { fontFamily: systemFont, fontSize: 17, fontWeight: '600', color: colors.textPrimary, letterSpacing: -0.2, lineHeight: 22 },
  body: { fontFamily: systemFont, fontSize: 15, fontWeight: '400', color: colors.textSecondary, lineHeight: 22, letterSpacing: -0.1 },
  bodyStrong: { fontFamily: systemFont, fontSize: 15, fontWeight: '600', color: colors.textPrimary, lineHeight: 22, letterSpacing: -0.1 },
  callout: { fontFamily: systemFont, fontSize: 14, fontWeight: '400', color: colors.textSecondary, lineHeight: 20 },
  footnote: { fontFamily: systemFont, fontSize: 13, fontWeight: '500', color: colors.textTertiary, lineHeight: 18 },
  caption: { fontFamily: systemFont, fontSize: 12, fontWeight: '500', color: colors.textTertiary, lineHeight: 16 },
  overline: { fontFamily: systemFont, fontSize: 11, fontWeight: '700', color: colors.textTertiary, letterSpacing: 1.3, textTransform: 'uppercase' },
  button: { fontFamily: systemFont, fontSize: 16, fontWeight: '700', letterSpacing: -0.2 },
  mono: { fontFamily: monoFont, fontSize: 12, color: colors.textTertiary, letterSpacing: 0 },
};
