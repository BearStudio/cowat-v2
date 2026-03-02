export const supportsHaptic =
  typeof window !== 'undefined'
    ? window.matchMedia('(pointer: coarse)').matches
    : false;

/**
 * Type guard to check if navigator supports vibrate API
 */
function hasVibrate(
  nav: Navigator
): nav is Navigator & { vibrate: (pattern: number | number[]) => boolean } {
  return 'vibrate' in nav && typeof nav.vibrate === 'function';
}

/**
 * Trigger haptic feedback on mobile devices.
 * Uses Vibration API on Android/modern browsers, and iOS checkbox trick on iOS.
 *
 * @param pattern - Vibration duration (ms) or pattern.
 * Custom patterns only work on Android devices. iOS uses fixed feedback.
 * See [Vibration API](https://developer.mozilla.org/docs/Web/API/Vibration_API)
 */
export function haptic(pattern: number | number[] = 50) {
  try {
    if (!supportsHaptic) return;

    if (hasVibrate(navigator)) {
      navigator.vibrate(pattern);
      return;
    }

    // iOS haptic trick via checkbox switch element
    const label = document.createElement('label');
    label.ariaHidden = 'true';
    label.style.display = 'none';

    const input = document.createElement('input');
    input.type = 'checkbox';
    input.setAttribute('switch', '');
    label.appendChild(input);

    try {
      document.head.appendChild(label);
      label.click();
    } finally {
      document.head.removeChild(label);
    }
  } catch {
    // Silently ignore — haptic feedback is non-critical
  }
}

/** Light tap — success confirmation (e.g. toast success) */
export function hapticSuccess() {
  haptic(50);
}

/** Double-pulse — error notification (e.g. toast error) */
export function hapticError() {
  haptic([50, 50, 50]);
}

/** Medium pulse — warning / destructive action (e.g. confirm dialog) */
export function hapticWarning() {
  haptic([30, 30, 60]);
}

/** Very brief tap — selection change (e.g. checkbox toggle) */
export function hapticSelection() {
  haptic(10);
}
