import { defaultPatterns, WebHaptics } from 'web-haptics';

const haptics = new WebHaptics();

export function triggerHaptic(preset: keyof typeof defaultPatterns = 'light') {
  haptics.trigger(preset);
}

export type HapticPresetName = Parameters<typeof triggerHaptic>[0];
