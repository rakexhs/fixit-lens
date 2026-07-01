import React, { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Switch, Text, TextInput, View } from 'react-native';
import { GradientBackground } from '../components/GradientBackground';
import { GlassCard } from '../components/GlassCard';
import { PrimaryButton } from '../components/PrimaryButton';
import { colors } from '../theme/colors';
import { radius, spacing } from '../theme/spacing';
import { typography } from '../theme/typography';
import { API_BASE_URL } from '../services/config';
import * as api from '../services/apiClient';
import { ApiError } from '../services/apiClient';
import {
  clearLocalData,
  getApiBaseUrlOverride,
  getDemoMode,
  getPrivacyMode,
  setApiBaseUrlOverride,
  setDemoMode,
  setPrivacyMode,
} from '../services/storage';
import { useRepairSessionStore } from '../state/repairSessionStore';

export function SettingsScreen() {
  const [apiUrl, setApiUrl] = useState('');
  const [privacyMode, setPrivacyModeState] = useState(false);
  const [demoMode, setDemoModeState] = useState(false);
  const [status, setStatus] = useState<'unknown' | 'connected' | 'error'>('unknown');
  const [statusMessage, setStatusMessage] = useState('Not checked yet');
  const reset = useRepairSessionStore((s) => s.reset);

  useEffect(() => {
    (async () => {
      const override = await getApiBaseUrlOverride();
      setApiUrl(override ?? API_BASE_URL);
      setPrivacyModeState(await getPrivacyMode());
      setDemoModeState(await getDemoMode());
    })();
  }, []);

  const handleSaveUrl = async () => {
    await setApiBaseUrlOverride(apiUrl.trim() === API_BASE_URL ? null : apiUrl.trim());
    Alert.alert('Saved', 'Backend URL updated.');
  };

  const handleTestConnection = async () => {
    try {
      const health = await api.getHealth();
      setStatus('connected');
      setStatusMessage(`Connected · v${health.version}`);
    } catch (err) {
      setStatus('error');
      setStatusMessage(err instanceof ApiError ? err.message : 'Could not reach backend.');
    }
  };

  const handleTogglePrivacy = async (value: boolean) => {
    setPrivacyModeState(value);
    await setPrivacyMode(value);
  };

  const handleToggleDemo = async (value: boolean) => {
    setDemoModeState(value);
    await setDemoMode(value);
  };

  const handleDeleteHistory = () => {
    Alert.alert('Delete local history?', 'This clears locally saved settings and the current session on this device.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          await clearLocalData();
          reset();
          Alert.alert('Cleared', 'Local data has been cleared on this device.');
        },
      },
    ]);
  };

  return (
    <GradientBackground>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={typography.title}>Settings</Text>

        <GlassCard style={styles.card}>
          <Text style={typography.label}>BACKEND API URL</Text>
          <TextInput
            value={apiUrl}
            onChangeText={setApiUrl}
            placeholder={API_BASE_URL}
            placeholderTextColor={colors.textTertiary}
            autoCapitalize="none"
            autoCorrect={false}
            style={styles.input}
          />
          <View style={styles.buttonRow}>
            <PrimaryButton label="Save" variant="secondary" onPress={handleSaveUrl} style={styles.buttonHalf} />
            <PrimaryButton label="Test connection" onPress={handleTestConnection} style={styles.buttonHalf} />
          </View>
          <Text
            style={[
              styles.statusText,
              status === 'connected' && styles.statusOk,
              status === 'error' && styles.statusError,
            ]}
          >
            {statusMessage}
          </Text>
        </GlassCard>

        <GlassCard style={styles.card}>
          <View style={styles.switchRow}>
            <View style={styles.switchLabel}>
              <Text style={typography.bodyStrong}>Privacy mode</Text>
              <Text style={typography.caption}>Avoid sending free-text descriptions where possible</Text>
            </View>
            <Switch value={privacyMode} onValueChange={handleTogglePrivacy} trackColor={{ true: colors.cyan }} />
          </View>
          <View style={styles.divider} />
          <View style={styles.switchRow}>
            <View style={styles.switchLabel}>
              <Text style={typography.bodyStrong}>Demo mode</Text>
              <Text style={typography.caption}>Prefer the seeded demo scenarios during walkthroughs</Text>
            </View>
            <Switch value={demoMode} onValueChange={handleToggleDemo} trackColor={{ true: colors.cyan }} />
          </View>
        </GlassCard>

        <GlassCard style={styles.card}>
          <Text style={typography.bodyStrong}>Delete local history</Text>
          <Text style={[typography.body, styles.deleteCaption]}>
            Removes locally saved settings and the in-progress session from this device.
          </Text>
          <PrimaryButton label="Delete local data" variant="danger" onPress={handleDeleteHistory} style={styles.deleteButton} />
        </GlassCard>

        <Text style={styles.privacyNote}>
          FixIt Lens sends photos and text you provide to your configured backend for analysis. No API keys are
          ever stored on this device.
        </Text>
      </ScrollView>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    padding: spacing.lg,
    paddingTop: spacing.xxl,
    paddingBottom: spacing.xxl,
  },
  card: {
    marginTop: spacing.lg,
  },
  input: {
    marginTop: spacing.sm,
    backgroundColor: colors.surfaceElevated,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
    color: colors.textPrimary,
    fontSize: 14,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  buttonHalf: {
    flex: 1,
  },
  statusText: {
    marginTop: spacing.sm,
    color: colors.textTertiary,
    fontSize: 12,
  },
  statusOk: {
    color: colors.green,
  },
  statusError: {
    color: colors.red,
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  switchLabel: {
    flex: 1,
    paddingRight: spacing.md,
  },
  divider: {
    height: 1,
    backgroundColor: colors.divider,
    marginVertical: spacing.md,
  },
  deleteCaption: {
    marginTop: spacing.xs,
  },
  deleteButton: {
    marginTop: spacing.md,
  },
  privacyNote: {
    marginTop: spacing.xl,
    color: colors.textTertiary,
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 18,
  },
});
