import React from 'react';
import { NavigationContainer, DarkTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { colors } from '../theme/colors';

import { HomeCameraScreen } from '../screens/HomeCameraScreen';
import { ImagePreviewScreen } from '../screens/ImagePreviewScreen';
import { AnalyzeProgressScreen } from '../screens/AnalyzeProgressScreen';
import { DiagnosisScreen } from '../screens/DiagnosisScreen';
import { GuidedRepairScreen } from '../screens/GuidedRepairScreen';
import { SourcesScreen } from '../screens/SourcesScreen';
import { HistoryScreen } from '../screens/HistoryScreen';
import { ManualInputScreen } from '../screens/ManualInputScreen';
import { SettingsScreen } from '../screens/SettingsScreen';

export type RootStackParamList = {
  HomeCamera: undefined;
  ImagePreview: undefined;
  AnalyzeProgress: { mode: 'image' | 'text' };
  Diagnosis: undefined;
  GuidedRepair: undefined;
  Sources: undefined;
  History: undefined;
  ManualInput: undefined;
  Settings: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

const navTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    background: colors.background,
    card: colors.background,
    text: colors.textPrimary,
    border: colors.divider,
    primary: colors.accentAlt,
  },
};

export function RootNavigator() {
  return (
    <NavigationContainer theme={navTheme}>
      <Stack.Navigator
        initialRouteName="HomeCamera"
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.background },
          animation: 'slide_from_right',
        }}
      >
        <Stack.Screen name="HomeCamera" component={HomeCameraScreen} />
        <Stack.Screen name="ImagePreview" component={ImagePreviewScreen} />
        <Stack.Screen name="AnalyzeProgress" component={AnalyzeProgressScreen} />
        <Stack.Screen name="Diagnosis" component={DiagnosisScreen} />
        <Stack.Screen name="GuidedRepair" component={GuidedRepairScreen} />
        <Stack.Screen name="Sources" component={SourcesScreen} />
        <Stack.Screen name="History" component={HistoryScreen} />
        <Stack.Screen name="ManualInput" component={ManualInputScreen} />
        <Stack.Screen name="Settings" component={SettingsScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
