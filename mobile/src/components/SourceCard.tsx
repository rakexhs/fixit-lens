import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';
import type { Source } from '../services/types';
import { GlassCard } from './GlassCard';

export function SourceCard({ source }: { source: Source }) {
  return (
    <GlassCard style={styles.card}>
      <View style={styles.headerRow}>
        <Text style={typography.bodyStrong}>{source.title}</Text>
        <Text style={styles.score}>{source.score.toFixed(2)}</Text>
      </View>
      <Text style={typography.caption}>{source.section}{source.page ? ` · p.${source.page}` : ''}</Text>
      <Text style={[typography.body, styles.snippet]}>{source.snippet}</Text>
      <Text style={styles.whyMatched}>Why matched: {source.why_matched}</Text>
      <Text style={styles.citationId}>{source.id}</Text>
    </GlassCard>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: spacing.md,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  score: {
    color: colors.cyan,
    fontWeight: '700',
    fontSize: 13,
  },
  snippet: {
    marginTop: spacing.sm,
  },
  whyMatched: {
    marginTop: spacing.sm,
    color: colors.violet,
    fontSize: 12,
    fontWeight: '600',
  },
  citationId: {
    marginTop: spacing.xs,
    color: colors.textTertiary,
    fontSize: 11,
  },
});
