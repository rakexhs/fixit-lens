import React from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/RootNavigator';
import { GradientBackground } from '../components/GradientBackground';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppHeader } from '../components/AppHeader';
import { SourceCard } from '../components/SourceCard';
import { EmptyState } from '../components/EmptyState';
import { Icon } from '../components/Icon';
import { colors, radius, spacing, typography } from '../theme';
import { useRepairSessionStore } from '../state/repairSessionStore';

type Nav = NativeStackNavigationProp<RootStackParamList, 'Sources'>;

export function SourcesScreen() {
  const navigation = useNavigation<Nav>();
  const diagnoseResult = useRepairSessionStore((s) => s.diagnoseResult);
  const sources = diagnoseResult?.sources ?? [];

  return (
    <GradientBackground>
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <View style={styles.headerPad}>
          <AppHeader title="Sources" />
        </View>

        {sources.length === 0 ? (
          <View style={styles.center}>
            <EmptyState
              icon="source"
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
            ListHeaderComponent={
              <View style={styles.banner}>
                <Icon name="shield" size={16} color={colors.success} />
                <Text style={[typography.callout, styles.bannerText]}>
                  Every guided step is grounded in one of these manual sections.
                </Text>
              </View>
            }
            contentContainerStyle={styles.list}
            showsVerticalScrollIndicator={false}
          />
        )}
      </SafeAreaView>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  headerPad: { paddingHorizontal: spacing.xl },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  list: { paddingHorizontal: spacing.xl, paddingTop: spacing.md, paddingBottom: spacing.xxxl },
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.success + '12',
    borderColor: colors.success + '30',
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  bannerText: { flex: 1, color: colors.textSecondary },
});
