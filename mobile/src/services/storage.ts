import AsyncStorage from '@react-native-async-storage/async-storage';

const KEYS = {
  apiBaseUrlOverride: 'fixit-lens/api-base-url-override',
  privacyMode: 'fixit-lens/privacy-mode',
  demoMode: 'fixit-lens/demo-mode',
} as const;

export async function getApiBaseUrlOverride(): Promise<string | null> {
  return AsyncStorage.getItem(KEYS.apiBaseUrlOverride);
}

export async function setApiBaseUrlOverride(value: string | null): Promise<void> {
  if (value) {
    await AsyncStorage.setItem(KEYS.apiBaseUrlOverride, value);
  } else {
    await AsyncStorage.removeItem(KEYS.apiBaseUrlOverride);
  }
}

export async function getPrivacyMode(): Promise<boolean> {
  return (await AsyncStorage.getItem(KEYS.privacyMode)) === 'true';
}

export async function setPrivacyMode(value: boolean): Promise<void> {
  await AsyncStorage.setItem(KEYS.privacyMode, value ? 'true' : 'false');
}

export async function getDemoMode(): Promise<boolean> {
  return (await AsyncStorage.getItem(KEYS.demoMode)) === 'true';
}

export async function setDemoMode(value: boolean): Promise<void> {
  await AsyncStorage.setItem(KEYS.demoMode, value ? 'true' : 'false');
}

export async function clearLocalData(): Promise<void> {
  await AsyncStorage.multiRemove(Object.values(KEYS));
}
