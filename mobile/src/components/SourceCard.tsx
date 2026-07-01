import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { GlassCard } from './GlassCard';
import { Icon } from './Icon';
import { colors, radius, spacing, typography } from '../theme';
import type { Source } from '../services/types';

export function SourceCard({ source }: { source: Source }) {
  return (
    <GlassCard style={styles.card}>
      <View style={styles.headerRow}>
        <View style={styles.titleWrap}>
          <Icon name="book" size={16} color={colors.accentAlt} />
          <Text style={[typography.bodyStrong, styles.title]} numberOfLines={2}>{source.title}</Text>
        </View>
        <View style={styles.scorePill}>
          <Text style={styles.scoreText}>{source.score.toFixed(2)}</Text>
        </View>
      </View>

      <Text style={styles.section}>
        {source.section}{source.page ? `  ·  p.${source.page}` : ''}
      </Text>
      <Text style={[typography.callout, styles.snippet]}>{source.snippet}</Text>

      <View style={styles.matchRow}>
        <Icon name="sparkles" size={12} color={colors.accent} />
        <Text style={styles.matchText}>{source.why_matched}</Text>
      </View>
      <Text style={typography.mono} numberOfLines={1}>{source.id}</Text>
    </GlassCard>
  );
}

const styles = StyleSheet.create({
  card: { marginBottom: spacing.md },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  titleWrap: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
  },
  title: { flex: 1 },
  scorePill: {
    backgroundColor: colors.accentAlt + '1A',
    borderColor: colors.accentAlt + '40',
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
  },
  scoreText: { color: colors.accentAlt, fontWeight: '800', fontSize: 12.5 },
  section: { marginTop: spacing.sm, ...typography.caption },
  snippet: { marginTop: spacing.sm },
  matchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: spacing.md,
  },
  matchText: { color: colors.accent, fontSize: 12, fontWeight: '600', flex: 1 },
});
