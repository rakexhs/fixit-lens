import React, { useCallback, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/RootNavigator';
import { GradientBackground } from '../components/GradientBackground';
import { GlassCard } from '../components/GlassCard';
import { SafetyBadge } from '../components/SafetyBadge';
import { EmptyState } from '../components/EmptyState';
import { ErrorState } from '../components/ErrorState';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';
import { colors } from '../theme/colors';
import { formatDate, titleCase } from '../utils/formatters';
import { useRepairSessionStore } from '../state/repairSessionStore';
import * as api from '../services/apiClient';
import { ApiError } from '../services/apiClient';
import type { SessionSummary } from '../services/types';

type Nav = NativeStackNavigationProp<RootStackParamList, 'History'>;

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
      const result = await api.listSessions();
      setSessions(result);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not load history.');
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const openSession = async (sessionId: string) => {
    try {
      const detail = await api.getSession(sessionId);
      setDiagnoseResult({
        session_id: detail.session_id,
        diagnosis: detail.diagnosis ?? { likely_issue: detail.likely_issue ?? 'Unknown issue', confidence: 0, reasoning_summary: '' },
        safety: detail.safety ?? { risk_level: (detail.risk_level as 0 | 1 | 2 | 3) ?? 0, label: '', warnings: [], blocked: detail.blocked, professional_required: detail.blocked },
        steps: detail.steps,
        clarifying_question: null,
        sources: detail.sources,
        metrics: { retrieval_latency_ms: 0, generation_latency_ms: 0, total_latency_ms: 0, citation_coverage: 1, provider_used: detail.provider_used ?? 'unknown' },
      });
      navigation.navigate('Diagnosis');
    } catch {
      // best-effort; ignore failures opening a past session
    }
  };

  return (
    <GradientBackground>
      <View style={styles.header}>
        <Text style={typography.title}>History</Text>
        <Text style={[typography.body, styles.subtitle]}>Your past repair sessions</Text>
      </View>

      {error ? (
        <ErrorState message={error} onRetry={load} />
      ) : !loading && sessions.length === 0 ? (
        <View style={styles.centered}>
          <EmptyState
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
          onRefresh={load}
          refreshing={loading}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => (
            <Pressable onPress={() => openSession(item.session_id)}>
              <GlassCard style={styles.card}>
                <View style={styles.cardHeader}>
                  <Text style={typography.bodyStrong}>
                    {item.brand ? `${item.brand} ${item.model ?? ''}`.trim() : titleCase(item.device_category ?? 'Unknown device')}
                  </Text>
                  <SafetyBadge riskLevel={item.risk_level ?? 0} blocked={item.blocked} />
                </View>
                <Text style={[typography.body, styles.issue]}>{item.likely_issue ?? 'No diagnosis recorded'}</Text>
                <Text style={styles.date}>{formatDate(item.created_at)}</Text>
              </GlassCard>
            </Pressable>
          )}
        />
      )}
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xxl,
    paddingBottom: spacing.md,
  },
  subtitle: {
    marginTop: spacing.xs,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  listContent: {
    padding: spacing.lg,
  },
  card: {
    marginBottom: spacing.md,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: spacing.sm,
  },
  issue: {
    marginTop: spacing.sm,
  },
  date: {
    marginTop: spacing.sm,
    color: colors.textTertiary,
    fontSize: 12,
  },
});
