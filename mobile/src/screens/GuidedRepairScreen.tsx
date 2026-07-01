import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/RootNavigator';
import { Screen } from '../components/Screen';
import { AppHeader } from '../components/AppHeader';
import { StepCard } from '../components/StepCard';
import { ProgressBar } from '../components/ProgressBar';
import { StepDots } from '../components/StepDots';
import { PrimaryButton } from '../components/PrimaryButton';
import { EmptyState } from '../components/EmptyState';
import { spacing, typography } from '../theme';
import { useRepairSessionStore } from '../state/repairSessionStore';
import * as api from '../services/apiClient';
import type { FeedbackResult } from '../services/types';

type Nav = NativeStackNavigationProp<RootStackParamList, 'GuidedRepair'>;

export function GuidedRepairScreen() {
  const navigation = useNavigation<Nav>();
  const diagnoseResult = useRepairSessionStore((s) => s.diagnoseResult);
  const currentStepIndex = useRepairSessionStore((s) => s.currentStepIndex);
  const goToNextStep = useRepairSessionStore((s) => s.goToNextStep);
  const goToPreviousStep = useRepairSessionStore((s) => s.goToPreviousStep);
  const [submitting, setSubmitting] = useState(false);

  if (!diagnoseResult || diagnoseResult.steps.length === 0) {
    return (
      <Screen>
        <View style={styles.center}>
          <EmptyState
            icon="wrench"
            title="No guided steps"
            message="There isn't a guided repair sequence for this diagnosis."
            actionLabel="Back to diagnosis"
            onAction={() => navigation.navigate('Diagnosis')}
          />
        </View>
      </Screen>
    );
  }

  const steps = diagnoseResult.steps;
  const step = steps[currentStepIndex];
  const isLast = currentStepIndex === steps.length - 1;
  const progress = (currentStepIndex + 1) / steps.length;

  const recordFeedback = async (result: FeedbackResult) => {
    setSubmitting(true);
    try {
      await api.submitFeedback({ session_id: diagnoseResult.session_id, step_number: step.step_number, result });
    } catch {
      // best-effort
    } finally {
      setSubmitting(false);
    }
    if (result === 'stop' || isLast) {
      navigation.navigate('Diagnosis');
      return;
    }
    goToNextStep();
  };

  return (
    <Screen edges={['top']}>
      <View style={styles.headerPad}>
        <AppHeader
          title="Guided fix"
          rightAction={currentStepIndex > 0 ? { icon: 'back', onPress: goToPreviousStep, accessibilityLabel: 'Previous step' } : undefined}
        />
        <View style={styles.progressRow}>
          <ProgressBar progress={progress} />
          <Text style={[typography.caption, styles.progressLabel]}>{currentStepIndex + 1}/{steps.length}</Text>
        </View>
        <View style={styles.dotsRow}>
          <StepDots total={steps.length} current={currentStepIndex} />
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <StepCard step={step} totalSteps={steps.length} />
      </ScrollView>

      <View style={styles.footer}>
        <View style={styles.footerRow}>
          <PrimaryButton label="Didn't work" icon="close" variant="ghost" onPress={() => recordFeedback('didnt_work')} disabled={submitting} style={styles.btn} />
          <PrimaryButton label="Skip" icon="skip" variant="ghost" onPress={() => recordFeedback('skip')} disabled={submitting} style={styles.btn} />
        </View>
        <View style={styles.footerRow}>
          <PrimaryButton label="Stop" icon="stop" variant="danger" onPress={() => recordFeedback('stop')} disabled={submitting} style={styles.btn} />
          <PrimaryButton label={isLast ? 'Finish' : 'Done'} icon="check" onPress={() => recordFeedback('done')} disabled={submitting} style={styles.btn} />
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  headerPad: { paddingHorizontal: spacing.xl },
  progressRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, marginTop: spacing.md },
  progressLabel: { width: 34, textAlign: 'right' },
  dotsRow: { marginTop: spacing.md },
  scroll: { paddingHorizontal: spacing.xl, paddingTop: spacing.lg, paddingBottom: spacing.xl },
  footer: { paddingHorizontal: spacing.xl, paddingTop: spacing.sm, paddingBottom: spacing.lg, gap: spacing.md },
  footerRow: { flexDirection: 'row', gap: spacing.md },
  btn: { flex: 1 },
});
