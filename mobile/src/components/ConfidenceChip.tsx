import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, radius, spacing } from '../theme';
import { formatPercent } from '../utils/formatters';

interface Props {
  confidence: number;
  label?: string;
}

function tintFor(confidence: number): string {
  if (confidence >= 0.75) return colors.success;
  if (confidence >= 0.45) return colors.warning;
  return colors.danger;
}

export function ConfidenceChip({ confidence, label = 'confidence' }: Props) {
  const tint = tintFor(confidence);
  return (
    <View style={[styles.chip, { borderColor: tint + '4D', backgroundColor: tint + '14' }]}>
      <View style={[styles.dot, { backgroundColor: tint }]} />
      <Text style={[styles.value, { color: tint }]}>{formatPercent(confidence)}</Text>
      <Text style={styles.label}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: 7,
    gap: 6,
  },
  dot: { width: 6, height: 6, borderRadius: 3 },
  value: { fontSize: 12.5, fontWeight: '800', letterSpacing: -0.2 },
  label: { fontSize: 12, fontWeight: '500', color: colors.textTertiary },
});
