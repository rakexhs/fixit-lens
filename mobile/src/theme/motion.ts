import { Easing } from 'react-native';

export const motion = {
  duration: {
    fast: 140,
    base: 240,
    slow: 420,
    scan: 2200,
  },
  easing: {
    standard: Easing.bezier(0.22, 1, 0.36, 1), // easeOutQuint-ish
    entrance: Easing.out(Easing.cubic),
    inOut: Easing.inOut(Easing.ease),
  },
  spring: {
    press: { tension: 320, friction: 18 },
    gentle: { tension: 180, friction: 20 },
  },
} as const;
