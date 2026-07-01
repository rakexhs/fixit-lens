import React from 'react';
import { StyleSheet, View } from 'react-native';
import { colors, radius } from '../theme';

interface Props {
  total: number;
  current: number;
}

export function StepDots({ total, current }: Props) {
  return (
    <View style={styles.row} accessibilityRole="progressbar" accessibilityValue={{ min: 0, max: total, now: current + 1 }}>
      {Array.from({ length: total }, (_, i) => {
        const active = i === current;
        const done = i < current;
        return (
          <View
            key={i}
            style={[
              styles.dot,
              active && styles.dotActive,
              done && styles.dotDone,
            ]}
          />
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    flex: 1,
  },
  dot: {
    height: 6,
    width: 6,
    borderRadius: radius.pill,
    backgroundColor: colors.surfaceBorderStrong,
  },
  dotActive: {
    width: 22,
    backgroundColor: colors.accentAlt,
  },
  dotDone: {
    backgroundColor: colors.accentAlt + '66',
  },
});
