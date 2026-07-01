import React, { useEffect, useState } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, gradients, radius } from '../theme';

interface Props {
  progress: number; // 0..1
  height?: number;
}

export function ProgressBar({ progress, height = 6 }: Props) {
  const [width] = useState(() => new Animated.Value(0));

  useEffect(() => {
    Animated.spring(width, { toValue: Math.max(0, Math.min(1, progress)), useNativeDriver: false, tension: 120, friction: 18 }).start();
  }, [progress, width]);

  return (
    <View style={[styles.track, { height, borderRadius: height }]}>
      <Animated.View
        style={{
          width: width.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] }),
          height: '100%',
          borderRadius: height,
          overflow: 'hidden',
        }}
      >
        <LinearGradient colors={gradients.accent} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={StyleSheet.absoluteFill} />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    width: '100%',
    backgroundColor: colors.surfaceHigh,
    overflow: 'hidden',
    borderRadius: radius.pill,
  },
});
