'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { X } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export function PwaInstallPrompt() {
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    // Check if the user has already dismissed the prompt
    const hasUserDismissedPrompt = localStorage.getItem('pwaPromptDismissed');
    if (hasUserDismissedPrompt === 'true') {
      setIsDismissed(true);
      return;
    }

    // Listen for the beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      // Prevent Chrome 67 and earlier from automatically showing the prompt
      e.preventDefault();
      // Store the event so it can be triggered later
      setInstallPrompt(e as BeforeInstallPromptEvent);
      // Show the install button
      setIsVisible(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Check if the app is already installed
    const handleAppInstalled = () => {
      setIsVisible(false);
      localStorage.setItem('pwaPromptDismissed', 'true');
    };

    window.addEventListener('appinstalled', handleAppInstalled);

    // Clean up event listeners
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!installPrompt) return;

    // Show the install prompt
    await installPrompt.prompt();

    // Wait for the user to respond to the prompt
    const choiceResult = await installPrompt.userChoice;
    
    if (choiceResult.outcome === 'accepted') {
      console.log('User accepted the install prompt');
    } else {
      console.log('User dismissed the install prompt');
    }

    // Clear the saved prompt as it can only be used once
    setInstallPrompt(null);
    setIsVisible(false);
  };

  const handleDismiss = () => {
    setIsVisible(false);
    setIsDismissed(true);
    localStorage.setItem('pwaPromptDismissed', 'true');
  };

  if (!isVisible || isDismissed) return null;

  return (
    <Card className="fixed bottom-4 left-4 right-4 p-4 z-50 bg-background border border-primary/20 shadow-lg">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h3 className="text-sm font-medium mb-1">Install SoulGotchi</h3>
          <p className="text-xs text-muted-foreground mb-3">
            Install this app on your device for a better experience
          </p>
          <Button size="sm" onClick={handleInstallClick} className="w-full">
            Install Now
          </Button>
        </div>
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-6 w-6" 
          onClick={handleDismiss}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </Card>
  );
} 