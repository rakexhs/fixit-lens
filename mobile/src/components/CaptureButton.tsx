import React, { useState } from 'react';
import { Animated, Pressable, StyleSheet, View } from 'react-native';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, gradients, motion } from '../theme';

interface Props {
  onPress: () => void;
  disabled?: boolean;
}

export function CaptureButton({ onPress, disabled }: Props) {
  const [scale] = useState(() => new Animated.Value(1));

  const animate = (to: number) =>
    Animated.spring(scale, { toValue: to, useNativeDriver: true, ...motion.spring.press }).start();

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Capture photo"
      disabled={disabled}
      onPressIn={() => animate(0.9)}
      onPressOut={() => animate(1)}
      onPress={() => {
        if (disabled) return;
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy).catch(() => {});
        onPress();
      }}
    >
      <Animated.View style={[styles.ring, disabled && styles.disabled, { transform: [{ scale }] }]}>
        <LinearGradient colors={gradients.accent} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.ringGradient}>
          <View style={styles.inner} />
        </LinearGradient>
      </Animated.View>
    </Pressable>
  );
}

const SIZE = 82;
const styles = StyleSheet.create({
  ring: { width: SIZE, height: SIZE, borderRadius: SIZE / 2 },
  ringGradient: {
    flex: 1,
    borderRadius: SIZE / 2,
    padding: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  inner: {
    flex: 1,
    width: '100%',
    borderRadius: SIZE / 2,
    backgroundColor: colors.textPrimary,
    borderWidth: 3,
    borderColor: colors.background,
  },
  disabled: { opacity: 0.4 },
});
