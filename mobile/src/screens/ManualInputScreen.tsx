import React, { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, StyleSheet, Text, TextInput, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/RootNavigator';
import { Screen } from '../components/Screen';
import { AppHeader } from '../components/AppHeader';
import { GlassCard } from '../components/GlassCard';
import { SegmentedControl } from '../components/SegmentedControl';
import { AnimatedPressable } from '../components/AnimatedPressable';
import { PrimaryButton } from '../components/PrimaryButton';
import { colors, radius, spacing, typography } from '../theme';
import { titleCase } from '../utils/formatters';
import { useRepairSessionStore } from '../state/repairSessionStore';
import * as api from '../services/apiClient';
import { ApiError } from '../services/apiClient';

type Nav = NativeStackNavigationProp<RootStackParamList, 'ManualInput'>;
type Mode = 'ask' | 'upload';

const CATEGORIES = ['router', 'dishwasher', 'washing_machine', 'laptop', 'other'];

export function ManualInputScreen() {
  const navigation = useNavigation<Nav>();
  const setPendingDiagnoseRequest = useRepairSessionStore((s) => s.setPendingDiagnoseRequest);
  const [mode, setMode] = useState<Mode>('ask');

  const [category, setCategory] = useState<string | null>(null);
  const [brand, setBrand] = useState('');
  const [model, setModel] = useState('');
  const [errorCode, setErrorCode] = useState('');
  const [symptom, setSymptom] = useState('');

  const [manualTitle, setManualTitle] = useState('');
  const [manualText, setManualText] = useState('');
  const [uploading, setUploading] = useState(false);

  const handleAsk = () => {
    setPendingDiagnoseRequest({
      device_category: category === 'other' ? null : category,
      brand: brand.trim() || null,
      model: model.trim() || null,
      error_code: errorCode.trim() || null,
      symptom: symptom.trim() || null,
      user_text: symptom.trim() || null,
    });
    navigation.navigate('AnalyzeProgress', { mode: 'text' });
  };

  const handleUpload = async () => {
    if (!manualText.trim()) {
      Alert.alert('Add manual text', 'Paste or type the manual content before uploading.');
      return;
    }
    setUploading(true);
    try {
      const r = await api.uploadManualText(manualText, manualTitle || undefined, category ?? undefined, brand || undefined, model || undefined);
      Alert.alert('Manual indexed', `${r.chunks_indexed} section(s) added as a priority source.`);
      setManualText('');
      setManualTitle('');
    } catch (err) {
      Alert.alert('Upload failed', err instanceof ApiError ? err.message : 'Could not upload this manual.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <Screen scroll keyboardShouldPersistTaps contentStyle={styles.scroll}>
      <AppHeader title="Type it in" />
      <Text style={[typography.body, styles.sub]}>
        Describe the device and issue, or add your own manual as a trusted source.
      </Text>

      <View style={styles.segment}>
        <SegmentedControl<Mode>
          segments={[{ value: 'ask', label: 'Ask about an issue' }, { value: 'upload', label: 'Upload a manual' }]}
          value={mode}
          onChange={setMode}
        />
      </View>

      <GlassCard style={styles.card}>
        <Text style={typography.overline}>Device category</Text>
        <View style={styles.chipRow}>
          {CATEGORIES.map((c) => {
            const active = category === c;
            return (
              <AnimatedPressable key={c} haptic="selection" scaleTo={0.95} onPress={() => setCategory(c)} style={[styles.chip, active && styles.chipActive]}>
                <Text style={[styles.chipText, active && styles.chipTextActive]}>{titleCase(c)}</Text>
              </AnimatedPressable>
            );
          })}
        </View>

        {mode === 'ask' ? (
          <>
            <Field label="Brand" optional value={brand} onChangeText={setBrand} placeholder="TP-Link" />
            <Field label="Model" optional value={model} onChangeText={setModel} placeholder="Archer AX55" />
            <Field label="Error code" optional value={errorCode} onChangeText={setErrorCode} placeholder="E24" autoCapitalize="characters" />
            <Field label="What's happening?" value={symptom} onChangeText={setSymptom} placeholder="Red internet light, no connection" multiline />
            <PrimaryButton label="Get diagnosis" icon="sparkles" fullWidth onPress={handleAsk} style={styles.submit} />
          </>
        ) : (
          <>
            <Field label="Manual title" optional value={manualTitle} onChangeText={setManualTitle} placeholder="My Router Manual" />
            <Field label="Brand" optional value={brand} onChangeText={setBrand} placeholder="TP-Link" />
            <Field label="Model" optional value={model} onChangeText={setModel} placeholder="Archer AX55" />
            <Field label="Manual text" value={manualText} onChangeText={setManualText} placeholder="Paste manual text. Use ## headings to separate sections." multiline tall />
            <PrimaryButton label="Upload manual" icon="upload" fullWidth loading={uploading} onPress={handleUpload} style={styles.submit} />
          </>
        )}
      </GlassCard>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} />
    </Screen>
  );
}

function Field({
  label,
  value,
  onChangeText,
  placeholder,
  optional,
  multiline,
  tall,
  autoCapitalize,
}: {
  label: string;
  value: string;
  onChangeText: (t: string) => void;
  placeholder: string;
  optional?: boolean;
  multiline?: boolean;
  tall?: boolean;
  autoCapitalize?: 'none' | 'characters' | 'words' | 'sentences';
}) {
  const [focused, setFocused] = useState(false);
  return (
    <View style={styles.field}>
      <Text style={typography.overline}>
        {label}{optional ? '  ·  optional' : ''}
      </Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.textFaint}
        multiline={multiline}
        autoCapitalize={autoCapitalize}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={[styles.input, multiline && styles.inputMulti, tall && styles.inputTall, focused && styles.inputFocused]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingTop: spacing.sm },
  sub: { marginTop: spacing.xs },
  segment: { marginTop: spacing.xl },
  card: { marginTop: spacing.lg },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginTop: spacing.md, marginBottom: spacing.sm },
  chip: {
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.surfaceBorderStrong,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.lg,
    paddingVertical: 8,
    backgroundColor: colors.surfaceHigh,
  },
  chipActive: { backgroundColor: colors.accentAlt + '22', borderColor: colors.accentAlt },
  chipText: { color: colors.textSecondary, fontSize: 13, fontWeight: '600' },
  chipTextActive: { color: colors.accentAlt },
  field: { marginTop: spacing.lg, gap: spacing.sm },
  input: {
    backgroundColor: colors.surfaceHigh,
    borderRadius: radius.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.surfaceBorder,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md + 2,
    color: colors.textPrimary,
    fontSize: 15,
  },
  inputMulti: { minHeight: 88, textAlignVertical: 'top', paddingTop: spacing.md },
  inputTall: { minHeight: 140 },
  inputFocused: { borderColor: colors.accentAlt },
  submit: { marginTop: spacing.xl },
});
