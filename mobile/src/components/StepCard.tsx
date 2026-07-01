import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme/colors';
import { radius, spacing } from '../theme/spacing';
import { typography } from '../theme/typography';
import type { Step } from '../services/types';
import { GlassCard } from './GlassCard';

interface Props {
  step: Step;
  totalSteps: number;
}

export function StepCard({ step, totalSteps }: Props) {
  return (
    <GlassCard>
      <Text style={typography.label}>
        STEP {step.step_number} OF {totalSteps}
      </Text>
      <Text style={[typography.title, styles.title]}>{step.title}</Text>
      <Text style={[typography.body, styles.instruction]}>{step.instruction}</Text>

      <View style={styles.whyBlock}>
        <Text style={typography.label}>WHY</Text>
        <Text style={[typography.body, styles.why]}>{step.why}</Text>
      </View>

      {step.tools.length > 0 && (
        <View style={styles.section}>
          <Text style={typography.label}>TOOLS NEEDED</Text>
          <View style={styles.chipRow}>
            {step.tools.map((tool) => (
              <View key={tool} style={styles.toolChip}>
                <Text style={styles.toolChipText}>{tool}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {step.stop_if.length > 0 && (
        <View style={[styles.section, styles.stopBlock]}>
          <Text style={[typography.label, styles.stopLabel]}>STOP IF</Text>
          {step.stop_if.map((condition, idx) => (
            <Text key={idx} style={[typography.body, styles.stopText]}>
              • {condition}
            </Text>
          ))}
        </View>
      )}

      {step.citation_ids.length > 0 && (
        <View style={styles.citationRow}>
          <Text style={typography.caption}>Cited: {step.citation_ids.join(', ')}</Text>
        </View>
      )}
    </GlassCard>
  );
}

const styles = StyleSheet.create({
  title: {
    marginTop: spacing.xs,
  },
  instruction: {
    marginTop: spacing.md,
  },
  whyBlock: {
    marginTop: spacing.lg,
  },
  why: {
    marginTop: spacing.xs,
  },
  section: {
    marginTop: spacing.lg,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  toolChip: {
    backgroundColor: colors.surfaceElevated,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
  },
  toolChipText: {
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: '600',
  },
  stopBlock: {
    backgroundColor: colors.red + '14',
    borderRadius: radius.md,
    padding: spacing.md,
  },
  stopLabel: {
    color: colors.red,
  },
  stopText: {
    color: colors.textPrimary,
    marginTop: spacing.xs,
  },
  citationRow: {
    marginTop: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.divider,
    paddingTop: spacing.sm,
  },
});
