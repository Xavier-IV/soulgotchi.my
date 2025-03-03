import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { vibrate } from '@/lib/haptics';
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
  
  const dhikrList = [
    { name: 'Subhanallah', translation: 'Glory be to Allah', benefit: 'Increases spirituality' },
    { name: 'Alhamdulillah', translation: 'Praise be to Allah', benefit: 'Increases happiness' },
    { name: 'Allahu Akbar', translation: 'Allah is the Greatest', benefit: 'Increases energy' },
    { name: 'Astaghfirullah', translation: 'I seek forgiveness from Allah', benefit: 'Restores health' },
  ];

  const handleDhikr = (dhikr: string) => {
    // Trigger subtle haptic feedback
    vibrate();
    
    onPerformDhikr(dhikr);
    
    // Get the current count for this dhikr
    const currentCount = (dhikrCounts[dhikr] || 0) + 1;
    
    // Show count in the message
    setLastAction(`Recited: ${dhikr} (${currentCount}x)`);
    
    // Clear the action message after 2 seconds
    setTimeout(() => {
      setLastAction(null);
    }, 2000);
  };
  
  const handlePray = (prayer: string) => {
    // Trigger subtle haptic feedback
    vibrate();
    
    // Toggle prayer status
    const newStatus = !prayerStatus[prayer];
    setPrayerStatus({
      ...prayerStatus,
      [prayer]: newStatus
    });
    
    // Only call onPray if the prayer is being performed (not undone)
    if (newStatus) {
      onPray();
      setLastAction(`Performed: ${prayer} prayer`);
    } else {
      setLastAction(`Undone: ${prayer} prayer`);
    }
    
    // Clear the action message after 2 seconds
    setTimeout(() => {
      setLastAction(null);
    }, 2000);
  };
  
  const handleRest = () => {
    // Trigger subtle haptic feedback
    vibrate();
    
    onRest();
    setLastAction('Resting...');
    
    // Clear the action message after 2 seconds
    setTimeout(() => {
      setLastAction(null);
    }, 2000);
  };
  
  const handleLearn = (topic: string) => {
    // Trigger subtle haptic feedback
    vibrate();
    
    onLearn();
    setLastAction(`Learning: ${topic}`);
    
    // Clear the action message after 2 seconds
    setTimeout(() => {
      setLastAction(null);
    }, 2000);
  };

  // Calculate the bonus for a dhikr based on count
  const getDhikrBonus = (dhikrName: string) => {
    const count = dhikrCounts[dhikrName] || 0;
    return Math.min(10, Math.floor(count / 10)); // Max bonus of 10
  };

  // Handle tab change with haptic feedback
  const handleTabChange = (value: string) => {
    vibrate();
    setActiveTab(value);
  };

  return (
    <Card className="w-full max-w-md mx-auto p-3">
      {/* Fixed height container for action messages to prevent layout shift */}
      <div className="h-8 flex items-center justify-center mb-1">
        {lastAction ? (
          <div className="bg-primary/10 text-primary text-center py-1 px-3 rounded-md w-full text-xs">
            {lastAction}
          </div>
        ) : (
          <div className="h-6"></div>
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
        
        <TabsContent value="dhikr" className="mt-2">
          <h3 className="text-sm font-medium text-center">Perform Dhikr</h3>
          <div className="grid grid-cols-2 gap-2 mt-2">
            {dhikrList.map((dhikr) => {
              const count = dhikrCounts[dhikr.name] || 0;
              const bonus = getDhikrBonus(dhikr.name);
              
              return (
                <Button 
                  key={dhikr.name}
                  variant="outline" 
                  className="h-auto min-h-12 py-2 flex flex-col"
                  onClick={() => handleDhikr(dhikr.name)}
                >
                  <span className="font-medium text-sm">{dhikr.name}</span>
                  <span className="text-xs text-muted-foreground">{count}x {bonus > 0 && `+${bonus}`}</span>
                </Button>
              );
            })}
          </div>
        </TabsContent>
        
        <TabsContent value="prayer" className="mt-2">
          <h3 className="text-sm font-medium text-center">Prayer</h3>
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
        
        <TabsContent value="rest" className="mt-2">
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
        
        <TabsContent value="learn" className="mt-2">
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