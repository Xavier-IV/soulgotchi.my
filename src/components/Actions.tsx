'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { vibrate, vibratePattern } from '@/lib/haptics';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger } from '@/components/ui/drawer';
import { useFocusStore } from '@/store/focusStore';
import { useActivityStore } from '@/store/activityStore';

interface ActionsProps {
  onPray: () => void;
  onLearn: () => void;
}

export function Actions({ 
  onPray, 
  onLearn,
}: ActionsProps) {
  const [activeTab, setActiveTab] = useState('dhikr');
  const [showActionMessage, setShowActionMessage] = useState(false);
  const actionTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [closeProgress, setCloseProgress] = useState(0);
  const [isHoldingClose, setIsHoldingClose] = useState(false);
  const closeTimerRef = useRef<NodeJS.Timeout | null>(null);
  const [lastClickedDhikr, setLastClickedDhikr] = useState<string | null>(null);
  const [isLockFlashing, setIsLockFlashing] = useState(false);
  const lockFlashTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Get focus state from Zustand store
  const { 
    isDrawerOpen, 
    focusedDhikr, 
    isLocked,
    setDrawerOpen,
    setFocusedDhikr,
    toggleLock
  } = useFocusStore();

  // Get activity state from Zustand store
  const {
    dhikrCounts,
    blockedDhikr,
    prayerStatus,
    lastActionMessage,
    performDhikr,
    completePrayer,
    setBlockedDhikr,
    setLastActionMessage
  } = useActivityStore();
  
  // Clean up timeout on unmount
  useEffect(() => {
    return () => {
      if (actionTimeoutRef.current) {
        clearTimeout(actionTimeoutRef.current);
      }
      if (closeTimerRef.current) {
        clearInterval(closeTimerRef.current);
      }
      if (lockFlashTimeoutRef.current) {
        clearTimeout(lockFlashTimeoutRef.current);
      }
    };
  }, []);
  
  const dhikrList = [
    { name: 'Subhanallah', translation: 'Glory be to Allah', benefit: 'Small boost to all stats + spirituality', target: 33 },
    { name: 'Alhamdulillah', translation: 'Praise be to Allah', benefit: 'Small boost to all stats + happiness', target: 33 },
    { name: 'Allahu Akbar', translation: 'Allah is the Greatest', benefit: 'Small boost to all stats + energy', target: 33 },
    { name: 'Astaghfirullah', translation: 'I seek forgiveness from Allah', benefit: 'Small boost to all stats + health', target: 33 }
  ];

  // Update action message and handle timeout
  const updateActionMessage = (message: string) => {
    setLastActionMessage(message);
    setShowActionMessage(true);
    
    // Clear any existing timeout
    if (actionTimeoutRef.current) {
      clearTimeout(actionTimeoutRef.current);
    }
    
    // Set a new timeout to hide the message after 3 seconds
    actionTimeoutRef.current = setTimeout(() => {
      setShowActionMessage(false);
    }, 3000);
  };
  
  const handleDhikr = (dhikrType: string) => {
    // If any dhikr is blocked, don't allow interaction
    if (blockedDhikr !== null) return;
    
    // Set this as the last clicked dhikr
    setLastClickedDhikr(dhikrType);
    
    vibrate();
    performDhikr(dhikrType);
    const count = (dhikrCounts[dhikrType] || 0) + 1;
    updateActionMessage(`Recited: ${dhikrType} (${count}x)`);
    
    // Check if completing a set of 33
    if (count % 33 === 0) {
      // Block this dhikr type
      setBlockedDhikr(dhikrType);
      
      // Trigger pattern vibration for set completion
      vibratePattern([100, 30, 100, 30, 100]); // Three vibrations with pauses
      
      // Unblock after 2 seconds
      setTimeout(() => {
        setBlockedDhikr(null);
      }, 2000);
    }
  };
  
  // Handle dhikr in focus mode
  const handleFocusedDhikr = () => {
    if (focusedDhikr) {
      handleDhikr(focusedDhikr);
    }
  };
  
  const handlePray = (prayerName: keyof typeof prayerStatus) => {
    vibrate();
    onPray();
    completePrayer(prayerName);
    updateActionMessage(`Completed ${prayerName} prayer`);
  };
  
  const handleLearn = (topic: string) => {
    vibrate();
    onLearn();
    updateActionMessage(`Studied: ${topic}`);
  };
  
  const handleTabChange = (value: string) => {
    vibrate();
    setActiveTab(value);
  };
  
  // Calculate dhikr progress and bonuses
  const getDhikrProgress = (dhikrType: string) => {
    const count = dhikrCounts[dhikrType] || 0;
    const dhikr = dhikrList.find(d => d.name === dhikrType);
    if (!dhikr) return 0;
    
    // Calculate progress as a percentage of target (33)
    const progress = Math.min(100, Math.floor((count % dhikr.target) / dhikr.target * 100));
    return progress;
  };
  
  const getDhikrBonus = (dhikrType: string) => {
    const count = dhikrCounts[dhikrType] || 0;
    // Calculate how many complete sets of 33 have been done
    const completeSets = Math.floor(count / 33);
    return completeSets;
  };

  // Handle hold to close
  const handleCloseStart = () => {
    setIsHoldingClose(true);
    setCloseProgress(0);
    
    // Clear any existing timer
    if (closeTimerRef.current) {
      clearInterval(closeTimerRef.current);
    }
    
    // Start a timer to increment progress
    const startTime = Date.now();
    const duration = 1000; // 1 second to hold
    
    closeTimerRef.current = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const newProgress = Math.min(100, (elapsed / duration) * 100);
      setCloseProgress(newProgress);
      
      if (newProgress >= 100) {
        // Close the drawer when progress is complete
        setDrawerOpen(false);
        setCloseProgress(0);
        setIsHoldingClose(false);
        clearInterval(closeTimerRef.current!);
        closeTimerRef.current = null;
      }
    }, 50); // Update every 50ms for smooth animation
  };
  
  const handleCloseEnd = () => {
    setIsHoldingClose(false);
    setCloseProgress(0);
    
    // Clear the timer
    if (closeTimerRef.current) {
      clearInterval(closeTimerRef.current);
      closeTimerRef.current = null;
    }
  };
  
  // Handle lock flash effect
  const handleLockFlash = () => {
    if (isLocked) {
      setIsLockFlashing(true);
      vibrate();
      
      // Clear any existing timeout
      if (lockFlashTimeoutRef.current) {
        clearTimeout(lockFlashTimeoutRef.current);
      }
      
      // Set a timeout to stop flashing after 1 second
      lockFlashTimeoutRef.current = setTimeout(() => {
        setIsLockFlashing(false);
      }, 1000);
    }
  };

  // Handle drawer open change - prevent closing when locked
  const handleDrawerOpenChange = (open: boolean) => {
    if (isLocked && !open) {
      // If locked and trying to close, prevent closing
      return;
    }
    setDrawerOpen(open);
  };

  // Handle opening the focus drawer
  const handleOpenFocusDrawer = () => {
    // If there's a last clicked dhikr, set it as the focused dhikr
    if (lastClickedDhikr) {
      setFocusedDhikr(lastClickedDhikr);
    }
    setDrawerOpen(true);
  };

  // Add keyboard shortcut handling
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Only process if not in an input field
      if (e.target instanceof HTMLInputElement || 
          e.target instanceof HTMLTextAreaElement) {
        return;
      }
      
      // Skip if drawer is open in focus mode
      if (isDrawerOpen && focusedDhikr) {
        // In focus mode, space triggers the focused dhikr
        if (e.code === 'Space' && !e.repeat) {
          e.preventDefault();
          handleFocusedDhikr();
        }
        return;
      }
      
      // Skip if any dhikr is blocked
      if (blockedDhikr !== null) return;
      
      // Keyboard shortcuts for dhikr
      switch (e.code) {
        case 'Digit1':
        case 'Numpad1':
          e.preventDefault();
          handleDhikr('Subhanallah');
          break;
        case 'Digit2':
        case 'Numpad2':
          e.preventDefault();
          handleDhikr('Alhamdulillah');
          break;
        case 'Digit3':
        case 'Numpad3':
          e.preventDefault();
          handleDhikr('Allahu Akbar');
          break;
        case 'Digit4':
        case 'Numpad4':
          e.preventDefault();
          handleDhikr('Astaghfirullah');
          break;
        case 'Space':
          // Space can be used for the last clicked dhikr
          if (lastClickedDhikr && !e.repeat) {
            e.preventDefault();
            handleDhikr(lastClickedDhikr);
          }
          break;
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [blockedDhikr, isDrawerOpen, focusedDhikr, lastClickedDhikr]);

  return (
    <Card className="w-full max-w-md mx-auto p-4">
      {/* Action message with fade effect */}
      <div className="h-8 mb-2 flex items-center justify-center">
        {lastActionMessage && (
          <div className={`text-sm text-center transition-opacity duration-500 ${showActionMessage ? 'opacity-100' : 'opacity-0'}`}>
            {lastActionMessage}
          </div>
        )}
      </div>
      
      <Tabs 
        defaultValue="dhikr" 
        className="w-full"
        value={activeTab}
        onValueChange={handleTabChange}
      >
        <TabsList className="grid w-full grid-cols-3 h-9">
          <TabsTrigger value="dhikr" className="text-xs">Dhikr</TabsTrigger>
          <TabsTrigger value="prayer" className="text-xs">Prayer</TabsTrigger>
          <TabsTrigger value="learn" className="text-xs">Learn</TabsTrigger>
        </TabsList>
        
        <TabsContent value="dhikr" className="mt-2 min-h-[180px]">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-sm font-medium">Perform Dhikr</h3>
            <Drawer 
              open={isDrawerOpen} 
              onOpenChange={handleDrawerOpenChange}
              dismissible={!isLocked}
            >
              <DrawerTrigger asChild>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="h-7 px-2"
                  onClick={handleOpenFocusDrawer}
                >
                  <span className="mr-1">Focus</span>
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-target"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>
                </Button>
              </DrawerTrigger>
              <DrawerContent data-vaul-no-drag={isLocked ? true : undefined}>
                <DrawerHeader className="relative">
                  {focusedDhikr && (
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="absolute left-2 top-1/2 -translate-y-1/2 h-8 w-8"
                      onClick={() => isLocked ? handleLockFlash() : setFocusedDhikr(null)}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-chevron-left"><path d="m15 18-6-6 6-6"/></svg>
                    </Button>
                  )}
                  <DrawerTitle className="text-center">Focus Mode</DrawerTitle>
                  {focusedDhikr && (
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className={`absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 transition-all ${isLockFlashing ? 'animate-pulse bg-amber-500/20' : ''}`}
                      onClick={toggleLock}
                    >
                      {isLocked ? (
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`lucide lucide-lock ${isLockFlashing ? 'text-amber-600' : 'text-amber-500'}`}><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                      ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-lock-open"><path d="M7 11V7a5 5 0 0 1 9.9-1"/><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/></svg>
                      )}
                    </Button>
                  )}
                </DrawerHeader>
                
                <div className="p-4 flex flex-col items-center">
                  {focusedDhikr ? (
                    <>
                      <div className="text-center mb-4">
                        <div className="text-lg font-medium">{focusedDhikr}</div>
                        <div className="text-sm text-muted-foreground">
                          {dhikrList.find(d => d.name === focusedDhikr)?.translation}
                        </div>
                      </div>
                      
                      <div className="text-4xl font-bold mb-6">
                        {dhikrCounts[focusedDhikr] || 0}
                      </div>
                      
                      <Button 
                        size="lg" 
                        className="w-full h-32 text-xl"
                        onClick={handleFocusedDhikr}
                        disabled={blockedDhikr === focusedDhikr}
                      >
                        {focusedDhikr}
                        
                        {blockedDhikr === focusedDhikr && (
                          <div className="absolute inset-0 flex items-center justify-center bg-background/80 rounded-md">
                            <div className="text-center">
                              <div className="text-lg font-semibold text-amber-500">Set Complete!</div>
                              <div className="text-xs text-muted-foreground mt-1">Please wait...</div>
                            </div>
                          </div>
                        )}
                      </Button>
                      
                      <div className="mt-4 text-sm">
                        <span className="font-medium">Current set: </span>
                        <span>{(dhikrCounts[focusedDhikr] || 0) % 33}/{dhikrList.find(d => d.name === focusedDhikr)?.target}</span>
                      </div>
                      
                      <div className="mt-6 w-full">
                        <div 
                          className="relative w-full overflow-hidden rounded-md"
                          onMouseDown={!isLocked ? handleCloseStart : handleLockFlash}
                          onMouseUp={!isLocked ? handleCloseEnd : undefined}
                          onMouseLeave={!isLocked ? handleCloseEnd : undefined}
                          onTouchStart={!isLocked ? handleCloseStart : handleLockFlash}
                          onTouchEnd={!isLocked ? handleCloseEnd : undefined}
                          onTouchCancel={!isLocked ? handleCloseEnd : undefined}
                        >
                          <Button 
                            variant="outline" 
                            className="w-full relative"
                            disabled={isLocked}
                            onClick={isLocked ? handleLockFlash : undefined}
                          >
                            <span className="relative z-10 flex items-center justify-center">
                              {isLocked && (
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-lock mr-2 text-amber-500"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                              )}
                              {isHoldingClose 
                                ? `Hold to close (${Math.round(closeProgress)}%)` 
                                : isLocked ? 'Locked' : 'Hold to close Focus Mode'}
                            </span>
                            
                            {/* Progress overlay */}
                            <div 
                              className="absolute left-0 top-0 bottom-0 bg-primary/20 transition-all"
                              style={{ width: `${closeProgress}%` }}
                            />
                          </Button>
                        </div>
                      </div>
                      
                      {/* Keyboard shortcut hint for focus mode - hidden on mobile */}
                      <div className="mt-3 text-xs text-center text-muted-foreground hidden sm:block">
                        Press <kbd className="px-1 py-0.5 mx-1 bg-muted rounded border border-border">Space</kbd> to recite
                      </div>
                    </>
                  ) : (
                    <div className="p-4 space-y-4">
                      <p className="text-center text-sm text-muted-foreground mb-2">Select a dhikr to focus on:</p>
                      <div className="grid grid-cols-1 gap-2">
                        {dhikrList.map((dhikr) => (
                          <Button 
                            key={dhikr.name}
                            variant="outline"
                            className="justify-start h-auto py-3"
                            onClick={() => setFocusedDhikr(dhikr.name)}
                          >
                            <div className="flex flex-col items-start">
                              <span className="font-medium">{dhikr.name}</span>
                              <span className="text-xs text-muted-foreground">{dhikr.translation}</span>
                            </div>
                          </Button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </DrawerContent>
            </Drawer>
          </div>
          
          <p className="text-xs text-center text-muted-foreground mb-2">
            Complete sets of 33 for greater rewards (Sunnah)
          </p>
          <div className="grid grid-cols-2 gap-2 mt-2">
            {dhikrList.map((dhikr, index) => {
              const count = dhikrCounts[dhikr.name] || 0;
              const bonus = getDhikrBonus(dhikr.name);
              const progress = getDhikrProgress(dhikr.name);
              const currentInSet = count % dhikr.target || 0;
              const isBlocked = blockedDhikr === dhikr.name;
              
              return (
                <Button 
                  key={dhikr.name}
                  variant="outline" 
                  className="h-auto py-2 flex flex-col relative overflow-hidden w-full"
                  onClick={() => handleDhikr(dhikr.name)}
                  disabled={isBlocked}
                >
                  {/* Progress bar */}
                  <div 
                    className="absolute bottom-0 left-0 h-1 bg-primary/50 transition-all duration-300" 
                    style={{ width: `${progress}%` }}
                  />
                  
                  <div className="flex items-center sm:justify-between w-full justify-center">
                    <span className="font-medium text-sm">{dhikr.name}</span>
                    <kbd className="px-1.5 py-0.5 text-xs bg-muted rounded border border-border hidden sm:inline-block">
                      {index + 1}
                    </kbd>
                  </div>
                  
                  <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground">
                    <span>{currentInSet}/{dhikr.target}</span>
                    {bonus > 0 && (
                      <span className="text-amber-500 font-medium">{bonus} sets</span>
                    )}
                  </div>
                  
                  {/* Overlay for blocked state */}
                  {isBlocked && (
                    <div className="absolute inset-0 flex items-center justify-center bg-background/80 rounded-md">
                      <div className="text-center">
                        <div className="text-sm font-semibold text-amber-500">Set Complete!</div>
                        <div className="text-xs text-muted-foreground">Please wait...</div>
                      </div>
                    </div>
                  )}
                </Button>
              );
            })}
          </div>

          {/* Keyboard shortcuts hint - hidden on mobile */}
          <div className="mt-3 text-xs text-center text-muted-foreground hidden sm:block">
            <p>Keyboard shortcuts: <kbd className="px-1 py-0.5 mx-1 bg-muted rounded border border-border">1</kbd>-<kbd className="px-1 py-0.5 mx-1 bg-muted rounded border border-border">4</kbd> for dhikr, <kbd className="px-1 py-0.5 mx-1 bg-muted rounded border border-border">Space</kbd> for last used</p>
          </div>
        </TabsContent>
        
        <TabsContent value="prayer" className="mt-2 min-h-[180px]">
          <h3 className="text-sm font-medium text-center">Prayer</h3>
          <p className="text-xs text-center text-muted-foreground mt-1 mb-2">
            The main source of nourishment for your soul
          </p>
          <div className="grid grid-cols-3 gap-2 mt-2">
            {Object.entries(prayerStatus).map(([prayer, completed]) => (
              <Button 
                key={prayer}
                variant={completed ? "default" : "outline"} 
                className={`h-12 ${completed ? "bg-primary text-primary-foreground" : ""}`}
                onClick={() => handlePray(prayer as keyof typeof prayerStatus)}
              >
                {prayer}
                {completed && (
                  <span className="ml-1 text-xs">✓</span>
                )}
              </Button>
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="learn" className="mt-2 min-h-[180px]">
          <h3 className="text-sm font-medium text-center">Learn</h3>
          <div className="grid grid-cols-2 gap-2 mt-2">
            <Button variant="outline" className="h-12" onClick={() => handleLearn('Quran')}>Read Quran</Button>
            <Button variant="outline" className="h-12" onClick={() => handleLearn('Hadith')}>Learn Hadith</Button>
            <Button variant="outline" className="h-12" onClick={() => handleLearn('Fiqh')}>Study Fiqh</Button>
            <Button variant="outline" className="h-12" onClick={() => handleLearn('Islamic History')}>Islamic History</Button>
          </div>
        </TabsContent>
      </Tabs>
    </Card>
  );
} 