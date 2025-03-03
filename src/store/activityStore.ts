import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { usePetStore } from './petStore';

interface DhikrCounts {
  [key: string]: number;
}

interface PrayerStatus {
  Fajr: boolean;
  Dhuhr: boolean;
  Asr: boolean;
  Maghrib: boolean;
  Isha: boolean;
  Tahajjud: boolean;
}

interface ActivityState {
  dhikrCounts: DhikrCounts;
  prayerStatus: PrayerStatus;
  blockedDhikr: string | null;
  lastActionMessage: string | null;
  
  // Actions
  performDhikr: (dhikrType: string) => void;
  completePrayer: (prayerName: keyof PrayerStatus) => void;
  setBlockedDhikr: (dhikr: string | null) => void;
  setLastActionMessage: (message: string | null) => void;
  resetDailyActivities: () => void;
}

const INITIAL_PRAYER_STATUS: PrayerStatus = {
  Fajr: false,
  Dhuhr: false,
  Asr: false,
  Maghrib: false,
  Isha: false,
  Tahajjud: false,
};

export const useActivityStore = create<ActivityState>()(
  persist(
    (set) => ({
      dhikrCounts: {},
      prayerStatus: INITIAL_PRAYER_STATUS,
      blockedDhikr: null,
      lastActionMessage: null,
      
      performDhikr: (dhikrType: string) =>
        set((state) => {
          const currentCount = state.dhikrCounts[dhikrType] || 0;
          const newCount = currentCount + 1;
          
          // Update pet stats based on dhikr completion
          const petStore = usePetStore.getState();
          
          // Small balanced increases for each dhikr
          let spiritualityIncrease = 0.5;
          let happinessIncrease = 0.5;
          let energyIncrease = 0.5;
          let healthIncrease = 0.5;
          
          // Small type-specific bonus
          switch (dhikrType) {
            case 'Subhanallah':
              spiritualityIncrease += 0.5;
              break;
            case 'Alhamdulillah':
              happinessIncrease += 0.5;
              break;
            case 'Allahu Akbar':
              energyIncrease += 0.5;
              break;
            case 'Astaghfirullah':
              healthIncrease += 0.5;
              break;
          }
          
          // Moderate bonus for completing a set of 33 (Sunnah reward)
          if (newCount % 33 === 0) {
            // Balanced bonus for completing a full set
            spiritualityIncrease += 3;
            happinessIncrease += 3;
            energyIncrease += 3;
            healthIncrease += 3;
            
            // Small additional type-specific bonus
            switch (dhikrType) {
              case 'Subhanallah':
                spiritualityIncrease += 2;
                break;
              case 'Alhamdulillah':
                happinessIncrease += 2;
                break;
              case 'Allahu Akbar':
                energyIncrease += 2;
                break;
              case 'Astaghfirullah':
                healthIncrease += 2;
                break;
            }
          }
          
          // Update pet stats
          petStore.updateStats({
            spirituality: petStore.stats.spirituality + spiritualityIncrease,
            happiness: petStore.stats.happiness + happinessIncrease,
            energy: petStore.stats.energy + energyIncrease,
            health: petStore.stats.health + healthIncrease,
          });
          
          return {
            ...state,
            dhikrCounts: {
              ...state.dhikrCounts,
              [dhikrType]: newCount,
            },
          };
        }),
      
      completePrayer: (prayerName) =>
        set((state) => {
          // Update pet stats for prayer completion
          const petStore = usePetStore.getState();
          petStore.updateStats({
            spirituality: petStore.stats.spirituality + 15,
            happiness: petStore.stats.happiness + 10,
            energy: petStore.stats.energy + 8,
            health: petStore.stats.health + 8,
          });
          
          return {
            prayerStatus: {
              ...state.prayerStatus,
              [prayerName]: true,
            },
          };
        }),
      
      setBlockedDhikr: (dhikr) => set({ blockedDhikr: dhikr }),
      
      setLastActionMessage: (message) => set({ lastActionMessage: message }),
      
      resetDailyActivities: () =>
        set({
          prayerStatus: INITIAL_PRAYER_STATUS,
          lastActionMessage: null,
        }),
    }),
    {
      name: 'soulgotchi-activity-state',
      storage: createJSONStorage(() => localStorage),
    }
  )
); 