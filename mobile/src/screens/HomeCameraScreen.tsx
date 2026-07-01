import React, { useRef, useState } from 'react';
import { Platform, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/RootNavigator';
import { GradientBackground } from '../components/GradientBackground';
import { CameraOverlay } from '../components/CameraOverlay';
import { CaptureButton } from '../components/CaptureButton';
import { AnimatedPressable } from '../components/AnimatedPressable';
import { Icon } from '../components/Icon';
import { EmptyState } from '../components/EmptyState';
import { colors, radius, spacing, typography } from '../theme';
import { useRepairSessionStore } from '../state/repairSessionStore';

type Nav = NativeStackNavigationProp<RootStackParamList, 'HomeCamera'>;

export function HomeCameraScreen() {
  const navigation = useNavigation<Nav>();
  const cameraRef = useRef<CameraView | null>(null);
  const [permission, requestPermission] = useCameraPermissions();
  const [isCapturing, setIsCapturing] = useState(false);
  const setCapturedImage = useRepairSessionStore((s) => s.setCapturedImage);
  const setUserHint = useRepairSessionStore((s) => s.setUserHint);

  const goToPreview = (uri: string) => {
    setUserHint(null);
    setCapturedImage(uri);
    navigation.navigate('ImagePreview');
  };

  const handleCapture = async () => {
    if (!cameraRef.current || isCapturing) return;
    setIsCapturing(true);
    try {
      const photo = await cameraRef.current.takePictureAsync({ quality: 0.85 });
      if (photo?.uri) goToPreview(photo.uri);
    } catch {
      // user can retry or use library
    } finally {
      setIsCapturing(false);
    }
  };

  const handlePickFromLibrary = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 0.85 });
    if (!result.canceled && result.assets[0]) goToPreview(result.assets[0].uri);
  };

  const showCamera = permission?.granted && Platform.OS !== 'web';

  return (
    <GradientBackground>
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.brandRow}>
            <View style={styles.logoMark}>
              <Icon name="scan" size={20} color={colors.accentAlt} />
            </View>
            <View>
              <Text style={typography.title2}>FixIt Lens</Text>
              <Text style={typography.caption}>Camera-guided repair assistant</Text>
            </View>
          </View>
          <AnimatedPressable haptic="light" onPress={() => navigation.navigate('Settings')} style={styles.headerIcon}>
            <Icon name="settings" size={20} color={colors.textPrimary} />
          </AnimatedPressable>
        </View>

        {/* Viewfinder */}
        <View style={styles.viewfinder}>
          {showCamera ? (
            <CameraView ref={cameraRef} style={StyleSheet.absoluteFill} facing="back" />
          ) : (
            <View style={[StyleSheet.absoluteFill, styles.fallback]} />
          )}
          <View style={styles.overlayCenter}>
            <CameraOverlay />
          </View>

          {!permission?.granted && Platform.OS !== 'web' && (
            <View style={styles.permission}>
              <EmptyState
                icon="camera"
                title="Camera access needed"
                message="Allow camera access to scan device labels, error codes, and warning lights."
                actionLabel="Enable camera"
                onAction={requestPermission}
              />
            </View>
          )}

          {Platform.OS === 'web' && (
            <View style={styles.webNote}>
              <Icon name="info" size={14} color={colors.textTertiary} />
              <Text style={typography.caption}>Live camera is available on the iOS app. Use the gallery to test here.</Text>
            </View>
          )}
        </View>

        {/* Controls */}
        <View style={styles.controls}>
          <View style={styles.captureRow}>
            <AnimatedPressable haptic="light" onPress={handlePickFromLibrary} style={styles.sideBtn}>
              <Icon name="gallery" size={22} color={colors.textPrimary} />
            </AnimatedPressable>
            <CaptureButton onPress={handleCapture} disabled={!showCamera || isCapturing} />
            <AnimatedPressable haptic="light" onPress={() => navigation.navigate('ManualInput')} style={styles.sideBtn}>
              <Icon name="keyboard" size={22} color={colors.textPrimary} />
            </AnimatedPressable>
          </View>

          <View style={styles.pillRow}>
            <AnimatedPressable haptic="light" onPress={() => navigation.navigate('ManualInput')} style={styles.pill}>
              <Icon name="keyboard" size={16} color={colors.accentAlt} />
              <Text style={typography.footnote}>Type error code</Text>
            </AnimatedPressable>
            <AnimatedPressable haptic="light" onPress={() => navigation.navigate('History')} style={styles.pill}>
              <Icon name="history" size={16} color={colors.accentAlt} />
              <Text style={typography.footnote}>History</Text>
            </AnimatedPressable>
          </View>
        </View>
      </SafeAreaView>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.sm,
  },
  brandRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  logoMark: {
    width: 42,
    height: 42,
    borderRadius: radius.md,
    backgroundColor: colors.accentAlt + '18',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.accentAlt + '3D',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerIcon: {
    width: 42,
    height: 42,
    borderRadius: radius.pill,
    backgroundColor: colors.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.surfaceBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  viewfinder: {
    flex: 1,
    marginTop: spacing.xl,
    marginHorizontal: spacing.xl,
    borderRadius: radius.xxl,
    overflow: 'hidden',
    backgroundColor: '#0E1017',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.surfaceBorderStrong,
  },
  fallback: { backgroundColor: '#0E1017' },
  overlayCenter: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, alignItems: 'center', justifyContent: 'center' },
  permission: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: colors.overlay, alignItems: 'center', justifyContent: 'center' },
  webNote: {
    position: 'absolute',
    bottom: spacing.lg,
    left: spacing.lg,
    right: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: colors.scrim,
    borderRadius: radius.md,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  controls: { paddingHorizontal: spacing.xl, paddingTop: spacing.xl, paddingBottom: spacing.sm },
  captureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.xxl,
  },
  sideBtn: {
    width: 54,
    height: 54,
    borderRadius: radius.pill,
    backgroundColor: colors.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.surfaceBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pillRow: { flexDirection: 'row', gap: spacing.md, marginTop: spacing.xl },
  pill: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: colors.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.surfaceBorder,
    borderRadius: radius.pill,
    paddingVertical: spacing.md + 2,
  },
});
