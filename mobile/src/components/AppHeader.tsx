import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { AnimatedPressable } from './AnimatedPressable';
import { Icon, IconName } from './Icon';
import { colors, hitSlop, radius, spacing, typography } from '../theme';

interface HeaderAction {
  icon: IconName;
  onPress: () => void;
  accessibilityLabel?: string;
}

interface Props {
  title?: string;
  subtitle?: string;
  showBack?: boolean;
  rightAction?: HeaderAction;
  large?: boolean;
}

// A real navigation header: back chevron, centered/large title, optional action.
export function AppHeader({ title, subtitle, showBack = true, rightAction, large = false }: Props) {
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <View style={styles.side}>
          {showBack && navigation.canGoBack() && (
            <AnimatedPressable
              haptic="light"
              onPress={() => navigation.goBack()}
              accessibilityLabel="Go back"
              style={styles.iconButton}
            >
              <Icon name="back" size={22} color={colors.textPrimary} />
            </AnimatedPressable>
          )}
        </View>

        {!large && (
          <View style={styles.center}>
            {!!title && <Text style={typography.headline} numberOfLines={1}>{title}</Text>}
          </View>
        )}

        <View style={[styles.side, styles.sideRight]}>
          {rightAction && (
            <AnimatedPressable
              haptic="light"
              onPress={rightAction.onPress}
              accessibilityLabel={rightAction.accessibilityLabel}
              style={styles.iconButton}
              hitSlop={hitSlop}
            >
              <Icon name={rightAction.icon} size={20} color={colors.textPrimary} />
            </AnimatedPressable>
          )}
        </View>
      </View>

      {large && !!title && (
        <View style={styles.largeBlock}>
          <Text style={typography.largeTitle}>{title}</Text>
          {!!subtitle && <Text style={[typography.body, styles.subtitle]}>{subtitle}</Text>}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: spacing.sm,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 44,
  },
  side: {
    width: 44,
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  sideRight: {
    alignItems: 'flex-end',
  },
  center: {
    flex: 1,
    alignItems: 'center',
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.surfaceBorder,
  },
  largeBlock: {
    marginTop: spacing.md,
  },
  subtitle: {
    marginTop: spacing.xs,
  },
});
