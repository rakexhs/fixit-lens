import React, { useRef, useState } from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/RootNavigator';
import { GradientBackground } from '../components/GradientBackground';
import { CameraOverlay } from '../components/CameraOverlay';
import { CaptureButton } from '../components/CaptureButton';
import { PrimaryButton } from '../components/PrimaryButton';
import { EmptyState } from '../components/EmptyState';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';
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
      // ignore; user can retry or use library upload
    } finally {
      setIsCapturing(false);
    }
  };

  const handlePickFromLibrary = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.85,
    });
    if (!result.canceled && result.assets[0]) {
      goToPreview(result.assets[0].uri);
    }
  };

  const showCamera = permission?.granted && Platform.OS !== 'web';

  return (
    <GradientBackground>
      <View style={styles.header}>
        <View>
          <Text style={typography.display}>FixIt Lens</Text>
          <Text style={[typography.body, styles.subtitle]}>Camera-guided AI repair assistant</Text>
        </View>
        <Pressable onPress={() => navigation.navigate('Settings')} style={styles.iconButton}>
          <Text style={styles.iconText}>⚙️</Text>
        </Pressable>
      </View>

      <View style={styles.cameraArea}>
        {showCamera ? (
          <CameraView ref={cameraRef} style={StyleSheet.absoluteFill} facing="back" />
        ) : (
          <View style={[StyleSheet.absoluteFill, styles.cameraFallback]} />
        )}
        <CameraOverlay />
        {!permission?.granted && Platform.OS !== 'web' && (
          <View style={styles.permissionOverlay}>
            <EmptyState
              icon="📷"
              title="Camera access needed"
              message="Allow camera access to scan device labels, error codes, and warning lights directly."
              actionLabel="Enable camera"
              onAction={requestPermission}
            />
          </View>
        )}
      </View>

      <View style={styles.controls}>
        <View style={styles.captureRow}>
          <View style={styles.sideButton} />
          <CaptureButton onPress={handleCapture} disabled={!showCamera || isCapturing} />
          <Pressable style={styles.sideButton} onPress={handlePickFromLibrary}>
            <Text style={styles.sideButtonText}>📁</Text>
          </Pressable>
        </View>

        <View style={styles.secondaryRow}>
          <PrimaryButton
            label="Type error code instead"
            variant="secondary"
            onPress={() => navigation.navigate('ManualInput')}
            style={styles.secondaryButton}
          />
          <PrimaryButton
            label="History"
            variant="secondary"
            onPress={() => navigation.navigate('History')}
            style={styles.secondaryButton}
          />
        </View>
      </View>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xxl,
  },
  subtitle: {
    marginTop: spacing.xs,
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconText: {
    fontSize: 18,
  },
  cameraArea: {
    flex: 1,
    marginTop: spacing.lg,
    marginHorizontal: spacing.lg,
    borderRadius: 28,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cameraFallback: {
    backgroundColor: '#12141C',
  },
  permissionOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: colors.overlay,
    alignItems: 'center',
    justifyContent: 'center',
  },
  controls: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
  },
  captureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.xl,
  },
  sideButton: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
  },
  sideButtonText: {
    fontSize: 20,
  },
  secondaryRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.lg,
  },
  secondaryButton: {
    flex: 1,
  },
});
