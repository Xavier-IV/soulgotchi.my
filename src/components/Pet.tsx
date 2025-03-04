'use client';

import { useState, useEffect, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger } from '@/components/ui/drawer';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart2 } from 'lucide-react';
import { vibrateMedium } from '@/lib/haptics';
import { useActivityStore } from '@/store/activityStore';
import Big from 'big.js';
import confetti from 'canvas-confetti';

type PetMood = 'happy' | 'content' | 'sad' | 'hungry' | 'tired';

// Mood hierarchy from worst to best
const moodHierarchy: PetMood[] = ['sad', 'hungry', 'tired', 'content', 'happy'];

interface PetProps {
  health: number;
  spirituality: number;
  energy: number;
  happiness: number;
  timeUntilDecay?: number;
  emoji?: string;
}

// Animated counter component
function AnimatedCounter({ targetValue }: { targetValue: number }) {
  const [displayValue, setDisplayValue] = useState(targetValue);
  const animationRef = useRef<number | undefined>(undefined);
  const shouldAnimate = targetValue > 1000;
  
  useEffect(() => {
    // If value is 1000 or less, just set it directly without animation
    if (!shouldAnimate) {
      setDisplayValue(targetValue);
      return;
    }
    
    const startValue = new Big(displayValue);
    const endValue = new Big(targetValue);
    const diff = endValue.minus(startValue);
    const duration = 2000; // 2 seconds
    const startTime = Date.now();
    
    const animate = () => {
      const now = Date.now();
      const elapsed = now - startTime;
      
      if (elapsed >= duration) {
        setDisplayValue(targetValue);
        return;
      }
      
      // Easing function: easeOutExpo
      const progress = 1 - Math.pow(2, -10 * elapsed / duration);
      const currentValue = startValue.plus(diff.times(progress));
      
      setDisplayValue(Number(currentValue));
      animationRef.current = requestAnimationFrame(animate);
    };
    
    animate();
    
    // Cleanup animation frame
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [targetValue, shouldAnimate]);
  
  // Format the display value with leading zeros for consistent width
  const formattedValue = Math.floor(displayValue).toString().padStart(4, '0');
  
  return (
    <div className="font-mono tabular-nums flex">
      {formattedValue.split('').map((digit, index) => (
        <div 
          key={index} 
          className="w-4 text-center"
        >
          {digit}
        </div>
      ))}
    </div>
  );
}

export function Pet({ health, spirituality, energy, happiness, timeUntilDecay = 0, emoji = '😌' }: PetProps) {
  const [mood, setMood] = useState<PetMood>('content');
  const [localTimer, setLocalTimer] = useState(timeUntilDecay);
  const [isAnimating, setIsAnimating] = useState(false);
  const [showTimer, setShowTimer] = useState(false);

  // Trigger confetti when mood improves
  const celebrateMoodImprovement = (newMood: PetMood, prevMood: PetMood) => {
    const newMoodIndex = moodHierarchy.indexOf(newMood);
    const prevMoodIndex = moodHierarchy.indexOf(prevMood);
    
    if (newMoodIndex > prevMoodIndex) {
      // Calculate how much the mood improved
      const improvementLevel = newMoodIndex - prevMoodIndex;
      
      // Create a balanced confetti effect
      const duration = 4 * 1000; // 4 seconds
      const end = Date.now() + duration;

      // Create a confetti animation frame loop with balanced density
      const frame = () => {
        // Balanced particle count based on improvement
        const baseParticleCount = 1 + improvementLevel;
        
        // Emit every 150ms for a balanced effect
        if (Date.now() % 150 < 20) {
          confetti({
            particleCount: baseParticleCount,
            angle: 60,
            spread: 45,
            origin: { x: 0.1, y: 0.6 },
            colors: ['#FFD700', '#FFA500', '#FF69B4', '#87CEEB', '#98FB98'],
            ticks: 180,
            gravity: 0.7,
            scalar: 0.9 + (improvementLevel * 0.15),
            drift: 0,
            shapes: ['circle', 'square']
          });

          confetti({
            particleCount: baseParticleCount,
            angle: 120,
            spread: 45,
            origin: { x: 0.9, y: 0.6 },
            colors: ['#FFD700', '#FFA500', '#FF69B4', '#87CEEB', '#98FB98'],
            ticks: 180,
            gravity: 0.7,
            scalar: 0.9 + (improvementLevel * 0.15),
            drift: 0,
            shapes: ['circle', 'square']
          });
        }

        if (Date.now() < end) {
          requestAnimationFrame(frame);
        }
      };

      // Start the animation
      frame();

      // Add a moderate final burst at the end, scaled with improvement
      setTimeout(() => {
        confetti({
          particleCount: 20 + (improvementLevel * 10),
          spread: 60,
          origin: { x: 0.5, y: 0.5 },
          colors: ['#FFD700', '#FFA500', '#FF69B4', '#87CEEB', '#98FB98'],
          ticks: 180,
          gravity: 0.7,
          scalar: 0.9 + (improvementLevel * 0.15),
          shapes: ['circle', 'square']
        });
      }, duration - 400);
    }
  };

  // Update local timer
  useEffect(() => {
    setLocalTimer(timeUntilDecay);
    
    // Create a countdown timer if timeUntilDecay > 0
    if (timeUntilDecay > 0) {
      const timer = setInterval(() => {
        setLocalTimer((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      
      return () => clearInterval(timer);
    }
  }, [timeUntilDecay]);

  // Only show timer on client-side to prevent hydration mismatch
  useEffect(() => {
    setShowTimer(true);
  }, []);

  // Determine pet mood based on stats
  useEffect(() => {
    const newMood = (() => {
      if (health < 30 || spirituality < 30) return 'sad';
      if (energy < 30) return 'tired';
      if (happiness < 30) return 'hungry';
      if (health > 70 && spirituality > 70 && happiness > 70) return 'happy';
      return 'content';
    })();

    if (newMood !== mood) {
      celebrateMoodImprovement(newMood, mood);
      setMood(newMood);
    }
  }, [health, spirituality, energy, happiness, mood]);

  // Handle pet interaction with haptic feedback
  const handlePetInteraction = () => {
    if (isAnimating) return;
    
    // Trigger medium haptic feedback
    vibrateMedium();
    
    // Animate the pet
    setIsAnimating(true);
    setTimeout(() => {
      setIsAnimating(false);
    }, 1000);
  };

  // Pet animations
  const renderPet = () => {
    // Simple ASCII-style pet representation based on mood
    const animationClass = isAnimating 
      ? "scale-110 transition-transform duration-300" 
      : "";
      
    return (
      <div className={`text-5xl ${mood === 'happy' ? 'animate-bounce' : mood === 'sad' || mood === 'hungry' ? 'animate-pulse' : ''} ${animationClass}`}>
        <span role="img" aria-label={`${mood} pet`}>{emoji}</span>
      </div>
    );
  };

  // Get prayer and dhikr state from activity store
  const { prayerStatus, dhikrCounts, blockedDhikr } = useActivityStore();

  // Calculate progress towards goal
  const getProgressLabel = (value: number) => {
    const flooredValue = Math.floor(value);
    if (flooredValue >= 100) return "100%";
    return `${flooredValue}%`;
  };

  // Get progress bar color based on value
  const getProgressColor = (value: number) => {
    const flooredValue = Math.floor(value);
    if (flooredValue >= 90) return "bg-gradient-to-r from-amber-300 to-yellow-500"; // Gold gradient for overachieving
    return ""; // Default color
  };

  const dhikrList = [
    { name: 'Subhanallah', translation: 'Glory be to Allah', benefit: 'Small boost to all stats + spirituality', target: 33 },
    { name: 'Alhamdulillah', translation: 'Praise be to Allah', benefit: 'Small boost to all stats + happiness', target: 33 },
    { name: 'Allahu Akbar', translation: 'Allah is the Greatest', benefit: 'Small boost to all stats + energy', target: 33 },
    { name: 'Astaghfirullah', translation: 'I seek forgiveness from Allah', benefit: 'Small boost to all stats + health', target: 33 }
  ];

  return (
    <Card className="w-full max-w-md mx-auto p-4 flex flex-col items-center justify-center gap-3">
      <div className="flex items-center justify-between w-full">
        <Badge variant={mood === 'happy' ? 'default' : 'outline'} className="text-xs">
          {mood.charAt(0).toUpperCase() + mood.slice(1)}
        </Badge>
        
        <div className="flex items-center gap-2">
          {showTimer && localTimer > 0 && (
            <Badge variant="outline" className="text-xs bg-yellow-500/10">
              Decay: {localTimer}s
            </Badge>
          )}
          
          <Drawer>
            <DrawerTrigger asChild>
              <Button 
                variant="outline" 
                size="icon" 
                className="h-7 w-7" 
                onClick={() => vibrateMedium()}
              >
                <BarChart2 className="h-4 w-4" />
              </Button>
            </DrawerTrigger>
            <DrawerContent>
              <div className="mx-auto w-full max-w-sm min-h-[500px]">
                <DrawerHeader>
                  <DrawerTitle>Daily Stats</DrawerTitle>
                </DrawerHeader>
                <div className="px-4 py-2">
                  <Tabs defaultValue="pet" className="w-full">
                    <div className="flex justify-center mb-2">
                      <TabsList className="grid grid-cols-3">
                        <TabsTrigger value="pet">Pet Mood</TabsTrigger>
                        <TabsTrigger value="dhikr">Dhikr</TabsTrigger>
                        <TabsTrigger value="prayer">Prayer</TabsTrigger>
                      </TabsList>
                    </div>
                    
                    <TabsContent value="pet" className="space-y-2">
                      <div className="text-center mb-4">
                        <div className="text-4xl mb-2">{emoji}</div>
                        <div className="text-lg font-medium">
                          Your pet is {mood === 'happy' ? "very happy" : mood === 'content' ? "content" : mood === 'sad' ? "sad" : mood === 'hungry' ? "hungry" : "tired"}
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <div className="flex justify-between text-xs">
                            <span>Health</span>
                            <span>{getProgressLabel(health)}</span>
                          </div>
                          <Progress value={Math.floor(health)} className={`h-2 ${getProgressColor(health)}`} />
                        </div>
                        
                        <div className="space-y-1">
                          <div className="flex justify-between text-xs">
                            <span>Spirituality</span>
                            <span>{getProgressLabel(spirituality)}</span>
                          </div>
                          <Progress value={Math.floor(spirituality)} className={`h-2 ${getProgressColor(spirituality)}`} />
                        </div>
                        
                        <div className="space-y-1">
                          <div className="flex justify-between text-xs">
                            <span>Energy</span>
                            <span>{getProgressLabel(energy)}</span>
                          </div>
                          <Progress value={Math.floor(energy)} className={`h-2 ${getProgressColor(energy)}`} />
                        </div>
                        
                        <div className="space-y-1">
                          <div className="flex justify-between text-xs">
                            <span>Happiness</span>
                            <span>{getProgressLabel(happiness)}</span>
                          </div>
                          <Progress value={Math.floor(happiness)} className={`h-2 ${getProgressColor(happiness)}`} />
                        </div>
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="dhikr" className="space-y-3">
                      <div className="text-sm text-center mb-2">Today&apos;s Dhikr Progress</div>
                      <div className="space-y-2">
                        {dhikrList.map((dhikr) => (
                          <div 
                            key={dhikr.name} 
                            className={`p-3 rounded-md border ${blockedDhikr === dhikr.name ? 'bg-amber-500/20 border-amber-500' : 'bg-card/50'} flex items-center justify-between relative`}
                          >
                            <div className="font-medium">{dhikr.name}</div>
                            <AnimatedCounter targetValue={dhikrCounts[dhikr.name] || 0} />
                          </div>
                        ))}
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="prayer" className="space-y-2">
                      <div className="text-sm text-center mb-2">Today&apos;s Prayers</div>
                      <div className="grid grid-cols-5 gap-2">
                        {Object.entries(prayerStatus).map(([prayer, completed]) => (
                          <div 
                            key={prayer} 
                            className={`text-center p-2 rounded-md border ${completed ? "bg-green-500/20 border-green-500" : "bg-muted/20 border-muted"}`}
                          >
                            <div className="text-xs font-medium">{prayer}</div>
                            <div className="mt-1">{completed ? "✓" : "○"}</div>
                          </div>
                        ))}
                      </div>
                      <div className="text-xs text-center mt-4 text-muted-foreground pb-6">
                        Complete all prayers for maximum spirituality boost
                      </div>
                    </TabsContent>
                  </Tabs>
                </div>
              </div>
            </DrawerContent>
          </Drawer>
        </div>
      </div>
      
      <div 
        className="h-24 w-24 flex items-center justify-center cursor-pointer rounded-full hover:bg-primary/5 active:bg-primary/10 transition-colors"
        onClick={handlePetInteraction}
      >
        {renderPet()}
      </div>
      
      <div className="w-full grid grid-cols-2 gap-x-4 gap-y-2">
        <div className="space-y-1">
          <div className="flex justify-between text-xs">
            <span>Health</span>
            <span className={Math.floor(health) >= 90 ? "font-semibold text-amber-500" : ""}>
              {getProgressLabel(health)}
            </span>
          </div>
          <Progress value={Math.floor(health)} className={`h-2 ${getProgressColor(health)}`} />
        </div>
        
        <div className="space-y-1">
          <div className="flex justify-between text-xs">
            <span>Spirituality</span>
            <span className={Math.floor(spirituality) >= 90 ? "font-semibold text-amber-500" : ""}>
              {getProgressLabel(spirituality)}
            </span>
          </div>
          <Progress value={Math.floor(spirituality)} className={`h-2 ${getProgressColor(spirituality)}`} />
        </div>
        
        <div className="space-y-1">
          <div className="flex justify-between text-xs">
            <span>Energy</span>
            <span className={Math.floor(energy) >= 90 ? "font-semibold text-amber-500" : ""}>
              {getProgressLabel(energy)}
            </span>
          </div>
          <Progress value={Math.floor(energy)} className={`h-2 ${getProgressColor(energy)}`} />
        </div>
        
        <div className="space-y-1">
          <div className="flex justify-between text-xs">
            <span>Happiness</span>
            <span className={Math.floor(happiness) >= 90 ? "font-semibold text-amber-500" : ""}>
              {getProgressLabel(happiness)}
            </span>
          </div>
          <Progress value={Math.floor(happiness)} className={`h-2 ${getProgressColor(happiness)}`} />
        </div>
      </div>
      
      {/* Always reserve space for mastery message to prevent layout shifts */}
      <div className="h-5 text-center w-full">
        {(Math.floor(health) >= 90 && Math.floor(spirituality) >= 90 && Math.floor(energy) >= 90 && Math.floor(happiness) >= 90) && (
          <div className="text-xs text-amber-500 font-medium animate-pulse">
            ✨ Mastery Level Achieved ✨
          </div>
        )}
      </div>
    </Card>
  );
}
