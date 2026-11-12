/**
 * Web Vibration API helper for tactile feedback on mobile devices.
 * Gracefully ignores unsupported or blocked browsers.
 */
export type HapticType = 'light' | 'medium' | 'heavy' | 'success' | 'warning';

export function triggerHaptic(type: HapticType = 'light') {
  if (typeof window === 'undefined' || !('vibrate' in navigator)) return;

  try {
    switch (type) {
      case 'light':
        navigator.vibrate(10);
        break;
      case 'medium':
        navigator.vibrate(22);
        break;
      case 'heavy':
        navigator.vibrate(35);
        break;
      case 'success':
        navigator.vibrate([15, 50, 20]);
        break;
      case 'warning':
        navigator.vibrate([30, 60, 30]);
        break;
    }
  } catch {
    // Vibration is optional and may be disabled by browser power-saving
  }
}
