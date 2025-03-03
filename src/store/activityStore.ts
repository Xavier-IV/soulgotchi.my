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
          if (newCount % 33 === 0) {
            const petStore = usePetStore.getState();
            petStore.updateStats({
              spirituality: petStore.stats.spirituality + 3,
              happiness: petStore.stats.happiness + 3,
              energy: petStore.stats.energy + 3,
              health: petStore.stats.health + 3,
            });
          } else {
            const petStore = usePetStore.getState();
            petStore.updateStats({
              spirituality: petStore.stats.spirituality + 0.5,
              happiness: petStore.stats.happiness + 0.5,
              energy: petStore.stats.energy + 0.5,
              health: petStore.stats.health + 0.5,
            });
          }
          
          return {
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