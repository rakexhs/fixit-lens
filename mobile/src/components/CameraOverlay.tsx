import React, { useEffect, useState } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, gradients, motion, radius, spacing, typography } from '../theme';

const FRAME = 264;

export function CameraOverlay({ hint = 'Point at a label, error code, or warning light' }: { hint?: string }) {
  const [scan] = useState(() => new Animated.Value(0));
  const [pulse] = useState(() => new Animated.Value(0));

  useEffect(() => {
    const scanLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(scan, { toValue: 1, duration: motion.duration.scan, easing: motion.easing.inOut, useNativeDriver: true }),
        Animated.timing(scan, { toValue: 0, duration: motion.duration.scan, easing: motion.easing.inOut, useNativeDriver: true }),
      ])
    );
    const pulseLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1, duration: 1400, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 0, duration: 1400, useNativeDriver: true }),
      ])
    );
    scanLoop.start();
    pulseLoop.start();
    return () => {
      scanLoop.stop();
      pulseLoop.stop();
    };
  }, [scan, pulse]);

  const translateY = scan.interpolate({ inputRange: [0, 1], outputRange: [-FRAME / 2 + 14, FRAME / 2 - 14] });
  const cornerOpacity = pulse.interpolate({ inputRange: [0, 1], outputRange: [0.55, 1] });

  return (
    <View pointerEvents="none" style={styles.container}>
      <View style={styles.frame}>
        <Animated.View style={[styles.corner, styles.tl, { opacity: cornerOpacity }]} />
        <Animated.View style={[styles.corner, styles.tr, { opacity: cornerOpacity }]} />
        <Animated.View style={[styles.corner, styles.bl, { opacity: cornerOpacity }]} />
        <Animated.View style={[styles.corner, styles.br, { opacity: cornerOpacity }]} />
        <Animated.View style={[styles.beamWrap, { transform: [{ translateY }] }]}>
          <LinearGradient colors={gradients.scanBeam} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.beam} />
        </Animated.View>
      </View>
      <View style={styles.hintPill}>
        <Text style={[typography.footnote, styles.hint]}>{hint}</Text>
      </View>
    </View>
  );
}

const C = 30;
const styles = StyleSheet.create({
  container: { alignItems: 'center', justifyContent: 'center' },
  frame: { width: FRAME, height: FRAME },
  corner: { position: 'absolute', width: C, height: C, borderColor: colors.accentAlt },
  tl: { top: 0, left: 0, borderTopWidth: 3, borderLeftWidth: 3, borderTopLeftRadius: radius.md },
  tr: { top: 0, right: 0, borderTopWidth: 3, borderRightWidth: 3, borderTopRightRadius: radius.md },
  bl: { bottom: 0, left: 0, borderBottomWidth: 3, borderLeftWidth: 3, borderBottomLeftRadius: radius.md },
  br: { bottom: 0, right: 0, borderBottomWidth: 3, borderRightWidth: 3, borderBottomRightRadius: radius.md },
  beamWrap: { position: 'absolute', left: 10, right: 10, top: '50%' },
  beam: { height: 3, borderRadius: 2 },
  hintPill: {
    marginTop: spacing.xxl,
    backgroundColor: colors.scrim,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.surfaceBorder,
  },
  hint: { color: colors.textSecondary, textAlign: 'center' },
});
