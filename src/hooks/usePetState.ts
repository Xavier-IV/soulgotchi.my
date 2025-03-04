import { useActivityStore } from '@/store/activityStore';
import { usePetStore } from '@/store/petStore';
import { useEffect, useState } from 'react';

interface BasePetState {
  age: number;
  name: string;
  emoji: string;
  lastDecay: number;
}

interface ExtendedPetState extends BasePetState {
  health: number;
  spirituality: number;
  energy: number;
  happiness: number;
}

export function usePetState(initialName: string = 'SoulGotchi', initialEmoji: string = '😌') {
  const [isAlive, setIsAlive] = useState<boolean>(true);
  const [decayTimer, setDecayTimer] = useState<NodeJS.Timeout | null>(null);
  
  // Get activity store actions and pet store
  const { performDhikr: activityPerformDhikr } = useActivityStore();
  const petStore = usePetStore();

  // Increase age over time
  useEffect(() => {
    if (!isAlive) return;
    
    const interval = setInterval(() => {
      petStore.setPetDetails({
        ...petStore.details,
        age: petStore.details.age + 1,
      });
    }, 3600000); // Increase age every hour
    
    return () => clearInterval(interval);
  }, [isAlive]);

  // Decay stats over time
  useEffect(() => {
    if (!isAlive) return;

    // Clear any existing timer
    if (decayTimer) {
      clearInterval(decayTimer);
    }

    // Set up a new decay timer
    const timer = setInterval(() => {
      const now = Date.now();
      const timeSinceLastDecay = now - petStore.details.lastDecay;
      
      // Only decay if enough time has passed (10 seconds)
      if (timeSinceLastDecay < 10000) {
        return;
      }

      // Calculate decay amount - small but noticeable
      const decayAmount = 1;
      const currentStats = petStore.stats;

      // Apply decay to all stats
      petStore.updateStats({
        health: Math.max(0, currentStats.health - decayAmount),
        spirituality: Math.max(0, currentStats.spirituality - decayAmount),
        energy: Math.max(0, currentStats.energy - decayAmount),
        happiness: Math.max(0, currentStats.happiness - decayAmount),
      });

      petStore.setPetDetails({
        ...petStore.details,
        lastDecay: now
      });
    }, 5000); // Check every 5 seconds

    setDecayTimer(timer);
    
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isAlive, petStore.details.lastDecay, petStore]);

  const setLastInteraction = (now: Date) => {
    petStore.setLastInteraction(now);
  };


  // Actions to interact with the pet
  const performDhikr = (dhikrType: string = 'Subhanallah') => {
    if (!isAlive) return;
    
    const now = new Date();
    setLastInteraction(now);
    
    // Use activity store to handle dhikr
    activityPerformDhikr(dhikrType);
  };

  const pray = () => {
    if (!isAlive) return;
    
    const now = new Date();
    setLastInteraction(now);
    
    const currentStats = petStore.stats;
    petStore.updateStats({
      spirituality: Math.min(100, currentStats.spirituality + 15),
      happiness: Math.min(100, currentStats.happiness + 10),
      energy: Math.min(100, currentStats.energy + 8),
      health: Math.min(100, currentStats.health + 8),
    });
    
    petStore.setPetDetails({
      ...petStore.details,
      lastDecay: Date.now()
    });
  };

  const rest = () => {
    if (!isAlive) return;
    
    const now = new Date();
    setLastInteraction(now);
    
    const currentStats = petStore.stats;
    petStore.updateStats({
      energy: Math.min(100, currentStats.energy + 20),
      health: Math.min(100, currentStats.health + 5),
    });
    
    petStore.setPetDetails({
      ...petStore.details,
      lastDecay: Date.now()
    });
  };

  const learn = () => {
    if (!isAlive) return;
    
    const now = new Date();
    setLastInteraction(now);
    
    const currentStats = petStore.stats;
    petStore.updateStats({
      spirituality: Math.min(100, currentStats.spirituality + 5),
      happiness: Math.min(100, currentStats.happiness + 5),
      energy: Math.max(0, currentStats.energy - 5),
    });
    
    petStore.setPetDetails({
      ...petStore.details,
      lastDecay: Date.now()
    });
  };

  const resetPet = (newName: string = initialName, newEmoji: string = initialEmoji) => {
    const now = new Date();
    setLastInteraction(now);
    
    petStore.resetPet();
    console.log('Resetting pet 3', newName);
    petStore.setPetDetails({
      age: 0,
      name: newName,
      emoji: newEmoji,
      lastDecay: Date.now()
    });
    setIsAlive(true);
  };

  // Calculate time until next decay
  const getTimeUntilNextDecay = () => {
    const now = Date.now();
    const timeSinceLastDecay = now - petStore.details.lastDecay;
    const timeUntilNextDecay = Math.max(0, 10000 - timeSinceLastDecay);
    return Math.ceil(timeUntilNextDecay / 1000); // Return seconds
  };

  return {
    petState: {
      ...petStore.details,
      ...petStore.stats,
    } as ExtendedPetState,
    isAlive,
    timeUntilDecay: getTimeUntilNextDecay(),
    actions: {
      performDhikr,
      pray,
      rest,
      learn,
      resetPet,
    },
  };
}