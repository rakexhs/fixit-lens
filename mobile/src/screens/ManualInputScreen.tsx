import React, { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/RootNavigator';
import { GradientBackground } from '../components/GradientBackground';
import { GlassCard } from '../components/GlassCard';
import { PrimaryButton } from '../components/PrimaryButton';
import { colors } from '../theme/colors';
import { radius, spacing } from '../theme/spacing';
import { typography } from '../theme/typography';
import { useRepairSessionStore } from '../state/repairSessionStore';
import * as api from '../services/apiClient';
import { ApiError } from '../services/apiClient';

type Nav = NativeStackNavigationProp<RootStackParamList, 'ManualInput'>;

const CATEGORIES = ['router', 'dishwasher', 'washing_machine', 'laptop', 'other'];

export function ManualInputScreen() {
  const navigation = useNavigation<Nav>();
  const setPendingDiagnoseRequest = useRepairSessionStore((s) => s.setPendingDiagnoseRequest);
  const [mode, setMode] = useState<'ask' | 'upload'>('ask');

  const [category, setCategory] = useState<string | null>(null);
  const [brand, setBrand] = useState('');
  const [model, setModel] = useState('');
  const [errorCode, setErrorCode] = useState('');
  const [symptom, setSymptom] = useState('');

  const [manualTitle, setManualTitle] = useState('');
  const [manualText, setManualText] = useState('');
  const [uploading, setUploading] = useState(false);

  const handleAskSubmit = () => {
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

  const handleUploadSubmit = async () => {
    if (!manualText.trim()) {
      Alert.alert('Add manual text', 'Paste or type the manual content before uploading.');
      return;
    }
    setUploading(true);
    try {
      const result = await api.uploadManualText(manualText, manualTitle || undefined, category ?? undefined, brand || undefined, model || undefined);
      Alert.alert('Manual indexed', `${result.chunks_indexed} section(s) added as a priority source.`);
      setManualText('');
      setManualTitle('');
    } catch (err) {
      Alert.alert('Upload failed', err instanceof ApiError ? err.message : 'Could not upload this manual.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <GradientBackground>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.flex}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <Text style={typography.title}>Type it in</Text>
          <Text style={[typography.body, styles.subtitle]}>
            Describe the device and issue, or add your own manual as a trusted source.
          </Text>

          <View style={styles.toggleRow}>
            <Pressable
              onPress={() => setMode('ask')}
              style={[styles.toggleButton, mode === 'ask' && styles.toggleButtonActive]}
            >
              <Text style={[styles.toggleLabel, mode === 'ask' && styles.toggleLabelActive]}>Ask about an issue</Text>
            </Pressable>
            <Pressable
              onPress={() => setMode('upload')}
              style={[styles.toggleButton, mode === 'upload' && styles.toggleButtonActive]}
            >
              <Text style={[styles.toggleLabel, mode === 'upload' && styles.toggleLabelActive]}>Upload a manual</Text>
            </Pressable>
          </View>

          <GlassCard style={styles.formCard}>
            <Text style={typography.label}>DEVICE CATEGORY</Text>
            <View style={styles.chipRow}>
              {CATEGORIES.map((c) => (
                <Pressable
                  key={c}
                  onPress={() => setCategory(c)}
                  style={[styles.categoryChip, category === c && styles.categoryChipActive]}
                >
                  <Text style={[styles.categoryChipText, category === c && styles.categoryChipTextActive]}>{c}</Text>
                </Pressable>
              ))}
            </View>

            {mode === 'ask' ? (
              <>
                <LabeledInput label="BRAND (OPTIONAL)" value={brand} onChangeText={setBrand} placeholder="e.g. TP-Link" />
                <LabeledInput label="MODEL (OPTIONAL)" value={model} onChangeText={setModel} placeholder="e.g. Archer AX55" />
                <LabeledInput label="ERROR CODE (OPTIONAL)" value={errorCode} onChangeText={setErrorCode} placeholder="e.g. E24" />
                <LabeledInput
                  label="WHAT'S HAPPENING?"
                  value={symptom}
                  onChangeText={setSymptom}
                  placeholder="e.g. red internet light, no connection"
                  multiline
                />
                <PrimaryButton label="Get diagnosis" onPress={handleAskSubmit} style={styles.submitButton} />
              </>
            ) : (
              <>
                <LabeledInput label="MANUAL TITLE (OPTIONAL)" value={manualTitle} onChangeText={setManualTitle} placeholder="e.g. My Router Manual" />
                <LabeledInput label="BRAND (OPTIONAL)" value={brand} onChangeText={setBrand} placeholder="e.g. TP-Link" />
                <LabeledInput label="MODEL (OPTIONAL)" value={model} onChangeText={setModel} placeholder="e.g. Archer AX55" />
                <LabeledInput
                  label="MANUAL TEXT"
                  value={manualText}
                  onChangeText={setManualText}
                  placeholder="Paste manual text here. Use ## headings to separate sections."
                  multiline
                  numberOfLines={8}
                />
                <PrimaryButton label="Upload manual" onPress={handleUploadSubmit} loading={uploading} style={styles.submitButton} />
              </>
            )}
          </GlassCard>
        </ScrollView>
      </KeyboardAvoidingView>
    </GradientBackground>
  );
}

function LabeledInput({
  label,
  value,
  onChangeText,
  placeholder,
  multiline,
  numberOfLines,
}: {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder: string;
  multiline?: boolean;
  numberOfLines?: number;
}) {
  return (
    <View style={styles.inputBlock}>
      <Text style={typography.label}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.textTertiary}
        multiline={multiline}
        numberOfLines={numberOfLines}
        style={[styles.input, multiline && styles.inputMultiline]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.lg,
    paddingTop: spacing.xxl,
    paddingBottom: spacing.xxl,
  },
  subtitle: {
    marginTop: spacing.xs,
  },
  toggleRow: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    padding: 4,
    marginTop: spacing.lg,
  },
  toggleButton: {
    flex: 1,
    paddingVertical: spacing.sm,
    borderRadius: radius.pill,
    alignItems: 'center',
  },
  toggleButtonActive: {
    backgroundColor: colors.surfaceElevated,
  },
  toggleLabel: {
    color: colors.textSecondary,
    fontWeight: '600',
    fontSize: 13,
  },
  toggleLabelActive: {
    color: colors.textPrimary,
  },
  formCard: {
    marginTop: spacing.lg,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginTop: spacing.sm,
    marginBottom: spacing.md,
  },
  categoryChip: {
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
  },
  categoryChipActive: {
    backgroundColor: colors.cyan + '22',
    borderColor: colors.cyan,
  },
  categoryChipText: {
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: '600',
  },
  categoryChipTextActive: {
    color: colors.cyan,
  },
  inputBlock: {
    marginTop: spacing.md,
  },
  input: {
    marginTop: spacing.xs,
    backgroundColor: colors.surfaceElevated,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
    color: colors.textPrimary,
    fontSize: 15,
  },
  inputMultiline: {
    minHeight: 96,
    textAlignVertical: 'top',
  },
  submitButton: {
    marginTop: spacing.lg,
  },
});
