import React from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/RootNavigator';
import { GradientBackground } from '../components/GradientBackground';
import { SourceCard } from '../components/SourceCard';
import { EmptyState } from '../components/EmptyState';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';
import { useRepairSessionStore } from '../state/repairSessionStore';

type Nav = NativeStackNavigationProp<RootStackParamList, 'Sources'>;

export function SourcesScreen() {
  const navigation = useNavigation<Nav>();
  const diagnoseResult = useRepairSessionStore((s) => s.diagnoseResult);
  const sources = diagnoseResult?.sources ?? [];

  return (
    <GradientBackground>
      <View style={styles.header}>
        <Text style={typography.title}>Sources</Text>
        <Text style={[typography.body, styles.subtitle]}>
          Every cited step in this diagnosis is grounded in one of these manual sections.
        </Text>
      </View>

      {sources.length === 0 ? (
        <View style={styles.centered}>
          <EmptyState
            title="No sources yet"
            message="Run a diagnosis first to see the manual sections it was grounded in."
            actionLabel="Back to diagnosis"
            onAction={() => navigation.navigate('Diagnosis')}
          />
        </View>
      ) : (
        <FlatList
          data={sources}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <SourceCard source={item} />}
          contentContainerStyle={styles.listContent}
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
});
