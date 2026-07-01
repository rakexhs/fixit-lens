import React, { useState } from 'react';
import { Animated, GestureResponderEvent, Insets, Pressable, StyleProp, ViewStyle } from 'react-native';
import * as Haptics from 'expo-haptics';
import { motion } from '../theme';

interface Props {
  children: React.ReactNode;
  onPress?: (e: GestureResponderEvent) => void;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  scaleTo?: number;
  haptic?: 'light' | 'medium' | 'selection' | 'none';
  accessibilityLabel?: string;
  hitSlop?: Insets | number;
}

// Spring-scaled press feedback with optional haptics — the small touch that
// separates a "designed" app from a template.
export function AnimatedPressable({
  children,
  onPress,
  disabled,
  style,
  scaleTo = 0.96,
  haptic = 'light',
  accessibilityLabel,
  hitSlop,
}: Props) {
  const [scale] = useState(() => new Animated.Value(1));

  const animate = (to: number) =>
    Animated.spring(scale, { toValue: to, useNativeDriver: true, ...motion.spring.press }).start();

  const fireHaptic = () => {
    if (haptic === 'none') return;
    const map = {
      light: Haptics.ImpactFeedbackStyle.Light,
      medium: Haptics.ImpactFeedbackStyle.Medium,
    } as const;
    if (haptic === 'selection') {
      Haptics.selectionAsync().catch(() => {});
    } else {
      Haptics.impactAsync(map[haptic]).catch(() => {});
    }
  };

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      disabled={disabled}
      hitSlop={hitSlop}
      onPressIn={() => animate(scaleTo)}
      onPressOut={() => animate(1)}
      onPress={(e) => {
        if (disabled) return;
        fireHaptic();
        onPress?.(e);
      }}
    >
      <Animated.View style={[{ transform: [{ scale }] }, style]}>{children}</Animated.View>
    </Pressable>
  );
}
