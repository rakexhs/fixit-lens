import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme/colors';
import { radius, spacing } from '../theme/spacing';
import { riskLevelLabel } from '../utils/formatters';

interface Props {
  riskLevel: number;
  blocked: boolean;
}

function colorForRisk(level: number): string {
  switch (level) {
    case 0:
      return colors.riskSafe;
    case 1:
      return colors.riskLow;
    case 2:
      return colors.riskModerate;
    default:
      return colors.riskHigh;
  }
}

export function SafetyBadge({ riskLevel, blocked }: Props) {
  const tint = colorForRisk(riskLevel);
  const label = blocked ? 'Professional required' : riskLevelLabel(riskLevel);

  return (
    <View style={[styles.badge, { borderColor: tint + '66', backgroundColor: tint + '20' }]}>
      <Text style={[styles.icon, { color: tint }]}>{blocked ? '⛔' : '🛡'}</Text>
      <Text style={[styles.label, { color: tint }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    gap: 6,
  },
  icon: {
    fontSize: 14,
  },
  label: {
    fontSize: 13,
    fontWeight: '700',
  },
});
