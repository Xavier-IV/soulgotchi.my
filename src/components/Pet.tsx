import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { vibrateMedium } from '@/lib/haptics';
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
    if (value >= 100) return "100%";
    return `${value}%`;
  };

  return (
    <Card className="w-full max-w-md mx-auto p-4 flex flex-col items-center justify-center gap-3">
      <div className="flex items-center justify-between w-full">
        <Badge variant={mood === 'happy' ? 'default' : 'outline'} className="text-xs">
          {mood.charAt(0).toUpperCase() + mood.slice(1)}
        </Badge>
        
        {localTimer > 0 && (
          <Badge variant="outline" className="text-xs bg-yellow-500/10">
            Decay: {localTimer}s
          </Badge>
        )}
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
            <span>{getProgressLabel(health)}</span>
          </div>
          <Progress value={health} className="h-2" />
        </div>
        
        <div className="space-y-1">
          <div className="flex justify-between text-xs">
            <span>Spirituality</span>
            <span>{getProgressLabel(spirituality)}</span>
          </div>
          <Progress value={spirituality} className="h-2" />
        </div>
        
        <div className="space-y-1">
          <div className="flex justify-between text-xs">
            <span>Energy</span>
            <span>{getProgressLabel(energy)}</span>
          </div>
          <Progress value={energy} className="h-2" />
        </div>
        
        <div className="space-y-1">
          <div className="flex justify-between text-xs">
            <span>Happiness</span>
            <span>{getProgressLabel(happiness)}</span>
          </div>
          <Progress value={happiness} className="h-2" />
        </div>
      </div>
    </Card>
  );
} 