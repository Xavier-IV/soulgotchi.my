import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { usePetStore } from './petStore';

interface LearningProgress {
  Quran: number;
  Hadith: number;
  Fiqh: number;
  'Islamic History': number;
}

interface LearningState {
  progress: LearningProgress;
  lastStudyTime: Record<keyof LearningProgress, number>;
  
  // Actions
  study: (subject: keyof LearningProgress) => void;
  resetDailyLearning: () => void;
}

const INITIAL_PROGRESS: LearningProgress = {
  Quran: 0,
  Hadith: 0,
  Fiqh: 0,
  'Islamic History': 0,
};

export const useLearningStore = create<LearningState>()(
  persist(
    (set) => ({
      progress: INITIAL_PROGRESS,
      lastStudyTime: {
        Quran: 0,
        Hadith: 0,
        Fiqh: 0,
        'Islamic History': 0,
      },
      
      study: (subject) =>
        set((state) => {
          const now = Date.now();
          const lastStudy = state.lastStudyTime[subject];
          
          // Check if enough time has passed (1 hour cooldown)
          if (now - lastStudy < 3600000) {
            return state;
          }
          
          // Update pet stats for studying
          const petStore = usePetStore.getState();
          petStore.updateStats({
            spirituality: petStore.stats.spirituality + 10,
            happiness: petStore.stats.happiness + 5,
            energy: Math.max(0, petStore.stats.energy - 5), // Studying consumes energy
          });
          
          // Update learning progress
          const newProgress = Math.min(100, (state.progress[subject] || 0) + 5);
          
          // Check for mastery achievement
          if (newProgress >= 100) {
            petStore.addAchievement(`${subject} Mastery`);
          }
          
          return {
            progress: {
              ...state.progress,
              [subject]: newProgress,
            },
            lastStudyTime: {
              ...state.lastStudyTime,
              [subject]: now,
            },
          };
        }),
      
      resetDailyLearning: () =>
        set(() => ({
          lastStudyTime: {
            Quran: 0,
            Hadith: 0,
            Fiqh: 0,
            'Islamic History': 0,
          },
        })),
    }),
    {
      name: 'soulgotchi-learning-state',
      storage: createJSONStorage(() => localStorage),
    }
  )
); 