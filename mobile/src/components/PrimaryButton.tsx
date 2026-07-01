import React from 'react';
import { ActivityIndicator, StyleProp, StyleSheet, Text, View, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { AnimatedPressable } from './AnimatedPressable';
import { Icon, IconName } from './Icon';
import { colors, gradients, radius, shadows, spacing, typography } from '../theme';

interface Props {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  icon?: IconName;
  style?: StyleProp<ViewStyle>;
  fullWidth?: boolean;
}

export function PrimaryButton({
  label,
  onPress,
  disabled,
  loading,
  variant = 'primary',
  icon,
  style,
  fullWidth,
}: Props) {
  const isBusy = disabled || loading;

  const content = (labelColor: string) => (
    <View style={styles.inner}>
      {loading ? (
        <ActivityIndicator color={labelColor} />
      ) : (
        <>
          {icon && <Icon name={icon} size={18} color={labelColor} />}
          <Text style={[typography.button, { color: labelColor }]}>{label}</Text>
        </>
      )}
    </View>
  );

  if (variant === 'primary') {
    return (
      <AnimatedPressable
        onPress={onPress}
        disabled={isBusy}
        haptic="medium"
        accessibilityLabel={label}
        style={[fullWidth && styles.fullWidth, isBusy && styles.disabled, style]}
      >
        <LinearGradient
          colors={gradients.accent}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.base, shadows.accentGlow]}
        >
          {content('#0A0B0F')}
        </LinearGradient>
      </AnimatedPressable>
    );
  }

  if (variant === 'danger') {
    return (
      <AnimatedPressable
        onPress={onPress}
        disabled={isBusy}
        haptic="medium"
        accessibilityLabel={label}
        style={[fullWidth && styles.fullWidth, isBusy && styles.disabled, style]}
      >
        <View style={[styles.base, styles.dangerBase]}>{content(colors.danger)}</View>
      </AnimatedPressable>
    );
  }

  const isGhost = variant === 'ghost';
  return (
    <AnimatedPressable
      onPress={onPress}
      disabled={isBusy}
      haptic="light"
      accessibilityLabel={label}
      style={[fullWidth && styles.fullWidth, isBusy && styles.disabled, style]}
    >
      <View style={[styles.base, isGhost ? styles.ghostBase : styles.secondaryBase]}>
        {content(colors.textPrimary)}
      </View>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: radius.pill,
    minHeight: 54,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
  },
  inner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  secondaryBase: {
    backgroundColor: colors.surfaceRaised,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.surfaceBorderStrong,
  },
  ghostBase: {
    backgroundColor: 'transparent',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.surfaceBorder,
  },
  dangerBase: {
    backgroundColor: 'rgba(251,92,99,0.12)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(251,92,99,0.4)',
  },
  fullWidth: {
    width: '100%',
  },
  disabled: {
    opacity: 0.45,
  },
});
