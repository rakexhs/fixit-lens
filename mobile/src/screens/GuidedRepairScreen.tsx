import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/RootNavigator';
import { GradientBackground } from '../components/GradientBackground';
import { StepCard } from '../components/StepCard';
import { PrimaryButton } from '../components/PrimaryButton';
import { EmptyState } from '../components/EmptyState';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';
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
      <GradientBackground>
        <View style={styles.centered}>
          <EmptyState
            title="No guided steps available"
            message="There isn't a guided repair sequence for this diagnosis."
            actionLabel="Back to diagnosis"
            onAction={() => navigation.navigate('Diagnosis')}
          />
        </View>
      </GradientBackground>
    );
  }

  const steps = diagnoseResult.steps;
  const step = steps[currentStepIndex];
  const isLastStep = currentStepIndex === steps.length - 1;

  const recordFeedback = async (result: FeedbackResult) => {
    setSubmitting(true);
    try {
      await api.submitFeedback({ session_id: diagnoseResult.session_id, step_number: step.step_number, result });
    } catch {
      // Feedback is best-effort; don't block the guided flow if it fails.
    } finally {
      setSubmitting(false);
    }

    if (result === 'stop') {
      navigation.navigate('Diagnosis');
      return;
    }
    if (isLastStep) {
      navigation.navigate('Diagnosis');
      return;
    }
    goToNextStep();
  };

  return (
    <GradientBackground>
      <View style={styles.header}>
        <Text style={typography.title}>Guided fix</Text>
        {currentStepIndex > 0 && (
          <PrimaryButton label="Back" variant="secondary" onPress={goToPreviousStep} style={styles.backButton} />
        )}
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <StepCard step={step} totalSteps={steps.length} />
      </ScrollView>

      <View style={styles.footer}>
        <View style={styles.footerRow}>
          <PrimaryButton
            label="Didn't work"
            variant="secondary"
            onPress={() => recordFeedback('didnt_work')}
            disabled={submitting}
            style={styles.footerButton}
          />
          <PrimaryButton
            label="Skip"
            variant="secondary"
            onPress={() => recordFeedback('skip')}
            disabled={submitting}
            style={styles.footerButton}
          />
        </View>
        <View style={styles.footerRow}>
          <PrimaryButton
            label="Stop"
            variant="danger"
            onPress={() => recordFeedback('stop')}
            disabled={submitting}
            style={styles.footerButton}
          />
          <PrimaryButton
            label={isLastStep ? 'Done - finish' : 'Done - next step'}
            onPress={() => recordFeedback('done')}
            disabled={submitting}
            style={styles.footerButton}
          />
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
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xxl,
  },
  backButton: {
    minWidth: 90,
  },
  scrollContent: {
    padding: spacing.lg,
  },
  footer: {
    padding: spacing.lg,
    gap: spacing.sm,
  },
  footerRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  footerButton: {
    flex: 1,
  },
});
