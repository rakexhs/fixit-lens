import { Platform, ViewStyle } from 'react-native';
import { palette } from './colors';

// Softer, layered elevation. On web we fall back to boxShadow via RN-web.
function elevation(y: number, blur: number, opacity: number, color = '#000000', spread = 0): ViewStyle {
  return Platform.select<ViewStyle>({
    ios: {
      shadowColor: color,
      shadowOffset: { width: 0, height: y },
      shadowOpacity: opacity,
      shadowRadius: blur,
    },
    android: { elevation: Math.round(blur / 2) },
    default: {
      boxShadow: `0px ${y}px ${blur}px ${spread}px ${hexWithOpacity(color, opacity)}`,
    } as ViewStyle,
  }) as ViewStyle;
}

function hexWithOpacity(hex: string, opacity: number): string {
  if (hex === '#000000') return `rgba(0,0,0,${opacity})`;
  return hex;
}

export const shadows = {
  sm: elevation(4, 12, 0.25),
  card: elevation(12, 28, 0.35),
  floating: elevation(18, 40, 0.4),
  accentGlow: elevation(0, 24, 0.5, palette.indigo, 0),
  cyanGlow: elevation(0, 20, 0.55, palette.cyan, 0),
} satisfies Record<string, ViewStyle>;
