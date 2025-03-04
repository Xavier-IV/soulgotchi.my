import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface PetStats {
  health: number;
  spirituality: number;
  energy: number;
  happiness: number;
}

interface PetState {
 
  stats: PetStats;
  mood: 'happy' | 'content' | 'sad' | 'hungry' | 'tired';
  lastActivity: string | null;
  achievements: string[];
  isSetupComplete: boolean; 
  lastInteraction: Date | null;
  details: {
    name: string;
    emoji: string;
    age: number;
    lastDecay: number;
  };

  // Actions
  updateStats: (updates: Partial<PetStats>) => void;
  updateMood: (newMood: PetState['mood']) => void;
  addAchievement: (achievement: string) => void;
  setLastActivity: (activity: string) => void;
  resetPet: () => void;
  setIsSetupComplete: (isComplete: boolean) => void;
  setLastInteraction: (now: Date) => void;
  setPetDetails: (details: { name: string; emoji: string; age: number; lastDecay: number }) => void;
}

const INITIAL_STATS: PetStats = {
  health: 20,
  spirituality: 20,
  energy: 20,
  happiness: 20,
};

export const usePetStore = create<PetState>()(
  persist(
    (set) => ({
      stats: INITIAL_STATS,
      mood: 'content',
      lastActivity: null,
      achievements: [],
      isSetupComplete: true,
      lastInteraction: null,
      details: {
        name: 'SoulGotchi',
        emoji: '😌',
        age: 0,
        lastDecay: Date.now(),
      },

      setIsSetupComplete: (isComplete) => set({ isSetupComplete: isComplete }),

      setPetDetails: ({ name, emoji, age, lastDecay }) => set({ details: { name, emoji, age, lastDecay } }),

      updateStats: (updates) =>
        set((state) => ({
          stats: {
            ...state.stats,
            ...Object.fromEntries(
              Object.entries(updates).map(([key, value]) => [
                key,
                Math.max(0, Math.min(100, value)) // Clamp between 0 and 100
              ])
            ),
          },
        })),
      
      updateMood: (newMood) => set({ mood: newMood }),
      
      addAchievement: (achievement) =>
        set((state) => ({
          achievements: [...new Set([...state.achievements, achievement])],
        })),
      
      setLastActivity: (activity) => set({ lastActivity: activity }),
      
      setLastInteraction: (now) => set({ lastInteraction: now }),

      resetPet: () =>
        set({
          stats: INITIAL_STATS,
          mood: 'content',
          lastActivity: null,
          achievements: [],
        }),
    }),
    {
      name: 'soulgotchi-pet-state',
      storage: createJSONStorage(() => localStorage),
    }
  )
); 