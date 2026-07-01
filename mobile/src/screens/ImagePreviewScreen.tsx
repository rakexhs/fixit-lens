import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/RootNavigator';
import { Screen } from '../components/Screen';
import { AppHeader } from '../components/AppHeader';
import { Icon } from '../components/Icon';
import { PrimaryButton } from '../components/PrimaryButton';
import { colors, radius, spacing, typography } from '../theme';
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

  return (
    <Screen>
      <View style={styles.headerPad}>
        <AppHeader title="Review photo" />
      </View>

      <View style={styles.body}>
        <Text style={[typography.body, styles.hint]}>
          Make sure the label, error code, or warning light is sharp and well-lit.
        </Text>

        <View style={styles.imageFrame}>
          {capturedImageUri ? (
            <Image source={{ uri: capturedImageUri }} style={styles.image} resizeMode="cover" />
          ) : (
            <View style={styles.placeholder}>
              <Icon name="gallery" size={28} color={colors.textFaint} />
            </View>
          )}
          <View style={styles.badge}>
            <Icon name="scan" size={13} color={colors.accentAlt} />
            <Text style={styles.badgeText}>Ready to analyze</Text>
          </View>
        </View>
      </View>

      <View style={styles.footer}>
        <PrimaryButton label="Retake" icon="retake" variant="secondary" onPress={handleRetake} style={styles.btn} />
        <PrimaryButton
          label="Analyze"
          icon="sparkles"
          onPress={() => navigation.navigate('AnalyzeProgress', { mode: 'image' })}
          disabled={!capturedImageUri}
          style={styles.btn}
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  headerPad: { paddingHorizontal: spacing.xl },
  body: { flex: 1, paddingHorizontal: spacing.xl, marginTop: spacing.md },
  hint: { marginBottom: spacing.lg },
  imageFrame: {
    flex: 1,
    borderRadius: radius.xxl,
    overflow: 'hidden',
    backgroundColor: colors.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.surfaceBorderStrong,
  },
  image: { width: '100%', height: '100%' },
  placeholder: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  badge: {
    position: 'absolute',
    top: spacing.md,
    left: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.scrim,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
  },
  badgeText: { color: colors.textSecondary, fontSize: 12, fontWeight: '600' },
  footer: {
    flexDirection: 'row',
    gap: spacing.md,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.lg,
  },
  btn: { flex: 1 },
});
