import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { vibrate, vibratePattern } from '@/lib/haptics';
import { savePrayerStatus, loadPrayerStatus } from '@/lib/storage';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger } from '@/components/ui/drawer';

interface ActionsProps {
  onPerformDhikr: (dhikrType: string) => void;
  onPray: () => void;
  onRest: () => void;
  onLearn: () => void;
  dhikrCounts?: {
    [key: string]: number;
  };
}

export function Actions({ 
  onPerformDhikr, 
  onPray, 
  onRest, 
  onLearn, 
  dhikrCounts = {} 
}: ActionsProps) {
  const [activeTab, setActiveTab] = useState('dhikr');
  const [lastAction, setLastAction] = useState<string | null>(null);
  const [showActionMessage, setShowActionMessage] = useState(false);
  const actionTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [blockedDhikr, setBlockedDhikr] = useState<string | null>(null);
  const [focusedDhikr, setFocusedDhikr] = useState<string | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [closeProgress, setCloseProgress] = useState(0);
  const [isHoldingClose, setIsHoldingClose] = useState(false);
  const [isLocked, setIsLocked] = useState(false);
  const closeTimerRef = useRef<NodeJS.Timeout | null>(null);
  const [prayerStatus, setPrayerStatus] = useState<Record<string, boolean>>({
    Fajr: false,
    Dhuhr: false,
    Asr: false,
    Maghrib: false,
    Isha: false,
    Tahajjud: false
  });
  
  // Load prayer status on component mount
  useEffect(() => {
    const savedPrayerStatus = loadPrayerStatus();
    if (savedPrayerStatus) {
      setPrayerStatus(savedPrayerStatus);
    }
  }, []);
  
  // Save prayer status whenever it changes
  useEffect(() => {
    savePrayerStatus(prayerStatus);
  }, [prayerStatus]);

  // Clean up timeout on unmount
  useEffect(() => {
    return () => {
      if (actionTimeoutRef.current) {
        clearTimeout(actionTimeoutRef.current);
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
    setLastAction(message);
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
    
    vibrate();
    onPerformDhikr(dhikrType);
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
  
  const handlePray = (prayerName: string) => {
    vibrate();
    onPray();
    setPrayerStatus(prev => ({
      ...prev,
      [prayerName]: true
    }));
    updateActionMessage(`Completed ${prayerName} prayer`);
  };
  
  const handleRest = () => {
    vibrate();
    onRest();
    updateActionMessage('Rested and regained energy');
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
    const duration = 3000; // 3 seconds to hold
    
    closeTimerRef.current = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const newProgress = Math.min(100, (elapsed / duration) * 100);
      setCloseProgress(newProgress);
      
      if (newProgress >= 100) {
        // Close the drawer when progress is complete
        setIsDrawerOpen(false);
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
  
  // Clean up close timer on unmount
  useEffect(() => {
    return () => {
      if (closeTimerRef.current) {
        clearInterval(closeTimerRef.current);
      }
    };
  }, []);

  // Toggle lock state
  const toggleLock = () => {
    vibrate();
    setIsLocked(!isLocked);
  };

  return (
    <Card className="w-full max-w-md mx-auto p-4">
      {/* Action message with fade effect */}
      <div className="h-8 mb-2 flex items-center justify-center">
        {lastAction && (
          <div className={`text-sm text-center transition-opacity duration-500 ${showActionMessage ? 'opacity-100' : 'opacity-0'}`}>
            {lastAction}
          </div>
        )}
      </div>
      
      <Tabs 
        defaultValue="dhikr" 
        className="w-full"
        value={activeTab}
        onValueChange={handleTabChange}
      >
        <TabsList className="grid w-full grid-cols-4 h-9">
          <TabsTrigger value="dhikr" className="text-xs">Dhikr</TabsTrigger>
          <TabsTrigger value="prayer" className="text-xs">Prayer</TabsTrigger>
          <TabsTrigger value="rest" className="text-xs">Rest</TabsTrigger>
          <TabsTrigger value="learn" className="text-xs">Learn</TabsTrigger>
        </TabsList>
        
        <TabsContent value="dhikr" className="mt-2 min-h-[180px]">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-sm font-medium">Perform Dhikr</h3>
            <Drawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
              <DrawerTrigger asChild>
                <Button variant="outline" size="sm" className="h-7 px-2">
                  <span className="mr-1">Focus</span>
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-target"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>
                </Button>
              </DrawerTrigger>
              <DrawerContent>
                <DrawerHeader className="relative">
                  {focusedDhikr && (
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="absolute left-2 top-1/2 -translate-y-1/2 h-8 w-8"
                      onClick={() => setFocusedDhikr(null)}
                      disabled={isLocked}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-chevron-left"><path d="m15 18-6-6 6-6"/></svg>
                    </Button>
                  )}
                  <DrawerTitle className="text-center">Focus Mode</DrawerTitle>
                  {focusedDhikr && (
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8"
                      onClick={toggleLock}
                    >
                      {isLocked ? (
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-lock text-amber-500"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                      ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-lock-open"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 9.9-1"/></svg>
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
                        className="w-full h-24 text-xl"
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
                          onMouseDown={!isLocked ? handleCloseStart : undefined}
                          onMouseUp={!isLocked ? handleCloseEnd : undefined}
                          onMouseLeave={!isLocked ? handleCloseEnd : undefined}
                          onTouchStart={!isLocked ? handleCloseStart : undefined}
                          onTouchEnd={!isLocked ? handleCloseEnd : undefined}
                          onTouchCancel={!isLocked ? handleCloseEnd : undefined}
                        >
                          <Button 
                            variant="outline" 
                            className="w-full relative"
                            disabled={isLocked}
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
            {dhikrList.map((dhikr) => {
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
                  
                  <span className="font-medium text-sm">{dhikr.name}</span>
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
        </TabsContent>
        
        <TabsContent value="prayer" className="mt-2 min-h-[180px]">
          <h3 className="text-sm font-medium text-center">Prayer</h3>
          <p className="text-xs text-center text-muted-foreground mt-1 mb-2">
            The main source of nourishment for your soul
          </p>
          <div className="grid grid-cols-3 gap-2 mt-2">
            {Object.keys(prayerStatus).map((prayer) => (
              <Button 
                key={prayer}
                variant={prayerStatus[prayer] ? "default" : "outline"} 
                className={`h-12 ${prayerStatus[prayer] ? "bg-primary text-primary-foreground" : ""}`}
                onClick={() => handlePray(prayer)}
              >
                {prayer}
                {prayerStatus[prayer] && (
                  <span className="ml-1 text-xs">✓</span>
                )}
              </Button>
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="rest" className="mt-2 min-h-[180px]">
          <h3 className="text-sm font-medium text-center">Rest</h3>
          <div className="flex justify-center mt-2">
            <Button 
              variant="outline" 
              className="h-12 px-6"
              onClick={handleRest}
            >
              Rest for a while
            </Button>
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