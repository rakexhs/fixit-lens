import React, { useEffect, useState } from 'react';
import { Alert, StyleSheet, Switch, Text, TextInput, View } from 'react-native';
import { Screen } from '../components/Screen';
import { AppHeader } from '../components/AppHeader';
import { GlassCard } from '../components/GlassCard';
import { ListGroup, ListRow } from '../components/ListRow';
import { PrimaryButton } from '../components/PrimaryButton';
import { Icon } from '../components/Icon';
import { colors, radius, spacing, typography } from '../theme';
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

type ConnStatus = 'unknown' | 'checking' | 'connected' | 'error';

export function SettingsScreen() {
  const [apiUrl, setApiUrl] = useState('');
  const [privacyMode, setPrivacyModeState] = useState(false);
  const [demoMode, setDemoModeState] = useState(false);
  const [status, setStatus] = useState<ConnStatus>('unknown');
  const [statusMsg, setStatusMsg] = useState('Not checked yet');
  const reset = useRepairSessionStore((s) => s.reset);

  useEffect(() => {
    (async () => {
      setApiUrl((await getApiBaseUrlOverride()) ?? API_BASE_URL);
      setPrivacyModeState(await getPrivacyMode());
      setDemoModeState(await getDemoMode());
    })();
  }, []);

  const testConnection = async () => {
    setStatus('checking');
    setStatusMsg('Connecting…');
    try {
      const h = await api.getHealth();
      setStatus('connected');
      setStatusMsg(`Connected · backend v${h.version}`);
    } catch (err) {
      setStatus('error');
      setStatusMsg(err instanceof ApiError ? err.message : 'Could not reach backend.');
    }
  };

  const saveUrl = async () => {
    await setApiBaseUrlOverride(apiUrl.trim() === API_BASE_URL ? null : apiUrl.trim());
    testConnection();
  };

  const deleteHistory = () => {
    Alert.alert('Delete local data?', 'Clears locally saved settings and the current session on this device.', [
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

  const statusColor = status === 'connected' ? colors.success : status === 'error' ? colors.danger : colors.textTertiary;
  const statusIcon = status === 'connected' ? 'cloudDone' : status === 'error' ? 'cloudOff' : 'cloud';

  return (
    <Screen scroll contentStyle={styles.scroll}>
      <AppHeader title="Settings" subtitle="Backend, privacy, and data" large />

      <GlassCard style={styles.card}>
        <View style={styles.cardHeader}>
          <Icon name="cloud" size={16} color={colors.accentAlt} />
          <Text style={typography.overline}>Backend connection</Text>
        </View>
        <TextInput
          value={apiUrl}
          onChangeText={setApiUrl}
          placeholder={API_BASE_URL}
          placeholderTextColor={colors.textFaint}
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType="url"
          style={styles.input}
        />
        <View style={styles.buttonRow}>
          <PrimaryButton label="Save" variant="ghost" onPress={saveUrl} style={styles.halfBtn} />
          <PrimaryButton label="Test" icon="cloud" onPress={testConnection} loading={status === 'checking'} style={styles.halfBtn} />
        </View>
        <View style={styles.statusRow}>
          <Icon name={statusIcon} size={15} color={statusColor} />
          <Text style={[typography.caption, { color: statusColor }]}>{statusMsg}</Text>
        </View>
        <View style={styles.lanTip}>
          <Icon name="info" size={14} color={colors.textFaint} />
          <Text style={[typography.caption, styles.lanTipText]}>
            On a physical iPhone, use your Mac{"'"}s LAN address (e.g. http://192.168.1.12:8000) and run{' '}
            <Text style={styles.lanCode}>make backend-lan</Text> so the phone can reach the API.
          </Text>
        </View>
      </GlassCard>

      <ListGroup title="Preferences">
        <ListRow
          icon="lock"
          title="Privacy mode"
          subtitle="Avoid sending free-text where possible"
          right={<Switch value={privacyMode} onValueChange={(v) => { setPrivacyModeState(v); setPrivacyMode(v); }} trackColor={{ true: colors.accent }} thumbColor={colors.textPrimary} />}
        />
        <ListRow
          icon="sparkles"
          title="Demo mode"
          subtitle="Prefer the seeded demo scenarios"
          right={<Switch value={demoMode} onValueChange={(v) => { setDemoModeState(v); setDemoMode(v); }} trackColor={{ true: colors.accent }} thumbColor={colors.textPrimary} />}
        />
      </ListGroup>

      <ListGroup title="Data">
        <ListRow icon="trash" iconColor={colors.danger} title="Delete local data" subtitle="Clears settings & current session on this device" danger onPress={deleteHistory} />
      </ListGroup>

      <View style={styles.footer}>
        <Icon name="shield" size={14} color={colors.textFaint} />
        <Text style={[typography.caption, styles.footerText]}>
          FixIt Lens sends photos and text you provide to your configured backend. No API keys are ever stored on this device.
        </Text>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingTop: spacing.sm },
  card: { marginTop: spacing.xl },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: spacing.md },
  input: {
    backgroundColor: colors.surfaceHigh,
    borderRadius: radius.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.surfaceBorder,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md + 2,
    color: colors.textPrimary,
    fontSize: 14,
  },
  buttonRow: { flexDirection: 'row', gap: spacing.md, marginTop: spacing.md },
  halfBtn: { flex: 1 },
  statusRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: spacing.md },
  lanTip: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.md, paddingTop: spacing.md, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.divider },
  lanTipText: { flex: 1, lineHeight: 18, color: colors.textTertiary },
  lanCode: { fontFamily: 'Menlo', color: colors.accentAlt },
  footer: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.xxl, paddingHorizontal: spacing.xs },
  footerText: { flex: 1, lineHeight: 18 },
});
