import React from 'react';
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, gradients } from '../theme';

interface Props {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}

export function GradientBackground({ children, style }: Props) {
  return (
    <View style={[styles.container, style]}>
      <LinearGradient colors={gradients.background} style={StyleSheet.absoluteFill} />
      {/* Subtle accent glow bleeding from the top for depth */}
      <LinearGradient
        colors={['rgba(109,94,246,0.16)', 'rgba(109,94,246,0)']}
        style={styles.topGlow}
        pointerEvents="none"
      />
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  topGlow: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 280,
  },
});
