import { TextStyle } from 'react-native';
import { colors } from './colors';

export const typography: Record<string, TextStyle> = {
  display: { fontSize: 30, fontWeight: '700', color: colors.textPrimary, letterSpacing: -0.5 },
  title: { fontSize: 22, fontWeight: '700', color: colors.textPrimary, letterSpacing: -0.3 },
  subtitle: { fontSize: 17, fontWeight: '600', color: colors.textPrimary },
  body: { fontSize: 15, fontWeight: '400', color: colors.textSecondary, lineHeight: 22 },
  bodyStrong: { fontSize: 15, fontWeight: '600', color: colors.textPrimary, lineHeight: 22 },
  caption: { fontSize: 13, fontWeight: '500', color: colors.textTertiary },
  label: { fontSize: 12, fontWeight: '700', color: colors.textSecondary, letterSpacing: 0.6 },
  button: { fontSize: 16, fontWeight: '700', color: colors.background },
};
