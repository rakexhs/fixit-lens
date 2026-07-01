import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';

const DEFAULT_STAGES = [
  'Reading visible text',
  'Identifying device',
  'Searching manuals',
  'Checking safety',
  'Preparing guided steps',
];

interface Props {
  stages?: string[];
  intervalMs?: number;
}

export function LoadingTimeline({ stages = DEFAULT_STAGES, intervalMs = 900 }: Props) {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1 < stages.length ? prev + 1 : prev));
    }, intervalMs);
    return () => clearInterval(interval);
  }, [stages.length, intervalMs]);

  return (
    <View style={styles.container}>
      {stages.map((stage, index) => {
        const isDone = index < activeIndex;
        const isActive = index === activeIndex;
        return (
          <View key={stage} style={styles.row}>
            <View style={styles.markerColumn}>
              <View
                style={[
                  styles.dot,
                  isDone && styles.dotDone,
                  isActive && styles.dotActive,
                ]}
              />
              {index < stages.length - 1 && (
                <View style={[styles.line, isDone && styles.lineDone]} />
              )}
            </View>
            <Text
              style={[
                typography.body,
                (isDone || isActive) && styles.textActive,
              ]}
            >
              {stage}
            </Text>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: spacing.md,
  },
  row: {
    flexDirection: 'row',
    minHeight: 44,
  },
  markerColumn: {
    alignItems: 'center',
    width: 24,
    marginRight: spacing.md,
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.surfaceBorder,
    borderWidth: 2,
    borderColor: colors.textTertiary,
  },
  dotActive: {
    borderColor: colors.cyan,
    backgroundColor: colors.cyan,
  },
  dotDone: {
    borderColor: colors.green,
    backgroundColor: colors.green,
  },
  line: {
    width: 2,
    flex: 1,
    backgroundColor: colors.divider,
    marginTop: 2,
  },
  lineDone: {
    backgroundColor: colors.green,
  },
  textActive: {
    color: colors.textPrimary,
    fontWeight: '600',
  },
});
