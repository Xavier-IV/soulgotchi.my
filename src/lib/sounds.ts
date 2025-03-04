// Sound utility functions for the application
import { useSoundStore } from '@/store/soundStore';

// AudioContext singleton to prevent multiple instances
let audioContext: AudioContext | null = null;

// Standard sound settings for consistency
const SOUND_SETTINGS = {
  // Base click sound
  baseFrequency: 800,
  baseDuration: 30,
  baseVolume: 0.05,
  
  // Volume limits to ensure consistency
  minVolume: 0.03,
  maxVolume: 0.07,
  
  // Completion sound (triple click)
  completionDelay: 100,
};

/**
 * Initialize or get the AudioContext
 */
const getAudioContext = (): AudioContext => {
  if (!audioContext) {
    // Create new AudioContext with fallback for older browsers
    audioContext = new (window.AudioContext || 
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
  }
  return audioContext;
};

/**
 * Ensures volume is within acceptable limits
 * @param volume The input volume to normalize
 * @returns A volume value within the min/max range
 */
const normalizeVolume = (volume: number): number => {
  return Math.min(
    SOUND_SETTINGS.maxVolume,
    Math.max(SOUND_SETTINGS.minVolume, volume)
  );
};

/**
 * Play a simple click sound that mimics a mobile button press
 * @param frequency Optional override for the frequency (default: use standard setting)
 * @param duration Optional override for the duration (default: use standard setting)
 * @param volume Optional override for the volume (default: use standard setting)
 */
export const playClickSound = (
  frequency = SOUND_SETTINGS.baseFrequency, 
  duration = SOUND_SETTINGS.baseDuration,
  volume = SOUND_SETTINGS.baseVolume
): void => {
  // Check if sound is muted
  if (useSoundStore.getState().isMuted) return;
  
  try {
    const context = getAudioContext();
    
    // Create an oscillator (sound generator)
    const oscillator = context.createOscillator();
    oscillator.type = 'sine'; // Sine wave for a clean sound
    oscillator.frequency.value = frequency;
    
    // Create a gain node to control volume and fade out
    const gainNode = context.createGain();
    // Apply volume limiting
    gainNode.gain.value = normalizeVolume(volume);
    
    // Connect the nodes: oscillator -> gain -> output
    oscillator.connect(gainNode);
    gainNode.connect(context.destination);
    
    // Schedule the sound to start immediately
    oscillator.start();
    
    // Schedule a quick fade out for a natural sound
    gainNode.gain.exponentialRampToValueAtTime(
      0.001, // Target gain (near zero)
      context.currentTime + duration / 1000 // Convert ms to seconds
    );
    
    // Stop the oscillator after the duration
    oscillator.stop(context.currentTime + duration / 1000);
  } catch (error) {
    console.error('Error playing click sound:', error);
  }
};

/**
 * Play a special completion sound for dhikr sets
 * Creates a simple triple-click "pop pop pop" sound with consistent volume
 */
export const playCompletionSound = (): void => {
  // Check if sound is muted
  if (useSoundStore.getState().isMuted) return;
  
  try {
    // Use the standard settings for all clicks
    const frequency = SOUND_SETTINGS.baseFrequency;
    const duration = SOUND_SETTINGS.baseDuration;
    const volume = SOUND_SETTINGS.baseVolume;
    const delay = SOUND_SETTINGS.completionDelay;
    
    // Play first click
    playClickSound(frequency, duration, volume);
    
    // Play second click after a short delay
    setTimeout(() => {
      playClickSound(frequency, duration, volume);
      
      // Play third click after another short delay
      setTimeout(() => {
        playClickSound(frequency, duration, volume);
      }, delay);
    }, delay);
  } catch (error) {
    console.error('Error playing completion sound:', error);
  }
};

/**
 * Resume the AudioContext if it was suspended
 * This should be called in response to a user interaction
 * to ensure audio can play on mobile devices
 */
export const resumeAudioContext = (): void => {
  if (audioContext && audioContext.state === 'suspended') {
    audioContext.resume();
  }
}; 