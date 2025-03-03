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
  
  // Actions
  updateStats: (updates: Partial<PetStats>) => void;
  updateMood: (newMood: PetState['mood']) => void;
  addAchievement: (achievement: string) => void;
  setLastActivity: (activity: string) => void;
  resetPet: () => void;
}

const INITIAL_STATS: PetStats = {
  health: 50,
  spirituality: 50,
  energy: 50,
  happiness: 50,
};

export const usePetStore = create<PetState>()(
  persist(
    (set) => ({
      stats: INITIAL_STATS,
      mood: 'content',
      lastActivity: null,
      achievements: [],
      
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