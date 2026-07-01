import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { GlassCard } from './GlassCard';
import { Icon } from './Icon';
import { colors, radius, spacing, typography } from '../theme';
import type { Step } from '../services/types';

interface Props {
  step: Step;
  totalSteps: number;
}

export function StepCard({ step, totalSteps }: Props) {
  return (
    <GlassCard tone="raised">
      <View style={styles.headerRow}>
        <View style={styles.numberBadge}>
          <Text style={styles.numberText}>{step.step_number}</Text>
        </View>
        <Text style={typography.overline}>Step {step.step_number} of {totalSteps}</Text>
      </View>

      <Text style={[typography.title2, styles.title]}>{step.title}</Text>
      <Text style={[typography.body, styles.instruction]}>{step.instruction}</Text>

      <View style={styles.whyRow}>
        <Icon name="bulb" size={15} color={colors.accentAlt} />
        <Text style={[typography.callout, styles.why]}>{step.why}</Text>
      </View>

      {step.tools.length > 0 && (
        <View style={styles.section}>
          <Text style={typography.overline}>Tools</Text>
          <View style={styles.chipRow}>
            {step.tools.map((tool) => (
              <View key={tool} style={styles.toolChip}>
                <Icon name="wrench" size={12} color={colors.textSecondary} />
                <Text style={styles.toolText}>{tool}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {step.stop_if.length > 0 && (
        <View style={styles.stopBlock}>
          <View style={styles.stopHeader}>
            <Icon name="stop" size={15} color={colors.danger} />
            <Text style={[typography.overline, styles.stopLabel]}>Stop if</Text>
          </View>
          {step.stop_if.map((c, i) => (
            <Text key={i} style={[typography.callout, styles.stopText]}>{c}</Text>
          ))}
        </View>
      )}

      {step.citation_ids.length > 0 && (
        <View style={styles.citationRow}>
          <Icon name="source" size={13} color={colors.textFaint} />
          <Text style={typography.mono} numberOfLines={1}>{step.citation_ids.join('  ·  ')}</Text>
        </View>
      )}
    </GlassCard>
  );
}

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  numberBadge: {
    width: 28,
    height: 28,
    borderRadius: radius.sm,
    backgroundColor: colors.accent + '26',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.accent + '59',
    alignItems: 'center',
    justifyContent: 'center',
  },
  numberText: {
    color: colors.accentAlt,
    fontWeight: '800',
    fontSize: 14,
  },
  title: {
    marginTop: spacing.md,
  },
  instruction: {
    marginTop: spacing.md,
  },
  whyRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.lg,
    backgroundColor: colors.surfaceHigh,
    borderRadius: radius.md,
    padding: spacing.md,
  },
  why: {
    flex: 1,
    color: colors.textSecondary,
  },
  section: {
    marginTop: spacing.lg,
    gap: spacing.sm,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  toolChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: colors.surfaceHigh,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.surfaceBorder,
  },
  toolText: {
    color: colors.textSecondary,
    fontSize: 12.5,
    fontWeight: '600',
  },
  stopBlock: {
    marginTop: spacing.lg,
    backgroundColor: 'rgba(251,92,99,0.1)',
    borderRadius: radius.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(251,92,99,0.28)',
    padding: spacing.md,
    gap: spacing.xs,
  },
  stopHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: spacing.xs,
  },
  stopLabel: {
    color: colors.danger,
  },
  stopText: {
    color: colors.textPrimary,
  },
  citationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: spacing.lg,
    paddingTop: spacing.md,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.divider,
  },
});
