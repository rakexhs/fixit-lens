import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/RootNavigator';
import { Screen } from '../components/Screen';
import { AppHeader } from '../components/AppHeader';
import { GlassCard } from '../components/GlassCard';
import { ConfidenceChip } from '../components/ConfidenceChip';
import { SafetyBadge } from '../components/SafetyBadge';
import { SeverityRing } from '../components/SeverityRing';
import { OCRResultCard } from '../components/OCRResultCard';
import { PrimaryButton } from '../components/PrimaryButton';
import { EmptyState } from '../components/EmptyState';
import { Icon, IconName } from '../components/Icon';
import { colors, spacing, typography } from '../theme';
import { useRepairSessionStore } from '../state/repairSessionStore';
import { titleCase } from '../utils/formatters';

type Nav = NativeStackNavigationProp<RootStackParamList, 'Diagnosis'>;

const CATEGORY_ICON: Record<string, IconName> = {
  router: 'router',
  laptop: 'laptop',
  dishwasher: 'appliance',
  washing_machine: 'appliance',
  dangerous: 'danger',
};

export function DiagnosisScreen() {
  const navigation = useNavigation<Nav>();
  const diagnoseResult = useRepairSessionStore((s) => s.diagnoseResult);
  const analyzeResult = useRepairSessionStore((s) => s.analyzeResult);

  if (!diagnoseResult) {
    return (
      <Screen>
        <View style={styles.center}>
          <EmptyState
            title="No diagnosis yet"
            message="Scan a device or type in details to get started."
            actionLabel="Start over"
            onAction={() => navigation.navigate('HomeCamera')}
          />
        </View>
      </Screen>
    );
  }

  const { diagnosis, safety, steps, sources, clarifying_question } = diagnoseResult;
  const device = analyzeResult?.detected_device;
  const category = device?.category ?? 'unknown';
  const deviceLine = device?.brand ? `${device.brand}${device.model ? ` · ${device.model}` : ''}` : titleCase(category);

  return (
    <Screen scroll contentStyle={styles.scroll}>
      <AppHeader title="Diagnosis" />

      {/* Hero */}
      <GlassCard tone={safety.blocked ? 'danger' : 'raised'} style={styles.hero}>
        <View style={styles.heroTop}>
          <View style={styles.heroText}>
            <View style={styles.deviceRow}>
              <Icon name={CATEGORY_ICON[category] ?? 'appliance'} size={14} color={colors.textTertiary} />
              <Text style={typography.overline}>{deviceLine}</Text>
            </View>
            <Text style={[typography.title, styles.issue]}>{diagnosis.likely_issue}</Text>
          </View>
          <SeverityRing level={safety.risk_level} />
        </View>
        <View style={styles.chipRow}>
          <ConfidenceChip confidence={diagnosis.confidence} label="confidence" />
          <SafetyBadge riskLevel={safety.risk_level} blocked={safety.blocked} />
        </View>
      </GlassCard>

      {/* Reasoning */}
      <GlassCard style={styles.card}>
        <View style={styles.cardHeader}>
          <Icon name="bulb" size={15} color={colors.accentAlt} />
          <Text style={typography.overline}>Why we think this</Text>
        </View>
        <Text style={[typography.body, styles.reasoning]}>{diagnosis.reasoning_summary}</Text>
      </GlassCard>

      {/* Safety block */}
      {safety.blocked && (
        <GlassCard tone="danger" style={styles.card}>
          <View style={styles.cardHeader}>
            <Icon name="block" size={16} color={colors.danger} />
            <Text style={[typography.overline, { color: colors.danger }]}>Professional required</Text>
          </View>
          {safety.warnings.map((w, i) => (
            <Text key={i} style={[typography.body, styles.warnText]}>{w}</Text>
          ))}
        </GlassCard>
      )}

      {!safety.blocked && safety.warnings.length > 0 && (
        <GlassCard style={styles.card}>
          <View style={styles.cardHeader}>
            <Icon name="shieldAlert" size={15} color={colors.warning} />
            <Text style={[typography.overline, { color: colors.warning }]}>Before you start</Text>
          </View>
          {safety.warnings.map((w, i) => (
            <Text key={i} style={[typography.body, styles.warnText]}>{w}</Text>
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
          <View style={styles.cardHeader}>
            <Icon name="info" size={15} color={colors.accentAlt} />
            <Text style={typography.overline}>One more thing</Text>
          </View>
          <Text style={[typography.body, styles.reasoning]}>{clarifying_question}</Text>
        </GlassCard>
      )}

      {/* Actions */}
      <View style={styles.actions}>
        {!safety.blocked && steps.length > 0 && (
          <PrimaryButton label="Start guided fix" icon="wrench" fullWidth onPress={() => navigation.navigate('GuidedRepair')} />
        )}
        {sources.length > 0 && (
          <PrimaryButton
            label={`View ${sources.length} sources`}
            icon="source"
            variant="secondary"
            fullWidth
            onPress={() => navigation.navigate('Sources')}
          />
        )}
        <PrimaryButton
          label="Add more details"
          icon="keyboard"
          variant="ghost"
          fullWidth
          onPress={() => navigation.navigate('ManualInput')}
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  scroll: { paddingTop: spacing.sm },
  hero: { marginTop: spacing.lg },
  heroTop: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.lg },
  heroText: { flex: 1 },
  deviceRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  issue: { marginTop: spacing.sm },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginTop: spacing.lg },
  card: { marginTop: spacing.md },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: spacing.sm },
  reasoning: {},
  warnText: { color: colors.textPrimary, marginTop: spacing.xs },
  actions: { marginTop: spacing.xl, gap: spacing.md },
});
