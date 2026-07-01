import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, riskColor, typography } from '../theme';

interface Props {
  level: number; // 0..3
  size?: number;
}

// A compact segmented severity ring (0-3) — reads instantly as a risk meter.
export function SeverityRing({ level, size = 56 }: Props) {
  const tint = riskColor(level);
  const segments = [0, 1, 2, 3];

  return (
    <View style={[styles.container, { width: size, height: size, borderRadius: size / 2 }]}>
      <View style={styles.segRow}>
        {segments.map((s) => (
          <View
            key={s}
            style={[
              styles.seg,
              { backgroundColor: s <= level ? tint : colors.surfaceHigh },
            ]}
          />
        ))}
      </View>
      <View style={[styles.center, { borderColor: tint }]}>
        <Text style={[typography.headline, { color: tint }]}>{level}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.surfaceBorder,
  },
  segRow: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
    gap: 2,
    padding: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  seg: {
    flex: 1,
    height: 3,
    borderRadius: 2,
  },
  center: {
    width: '58%',
    aspectRatio: 1,
    borderRadius: 999,
    borderWidth: 1.5,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
