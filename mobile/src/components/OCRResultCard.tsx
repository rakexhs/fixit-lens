import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { GlassCard } from './GlassCard';
import { ConfidenceChip } from './ConfidenceChip';
import { Icon } from './Icon';
import { colors, spacing, typography } from '../theme';
import type { OCRResult } from '../services/types';

export function OCRResultCard({ ocr }: { ocr: OCRResult }) {
  const hasText = !!ocr.text?.trim();
  return (
    <GlassCard>
      <View style={styles.header}>
        <Icon name="scan" size={15} color={colors.accentAlt} />
        <Text style={typography.overline}>Detected text</Text>
      </View>
      <Text style={[typography.bodyStrong, styles.text, !hasText && styles.faint]}>
        {hasText ? `“${ocr.text}”` : 'No visible text detected'}
      </Text>
      {hasText && (
        <View style={styles.footer}>
          <ConfidenceChip confidence={ocr.confidence} label="OCR confidence" />
        </View>
      )}
    </GlassCard>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  text: { marginTop: spacing.md, lineHeight: 22 },
  faint: { color: colors.textTertiary, fontStyle: 'italic' },
  footer: { marginTop: spacing.lg },
});
