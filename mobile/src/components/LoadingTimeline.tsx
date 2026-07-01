import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Animated, StyleSheet, Text, View } from 'react-native';
import { Icon, IconName } from './Icon';
import { colors, spacing, typography } from '../theme';

interface Stage {
  label: string;
  icon: IconName;
}

const DEFAULT_STAGES: Stage[] = [
  { label: 'Reading visible text', icon: 'scan' },
  { label: 'Identifying device', icon: 'sparkles' },
  { label: 'Searching manuals', icon: 'book' },
  { label: 'Checking safety', icon: 'shield' },
  { label: 'Preparing guided steps', icon: 'wrench' },
];

export function LoadingTimeline({ stages = DEFAULT_STAGES, intervalMs = 850 }: { stages?: Stage[]; intervalMs?: number }) {
  const [active, setActive] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setActive((p) => (p + 1 < stages.length ? p + 1 : p)), intervalMs);
    return () => clearInterval(id);
  }, [stages.length, intervalMs]);

  return (
    <View style={styles.container}>
      {stages.map((stage, i) => {
        const done = i < active;
        const current = i === active;
        return (
          <Row key={stage.label} stage={stage} done={done} current={current} last={i === stages.length - 1} />
        );
      })}
    </View>
  );
}

function Row({ stage, done, current, last }: { stage: Stage; done: boolean; current: boolean; last: boolean }) {
  const [opacity] = useState(() => new Animated.Value(0.4));
  useEffect(() => {
    Animated.timing(opacity, { toValue: done || current ? 1 : 0.4, duration: 300, useNativeDriver: true }).start();
  }, [done, current, opacity]);

  return (
    <Animated.View style={[styles.row, { opacity }]}>
      <View style={styles.markerCol}>
        <View
          style={[
            styles.node,
            done && styles.nodeDone,
            current && styles.nodeCurrent,
          ]}
        >
          {done ? (
            <Icon name="check" size={13} color={colors.background} />
          ) : current ? (
            <ActivityIndicator size="small" color={colors.accentAlt} />
          ) : (
            <Icon name={stage.icon} size={13} color={colors.textFaint} />
          )}
        </View>
        {!last && <View style={[styles.line, done && styles.lineDone]} />}
      </View>
      <Text style={[typography.body, (done || current) && styles.activeText]}>{stage.label}</Text>
    </Animated.View>
  );
}

const NODE = 34;
const styles = StyleSheet.create({
  container: { alignSelf: 'stretch' },
  row: { flexDirection: 'row', minHeight: 56 },
  markerCol: { alignItems: 'center', width: NODE, marginRight: spacing.lg },
  node: {
    width: NODE,
    height: NODE,
    borderRadius: NODE / 2,
    backgroundColor: colors.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.surfaceBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nodeCurrent: {
    borderColor: colors.accentAlt,
    backgroundColor: colors.accentAlt + '1A',
  },
  nodeDone: {
    backgroundColor: colors.success,
    borderColor: colors.success,
  },
  line: {
    width: 2,
    flex: 1,
    backgroundColor: colors.divider,
    marginVertical: 2,
    borderRadius: 1,
  },
  lineDone: { backgroundColor: colors.success },
  activeText: { color: colors.textPrimary, fontWeight: '600', alignSelf: 'center' },
});
