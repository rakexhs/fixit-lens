import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';
import type { OCRResult } from '../services/types';
import { GlassCard } from './GlassCard';
import { ConfidenceChip } from './ConfidenceChip';

export function OCRResultCard({ ocr }: { ocr: OCRResult }) {
  return (
    <GlassCard>
      <Text style={typography.label}>DETECTED TEXT</Text>
      <Text style={[typography.bodyStrong, styles.text]}>
        {ocr.text?.trim() ? ocr.text : 'No visible text detected'}
      </Text>
      <View style={styles.footer}>
        <ConfidenceChip confidence={ocr.confidence} label="OCR confidence" />
      </View>
    </GlassCard>
  );
}

const styles = StyleSheet.create({
  text: {
    marginTop: spacing.sm,
  },
  footer: {
    marginTop: spacing.md,
  },
});
