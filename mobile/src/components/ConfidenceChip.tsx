import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme/colors';
import { radius, spacing } from '../theme/spacing';
import { formatPercent } from '../utils/formatters';

interface Props {
  confidence: number;
  label?: string;
}

function colorForConfidence(confidence: number): string {
  if (confidence >= 0.75) return colors.green;
  if (confidence >= 0.45) return colors.amber;
  return colors.red;
}

export function ConfidenceChip({ confidence, label = 'confidence' }: Props) {
  const tint = colorForConfidence(confidence);
  return (
    <View style={[styles.chip, { borderColor: tint + '55', backgroundColor: tint + '1A' }]}>
      <View style={[styles.dot, { backgroundColor: tint }]} />
      <Text style={[styles.text, { color: tint }]}>
        {formatPercent(confidence)} {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: 6,
    gap: 6,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  text: {
    fontSize: 12,
    fontWeight: '700',
  },
});
