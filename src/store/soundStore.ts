import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface SoundState {
  // Sound settings
  isMuted: boolean;
  
  // Actions
  toggleMute: () => void;
  setMuted: (muted: boolean) => void;
}

export const useSoundStore = create<SoundState>()(
  persist(
    (set) => ({
      // Initial state
      isMuted: false,
      
      // Actions
      toggleMute: () => set((state) => ({ isMuted: !state.isMuted })),
      setMuted: (muted) => set({ isMuted: muted }),
    }),
    {
      name: 'soulgotchi-sound-state',
      storage: createJSONStorage(() => localStorage),
    }
  )
); 