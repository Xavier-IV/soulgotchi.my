import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { vibrate } from '@/lib/haptics';

interface FocusState {
  // Focus mode state
  isDrawerOpen: boolean;
  focusedDhikr: string | null;
  isLocked: boolean;
  
  // Actions
  setDrawerOpen: (isOpen: boolean) => void;
  setFocusedDhikr: (dhikr: string | null) => void;
  toggleLock: () => void;
  resetFocusMode: () => void;
}

export const useFocusStore = create<FocusState>()(
  persist(
    (set) => ({
      // Initial state
      isDrawerOpen: false,
      focusedDhikr: null,
      isLocked: false,
      
      // Actions
      setDrawerOpen: (isOpen) => set({ isDrawerOpen: isOpen }),
      setFocusedDhikr: (dhikr) => set({ focusedDhikr: dhikr }),
      toggleLock: () => {
        vibrate();
        set((state) => ({ isLocked: !state.isLocked }));
      },
      resetFocusMode: () => set({ 
        isDrawerOpen: false, 
        focusedDhikr: null, 
        isLocked: false 
      }),
    }),
    {
      name: 'soulgotchi-focus-state',
      storage: createJSONStorage(() => localStorage),
    }
  )
); 