import React from 'react';
import { Pressable, StyleSheet } from 'react-native';
import * as Haptics from 'expo-haptics';
import { colors } from '../theme/colors';

interface Props {
  onPress: () => void;
  disabled?: boolean;
}

export function CaptureButton({ onPress, disabled }: Props) {
  const handlePress = () => {
    if (disabled) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    onPress();
  };

  return (
    <Pressable onPress={handlePress} disabled={disabled} style={({ pressed }) => [styles.outer, pressed && styles.pressed]}>
      <Pressable onPress={handlePress} disabled={disabled} style={styles.inner} />
    </Pressable>
  );
}

const SIZE = 78;

const styles = StyleSheet.create({
  outer: {
    width: SIZE,
    height: SIZE,
    borderRadius: SIZE / 2,
    borderWidth: 4,
    borderColor: colors.textPrimary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  inner: {
    width: SIZE - 16,
    height: SIZE - 16,
    borderRadius: (SIZE - 16) / 2,
    backgroundColor: colors.textPrimary,
  },
  pressed: {
    opacity: 0.7,
  },
});
