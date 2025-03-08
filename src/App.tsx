import React, { useState, useEffect } from 'react';
import { Terminal } from './components/Terminal';
import { JobCard } from './components/JobCard';
import { PlayerStats } from './components/PlayerStats';
import { Tutorial } from './components/Tutorial';
import { LoginForm } from './components/LoginForm';
import { Toolbar } from './components/Toolbar';
import { AdminPanel } from './components/AdminPanel';
import { EventPanel } from './components/EventPanel';
import { AlertCircle, Ghost } from 'lucide-react';
import { availableJobs } from './data/jobs';
import { availableEquipment } from './data/equipment';
import { supabase } from './lib/supabase';
import { playSound } from './lib/sounds';
import type { Job, Player } from './types';

// Helper function to get random contracts
function getRandomContracts(contracts: Job[], count: number): Job[] {
  const shuffled = [...contracts].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, 8);
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
    equipped: [] as Equipment[],
    inventory: [] as Equipment[]
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
  const [session, setSession] = useState(null);
  const [player, setPlayer] = useState<Player>(initialPlayer);
  const [jobs, setJobs] = useState<Job[]>(getRandomContracts(availableJobs, 8));
  const [showAdmin, setShowAdmin] = useState(false);
  const [timeMultiplier, setTimeMultiplier] = useState(1);
  const [nextRefresh, setNextRefresh] = useState<Date>(new Date(Date.now() + 2 * 60 * 60 * 1000));
  const [showEventIndicator, setShowEventIndicator] = useState(true);
  const [showGhostIndicator, setShowGhostIndicator] = useState(true);
  const [eventKey, setEventKey] = useState(0);
  const [adminKeyPressed, setAdminKeyPressed] = useState(false);
  const [activePanel, setActivePanel] = useState<string | null>(null);
  const [showTutorial, setShowTutorial] = useState(false);
  const [messages, setMessages] = useState<string[]>([
    'Initializing system...',
    'Connecting to network...',
    'Ready for operations.',
  ]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    localStorage.clear(); // Clear any stored tokens
    playSound('click');
    setSession(null);
    setPlayer(initialPlayer);
    setJobs(getRandomContracts(availableJobs, 8));
    addMessage('Logged out successfully. Connection terminated.');
  };

  // Experience rewards for different job difficulties
  const expRewards = {
    easy: 41,
    medium: 104,
    hard: 208
  };

  const addMessage = (message: string) => {
    setMessages(prev => [...prev, message]);
  };

  const handleLogin = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    setSession(session);
    if (session) {
      addMessage('Establishing secure connection...');
      
      setJobs(getRandomContracts(availableJobs, 8));
      
      // Fetch player data
      const { data: playerData, error } = await supabase
        .from('players')
        .select('*')
        .eq('id', session.user.id)
        .single();
      
      if (error && error.code === 'PGRST116') {
        // Create new player profile if one doesn't exist
        const now = new Date();
        const nextRefreshTime = new Date(now.getTime() + 2 * 60 * 60 * 1000);
        
        const { data: newPlayer, error: createError } = await supabase
          .from('players')
          .insert([{
            id: session.user.id,
            username: session.user.email?.split('@')[0] || 'hacker',
            credits: initialPlayer.credits,
            torcoins: initialPlayer.torcoins,
            level: initialPlayer.level,
            experience: initialPlayer.experience,
            max_concurrent_jobs: initialPlayer.maxConcurrentJobs,
            reputation: initialPlayer.reputation,
            skills: initialPlayer.skills,
            equipment: initialPlayer.equipment,
            inventory: initialPlayer.inventory,
            last_contract_refresh: now.toISOString(),
            next_contract_refresh: nextRefreshTime.toISOString(),
            manual_refresh_available: true,
          }])
          .select()
          .single();

        if (createError) {
          addMessage(`ERROR: ${createError.message}`);
          return;
        }

        if (newPlayer) {
          setPlayer({
            ...initialPlayer,
            ...newPlayer,
            equipment: newPlayer.equipment || initialPlayer.equipment,
            skills: newPlayer.skills || initialPlayer.skills,
            reputation: newPlayer.reputation || initialPlayer.reputation,
            inventory: newPlayer.inventory || initialPlayer.inventory
          });
          addMessage(`Welcome to the Syndicate, ${newPlayer.username}!`);
        }
      } else if (error) {
        addMessage(`ERROR: ${error.message}`);
        return;
      } else if (playerData) {
        setPlayer({
          ...initialPlayer,
          ...playerData,
          equipment: playerData.equipment || initialPlayer.equipment,
          skills: playerData.skills || initialPlayer.skills,
          reputation: playerData.reputation || initialPlayer.reputation,
          inventory: playerData.inventory || initialPlayer.inventory
        });
        addMessage(`Welcome back, ${playerData.username}!`);
        
        // Update next refresh time if needed
        if (playerData.next_contract_refresh) {
          const nextRefresh = new Date(playerData.next_contract_refresh);
          setNextRefresh(nextRefresh);
        }
      }
    }
  };

  // Check for existing session on load
  useEffect(() => {
    const initAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          handleLogin();
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        // Silently handle initialization errors
      }
    };

    initAuth();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        setSession(session);
        handleLogin();
      } else {
        setSession(null);
        setPlayer(initialPlayer);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const upgradeSkill = (skill: keyof Player['skills']) => {
    if (player.skills.skillPoints <= 0) return;
    
    const updatedPlayer = {
      ...player,
      skills: {
        ...player.skills,
        [skill]: player.skills[skill] + 1,
        skillPoints: player.skills.skillPoints - 1
      }
    };

    setPlayer(updatedPlayer);
    
    // Update database
    supabase
      .from('players')
      .update({
        skills: updatedPlayer.skills
      })
      .eq('id', session?.user?.id)
      .then(({ error }) => {
        if (error) addMessage(`ERROR: Failed to save skill upgrade - ${error.message}`);
      });

    addMessage(`Upgraded ${skill} to level ${player.skills[skill] + 1}`);
  };

  // Helper function to sync player data with database
  const syncPlayerData = async (updates: Partial<Player>) => {
    if (!session?.user?.id) return;
    
    // Ensure JSON fields are properly formatted
    const sanitizedUpdates = {
      ...updates,
      equipment: updates.equipment ? JSON.stringify(updates.equipment) : undefined,
      skills: updates.skills ? JSON.stringify(updates.skills) : undefined,
      reputation: updates.reputation ? JSON.stringify(updates.reputation) : undefined,
      inventory: updates.inventory ? JSON.stringify(updates.inventory) : undefined
    };

    const { error } = await supabase
      .from('players')
      .update(sanitizedUpdates)
      .eq('id', session.user.id);

    if (error) {
      addMessage(`ERROR: Failed to sync player data - ${error.message}`);
      return false;
    }
    return true;
  };

  const purchaseEquipment = async (equipmentId: string) => {
    const equipment = availableEquipment.find(e => e.id === equipmentId);
    if (!equipment) return;
    
    if (player.credits < equipment.cost) {
      addMessage(`Insufficient credits for ${equipment.name}`);
      return;
    }
    
    const inventoryCount = player.equipment?.inventory?.length || 0;
    const equippedCount = player.equipment?.equipped?.length || 0;
    
    if (inventoryCount + equippedCount >= 10) {
      addMessage('ERROR: Maximum equipment capacity reached');
      return;
    }

    const updatedPlayer = {
      ...player,
      credits: player.credits - equipment.cost,
      equipment: {
        equipped: player.equipment?.equipped || [],
        inventory: [...(player.equipment?.inventory || []), equipment]
      }
    };

    // Update database first
    const success = await syncPlayerData({
      credits: updatedPlayer.credits,
      equipment: updatedPlayer.equipment
    });

    if (success) {
      setPlayer(updatedPlayer);
      addMessage(`Purchased ${equipment.name}`);
    }
  };

  const equipItem = async (equipmentId: string) => {
    if ((player.equipment?.equipped?.length || 0) >= 5) {
      addMessage('ERROR: Maximum equipped items reached (5)');
      return;
    }

    const item = player.equipment?.inventory?.find(e => e.id === equipmentId);
    if (!item) return;

    // Calculate new maxConcurrentJobs based on equipment effects
    const newMaxJobs = (player.equipment?.equipped || []).reduce((total, eq) => {
      return total + (eq.effects.concurrent_jobs || 0);
    }, 2) + (item.effects.concurrent_jobs || 0);

    const updatedPlayer = {
      ...player,
      equipment: {
        equipped: [...(player.equipment?.equipped || []), item],
        inventory: (player.equipment?.inventory || []).filter(e => e.id !== equipmentId)
      },
      maxConcurrentJobs: newMaxJobs
    };

    const success = await syncPlayerData({
      equipment: updatedPlayer.equipment,
      max_concurrent_jobs: newMaxJobs
    });

    if (success) {
      setPlayer(updatedPlayer);
      addMessage(`Equipped ${item.name}${item.effects.concurrent_jobs ? ` (+${item.effects.concurrent_jobs} concurrent jobs)` : ''}`);
    }
  };

  const unequipItem = async (equipmentId: string) => {
    const item = player.equipment?.equipped?.find(e => e.id === equipmentId);
    if (!item) return;

    // Recalculate maxConcurrentJobs without this item
    const newMaxJobs = (player.equipment?.equipped || []).reduce((total, eq) => {
      if (eq.id === equipmentId) return total;
      return total + (eq.effects.concurrent_jobs || 0);
    }, 2);

    const updatedPlayer = {
      ...player,
      equipment: {
        equipped: (player.equipment?.equipped || []).filter(e => e.id !== equipmentId),
        inventory: [...(player.equipment?.inventory || []), item]
      },
      maxConcurrentJobs: newMaxJobs
    };

    const success = await syncPlayerData({
      equipment: updatedPlayer.equipment,
      max_concurrent_jobs: newMaxJobs
    });

    if (success) {
      setPlayer(updatedPlayer);
      addMessage(`Unequipped ${item.name}${item.effects.concurrent_jobs ? ` (-${item.effects.concurrent_jobs} concurrent jobs)` : ''}`);
    }
  };

  const updatePlayer = (updates: Partial<Player>) => {
    setPlayer(prev => ({
      ...prev,
      ...updates
    }));
    addMessage('Admin: Player stats updated');
  };

  const refreshContracts = () => {
    const newJobs = getRandomContracts(availableJobs, 8).map(job => ({
      ...job,
      status: 'available',
      progress: 0
    }));
    setJobs(newJobs);
    addMessage('Admin: Contracts refreshed');
  };

  const handleManualRefresh = () => {
    const now = new Date();
    
    // Check if manual refresh is available
    const lastRefresh = player.last_contract_refresh ? new Date(player.last_contract_refresh) : null;
    const canRefresh = !lastRefresh || (now.getTime() - lastRefresh.getTime() >= 24 * 60 * 60 * 1000);
    
    if (canRefresh) {
      refreshContracts();
      
      // Update database with refresh info
      const nextDay = new Date(now);
      nextDay.setHours(nextDay.getHours() + 24);
      
      const nextRefreshTime = new Date(now.getTime() + 2 * 60 * 60 * 1000);
      
      syncPlayerData({
        last_contract_refresh: now.toISOString(),
        next_contract_refresh: nextRefreshTime.toISOString()
      });
      
      setPlayer(prev => ({
        ...prev,
        last_contract_refresh: now.toISOString(),
        next_contract_refresh: nextRefreshTime.toISOString()
      }));
      
      addMessage('Contracts manually refreshed. Next free refresh available in 24 hours.');
    } else {
      const timeLeft = 24 * 60 * 60 * 1000 - (now.getTime() - lastRefresh!.getTime());
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
    setShowEventIndicator(true);
    setShowGhostIndicator(true);
    
    // Clear localStorage
    localStorage.removeItem('icebreaker_lockout');
    localStorage.removeItem('ghost_lockout');
    
    addMessage('Admin: All event lockouts reset');
  };

  const handleTutorialReset = () => {
    setShowTutorial(true);
    setPlayer(prev => ({
      ...prev,
      tutorial_completed: false,
      tutorial_step: 0
    }));
    addMessage('Admin: Tutorial reset');
  };

  // Auto-refresh contracts every 3 hours
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      refreshContracts();
      
      // Update database with new refresh time
      const nextRefreshTime = new Date(now.getTime() + 2 * 60 * 60 * 1000);
      syncPlayerData({
        last_contract_refresh: now.toISOString(),
        next_contract_refresh: nextRefreshTime.toISOString()
      });
      
      setNextRefresh(nextRefreshTime);
      
      // Reset manual refresh if 24 hours have passed
      if (player.last_contract_refresh) {
        const lastRefresh = new Date(player.last_contract_refresh);
        if (now.getTime() - lastRefresh.getTime() >= 24 * 60 * 60 * 1000) {
          syncPlayerData({ manual_refresh_available: true });
          setPlayer(prev => ({ ...prev, manual_refresh_available: true }));
        }
      }
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
      if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'a') {
        e.preventDefault();
        setShowAdmin(prev => !prev);
        setAdminKeyPressed(true);
        setTimeout(() => setAdminKeyPressed(false), 100);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [adminKeyPressed]);

  const acceptJob = (job: Job) => {
    // Count only in-progress jobs
    const activeJobCount = jobs.filter(j => 
      j.status === 'in-progress' && 
      player.activeJobs.includes(j.id)
    ).length;
    
    if (activeJobCount >= player.maxConcurrentJobs) {
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
            
            // 1 in 20 chance for base Torcoin reward
            if (torcoinChance < 1/20) {
              torcoinReward = 1;
              playSound('torcoin');
              addMessage('\n[RARE DROP] Found 1 Torcoin!');
            }
            
            // 2% chance for bonus Torcoin
            if (bonusChance < 0.02) {
              torcoinReward += 1;
              playSound('torcoin');
              addMessage('[CRITICAL] Hacked an additional Torcoin!');
            }
            
            playSound('complete');
            // Add experience based on job difficulty
            const expGained = expRewards[job.difficulty];
            
            // Update player state
            setPlayer(prev => {
              const updatedPlayer = {
                ...prev,
                credits: prev.credits + job.reward,
                torcoins: prev.torcoins + torcoinReward,
                activeJobs: prev.activeJobs.filter(id => id !== job.id),
                reputation: {
                  ...prev.reputation,
                  [job.faction]: (prev.reputation[job.faction] || 0) + 1
                }
              };
              
              // Sync with database
              syncPlayerData({
                credits: updatedPlayer.credits,
                torcoins: updatedPlayer.torcoins,
                reputation: updatedPlayer.reputation
              });
              
              return updatedPlayer;
            });

            return { ...job, status: 'completed', progress: 100 };
          }

          return { ...job, progress: newProgress };
        });
        
        // Handle experience and leveling up for completed jobs
        if (jobsCompleted) {
          const completedJobs = updatedJobs.filter(j => j.status === 'completed');
          let totalExp = 0;

          completedJobs.forEach(job => {
            const expGained = expRewards[job.difficulty];
            totalExp += expGained;
            addMessage(`\n[EXP] +${expGained} experience points`);
          });

          setPlayer(prev => {
            let newExp = (prev.experience || 0) + totalExp;
            let newLevel = prev.level || 1;
            let newSkillPoints = (prev.skills?.skillPoints || 0);

            // Level up if enough exp (1000 exp per level)
            while (newExp >= 1000) {
              newLevel++;
              newExp -= 1000;
              addMessage(`\n[LEVEL UP] Advanced to level ${newLevel}!`);
              newSkillPoints += 2;
              addMessage('Gained 2 skill points!');
            }
            
            const updatedPlayer = {
              ...prev,
              level: newLevel,
              experience: newExp,
              skills: {
                decryption: prev.skills?.decryption || 1,
                firewall: prev.skills?.firewall || 1,
                spoofing: prev.skills?.spoofing || 1,
                social: prev.skills?.social || 1,
                skillPoints: newSkillPoints
              }
            };

            // Sync with database
            syncPlayerData({
              level: newLevel,
              experience: newExp,
              skills: updatedPlayer.skills
            });

            return updatedPlayer;
          });
        }

        return updatedJobs;
      });
    }, 100);

    return () => clearInterval(interval);
  }, [timeMultiplier]); // Add timeMultiplier to dependencies

  return (
    <div className="min-h-screen bg-black text-green-400 p-4 sm:p-8 pb-48 overflow-x-hidden relative">
      <div className="matrix-bg fixed inset-0" />
      {showEventIndicator && (
        <div className="fixed top-2 right-2 sm:top-4 sm:right-4 flex flex-col gap-2 z-50">
          <div 
            className="bg-red-900/90 border-2 border-red-500 rounded-lg px-3 py-1 sm:px-4 sm:py-2 z-50 flex items-center gap-2 cursor-pointer hover:bg-red-900/70 transition-colors text-sm sm:text-base"
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
          {showGhostIndicator && (
            <div 
              className="bg-purple-900/90 border-2 border-purple-500 rounded-lg px-3 py-1 sm:px-4 sm:py-2 z-50 flex items-center gap-2 cursor-pointer hover:bg-purple-900/70 transition-colors text-sm sm:text-base"
              onClick={() => {
                const toolbar = document.querySelector('[data-panel="events"]');
                if (toolbar) {
                  toolbar.click();
                  setShowGhostIndicator(false);
                }
              }}
            >
              <Ghost className="w-5 h-5 text-purple-400 animate-pulse" />
              <span className="text-purple-400 font-mono">GHOST IN THE MACHINE Event Available!</span>
            </div>
          )}
        </div>
      )}
      {showAdmin && (
        <div className="relative z-[100]"><AdminPanel
          player={player}
          onUpdatePlayer={updatePlayer}
          onRefreshContracts={refreshContracts}
          onUpdateSpeed={updateTimeMultiplier}
          onResetEvent={handleEventReset}
          onResetTutorial={handleTutorialReset}
          timeMultiplier={timeMultiplier}
        /></div>
      )}
      <div className="max-w-4xl mx-auto space-y-4 sm:space-y-8 relative z-10">
        <h1 className="text-4xl font-bold text-center mb-8 text-green-500 font-mono tracking-wider">
          404 Syndicate
        </h1>
        
        {session ? (
          <>
            <div className="player-stats">
              <div className="relative z-[1]">
                <PlayerStats player={player} onLogout={handleLogout} />
              </div>
            </div>
            
            {(!player.tutorial_completed || showTutorial) && (
              <Tutorial
                player={player}
                onComplete={() => setShowTutorial(false)}
                onUpdatePlayer={updatePlayer}
                isAdmin={showAdmin}
                onOpenPanel={setActivePanel}
              />
            )}
        
            <div className="grid grid-cols-1 gap-4 sm:gap-8">
              <div className="order-2">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold font-mono text-green-400 relative z-[1]">Available Contracts</h2>
                  <div className="flex items-center gap-4">
                    <span className="text-sm text-green-600 font-mono">
                      {jobs.filter(j => j.status === 'available').length} contracts
                    </span>
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
                <div className="contracts-panel grid grid-cols-1 md:grid-cols-2 gap-6 h-[400px] lg:h-[600px] overflow-y-auto scrollbar-hide pr-2 pb-4 relative z-[1]">
                  {jobs?.map((job, index) => (
                    <JobCard
                      key={`${job.id}-${index}`}
                      job={job}
                      onAccept={acceptJob}
                      disabled={
                        job.status !== 'available' ||
                        jobs.filter(j => j.status === 'in-progress' && player.activeJobs.includes(j.id)).length >= player.maxConcurrentJobs
                      }
                    />
                  ))}
                </div>
              </div>
          
              <div className="terminal-panel">
                <div className="terminal-panel">
                  <h2 className="text-xl font-bold mb-4 font-mono text-green-400 relative z-[1]">Terminal</h2>
                  <Terminal messages={messages} />
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="lg:col-span-2 mx-auto">
            <LoginForm onLogin={handleLogin} addMessage={addMessage} />
          </div>
        )}
      </div>
      
      {session && <div className="relative z-[90]"><Toolbar
        equipment={availableEquipment}
        onPurchase={purchaseEquipment}
        onEquip={equipItem}
        activePanel={activePanel}
        onPanelChange={setActivePanel}
        onUnequip={unequipItem}
        eventKey={eventKey}
        isAdmin={showAdmin}
        playerCredits={player.credits}
        playerTorcoins={player.torcoins}
        player={player}
        onUpgradeSkill={upgradeSkill}
        onEventReward={(torcoins) => {
          const updatedPlayer = {
            ...player,
            torcoins: player.torcoins + torcoins
          };
          setPlayer(updatedPlayer);
          syncPlayerData({ torcoins: updatedPlayer.torcoins });
          addMessage(`[REWARD] Received ${torcoins} Torcoins!`);
        }}
      /></div>}
    </div>
  );
}

export default App;