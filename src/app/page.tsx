'use client';

import { useEffect, useState } from 'react';
import { Pet } from '@/components/Pet';
import { Actions } from '@/components/Actions';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { usePetState } from '@/hooks/usePetState';
import { loadPetState } from '@/lib/storage';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { InfoIcon, TrophyIcon } from 'lucide-react';

export default function Home() {
  const [petName, setPetName] = useState('SoulGatchi');
  const [isSetupComplete, setIsSetupComplete] = useState(false);
  const [selectedEmoji, setSelectedEmoji] = useState('🥺');
  
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
  
  // Load saved state on initial render
  useEffect(() => {
    const savedPet = loadPetState();
    
    if (savedPet) {
      setPetName(savedPet.name);
      actions.resetPet(savedPet.name);
      setIsSetupComplete(true);
    }
  }, []);
  
  // Handle pet setup
  const handleSetupPet = () => {
    if (petName.trim() === '') {
      setPetName('SoulGatchi');
    }
    
    actions.resetPet(petName);
    setIsSetupComplete(true);
  };
  
  // Handle pet death or reset
  const handleReset = () => {
    setIsSetupComplete(false);
    setPetName('SoulGatchi');
  };

  // Handle dhikr with specific type
  const handleDhikr = (dhikrType: string) => {
    actions.performDhikr(dhikrType);
  };

  // Game info tooltip content
  const gameInfoContent = (
    <div className="max-w-xs space-y-1 text-xs text-white">
      <h3 className="font-medium">How to Play SoulGatchi</h3>
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
  
  // Setup screen
  if (!isSetupComplete) {
    return (
      <main className="flex min-h-screen flex-col items-start justify-center p-2 bg-background">
        <Card className="w-full max-w-md mx-auto p-4 space-y-4">
          <div className="space-y-1 text-center">
            <h1 className="text-xl font-bold">Welcome to SoulGatchi</h1>
            <p className="text-xs text-muted-foreground">
              Your Islamic virtual pet that grows with your spiritual practices
            </p>
          </div>
          
          <div className="space-y-3">
            <div className="space-y-1">
              <label htmlFor="pet-name" className="text-xs font-medium">
                Name your SoulGatchi
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
          <h1 className="text-xl font-bold">Your SoulGatchi has passed away</h1>
          <p className="text-xs text-muted-foreground">
            {petName} lived for {petState.age} hours and has returned to Allah.
          </p>
          <div className="text-6xl my-4">
            <span role="img" aria-label="Deceased pet">💫</span>
          </div>
          <Button onClick={handleReset} className="w-full h-8 text-sm">
            Start Again
          </Button>
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
                    Your SoulGatchi&apos;s accomplishments
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
                      Mastery Achieved! Continue nurturing your SoulGatchi&apos;s journey.
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
          onPerformDhikr={handleDhikr}
          onPray={actions.pray}
          onRest={actions.rest}
          onLearn={actions.learn}
          dhikrCounts={petState.dhikrCounts}
        />
        
        <div className="text-center">
          <Button variant="outline" size="sm" onClick={handleReset} className="h-7 text-xs">
            Reset Pet
          </Button>
        </div>
      </div>
    </main>
  );
}
