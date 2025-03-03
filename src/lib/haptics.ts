/**
 * Utility functions for haptic feedback
 */

/**
 * Trigger a subtle vibration if the device supports it
 * @param duration - Vibration duration in milliseconds (default: 20ms for subtle feedback)
 */
export function vibrate(duration: number = 20): void {
  // Check if the browser supports the Vibration API
  if (typeof window !== 'undefined' && 'navigator' in window && 'vibrate' in navigator) {
    try {
      navigator.vibrate(duration);
    } catch (error) {
      // Silently fail if vibration fails
      console.debug('Vibration failed:', error);
    }
  }
}

/**
 * Trigger a medium vibration for important actions
 */
export function vibrateMedium(): void {
  vibrate(40);
}

/**
 * Trigger a strong vibration for significant events
 */
export function vibrateStrong(): void {
  vibrate(80);
}

/**
 * Trigger a pattern of vibrations for special events
 * @param pattern - Array of alternating vibration and pause durations
 */
export function vibratePattern(pattern: number[]): void {
  if (typeof window !== 'undefined' && 'navigator' in window && 'vibrate' in navigator) {
    try {
      navigator.vibrate(pattern);
    } catch (error) {
      // Silently fail if vibration fails
      console.debug('Vibration pattern failed:', error);
    }
  }
}

/**
 * Check if the device supports haptic feedback
 */
export function supportsHaptics(): boolean {
  return typeof window !== 'undefined' && 'navigator' in window && 'vibrate' in navigator;
} 