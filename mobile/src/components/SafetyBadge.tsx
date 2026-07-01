import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Icon, IconName } from './Icon';
import { radius, riskColor, spacing } from '../theme';
import { riskLevelLabel } from '../utils/formatters';

interface Props {
  riskLevel: number;
  blocked: boolean;
  compact?: boolean;
}

export function SafetyBadge({ riskLevel, blocked, compact = false }: Props) {
  const tint = riskColor(riskLevel);
  const label = blocked ? 'Professional required' : riskLevelLabel(riskLevel);
  const icon: IconName = blocked ? 'block' : riskLevel >= 2 ? 'shieldAlert' : 'shield';

  return (
    <View
      style={[
        styles.badge,
        compact && styles.compact,
        { borderColor: tint + '59', backgroundColor: tint + '1A' },
      ]}
    >
      <Icon name={icon} size={compact ? 12 : 14} color={tint} />
      <Text style={[styles.label, compact && styles.labelCompact, { color: tint }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: 7,
    gap: 6,
  },
  compact: {
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: 5,
  },
  label: { fontSize: 13, fontWeight: '700', letterSpacing: -0.1 },
  labelCompact: { fontSize: 11.5 },
});
