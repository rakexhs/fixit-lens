import React from 'react';
import { RefreshControlProps, ScrollView, StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { Edge, SafeAreaView } from 'react-native-safe-area-context';
import { GradientBackground } from './GradientBackground';
import { spacing } from '../theme';

interface Props {
  children: React.ReactNode;
  scroll?: boolean;
  contentStyle?: StyleProp<ViewStyle>;
  edges?: readonly Edge[];
  refreshControl?: React.ReactElement<RefreshControlProps>;
  keyboardShouldPersistTaps?: boolean;
}

// Every screen sits on the gradient, respects the notch/home indicator, and
// gets consistent horizontal gutters.
export function Screen({
  children,
  scroll = false,
  contentStyle,
  edges = ['top', 'bottom'],
  refreshControl,
  keyboardShouldPersistTaps,
}: Props) {
  return (
    <GradientBackground>
      <SafeAreaView style={styles.safe} edges={edges}>
        {scroll ? (
          <ScrollView
            contentContainerStyle={[styles.content, contentStyle]}
            showsVerticalScrollIndicator={false}
            refreshControl={refreshControl}
            keyboardShouldPersistTaps={keyboardShouldPersistTaps ? 'handled' : 'never'}
          >
            {children}
          </ScrollView>
        ) : (
          <View style={[styles.flex, contentStyle]}>{children}</View>
        )}
      </SafeAreaView>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  flex: { flex: 1 },
  content: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xxxl,
  },
});
