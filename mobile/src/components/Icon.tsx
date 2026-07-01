import React from 'react';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme';

// A curated, semantic icon set so screens never reference emoji or raw glyph names.
export const ICONS = {
  camera: 'camera-outline',
  cameraFlip: 'camera-reverse-outline',
  gallery: 'images-outline',
  scan: 'scan-outline',
  keyboard: 'create-outline',
  history: 'time-outline',
  settings: 'settings-outline',
  back: 'chevron-back',
  forward: 'chevron-forward',
  close: 'close',
  check: 'checkmark',
  checkCircle: 'checkmark-circle',
  shield: 'shield-checkmark-outline',
  shieldAlert: 'warning-outline',
  block: 'hand-left-outline',
  danger: 'alert-circle-outline',
  wrench: 'construct-outline',
  book: 'document-text-outline',
  source: 'link-outline',
  bulb: 'bulb-outline',
  retake: 'refresh-outline',
  skip: 'play-skip-forward-outline',
  stop: 'stop-circle-outline',
  info: 'information-circle-outline',
  chevronRight: 'chevron-forward',
  trash: 'trash-outline',
  cloud: 'cloud-outline',
  cloudDone: 'cloud-done-outline',
  cloudOff: 'cloud-offline-outline',
  sparkles: 'sparkles-outline',
  router: 'wifi-outline',
  laptop: 'laptop-outline',
  appliance: 'cube-outline',
  upload: 'cloud-upload-outline',
  eye: 'eye-outline',
  lock: 'lock-closed-outline',
} as const;

export type IconName = keyof typeof ICONS;

interface Props {
  name: IconName;
  size?: number;
  color?: string;
  style?: object;
}

export function Icon({ name, size = 20, color = colors.textSecondary, style }: Props) {
  return <Ionicons name={ICONS[name] as never} size={size} color={color} style={style} />;
}
