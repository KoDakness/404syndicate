import React, { useState, useEffect } from 'react';
import { Terminal } from './components/Terminal';
import { JobCard } from './components/JobCard';
import { PlayerStats } from './components/PlayerStats';
import { Toolbar } from './components/Toolbar';
import { AdminPanel } from './components/AdminPanel';
import { EventPanel } from './components/EventPanel';
import { AlertCircle } from 'lucide-react';
import { availableJobs } from './data/jobs';
import { availableEquipment } from './data/equipment';
import type { Job, Player } from './types';

// Helper function to get random contracts
function getRandomContracts(contracts: Job[], count: number): Job[] {
  const shuffled = [...contracts].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, 4);
}

const initialPlayer: Player = {
  credits: 1000,
  torcoins: 0,
  lastRefresh: null,
  reputation: {
    corporate: 0,
    underground: 0,
  },
  equipment: {
    equipped: [],
    inventory: []
  },
  inventory: [],
  activeEvents: [],
  level: 1,
  experience: 0,
  maxConcurrentJobs: 2,
  skills: {
    decryption: 1,
    firewall: 1,
    spoofing: 1,
    skillPoints: 3
  },
  activeJobs: [],
};

function App() {
  const [player, setPlayer] = useState<Player>(initialPlayer);
  const [jobs, setJobs] = useState<Job[]>(getRandomContracts(availableJobs, 4));
  const [showAdmin, setShowAdmin] = useState(false);
  const [timeMultiplier, setTimeMultiplier] = useState(1);
  const [nextRefresh, setNextRefresh] = useState<Date>(new Date(Date.now() + 2 * 60 * 60 * 1000));
  const [showEventIndicator, setShowEventIndicator] = useState(true);
  const [eventKey, setEventKey] = useState(0);
  const [messages, setMessages] = useState<string[]>([
    'Initializing system...',
    'Connecting to network...',
    'Ready for operations.',
  ]);

  const addMessage = (message: string) => {
    setMessages(prev => [...prev, message]);
  };

  const upgradeSkill = (skill: keyof Player['skills']) => {
    if (player.skills.skillPoints <= 0) return;
    
    setPlayer(prev => ({
      ...prev,
      skills: {
        ...prev.skills,
        [skill]: prev.skills[skill] + 1,
        skillPoints: prev.skills.skillPoints - 1
      }
    }));
    
    addMessage(`Upgraded ${skill} to level ${player.skills[skill] + 1}`);
  };

  const purchaseEquipment = (equipmentId: string) => {
    const equipment = availableEquipment.find(e => e.id === equipmentId);
    if (!equipment) return;
    
    if (player.credits < equipment.cost) {
      addMessage(`Insufficient credits for ${equipment.name}`);
      return;
    }
    
    if (player.equipment.inventory.length + player.equipment.equipped.length >= 10) {
      addMessage('ERROR: Maximum equipment capacity reached');
      return;
    }

    setPlayer(prev => ({
      ...prev,
      credits: prev.credits - equipment.cost,
      equipment: {
        ...prev.equipment,
        inventory: [...prev.equipment.inventory, equipment]
      }
    }));

    addMessage(`Purchased ${equipment.name}`);
  };

  const equipItem = (equipmentId: string) => {
    if (player.equipment.equipped.length >= 5) {
      addMessage('ERROR: Maximum equipped items reached (5)');
      return;
    }

    const item = player.equipment.inventory.find(e => e.id === equipmentId);
    if (!item) return;

    setPlayer(prev => ({
      ...prev,
      equipment: {
        equipped: [...prev.equipment.equipped, item],
        inventory: prev.equipment.inventory.filter(e => e.id !== equipmentId)
      }
    }));

    addMessage(`Equipped ${item.name}`);
  };

  const unequipItem = (equipmentId: string) => {
    const item = player.equipment.equipped.find(e => e.id === equipmentId);
    if (!item) return;

    setPlayer(prev => ({
      ...prev,
      equipment: {
        equipped: prev.equipment.equipped.filter(e => e.id !== equipmentId),
        inventory: [...prev.equipment.inventory, item]
      }
    }));

    addMessage(`Unequipped ${item.name}`);
  };

  const updatePlayer = (updates: Partial<Player>) => {
    setPlayer(prev => ({
      ...prev,
      ...updates
    }));
    addMessage('Admin: Player stats updated');
  };

  const refreshContracts = () => {
    const newJobs = getRandomContracts(availableJobs, 4).map(job => ({
      ...job,
      status: 'available',
      progress: 0
    }));
    setJobs(newJobs);
    addMessage('Admin: Contracts refreshed');
  };

  const handleManualRefresh = () => {
    const now = new Date();
    const lastRefresh = player.lastRefresh ? new Date(player.lastRefresh) : null;
    
    if (!lastRefresh || now.getTime() - lastRefresh.getTime() >= 24 * 60 * 60 * 1000) {
      refreshContracts();
      setPlayer(prev => ({
        ...prev,
        lastRefresh: now.toISOString()
      }));
      addMessage('Contracts manually refreshed. Next free refresh available in 24 hours.');
    } else {
      const timeLeft = 24 * 60 * 60 * 1000 - (now.getTime() - lastRefresh.getTime());
      const hoursLeft = Math.floor(timeLeft / (60 * 60 * 1000));
      const minutesLeft = Math.floor((timeLeft % (60 * 60 * 1000)) / (60 * 1000));
      addMessage(`Free refresh not available. Time remaining: ${hoursLeft}h ${minutesLeft}m`);
    }
  };

  const updateTimeMultiplier = (multiplier: number) => {
    setTimeMultiplier(multiplier);
    addMessage(`Admin: Contract speed set to ${multiplier}x`);
  };

  const handleEventReset = () => {
    setEventKey(prev => prev + 1);
    addMessage('Admin: Event lockout reset');
  };

  // Auto-refresh contracts every 3 hours
  useEffect(() => {
    const interval = setInterval(() => {
      refreshContracts();
      setNextRefresh(new Date(Date.now() + 2 * 60 * 60 * 1000));
    }, 2 * 60 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  // Update countdown timer
  useEffect(() => {
    const timer = setInterval(() => {
      setNextRefresh(prev => {
        if (prev.getTime() <= Date.now()) {
          return new Date(Date.now() + 2 * 60 * 60 * 1000);
        }
        return prev;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Ctrl + Shift + A to toggle admin panel
      if (e.ctrlKey && e.shiftKey && e.key === 'A') {
        setShowAdmin(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);

  const acceptJob = (job: Job) => {
    if (player.activeJobs.length >= 2) {
      addMessage('ERROR: Maximum concurrent jobs reached');
      return;
    }

    // Initial job message
    addMessage(`\n[CONTRACT START] ${job.name}`);
    addMessage(job.messages[0]);

    const updatedJobs = jobs.map(j => 
      j.id === job.id 
        ? { ...j, status: 'in-progress' as const, startTime: Date.now() }
        : j
    );

    setJobs(updatedJobs);
    setPlayer(prev => ({
      ...prev,
      activeJobs: [...prev.activeJobs, job.id],
    }));

    addMessage(`Starting job: ${job.name}`);
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setJobs(prevJobs => {
        let jobsCompleted = false;
        
        const updatedJobs = prevJobs.map(job => {
          if (job.status !== 'in-progress' || !job.startTime) return job;

          const elapsed = Date.now() - job.startTime;
          const newProgress = Math.min(100, Math.floor((elapsed * timeMultiplier / job.duration) * 100));
          
          // Show messages more frequently
          if (newProgress !== job.progress) {
            const progressStep = 100 / (job.messages.length - 1);
            const shouldShowMessage = Math.floor(newProgress / progressStep) > Math.floor(job.progress / progressStep);
            
            if (shouldShowMessage) {
              const messageIndex = Math.min(
                Math.floor(newProgress / progressStep),
                job.messages.length - 1
              );
              addMessage(`\n[${job.name}] ${job.messages[messageIndex]}`);
            }
          }

          if (newProgress >= 100 && job.status !== 'completed') {
            jobsCompleted = true;
            addMessage(`\n[${job.name}] ${job.messages[job.messages.length - 1]}`);
            addMessage(`\n[CONTRACT COMPLETE] Reward: ${job.reward} credits\n`);
            
            // Handle Torcoin rewards
            const torcoinChance = Math.random();
            const bonusChance = Math.random();
            let torcoinReward = 0;
            
            // 1 in 35 chance for base Torcoin reward
            if (torcoinChance < 1/35) {
              torcoinReward = 1;
              addMessage('\n[RARE DROP] Found 1 Torcoin!');
            }
            
            // 2% chance for bonus Torcoin
            if (bonusChance < 0.02) {
              torcoinReward += 1;
              addMessage('[CRITICAL] Hacked an additional Torcoin!');
            }
            
            setPlayer(prev => ({
              ...prev,
              credits: prev.credits + job.reward,
              torcoins: prev.torcoins + torcoinReward,
              activeJobs: prev.activeJobs.filter(id => id !== job.id),
              reputation: {
                ...prev.reputation,
                [job.faction]: prev.reputation[job.faction === 'corporate' ? 'corporate' : 'underground'] + 1
              }
            }));

            return { ...job, status: 'completed', progress: 100 };
          }

          return { ...job, progress: newProgress };
        });

        return updatedJobs;
      });
    }, 100);

    return () => clearInterval(interval);
  }, [timeMultiplier]); // Add timeMultiplier to dependencies

  return (
    <div className="h-screen bg-black text-green-400 p-8 pb-48 overflow-hidden">
      {showEventIndicator && (
        <div 
          className="fixed top-4 right-4 bg-red-900/90 border-2 border-red-500 rounded-lg px-4 py-2 z-50 flex items-center gap-2 cursor-pointer hover:bg-red-900/70 transition-colors"
          onClick={() => {
            const toolbar = document.querySelector('[data-panel="events"]');
            if (toolbar) {
              toolbar.click();
              setShowEventIndicator(false);
            }
          }}
        >
          <AlertCircle className="w-5 h-5 text-red-400 animate-pulse" />
          <span className="text-red-400 font-mono">ICEBREAKER Event Available!</span>
        </div>
      )}
      {showAdmin && (
        <AdminPanel
          player={player}
          onUpdatePlayer={updatePlayer}
          onRefreshContracts={refreshContracts}
          onUpdateSpeed={updateTimeMultiplier}
          onResetEvent={handleEventReset}
          timeMultiplier={timeMultiplier}
        />
      )}
      <div className="max-w-4xl mx-auto space-y-8">
        <h1 className="text-4xl font-bold text-center mb-8 text-green-500 font-mono tracking-wider">
          404 Syndicate
        </h1>
        
        <PlayerStats player={player} />
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold font-mono text-green-400">Available Contracts</h2>
              <div className="flex items-center gap-4">
                <span className="text-sm text-green-600 font-mono">
                  {`Next refresh: ${Math.floor((nextRefresh.getTime() - Date.now()) / (60 * 1000))}m`}
                </span>
                <button
                  onClick={handleManualRefresh}
                  className="px-2 py-1 text-sm border border-green-500 rounded hover:bg-green-900/30 font-mono"
                >
                  Refresh
                </button>
              </div>
            </div>
            <div className="space-y-4 h-[600px] overflow-y-auto scrollbar-hide pr-2">
              {jobs.map(job => (
                <JobCard
                  key={job.id}
                  job={job}
                  onAccept={acceptJob}
                  disabled={
                    job.status !== 'available' ||
                    player.activeJobs.length >= 2
                  }
                />
              ))}
            </div>
          </div>
          
          <div className="lg:col-span-2">
            <h2 className="text-xl font-bold mb-4 font-mono text-green-400">Terminal</h2>
            <Terminal messages={messages} />
          </div>
        </div>
      </div>
      
      <Toolbar
        equipment={availableEquipment}
        onPurchase={purchaseEquipment}
        onEquip={equipItem}
        onUnequip={unequipItem}
        eventKey={eventKey}
        isAdmin={showAdmin}
        playerCredits={player.credits}
        playerTorcoins={player.torcoins}
        player={player}
        onUpgradeSkill={upgradeSkill}
      />
    </div>
  );
}

export default App