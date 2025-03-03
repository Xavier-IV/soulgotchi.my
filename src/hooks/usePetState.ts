import { useState, useEffect } from 'react';
import { savePetState, saveLastInteraction } from '@/lib/storage';

interface PetState {
  health: number;
  spirituality: number;
  energy: number;
  happiness: number;
  age: number;
  name: string;
  dhikrCounts: {
    [key: string]: number;
  };
  prayerStatus: {
    [key: string]: boolean;
  };
  lastDecay: number;
}

export function usePetState(initialName: string = 'SoulGatchi') {
  const [petState, setPetState] = useState<PetState>({
    health: 20,
    spirituality: 20,
    energy: 20,
    happiness: 20,
    age: 0,
    name: initialName,
    dhikrCounts: {
      'Subhanallah': 0,
      'Alhamdulillah': 0,
      'Allahu Akbar': 0,
      'Astaghfirullah': 0
    },
    prayerStatus: {
      Fajr: false,
      Dhuhr: false,
      Asr: false,
      Maghrib: false,
      Isha: false,
      Tahajjud: false
    },
    lastDecay: Date.now()
  });

  const [lastInteraction, setLastInteraction] = useState<Date>(new Date());
  const [isAlive, setIsAlive] = useState<boolean>(true);
  const [decayTimer, setDecayTimer] = useState<NodeJS.Timeout | null>(null);

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
    
    setPetState((prev) => {
      // Increment the dhikr count for this specific type
      const currentCount = prev.dhikrCounts[dhikrType] || 0;
      const newCount = currentCount + 1;
      
      // Calculate bonus based on repetition count
      // More repetitions = more benefit
      const repetitionBonus = Math.min(10, Math.floor(newCount / 10)); // Max bonus of 10
      
      // Different dhikr types provide different benefits
      // Reduced spirituality increase rates
      let spiritualityIncrease = 1 + Math.floor(repetitionBonus / 2);
      let happinessIncrease = 1 + Math.floor(repetitionBonus / 2);
      let energyIncrease = 0;
      let healthIncrease = 0;
      
      switch (dhikrType) {
        case 'Subhanallah':
          spiritualityIncrease += 1; // Reduced from 3 to 1
          break;
        case 'Alhamdulillah':
          happinessIncrease += 3; // Focuses on happiness
          break;
        case 'Allahu Akbar':
          energyIncrease += 3; // Provides energy
          break;
        case 'Astaghfirullah':
          healthIncrease += 3; // Restores health
          break;
      }
      
      // Update dhikr counts
      const newDhikrCounts = {
        ...prev.dhikrCounts,
        [dhikrType]: newCount
      };
      
      // Apply the benefits
      return {
        ...prev,
        spirituality: Math.min(100, prev.spirituality + spiritualityIncrease),
        happiness: Math.min(100, prev.happiness + happinessIncrease),
        energy: Math.min(100, prev.energy + energyIncrease),
        health: Math.min(100, prev.health + healthIncrease),
        dhikrCounts: newDhikrCounts,
        lastDecay: Date.now() // Reset decay timer when interacting
      };
    });
    
    return true; // Return success
  };

  const pray = () => {
    if (!isAlive) return;
    
    const now = new Date();
    setLastInteraction(now);
    
    setPetState((prev) => {
      const newState = {
        ...prev,
        spirituality: Math.min(100, prev.spirituality + 8), // Reduced from 15 to 8
        energy: Math.min(100, prev.energy + 10),
        health: Math.min(100, prev.health + 5),
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
      dhikrCounts: {
        'Subhanallah': 0,
        'Alhamdulillah': 0,
        'Allahu Akbar': 0,
        'Astaghfirullah': 0
      },
      prayerStatus: {
        Fajr: false,
        Dhuhr: false,
        Asr: false,
        Maghrib: false,
        Isha: false,
        Tahajjud: false
      },
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