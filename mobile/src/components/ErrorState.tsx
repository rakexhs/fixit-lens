import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Icon } from './Icon';
import { PrimaryButton } from './PrimaryButton';
import { colors, radius, spacing, typography } from '../theme';

interface Props {
  title?: string;
  message: string;
  retryLabel?: string;
  onRetry?: () => void;
}

export function ErrorState({ title = 'Something went wrong', message, retryLabel = 'Try again', onRetry }: Props) {
  return (
    <View style={styles.container}>
      <View style={styles.iconWrap}>
        <Icon name="danger" size={30} color={colors.danger} />
      </View>
      <Text style={[typography.title2, styles.title]}>{title}</Text>
      <Text style={[typography.body, styles.message]}>{message}</Text>
      {onRetry && <PrimaryButton label={retryLabel} icon="retake" onPress={onRetry} style={styles.action} />}
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
    borderColor: 'rgba(251,92,99,0.3)',
    backgroundColor: 'rgba(251,92,99,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  title: { textAlign: 'center' },
  message: { textAlign: 'center', marginTop: spacing.sm, maxWidth: 320 },
  action: { marginTop: spacing.xl, minWidth: 220 },
});
