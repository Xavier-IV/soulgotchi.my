import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { vibrate, vibratePattern } from '@/lib/haptics';
import { savePrayerStatus, loadPrayerStatus } from '@/lib/storage';

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
          <h3 className="text-sm font-medium text-center">Perform Dhikr</h3>
          <p className="text-xs text-center text-muted-foreground mt-1 mb-2">
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
                  className="h-auto py-2 flex flex-col relative overflow-hidden"
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