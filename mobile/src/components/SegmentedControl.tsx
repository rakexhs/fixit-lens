import React from 'react';
import { LayoutChangeEvent, StyleSheet, Text, View } from 'react-native';
import { AnimatedPressable } from './AnimatedPressable';
import { colors, radius, spacing, typography } from '../theme';

interface Props<T extends string> {
  segments: { value: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
}

// iOS-style segmented control with a sliding selection pill.
export function SegmentedControl<T extends string>({ segments, value, onChange }: Props<T>) {
  const [width, setWidth] = React.useState(0);
  const onLayout = (e: LayoutChangeEvent) => setWidth(e.nativeEvent.layout.width);
  const segWidth = width > 0 ? (width - 6) / segments.length : 0;
  const activeIndex = Math.max(0, segments.findIndex((s) => s.value === value));

  return (
    <View style={styles.track} onLayout={onLayout}>
      {segWidth > 0 && (
        <View
          style={[
            styles.pill,
            { width: segWidth, transform: [{ translateX: activeIndex * segWidth }] },
          ]}
        />
      )}
      {segments.map((seg) => {
        const active = seg.value === value;
        return (
          <AnimatedPressable
            key={seg.value}
            haptic="selection"
            scaleTo={0.97}
            onPress={() => onChange(seg.value)}
            style={styles.segment}
          >
            <Text style={[typography.footnote, active && styles.activeLabel]}>{seg.label}</Text>
          </AnimatedPressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: radius.pill,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.surfaceBorder,
    padding: 3,
  },
  pill: {
    position: 'absolute',
    top: 3,
    left: 3,
    bottom: 3,
    backgroundColor: colors.surfaceHigh,
    borderRadius: radius.pill,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.surfaceBorderStrong,
  },
  segment: {
    flex: 1,
    paddingVertical: spacing.sm + 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeLabel: {
    color: colors.textPrimary,
    fontWeight: '700',
  },
});
