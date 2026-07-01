import React from 'react';
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, gradients, radius, shadows, spacing } from '../theme';

interface Props {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  padded?: boolean;
  tone?: 'default' | 'danger' | 'raised';
}

// Frosted material card with a top sheen and hairline border — the core surface.
export function GlassCard({ children, style, padded = true, tone = 'default' }: Props) {
  const borderColor =
    tone === 'danger' ? 'rgba(251,92,99,0.35)' : colors.surfaceBorder;

  return (
    <View style={[styles.wrapper, shadows.card, { borderColor }, style]}>
      <BlurView intensity={24} tint="dark" style={StyleSheet.absoluteFill} />
      <View style={[StyleSheet.absoluteFill, styles.tint, tone === 'raised' && styles.tintRaised]} />
      <LinearGradient
        colors={tone === 'danger' ? ['rgba(251,92,99,0.10)', 'rgba(251,92,99,0)'] : gradients.cardSheen}
        style={styles.sheen}
        pointerEvents="none"
      />
      <View style={padded ? styles.padded : undefined}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    borderRadius: radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: 'hidden',
    backgroundColor: colors.surface,
  },
  tint: {
    backgroundColor: 'rgba(255,255,255,0.02)',
  },
  tintRaised: {
    backgroundColor: 'rgba(255,255,255,0.045)',
  },
  sheen: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 64,
  },
  padded: {
    padding: spacing.xl,
  },
});
