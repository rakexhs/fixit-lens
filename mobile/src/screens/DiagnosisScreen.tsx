import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/RootNavigator';
import { GradientBackground } from '../components/GradientBackground';
import { GlassCard } from '../components/GlassCard';
import { ConfidenceChip } from '../components/ConfidenceChip';
import { SafetyBadge } from '../components/SafetyBadge';
import { OCRResultCard } from '../components/OCRResultCard';
import { PrimaryButton } from '../components/PrimaryButton';
import { EmptyState } from '../components/EmptyState';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';
import { useRepairSessionStore } from '../state/repairSessionStore';

type Nav = NativeStackNavigationProp<RootStackParamList, 'Diagnosis'>;

export function DiagnosisScreen() {
  const navigation = useNavigation<Nav>();
  const diagnoseResult = useRepairSessionStore((s) => s.diagnoseResult);
  const analyzeResult = useRepairSessionStore((s) => s.analyzeResult);

  if (!diagnoseResult) {
    return (
      <GradientBackground>
        <View style={styles.centered}>
          <EmptyState
            title="No diagnosis yet"
            message="Scan a device or type in details to get started."
            actionLabel="Start over"
            onAction={() => navigation.navigate('HomeCamera')}
          />
        </View>
      </GradientBackground>
    );
  }

  const { diagnosis, safety, steps, sources, clarifying_question } = diagnoseResult;

  return (
    <GradientBackground>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={typography.label}>DIAGNOSIS</Text>
        <Text style={[typography.display, styles.issue]}>{diagnosis.likely_issue}</Text>

        <View style={styles.chipRow}>
          <ConfidenceChip confidence={diagnosis.confidence} label="diagnosis confidence" />
          <SafetyBadge riskLevel={safety.risk_level} blocked={safety.blocked} />
        </View>

        <GlassCard style={styles.card}>
          <Text style={typography.label}>WHY</Text>
          <Text style={[typography.body, styles.reasoning]}>{diagnosis.reasoning_summary}</Text>
        </GlassCard>

        {safety.blocked && (
          <GlassCard style={[styles.card, styles.dangerCard]}>
            <Text style={[typography.label, styles.dangerLabel]}>PROFESSIONAL REQUIRED</Text>
            {safety.warnings.map((warning, idx) => (
              <Text key={idx} style={[typography.body, styles.dangerText]}>
                {warning}
              </Text>
            ))}
          </GlassCard>
        )}

        {!safety.blocked && safety.warnings.length > 0 && (
          <GlassCard style={styles.card}>
            <Text style={typography.label}>WARNINGS</Text>
            {safety.warnings.map((warning, idx) => (
              <Text key={idx} style={[typography.body, styles.warningText]}>
                {warning}
              </Text>
            ))}
          </GlassCard>
        )}

        {analyzeResult && (
          <View style={styles.card}>
            <OCRResultCard ocr={analyzeResult.ocr} />
          </View>
        )}

        {clarifying_question && (
          <GlassCard style={styles.card}>
            <Text style={typography.label}>ONE MORE THING</Text>
            <Text style={[typography.body, styles.reasoning]}>{clarifying_question}</Text>
          </GlassCard>
        )}

        <View style={styles.actions}>
          {!safety.blocked && steps.length > 0 && (
            <PrimaryButton
              label="Start guided fix"
              onPress={() => navigation.navigate('GuidedRepair')}
              style={styles.actionButton}
            />
          )}
          {sources.length > 0 && (
            <PrimaryButton
              label={`View sources (${sources.length})`}
              variant="secondary"
              onPress={() => navigation.navigate('Sources')}
              style={styles.actionButton}
            />
          )}
          <PrimaryButton
            label="Type more details"
            variant="secondary"
            onPress={() => navigation.navigate('ManualInput')}
            style={styles.actionButton}
          />
        </View>
      </ScrollView>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    padding: spacing.lg,
    paddingTop: spacing.xxl,
    paddingBottom: spacing.xxl,
  },
  issue: {
    marginTop: spacing.sm,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginTop: spacing.lg,
  },
  card: {
    marginTop: spacing.lg,
  },
  reasoning: {
    marginTop: spacing.xs,
  },
  dangerCard: {
    borderColor: colors.red + '55',
  },
  dangerLabel: {
    color: colors.red,
  },
  dangerText: {
    marginTop: spacing.xs,
    color: colors.textPrimary,
  },
  warningText: {
    marginTop: spacing.xs,
  },
  actions: {
    marginTop: spacing.xl,
    gap: spacing.sm,
  },
  actionButton: {
    width: '100%',
  },
});
