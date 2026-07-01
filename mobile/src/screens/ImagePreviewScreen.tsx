import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/RootNavigator';
import { GradientBackground } from '../components/GradientBackground';
import { GlassCard } from '../components/GlassCard';
import { PrimaryButton } from '../components/PrimaryButton';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';
import { useRepairSessionStore } from '../state/repairSessionStore';

type Nav = NativeStackNavigationProp<RootStackParamList, 'ImagePreview'>;

export function ImagePreviewScreen() {
  const navigation = useNavigation<Nav>();
  const capturedImageUri = useRepairSessionStore((s) => s.capturedImageUri);
  const setCapturedImage = useRepairSessionStore((s) => s.setCapturedImage);

  const handleRetake = () => {
    setCapturedImage(null);
    navigation.goBack();
  };

  const handleAnalyze = () => {
    navigation.navigate('AnalyzeProgress', { mode: 'image' });
  };

  return (
    <GradientBackground>
      <View style={styles.header}>
        <Text style={typography.title}>Review photo</Text>
        <Text style={[typography.body, styles.subtitle]}>
          Make sure the label, error code, or warning light is clearly visible.
        </Text>
      </View>

      <View style={styles.imageWrapper}>
        {capturedImageUri ? (
          <Image source={{ uri: capturedImageUri }} style={styles.image} resizeMode="cover" />
        ) : (
          <GlassCard>
            <Text style={typography.body}>No image captured yet.</Text>
          </GlassCard>
        )}
      </View>

      <View style={styles.footer}>
        <PrimaryButton label="Retake" variant="secondary" onPress={handleRetake} style={styles.footerButton} />
        <PrimaryButton label="Analyze" onPress={handleAnalyze} disabled={!capturedImageUri} style={styles.footerButton} />
      </View>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xxl,
  },
  subtitle: {
    marginTop: spacing.xs,
  },
  imageWrapper: {
    flex: 1,
    marginHorizontal: spacing.lg,
    marginVertical: spacing.lg,
    borderRadius: 28,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  footer: {
    flexDirection: 'row',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
  },
  footerButton: {
    flex: 1,
  },
});
