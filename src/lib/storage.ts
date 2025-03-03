interface PetState {
  health: number;
  spirituality: number;
  energy: number;
  happiness: number;
  age: number;
  name: string;
  emoji: string;
}

const STORAGE_KEY = 'soulgotchi-pet-state';
const LAST_INTERACTION_KEY = 'soulgotchi-last-interaction';
const PRAYER_STATUS_KEY = 'soulgotchi-prayer-status';

export function savePetState(petState: PetState): void {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(petState));
  } catch (error) {
    console.error('Failed to save pet state:', error);
  }
}

export function savePrayerStatus(prayerStatus: Record<string, boolean>): void {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem(PRAYER_STATUS_KEY, JSON.stringify(prayerStatus));
  } catch (error) {
    console.error('Failed to save prayer status:', error);
  }
}

export function saveLastInteraction(date: Date): void {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem(LAST_INTERACTION_KEY, date.toISOString());
  } catch (error) {
    console.error('Failed to save last interaction:', error);
  }
}

export function loadPetState(): PetState | null {
  if (typeof window === 'undefined') return null;
  
  try {
    const savedState = localStorage.getItem(STORAGE_KEY);
    if (!savedState) return null;
    
    return JSON.parse(savedState) as PetState;
  } catch (error) {
    console.error('Failed to load pet state:', error);
    return null;
  }
}

export function loadPrayerStatus(): Record<string, boolean> | null {
  if (typeof window === 'undefined') return null;
  
  try {
    const savedStatus = localStorage.getItem(PRAYER_STATUS_KEY);
    if (!savedStatus) return null;
    
    return JSON.parse(savedStatus) as Record<string, boolean>;
  } catch (error) {
    console.error('Failed to load prayer status:', error);
    return null;
  }
}

export function loadLastInteraction(): Date | null {
  if (typeof window === 'undefined') return null;
  
  try {
    const savedDate = localStorage.getItem(LAST_INTERACTION_KEY);
    if (!savedDate) return null;
    
    return new Date(savedDate);
  } catch (error) {
    console.error('Failed to load last interaction:', error);
    return null;
  }
}

export function clearPetData(): void {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(LAST_INTERACTION_KEY);
    localStorage.removeItem(PRAYER_STATUS_KEY);
  } catch (error) {
    console.error('Failed to clear pet data:', error);
  }
} 