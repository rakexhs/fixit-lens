import React, { useCallback, useState } from 'react';
import { FlatList, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/RootNavigator';
import { Screen } from '../components/Screen';
import { AppHeader } from '../components/AppHeader';
import { GlassCard } from '../components/GlassCard';
import { SafetyBadge } from '../components/SafetyBadge';
import { EmptyState } from '../components/EmptyState';
import { ErrorState } from '../components/ErrorState';
import { AnimatedPressable } from '../components/AnimatedPressable';
import { SkeletonCard } from '../components/Skeleton';
import { Icon, IconName } from '../components/Icon';
import { colors, spacing, typography } from '../theme';
import { formatDate, titleCase } from '../utils/formatters';
import { useRepairSessionStore } from '../state/repairSessionStore';
import * as api from '../services/apiClient';
import { ApiError } from '../services/apiClient';
import type { SessionSummary } from '../services/types';

type Nav = NativeStackNavigationProp<RootStackParamList, 'History'>;

const CATEGORY_ICON: Record<string, IconName> = {
  router: 'router',
  laptop: 'laptop',
  dishwasher: 'appliance',
  washing_machine: 'appliance',
  dangerous: 'danger',
};

export function HistoryScreen() {
  const navigation = useNavigation<Nav>();
  const setDiagnoseResult = useRepairSessionStore((s) => s.setDiagnoseResult);
  const [sessions, setSessions] = useState<SessionSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setSessions(await api.listSessions());
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not load history.');
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const openSession = async (sessionId: string) => {
    try {
      const d = await api.getSession(sessionId);
      setDiagnoseResult({
        session_id: d.session_id,
        diagnosis: d.diagnosis ?? { likely_issue: d.likely_issue ?? 'Unknown issue', confidence: 0, reasoning_summary: '' },
        safety: d.safety ?? { risk_level: (d.risk_level as 0 | 1 | 2 | 3) ?? 0, label: '', warnings: [], blocked: d.blocked, professional_required: d.blocked },
        steps: d.steps,
        clarifying_question: null,
        sources: d.sources,
        metrics: { retrieval_latency_ms: 0, generation_latency_ms: 0, total_latency_ms: 0, citation_coverage: 1, provider_used: d.provider_used ?? 'unknown' },
      });
      navigation.navigate('Diagnosis');
    } catch {
      // best-effort
    }
  };

  return (
    <Screen edges={['top', 'bottom']}>
      <View style={styles.headerPad}>
        <AppHeader title="History" subtitle="Your past repair sessions" large />
      </View>

      {error ? (
        <View style={styles.center}><ErrorState message={error} onRetry={load} /></View>
      ) : loading && sessions.length === 0 ? (
        <View style={styles.skeletonList}>
          <SkeletonCard />
          <SkeletonCard lines={2} style={styles.skeletonGap} />
          <SkeletonCard lines={2} style={styles.skeletonGap} />
        </View>
      ) : !loading && sessions.length === 0 ? (
        <View style={styles.center}>
          <EmptyState
            icon="history"
            title="No sessions yet"
            message="Scan a device or type in details to start your first session."
            actionLabel="Start scanning"
            onAction={() => navigation.navigate('HomeCamera')}
          />
        </View>
      ) : (
        <FlatList
          data={sessions}
          keyExtractor={(item) => item.session_id}
          refreshControl={<RefreshControl refreshing={loading} onRefresh={load} tintColor={colors.accentAlt} />}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => {
            const cat = item.device_category ?? 'unknown';
            return (
              <AnimatedPressable haptic="light" scaleTo={0.98} onPress={() => openSession(item.session_id)} style={styles.cardWrap}>
                <GlassCard>
                  <View style={styles.cardHeader}>
                    <View style={styles.iconWrap}>
                      <Icon name={CATEGORY_ICON[cat] ?? 'appliance'} size={18} color={colors.accentAlt} />
                    </View>
                    <View style={styles.cardTitle}>
                      <Text style={typography.bodyStrong} numberOfLines={1}>
                        {item.brand ? `${item.brand} ${item.model ?? ''}`.trim() : titleCase(cat)}
                      </Text>
                      <Text style={typography.caption}>{formatDate(item.created_at)}</Text>
                    </View>
                    <SafetyBadge riskLevel={item.risk_level ?? 0} blocked={item.blocked} compact />
                  </View>
                  <Text style={[typography.callout, styles.issue]} numberOfLines={2}>
                    {item.likely_issue ?? 'No diagnosis recorded'}
                  </Text>
                </GlassCard>
              </AnimatedPressable>
            );
          }}
        />
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  headerPad: { paddingHorizontal: spacing.xl },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  skeletonList: { paddingHorizontal: spacing.xl, paddingTop: spacing.lg },
  skeletonGap: { marginTop: spacing.md },
  list: { paddingHorizontal: spacing.xl, paddingTop: spacing.lg, paddingBottom: spacing.xxxl },
  cardWrap: { marginBottom: spacing.md },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: colors.accentAlt + '14',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardTitle: { flex: 1, gap: 2 },
  issue: { marginTop: spacing.md },
});
