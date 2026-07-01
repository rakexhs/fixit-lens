import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Icon, IconName } from './Icon';
import { PrimaryButton } from './PrimaryButton';
import { colors, radius, spacing, typography } from '../theme';

interface Props {
  icon?: IconName;
  title: string;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
  tone?: 'default' | 'danger';
}

export function EmptyState({ icon = 'scan', title, message, actionLabel, onAction, tone = 'default' }: Props) {
  const tint = tone === 'danger' ? colors.danger : colors.accentAlt;
  return (
    <View style={styles.container}>
      <View style={[styles.iconWrap, { borderColor: tint + '33', backgroundColor: tint + '12' }]}>
        <Icon name={icon} size={30} color={tint} />
      </View>
      <Text style={[typography.title2, styles.title]}>{title}</Text>
      <Text style={[typography.body, styles.message]}>{message}</Text>
      {actionLabel && onAction && (
        <PrimaryButton
          label={actionLabel}
          onPress={onAction}
          variant="secondary"
          style={styles.action}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
  },
  iconWrap: {
    width: 72,
    height: 72,
    borderRadius: radius.xl,
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  title: { textAlign: 'center' },
  message: { textAlign: 'center', marginTop: spacing.sm, maxWidth: 320 },
  action: { marginTop: spacing.xl, minWidth: 220 },
});
