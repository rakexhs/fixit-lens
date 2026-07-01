import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { AnimatedPressable } from './AnimatedPressable';
import { Icon, IconName } from './Icon';
import { colors, radius, spacing, typography } from '../theme';

interface Props {
  icon?: IconName;
  iconColor?: string;
  title: string;
  subtitle?: string;
  right?: React.ReactNode;
  onPress?: () => void;
  danger?: boolean;
  first?: boolean;
  last?: boolean;
}

// Grouped iOS settings-style row. Compose several inside a ListGroup.
export function ListRow({ icon, iconColor, title, subtitle, right, onPress, danger, first, last }: Props) {
  const body = (
    <View style={[styles.row, first && styles.first, last && styles.last]}>
      {icon && (
        <View style={[styles.iconWrap, danger && styles.iconWrapDanger]}>
          <Icon name={icon} size={17} color={iconColor ?? (danger ? colors.danger : colors.accentAlt)} />
        </View>
      )}
      <View style={styles.textWrap}>
        <Text style={[typography.bodyStrong, danger && styles.dangerText]} numberOfLines={1}>
          {title}
        </Text>
        {!!subtitle && <Text style={typography.caption} numberOfLines={2}>{subtitle}</Text>}
      </View>
      <View style={styles.rightWrap}>
        {right ?? (onPress ? <Icon name="chevronRight" size={18} color={colors.textFaint} /> : null)}
      </View>
    </View>
  );

  if (!onPress) return body;
  return (
    <AnimatedPressable haptic="light" scaleTo={0.99} onPress={onPress}>
      {body}
    </AnimatedPressable>
  );
}

export function ListGroup({ children, title }: { children: React.ReactNode; title?: string }) {
  const items = React.Children.toArray(children);
  return (
    <View style={styles.group}>
      {!!title && <Text style={[typography.overline, styles.groupTitle]}>{title}</Text>}
      <View style={styles.groupCard}>
        {items.map((child, i) =>
          React.isValidElement(child)
            ? React.cloneElement(child as React.ReactElement<Props>, {
                first: i === 0,
                last: i === items.length - 1,
              })
            : child
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  group: {
    marginTop: spacing.xl,
  },
  groupTitle: {
    marginBottom: spacing.sm,
    marginLeft: spacing.xs,
  },
  groupCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.surfaceBorder,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md + 2,
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.divider,
  },
  first: {
    borderTopWidth: 0,
  },
  last: {},
  iconWrap: {
    width: 34,
    height: 34,
    borderRadius: radius.sm,
    backgroundColor: colors.surfaceHigh,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrapDanger: {
    backgroundColor: 'rgba(251,92,99,0.14)',
  },
  textWrap: {
    flex: 1,
    gap: 2,
  },
  rightWrap: {
    marginLeft: spacing.sm,
  },
  dangerText: {
    color: colors.danger,
  },
});
