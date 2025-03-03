import { useState, useEffect, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger } from '@/components/ui/drawer';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart2 } from 'lucide-react';
import { vibrateMedium, vibratePattern } from '@/lib/haptics';
import confetti from 'canvas-confetti';
import Big from 'big.js';

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

// Counter animation component
function AnimatedCounter({ targetValue }: { targetValue: number }) {
  const [displayValue, setDisplayValue] = useState(0);
  const previousValueRef = useRef(0);
  
  useEffect(() => {
    // Start with a small delay to make the animation more noticeable
    const startDelay = setTimeout(() => {
      // Always animate when the component mounts
      // Start from zero for more visible animation
      setDisplayValue(0);
      
      // Store the target value
      previousValueRef.current = targetValue;
      
      // Create Big.js instance for target value
      const bigTarget = new Big(targetValue);
      
      // Animate to target value - shorter duration to account for initial delay
      const duration = 1800; // 1.8 seconds (total 2s with 200ms delay)
      const interval = 20; // Update every 20ms for snappier animation
      const steps = duration / interval;
      
      let currentStep = 0;
      const timer = setInterval(() => {
        currentStep++;
        
        if (currentStep >= steps) {
          setDisplayValue(targetValue);
          clearInterval(timer);
        } else {
          // Calculate progress with a custom easing function that slows down dramatically at the end
          const progress = new Big(currentStep).div(steps);
          
          // Custom easing function - combination of easeOutQuint and easeOutExpo
          // This will make it very slow at the end
          let easedProgress;
          if (progress.lt(0.5)) {
            // easeOutQuint for first half: 16 * t^5
            easedProgress = new Big(16).times(
              progress.pow(5)
            );
          } else {
            // easeOutExpo for second half: 1 - pow(-2t + 2, 5) / 2
            easedProgress = new Big(1).minus(
              new Big(-2).times(progress).plus(2).pow(5).div(2)
            );
          }
          
          // Apply additional slowdown for the last 10% of the animation
          let finalProgress;
          if (progress.gt(0.9)) {
            // Slow down even more in the last 10%
            finalProgress = easedProgress.times(0.95).plus(
              progress.minus(0.9).times(0.5)
            );
          } else {
            finalProgress = easedProgress;
          }
          
          // Calculate the current value based on the eased progress
          const currentValue = bigTarget.times(finalProgress).round(0, 0);
          
          // Set the display value, ensuring it doesn't exceed the target
          setDisplayValue(Math.min(targetValue, currentValue.toNumber()));
        }
      }, interval);
      
      return () => clearInterval(timer);
    }, 200); // 200ms delay before starting (reduced from 300ms)
    
    return () => clearTimeout(startDelay);
  }, [targetValue]);
  
  // Format the display value with leading zeros
  const formattedValue = displayValue.toString().padStart(4, '0');
  
  return (
    <div className="font-mono font-semibold flex">
      {formattedValue.split('').map((digit, index) => (
        <div 
          key={index} 
          className="w-6 text-center tabular-nums"
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

  // Mock data for dhikr and prayers
  const dhikrData = [
    { name: 'SubhanAllah', count: 1233, target: 33, completed: true, isBlocked: false },
    { name: 'Alhamdulillah', count: 987, target: 33, completed: false, isBlocked: false },
    { name: 'Allahu Akbar', count: 1542, target: 33, completed: false, isBlocked: false },
    { name: 'Astaghfirullah', count: 456, target: 33, completed: true, isBlocked: false },
  ];

  const prayerData = [
    { name: 'Fajr', completed: true },
    { name: 'Dhuhr', completed: true },
    { name: 'Asr', completed: false },
    { name: 'Maghrib', completed: false },
    { name: 'Isha', completed: false },
  ];

  // State to track which dhikr is currently blocked
  const [blockedDhikr, setBlockedDhikr] = useState<string | null>(null);

  // Function to handle dhikr completion
  const handleDhikrComplete = (dhikrName: string) => {
    // If any dhikr is blocked, don't allow interaction
    if (blockedDhikr !== null) return;
    
    // Set the dhikr as blocked
    setBlockedDhikr(dhikrName);
    
    // Trigger strong haptic feedback for the "notch"
    vibratePattern([100, 30, 100, 30, 100]); // Three strong vibrations with pauses
    
    // Show confetti for the achievement
    confetti({
      particleCount: 50,
      spread: 70,
      origin: { x: 0.5, y: 0.6 },
      colors: ['#FFD700', '#FFA500', '#FF69B4', '#87CEEB', '#98FB98'],
    });
    
    // Unblock after 2 seconds
    setTimeout(() => {
      setBlockedDhikr(null);
    }, 2000);
  };

  return (
    <Card className="w-full max-w-md mx-auto p-4 flex flex-col items-center justify-center gap-3">
      <div className="flex items-center justify-between w-full">
        <Badge variant={mood === 'happy' ? 'default' : 'outline'} className="text-xs">
          {mood.charAt(0).toUpperCase() + mood.slice(1)}
        </Badge>
        
        <div className="flex items-center gap-2">
          {localTimer > 0 && (
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
                        {dhikrData.map((dhikr) => (
                          <div 
                            key={dhikr.name} 
                            className={`p-3 rounded-md border ${blockedDhikr === dhikr.name ? 'bg-amber-500/20 border-amber-500' : 'bg-card/50'} flex items-center justify-between relative cursor-pointer`}
                            onClick={() => handleDhikrComplete(dhikr.name)}
                          >
                            <div className="font-medium">{dhikr.name}</div>
                            <AnimatedCounter targetValue={dhikr.count} />
                            
                            {blockedDhikr === dhikr.name && (
                              <div className="absolute inset-0 flex items-center justify-center bg-background/80 rounded-md">
                                <div className="text-center">
                                  <div className="text-lg font-semibold text-amber-500">Set Complete!</div>
                                  <div className="text-xs text-muted-foreground mt-1">Please wait...</div>
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="prayer" className="space-y-2">
                      <div className="text-sm text-center mb-2">Today&apos;s Prayers</div>
                      <div className="grid grid-cols-5 gap-2">
                        {prayerData.map((prayer) => (
                          <div 
                            key={prayer.name} 
                            className={`text-center p-2 rounded-md border ${prayer.completed ? "bg-green-500/20 border-green-500" : "bg-muted/20 border-muted"}`}
                          >
                            <div className="text-xs font-medium">{prayer.name}</div>
                            <div className="mt-1">{prayer.completed ? "✓" : "○"}</div>
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
