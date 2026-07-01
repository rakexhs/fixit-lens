import React, { useCallback, useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/RootNavigator';
import { GradientBackground } from '../components/GradientBackground';
import { LoadingTimeline } from '../components/LoadingTimeline';
import { ErrorState } from '../components/ErrorState';
import { EmptyState } from '../components/EmptyState';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';
import { useRepairSessionStore } from '../state/repairSessionStore';
import * as api from '../services/apiClient';
import { ApiError } from '../services/apiClient';

type Nav = NativeStackNavigationProp<RootStackParamList, 'AnalyzeProgress'>;
type Rt = RouteProp<RootStackParamList, 'AnalyzeProgress'>;

type Status = 'loading' | 'error' | 'unusable_image';

export function AnalyzeProgressScreen() {
  const navigation = useNavigation<Nav>();
  const route = useRoute<Rt>();
  const [status, setStatus] = useState<Status>('loading');
  const [message, setMessage] = useState('');
  const [issues, setIssues] = useState<string[]>([]);

  const capturedImageUri = useRepairSessionStore((s) => s.capturedImageUri);
  const userHint = useRepairSessionStore((s) => s.userHint);
  const pendingDiagnoseRequest = useRepairSessionStore((s) => s.pendingDiagnoseRequest);
  const setAnalyzeResult = useRepairSessionStore((s) => s.setAnalyzeResult);
  const setDiagnoseResult = useRepairSessionStore((s) => s.setDiagnoseResult);

  const run = useCallback(async () => {
    setStatus('loading');
    try {
      if (route.params.mode === 'image') {
        if (!capturedImageUri) throw new ApiError('No image was captured. Please retake the photo.');

        const analyzeResult = await api.analyzeImage(
          capturedImageUri,
          'capture.jpg',
          'image/jpeg',
          userHint ?? undefined
        );
        setAnalyzeResult(analyzeResult);

        if (!analyzeResult.image_quality.usable) {
          setIssues(analyzeResult.image_quality.issues);
          setStatus('unusable_image');
          return;
        }

        const diagnoseResult = await api.diagnose({
          session_id: analyzeResult.session_id,
          device_category: analyzeResult.detected_device.category,
          brand: analyzeResult.detected_device.brand,
          model: analyzeResult.detected_device.model,
          error_code: analyzeResult.detected_problem.error_code,
          symptom: analyzeResult.detected_problem.symptom,
        });
        setDiagnoseResult(diagnoseResult);
        navigation.replace('Diagnosis');
      } else {
        if (!pendingDiagnoseRequest) throw new ApiError('Please enter some details about the device or issue.');
        const diagnoseResult = await api.diagnose(pendingDiagnoseRequest);
        setDiagnoseResult(diagnoseResult);
        navigation.replace('Diagnosis');
      }
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : 'Something went wrong while analyzing this request.';
      setMessage(msg);
      setStatus('error');
    }
  }, [route.params.mode, capturedImageUri, userHint, pendingDiagnoseRequest, navigation, setAnalyzeResult, setDiagnoseResult]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- run() fetches on mount; its setState calls happen after awaiting the API response, not synchronously.
    void run();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (status === 'error') {
    return (
      <GradientBackground>
        <View style={styles.centered}>
          <ErrorState message={message} onRetry={run} />
        </View>
      </GradientBackground>
    );
  }

  if (status === 'unusable_image') {
    return (
      <GradientBackground>
        <View style={styles.centered}>
          <EmptyState
            icon="🖼️"
            title="Image needs a retake"
            message={issues[0] ?? 'This image is too low quality to analyze confidently.'}
            actionLabel="Retake photo"
            onAction={() => navigation.navigate('HomeCamera')}
          />
        </View>
      </GradientBackground>
    );
  }

  return (
    <GradientBackground>
      <View style={styles.centered}>
        <Text style={typography.title}>Analyzing…</Text>
        <Text style={[typography.body, styles.subtitle]}>This usually takes a few seconds.</Text>
        <View style={styles.timelineWrapper}>
          <LoadingTimeline />
        </View>
      </View>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
  },
  subtitle: {
    marginTop: spacing.xs,
    textAlign: 'center',
  },
  timelineWrapper: {
    marginTop: spacing.xl,
    alignSelf: 'stretch',
  },
});
