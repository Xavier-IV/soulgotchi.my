'use client';

import { Actions } from '@/components/Actions';
import { Pet } from '@/components/Pet';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Drawer, DrawerContent, DrawerDescription, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
import { Input } from '@/components/ui/input';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { usePetState } from '@/hooks/usePetState';
import { usePetStore } from '@/store/petStore';
import { InfoIcon, TrophyIcon } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

export default function Home() {
  const [petName, setPetName] = useState('SoulGotchi');
  const [selectedEmoji, setSelectedEmoji] = useState('🥺');
  const [resetDrawerOpen, setResetDrawerOpen] = useState(false);
  const [resetProgress, setResetProgress] = useState(0);
  const [isHoldingReset, setIsHoldingReset] = useState(false);
  const resetTimerRef = useRef<NodeJS.Timeout | null>(null);
  const { isSetupComplete, setIsSetupComplete } = usePetStore();
  
  const emojiOptions = [
    { emoji: '🥺', description: 'Pleading' },
    { emoji: '😊', description: 'Gentle smile' },
    { emoji: '🐱', description: 'Kitty' },
    { emoji: '🐰', description: 'Bunny' },
    { emoji: '🐨', description: 'Koala' },
    { emoji: '🦊', description: 'Fox' },
    { emoji: '🐼', description: 'Panda' },
    { emoji: '🐣', description: 'Baby chick' },
  ];
  
  // Initialize pet state from storage or with default values
  const { petState, isAlive, timeUntilDecay, actions } = usePetState(petName);
  
  
  // Handle pet setup
  const handleSetupPet = () => {
    if (petName.trim() === '') {
      setPetName('SoulGotchi');
    }
    console.log('Resetting pet 1');
    actions.resetPet(petName, selectedEmoji);
    setIsSetupComplete(true);
  };
  
  // Handle pet death or reset
  const handleReset = () => {
    setIsSetupComplete(false);
    console.log('Resetting pet 2');
    setPetName('SoulGotchi');
  };

  // Function to reset all data
  const handleResetAllData = () => {
    // Clear all localStorage data
    localStorage.clear();
    
    // Reset pet state
    actions.resetPet();
    
    // Close the drawer
    setResetDrawerOpen(false);
    
    // Reset the progress
    setResetProgress(0);
    setIsHoldingReset(false);
    setIsSetupComplete(false); 
    // Reload the page to ensure all stores are reset
    window.location.reload();
  };
  
  // Handle hold to reset
  const handleResetStart = () => {
    setIsHoldingReset(true);
    setResetProgress(0);
    
    // Clear any existing timer
    if (resetTimerRef.current) {
      clearInterval(resetTimerRef.current);
    }
    
    // Start a timer to increment progress
    const startTime = Date.now();
    const duration = 3000; // 3 seconds to hold
    
    resetTimerRef.current = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const newProgress = Math.min(100, (elapsed / duration) * 100);
      setResetProgress(newProgress);
      
      if (newProgress >= 100) {
        // Reset all data when progress is complete
        handleResetAllData();
        clearInterval(resetTimerRef.current!);
      }
    }, 100);
  };
  
  const handleResetEnd = () => {
    setIsHoldingReset(false);
    console.log('Resetting end');
    setIsSetupComplete(false);
    setResetProgress(0);
    
    // Clear the timer
    if (resetTimerRef.current) {
      clearInterval(resetTimerRef.current);
      resetTimerRef.current = null;
    }
  };

  // Game info tooltip content
  const gameInfoContent = (
    <div className="max-w-xs space-y-1 text-xs text-white">
      <h3 className="font-medium">How to Play SoulGotchi</h3>
      <ul className="list-disc pl-3 space-y-0.5">
        <li>Perform Islamic practices to grow your pet&apos;s stats</li>
        <li>Each dhikr type provides different benefits</li>
        <li>Recite the same dhikr repeatedly for bonus effects</li>
        <li>Stats decay every 10 seconds if you don&apos;t interact</li>
        <li>Earn achievements as your stats improve</li>
        <li>Reach 100% in all stats to achieve mastery</li>
        <li>If health or spirituality drops to 0, your pet will pass away</li>
      </ul>
    </div>
  );

  useEffect(() => {
    if (isSetupComplete) {
      setPetName(petState.name);
      setSelectedEmoji(petState.emoji);
    }
  }, [isSetupComplete, petState.name, petState.emoji]);
  
  // Setup screen
  if (!isSetupComplete) {
    return (
      <main className="flex min-h-screen flex-col items-start justify-center p-2 bg-background">
        <Card className="w-full max-w-md mx-auto p-4 space-y-4">
          <div className="space-y-1 text-center">
            <h1 className="text-xl font-bold">Welcome to SoulGotchi</h1>
            <p className="text-xs text-muted-foreground">
              Your Islamic virtual pet that grows with your spiritual practices
            </p>
          </div>
          
          <div className="space-y-3">
            <div className="space-y-1">
              <label htmlFor="pet-name" className="text-xs font-medium">
                Name your SoulGotchi
              </label>
              <Input
                id="pet-name"
                value={petName}
                onChange={(e) => setPetName(e.target.value)}
                placeholder="Enter a name"
                className="w-full h-8 text-sm"
              />
            </div>
            
            <div className="space-y-1">
              <label className="text-xs font-medium">
                Choose your pet
              </label>
              <div className="grid grid-cols-4 gap-2">
                {emojiOptions.map((option) => (
                  <Button
                    key={option.emoji}
                    variant={selectedEmoji === option.emoji ? "default" : "outline"}
                    className="h-12 text-xl hover:text-2xl transition-all"
                    onClick={() => setSelectedEmoji(option.emoji)}
                    title={option.description}
                  >
                    {option.emoji}
                  </Button>
                ))}
              </div>
            </div>
            
            <Button onClick={handleSetupPet} className="w-full h-8 text-sm">
              Start Your Journey
            </Button>
          </div>
        </Card>
      </main>
    );
  }
  
  // Death screen
  if (!isAlive) {
    return (
      <main className="flex min-h-screen flex-col items-start justify-center p-2 bg-background">
        <Card className="w-full max-w-md mx-auto p-4 space-y-4 text-center">
          <h1 className="text-xl font-bold">Your SoulGotchi has passed away</h1>
          <p className="text-xs text-muted-foreground">
            {petName} lived for {petState.age} hours and has returned to Allah.
          </p>
          <div className="text-6xl my-4">
            <span role="img" aria-label="Deceased pet">💫</span>
          </div>
          <div className="text-center flex justify-center gap-2">
            <Button variant="outline" size="sm" onClick={handleReset} className="h-7 text-xs">
              Reset Pet
            </Button>
            <Button variant="outline" size="sm" onClick={() => setResetDrawerOpen(true)} className="h-7 text-xs text-destructive border-destructive/30 hover:bg-destructive/10">
              Reset All Data
            </Button>
          </div>
        </Card>
      </main>
    );
  }
  
  // Calculate achievements based on stats
  const getAchievements = () => {
    const achievements = [];
    
    // Spiritual achievements
    if (petState.spirituality >= 100) {
      achievements.push("Spiritual Master");
    } else if (petState.spirituality >= 75) {
      achievements.push("Spiritual Guide");
    } else if (petState.spirituality >= 50) {
      achievements.push("Spiritual Seeker");
    }
    
    // Health achievements
    if (petState.health >= 100) {
      achievements.push("Peak Health");
    } else if (petState.health >= 75) {
      achievements.push("Vibrant Health");
    } else if (petState.health >= 50) {
      achievements.push("Good Health");
    }
    
    // Energy achievements
    if (petState.energy >= 100) {
      achievements.push("Boundless Energy");
    } else if (petState.energy >= 75) {
      achievements.push("Energetic");
    } else if (petState.energy >= 50) {
      achievements.push("Active");
    }
    
    // Happiness achievements
    if (petState.happiness >= 100) {
      achievements.push("Blissful");
    } else if (petState.happiness >= 75) {
      achievements.push("Joyful");
    } else if (petState.happiness >= 50) {
      achievements.push("Content");
    }
    
    // Age-based achievements
    if (petState.age >= 24) {
      achievements.push("Wise Elder");
    } else if (petState.age >= 12) {
      achievements.push("Mature Soul");
    } else if (petState.age >= 6) {
      achievements.push("Growing Soul");
    }
    
    return achievements;
  };
  
  const achievements = getAchievements();
  const hasMaxStats = petState.health >= 100 && petState.spirituality >= 100 && 
                      petState.energy >= 100 && petState.happiness >= 100;
  
  // Main game screen
  return (
    <main className="flex min-h-screen flex-col items-start justify-center p-2 bg-background">
      <div className="w-full max-w-md mx-auto space-y-3">
        <div className="flex items-center justify-between w-full">
          <h1 className="text-xl font-bold">{petName}</h1>
          <div className="flex items-center gap-2">
            <p className="text-xs text-muted-foreground">Age: {petState.age} hours</p>
            
            {/* Achievements Dialog */}
            <Dialog>
              <DialogTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-6 w-6 relative"
                  aria-label="View Achievements"
                >
                  <TrophyIcon className="h-3 w-3" />
                  {achievements.length > 0 && (
                    <span className="absolute -top-1 -right-1 bg-primary text-[10px] text-primary-foreground rounded-full h-3 w-3 flex items-center justify-center">
                      {achievements.length}
                    </span>
                  )}
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-xs">
                <DialogHeader>
                  <DialogTitle>Achievements</DialogTitle>
                  <DialogDescription>
                    Your SoulGotchi&apos;s accomplishments
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-2">
                  {achievements.length > 0 ? (
                    <div className="flex flex-wrap gap-1">
                      {achievements.map((achievement, index) => (
                        <span key={index} className="text-xs bg-primary/20 text-primary px-2 py-1 rounded-full">
                          {achievement}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      Complete tasks to earn achievements
                    </p>
                  )}
                  
                  {hasMaxStats && (
                    <p className="text-sm text-primary font-medium mt-2">
                      Mastery Achieved! Continue nurturing your SoulGotchi&apos;s journey.
                    </p>
                  )}
                </div>
              </DialogContent>
            </Dialog>
            
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-6 w-6">
                    <InfoIcon className="h-3 w-3" />
                    <span className="sr-only">Game Info</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom" align="end" className="bg-card border-border">
                  {gameInfoContent}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
        
        <Pet
          health={petState.health}
          spirituality={petState.spirituality}
          energy={petState.energy}
          happiness={petState.happiness}
          timeUntilDecay={timeUntilDecay}
          emoji={selectedEmoji}
        />
        
        <Actions
          onPray={actions.pray}
          onLearn={actions.learn}
        />
        
        <div className="text-center flex justify-center gap-2">
          <Button variant="outline" size="sm" onClick={handleReset} className="h-7 text-xs">
            Reset Pet
          </Button>
          <Button variant="outline" size="sm" onClick={() => setResetDrawerOpen(true)} className="h-7 text-xs text-destructive border-destructive/30 hover:bg-destructive/10">
            Reset All Data
          </Button>
        </div>
      </div>
      
      {/* Reset All Data Confirmation Drawer */}
      <Drawer open={resetDrawerOpen} onOpenChange={setResetDrawerOpen}>
        <DrawerContent>
          <div className="mx-auto w-full max-w-sm">
            <DrawerHeader>
              <DrawerTitle>Reset All Data</DrawerTitle>
              <DrawerDescription>
                This will delete all your progress, achievements, and settings. This action cannot be undone.
              </DrawerDescription>
            </DrawerHeader>
            <div className="p-4 flex flex-col gap-4">
              <p className="text-sm text-muted-foreground">
                Are you sure you want to reset all data and start fresh?
              </p>
              
              <Button 
                variant="destructive" 
                className="relative overflow-hidden"
                onMouseDown={handleResetStart}
                onMouseUp={handleResetEnd}
                onMouseLeave={handleResetEnd}
                onTouchStart={handleResetStart}
                onTouchEnd={handleResetEnd}
                onTouchCancel={handleResetEnd}
              >
                <span className="relative z-10 flex items-center justify-center">
                  {isHoldingReset 
                    ? `Hold to confirm (${Math.round(resetProgress)}%)` 
                    : 'Hold to confirm reset'}
                </span>
                
                {/* Progress overlay */}
                <div 
                  className="absolute left-0 top-0 bottom-0 bg-background/20 transition-all"
                  style={{ width: `${resetProgress}%` }}
                />
              </Button>
              
              <Button variant="outline" onClick={() => setResetDrawerOpen(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </DrawerContent>
      </Drawer>
    </main>
  );
}
