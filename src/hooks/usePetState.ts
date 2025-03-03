import { useState, useEffect } from 'react';
import { savePetState, saveLastInteraction } from '@/lib/storage';
import { useActivityStore } from '@/store/activityStore';

interface PetState {
  health: number;
  spirituality: number;
  energy: number;
  happiness: number;
  age: number;
  name: string;
  emoji: string;
  lastDecay: number;
}

export function usePetState(initialName: string = 'SoulGotchi', initialEmoji: string = '😌') {
  const [petState, setPetState] = useState<PetState>({
    health: 20,
    spirituality: 20,
    energy: 20,
    happiness: 20,
    age: 0,
    name: initialName,
    emoji: initialEmoji,
    lastDecay: Date.now()
  });

  const [lastInteraction, setLastInteraction] = useState<Date>(new Date());
  const [isAlive, setIsAlive] = useState<boolean>(true);
  const [decayTimer, setDecayTimer] = useState<NodeJS.Timeout | null>(null);
  
  // Get activity store actions
  const { performDhikr: activityPerformDhikr } = useActivityStore();

  // Increase age over time
  useEffect(() => {
    if (!isAlive) return;
    
    const interval = setInterval(() => {
      setPetState((prev) => ({
        ...prev,
        age: prev.age + 1,
      }));
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
      setPetState((prev) => {
        const now = Date.now();
        const timeSinceLastDecay = now - prev.lastDecay;
        
        // Only decay if enough time has passed (10 seconds)
        if (timeSinceLastDecay < 10000) {
          return prev;
        }

        // Calculate decay amount - small but noticeable
        const decayAmount = 1;

        // Apply decay to all stats
        return {
          ...prev,
          health: Math.max(0, prev.health - decayAmount),
          spirituality: Math.max(0, prev.spirituality - decayAmount),
          energy: Math.max(0, prev.energy - decayAmount),
          happiness: Math.max(0, prev.happiness - decayAmount),
          lastDecay: now
        };
      });
    }, 5000); // Check every 5 seconds

    setDecayTimer(timer);
    
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isAlive]);

  // Save pet state whenever it changes
  useEffect(() => {
    savePetState(petState);
    
    // Check if pet is still alive
    if (petState.health <= 0 || petState.spirituality <= 0) {
      setIsAlive(false);
    }
  }, [petState]);

  // Save last interaction time
  useEffect(() => {
    saveLastInteraction(lastInteraction);
  }, [lastInteraction]);

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
    
    setPetState((prev) => {
      const newState = {
        ...prev,
        spirituality: Math.min(100, prev.spirituality + 15), // Primary benefit
        happiness: Math.min(100, prev.happiness + 10),
        energy: Math.min(100, prev.energy + 8),
        health: Math.min(100, prev.health + 8),
        lastDecay: Date.now() // Reset decay timer when interacting
      };
      return newState;
    });
  };

  const rest = () => {
    if (!isAlive) return;
    
    const now = new Date();
    setLastInteraction(now);
    
    setPetState((prev) => {
      const newState = {
        ...prev,
        energy: Math.min(100, prev.energy + 20),
        health: Math.min(100, prev.health + 5),
        lastDecay: Date.now() // Reset decay timer when interacting
      };
      return newState;
    });
  };

  const learn = () => {
    if (!isAlive) return;
    
    const now = new Date();
    setLastInteraction(now);
    
    setPetState((prev) => {
      const newState = {
        ...prev,
        spirituality: Math.min(100, prev.spirituality + 5), // Reduced from 10 to 5
        happiness: Math.min(100, prev.happiness + 5),
        // Learning still takes energy
        energy: Math.max(0, prev.energy - 5),
        lastDecay: Date.now() // Reset decay timer when interacting
      };
      return newState;
    });
  };

  const resetPet = (newName: string = initialName) => {
    const now = new Date();
    setLastInteraction(now);
    
    setPetState({
      health: 20,
      spirituality: 20,
      energy: 20,
      happiness: 20,
      age: 0,
      name: newName,
      emoji: initialEmoji,
      lastDecay: Date.now()
    });
    setIsAlive(true);
  };

  // Calculate time until next decay
  const getTimeUntilNextDecay = () => {
    const now = Date.now();
    const timeSinceLastDecay = now - petState.lastDecay;
    const timeUntilNextDecay = Math.max(0, 10000 - timeSinceLastDecay);
    return Math.ceil(timeUntilNextDecay / 1000); // Return seconds
  };

  return {
    petState,
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