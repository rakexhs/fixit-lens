import React, { useEffect, useMemo } from 'react';
import { Animated, StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { colors, radius } from '../theme';
import { motion } from '../theme/motion';

interface Props {
  width?: number | `${number}%`;
  height?: number;
  borderRadius?: number;
  style?: StyleProp<ViewStyle>;
}

export function Skeleton({ width = '100%', height = 14, borderRadius = radius.sm, style }: Props) {
  const pulse = useMemo(() => new Animated.Value(0.35), []);

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 0.75,
          duration: motion.duration.slow,
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 0.35,
          duration: motion.duration.slow,
          useNativeDriver: true,
        }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [pulse]);

  return (
    <View style={[{ width, height, borderRadius, overflow: 'hidden' }, style]}>
      <Animated.View style={[styles.fill, { opacity: pulse, borderRadius }]} />
    </View>
  );
}

interface CardProps {
  lines?: number;
  style?: StyleProp<ViewStyle>;
}

export function SkeletonCard({ lines = 3, style }: CardProps) {
  return (
    <View style={[styles.card, style]}>
      <View style={styles.cardHeader}>
        <Skeleton width={40} height={40} borderRadius={12} />
        <View style={styles.cardText}>
          <Skeleton width="68%" height={14} />
          <Skeleton width="42%" height={11} style={styles.gap} />
        </View>
      </View>
      {Array.from({ length: lines }, (_, i) => (
        <Skeleton key={i} width={i === lines - 1 ? '78%' : '100%'} height={12} style={styles.gap} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  fill: {
    ...StyleSheet.absoluteFill,
    backgroundColor: colors.surfaceHigh,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.surfaceBorder,
    padding: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 14,
  },
  cardText: {
    flex: 1,
    gap: 6,
  },
  gap: {
    marginTop: 8,
  },
});
