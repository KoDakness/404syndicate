import React, { useState, useEffect, useRef } from 'react';
import { availableJobs } from './data/jobs';
import { availableEquipment } from './data/equipment';
import { JobCard } from './components/JobCard';
import { Terminal } from './components/Terminal';
import { GlobalChat } from './components/GlobalChat'; 
import { PlayerStats } from './components/PlayerStats';
import { Toolbar } from './components/Toolbar';
import { Tutorial } from './components/Tutorial';
import { LoginForm } from './components/LoginForm';
import { AdminPanel } from './components/AdminPanel';
import { supabase } from './lib/supabase';
import { playSound } from './lib/sounds';
import { RefreshCw } from 'lucide-react';
import type { Job, Player, Equipment, RandomEvent } from './types';

const REFRESH_INTERVAL = 60 * 60 * 1000; // 1 hour
const REFRESH_COOLDOWN = 15 * 60 * 1000; // 15 minutes
const MANUAL_REFRESH_COOLDOWN = 12 * 60 * 60 * 1000; // 12 hours
const MAX_AVAILABLE_CONTRACTS = 8;

function App() {
  const [messages, setMessages] = useState<string[]>([]);
  const [chatMessages, setChatMessages] = useState<string[]>([
    "SYSTEM: Welcome to the Global Network. Connect with other hackers.",
    "SYSTEM: Be respectful and avoid sharing personal information."
  ]);
  const [allJobs, setAllJobs] = useState<Job[]>([]); // All jobs with their statuses
  const [availableContracts, setAvailableContracts] = useState<Job[]>([]); // Current set of available contracts
  const [equipment, setEquipment] = useState<Equipment[]>(availableEquipment);
  const [user, setUser] = useState<any>(null);
  const [event, setEvent] = useState<RandomEvent | null>(null);
  const [eventKey, setEventKey] = useState<number>(0);
  const [player, setPlayer] = useState<Player | null>(null);
  const [activePanel, setActivePanel] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [timeMultiplier, setTimeMultiplier] = useState(1);
  const [tutorials, setTutorials] = useState({
    loadout: false,
    contract: false,
    skill: false,
  });
  const [isAdmin, setIsAdmin] = useState(false);
  const [nextContractRefresh, setNextContractRefresh] = useState<Date | null>(null);
  const [nextManualRefresh, setNextManualRefresh] = useState<Date | null>(null);
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [lastExperienceUpdate, setLastExperienceUpdate] = useState<number>(0);
  const contractCheckRef = useRef<NodeJS.Timeout | null>(null);
  const isVisibleRef = useRef<boolean>(true);
  // Track if a level up is in progress to prevent multiple level ups
  const levelUpInProgressRef = useRef<boolean>(false);
  // Track the last time we processed a level up to prevent duplicate processing
  const lastLevelUpTimeRef = useRef<number>(0);

  const addMessage = (message: string) => {
    setMessages(prev => [...prev, message]);
  };

  const addChatMessage = async (message: string) => {
    if (!player || !user) return;
    
    try {
      // Add message to Supabase chat table
      const { error } = await supabase
        .from('chat_messages')
        .insert([
          {
            username: player.username,
            content: message,
            type: 'user'
          }
        ]);
        
      if (error) throw error;
    } catch (error) {
      console.error('Error adding chat message:', error);
      addMessage(`ERROR: Failed to send chat message: ${(error as Error).message}`);
    }
  };

  const addSystemChatMessage = async (message: string) => {
    try {
      // Add system message to Supabase chat table
      const { error } = await supabase
        .from('chat_messages')
        .insert([
          {
            username: 'SYSTEM',
            content: message,
            type: 'system'
          }
        ]);
        
      if (error) throw error;
    } catch (error) {
      console.error('Error adding system chat message:', error);
    }
  };

  // Admin panel keyboard shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Toggle admin panel with Ctrl+Shift+A, but only if the user is an admin
      if (e.ctrlKey && e.shiftKey && e.key === 'A') {
        e.preventDefault();
        // Only toggle admin panel if user is actually an admin
        if (isAdmin) {
          setShowAdminPanel(prev => !prev);
        }
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isAdmin]);

  // Visibility change handling to prevent false level ups
  useEffect(() => {
    const handleVisibilityChange = () => {
      isVisibleRef.current = document.visibilityState === 'visible';
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  // User authentication
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session) {
        setUser(session.user);
        addMessage('Authentication successful. Welcome to the Syndicate.');
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        setPlayer(null);
        setIsAdmin(false); // Reset admin status on logout
        setShowAdminPanel(false); // Hide admin panel on logout
        addMessage('Logged out successfully.');
      }
    });

    // Check current auth state
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user || null);
      if (session?.user) {
        addMessage('Authentication restored. Welcome back.');
        checkAdminStatus(session.user.id);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const checkAdminStatus = async (userId: string) => {
    try {
      // Check if user is in admin_users table
      const { data, error } = await supabase
        .from('admin_users')
        .select('id')
        .eq('user_id', userId)
        .maybeSingle();
        
      if (error) {
        console.error('Error checking admin status:', error);
        return;
      }
      
      // Set admin status based on whether a record was found
      const isUserAdmin = !!data;
      setIsAdmin(isUserAdmin);
      
      // If user is not an admin, make sure admin panel is closed
      if (!isUserAdmin) {
        setShowAdminPanel(false);
      }
      
      if (isUserAdmin) {
        addMessage('Administrator access granted. Additional controls available.');
      }
    } catch (error) {
      console.error('Error checking admin status:', error);
    }
  };

  // Reset job statuses for fresh contracts
  const resetJobStatuses = () => {
    // Create fresh copy of available jobs with initial states
    const refreshedJobs = availableJobs.map(templateJob => {
      const currentJob = allJobs.find(j => j.id === templateJob.id);
      
      // Keep in-progress jobs as they are
      if (currentJob && currentJob.status === 'in-progress') {
        return currentJob;
      }
      
      // Reset completed jobs back to available
      return {
        ...templateJob,
        status: 'available',
        progress: 0,
        startTime: undefined
      };
    });
    
    return refreshedJobs;
  };

  // Select random contracts
  const selectRandomContracts = (allJobs: Job[], activeJobIds: string[]) => {
    // Ensure all in-progress jobs are included first
    const inProgressJobs = allJobs.filter(job => job.status === 'in-progress');
    
    // Filter out jobs that are in progress or completed
    const availableJobs = allJobs.filter(job => 
      !activeJobIds.includes(job.id) && 
      job.status !== 'in-progress' && 
      job.status !== 'completed'
    );
    
    // If we have fewer available jobs than MAX_AVAILABLE_CONTRACTS (minus in-progress jobs), return all available jobs
    const remainingSlots = MAX_AVAILABLE_CONTRACTS - inProgressJobs.length;
    
    if (availableJobs.length <= remainingSlots) {
      return [...inProgressJobs, ...availableJobs];
    }
    
    // Otherwise, select random jobs for the remaining slots
    const shuffled = [...availableJobs].sort(() => 0.5 - Math.random());
    return [...inProgressJobs, ...shuffled.slice(0, remainingSlots)];
  };

  // Player data fetch
  useEffect(() => {
    if (user) {
      const fetchPlayerData = async () => {
        try {
          addMessage('Retrieving user data...');
          
          // Fetch player data
          const { data: playerData, error: playerError } = await supabase
            .from('players')
            .select('*')
            .eq('id', user.id)
            .single();
          
          if (playerError) throw playerError;
          if (!playerData) throw new Error('Player data not found');
          
          // Fetch active jobs
          const { data: playerJobs, error: jobsError } = await supabase
            .from('player_jobs')
            .select('*')
            .eq('player_id', user.id);
          
          if (jobsError) throw jobsError;
          
          // Process player data
          const loadouts = playerData.equipment && playerData.equipment.loadouts 
            ? playerData.equipment.loadouts 
            : [];
            
          const inventory = playerData.inventory || {
            bases: [],
            motherboards: [],
            components: []
          };
          
          // Create player object
          const playerObj: Player = {
            ...playerData,
            inventory,
            loadouts,
            skills: playerData.skills || {
              decryption: 1,
              firewall: 1,
              spoofing: 1,
              social: 1,
              skillPoints: 0
            },
            activeJobs: playerJobs
              .filter(job => job.status === 'in-progress')
              .map(job => job.job_id),
            tutorial_completed: playerData.tutorial_completed || false,
            tutorial_step: playerData.tutorial_step || 0,
            tutorial_seen_features: playerData.tutorial_seen_features || [],
          };
          
          setPlayer(playerObj);
          // Initialize lastExperienceUpdate with the player's current experience to prevent leveling on refresh
          setLastExperienceUpdate(playerObj.experience);
          addMessage('User data retrieved successfully.');
          
          // Process all jobs with statuses
          const jobsWithStatus = availableJobs.map(job => {
            const playerJob = playerJobs.find(pj => pj.job_id === job.id);
            
            if (playerJob) {
              if (playerJob.status === 'in-progress') {
                return {
                  ...job,
                  status: 'in-progress' as const,
                  progress: playerJob.progress,
                  startTime: new Date(playerJob.start_time).getTime()
                };
              } else if (playerJob.status === 'completed') {
                return {
                  ...job,
                  status: 'completed' as const,
                  progress: 100
                };
              }
            }
            
            return job;
          });
          
          setAllJobs(jobsWithStatus);
          
          // Get all in-progress jobs first
          const inProgressJobs = jobsWithStatus.filter(job => job.status === 'in-progress');
          
          // Then get other active jobs
          const activeJobIds = playerJobs
            .filter(job => job.status === 'in-progress')
            .map(job => job.job_id);
          
          // Make sure to include all in-progress jobs in the available contracts
          const selectedContracts = selectRandomContracts(jobsWithStatus, activeJobIds);
          setAvailableContracts(selectedContracts);
          
          // Set next contract refresh time
          if (playerData.next_contract_refresh) {
            setNextContractRefresh(new Date(playerData.next_contract_refresh));
          } else {
            // Set initial refresh time to one hour from now
            const nextRefresh = new Date(Date.now() + REFRESH_INTERVAL);
            setNextContractRefresh(nextRefresh);
            
            // Also update in player data
            updatePlayer({
              next_contract_refresh: nextRefresh.toISOString(),
              manual_refresh_available: true
            });
          }

          // Set next manual refresh time if player doesn't have one available
          if (playerData.manual_refresh_available === false && playerData.next_manual_refresh) {
            setNextManualRefresh(new Date(playerData.next_manual_refresh));
          }
          
          setIsInitialized(true);
        } catch (error) {
          console.error('Error fetching player data:', error);
          addMessage(`ERROR: Failed to retrieve user data: ${(error as Error).message}`);
        }
      };

      fetchPlayerData();
    }
  }, [user]);

  // Hourly contract refresh
  useEffect(() => {
    if (!player || !nextContractRefresh) return;
    
    // Clear previous interval
    if (contractCheckRef.current) {
      clearInterval(contractCheckRef.current);
    }
    
    const checkRefreshTime = () => {
      if (!nextContractRefresh) return;
      
      const now = Date.now();
      const refreshTime = nextContractRefresh.getTime();
      
      if (now >= refreshTime) {
        console.log('Contract refresh triggered', {
          now: new Date(now).toISOString(),
          refreshTime: new Date(refreshTime).toISOString()
        });
        
        // Time to refresh contracts
        addMessage('Hourly contract refresh: New contracts available!');
        
        // Reset job statuses first
        const refreshedJobs = resetJobStatuses();
        setAllJobs(refreshedJobs);
        
        // Make sure to preserve in-progress jobs
        const inProgressJobs = refreshedJobs.filter(job => job.status === 'in-progress');
        
        // Select new random contracts, but always include in-progress jobs
        const activeJobIds = refreshedJobs
          .filter(job => job.status === 'in-progress')
          .map(job => job.id);
          
        const selectedContracts = selectRandomContracts(refreshedJobs, activeJobIds);
        
        if (selectedContracts.length === 0) {
          console.warn('No contracts available for refresh');
        }
        
        setAvailableContracts(selectedContracts);
        
        // Set next refresh time
        const nextRefresh = new Date(now + REFRESH_INTERVAL);
        console.log('Setting next refresh time:', nextRefresh.toISOString());
        
        setNextContractRefresh(nextRefresh);
        
        // Update player data
        updatePlayer({
          next_contract_refresh: nextRefresh.toISOString(),
          manual_refresh_available: true
        });
      }
    };
    
    // Initial check
    checkRefreshTime();
    
    // Set up interval to check for refresh
    contractCheckRef.current = setInterval(checkRefreshTime, 10000); // Check every 10 seconds
    
    return () => {
      if (contractCheckRef.current) {
        clearInterval(contractCheckRef.current);
      }
    };
  }, [player, nextContractRefresh, allJobs]);

  // Contract progress simulation
  useEffect(() => {
    if (!player) return;
    
    const progressInterval = setInterval(() => {
      setAllJobs(currentJobs => {
        const updatedJobs = [...currentJobs];
        let jobsChanged = false;
        
        for (const job of updatedJobs) {
          if (job.status === 'in-progress' && job.startTime) {
            const elapsed = Date.now() - job.startTime;
            const newProgress = Math.min(100, Math.floor((elapsed / job.duration) * 100));
            
            if (newProgress !== job.progress) {
              job.progress = newProgress;
              jobsChanged = true;
              
              // Also update the availableContracts list to keep UI in sync
              setAvailableContracts(contracts => 
                contracts.map(c => 
                  c.id === job.id 
                    ? { ...c, progress: newProgress } 
                    : c
                )
              );
              
              if (newProgress >= 100) {
                job.status = 'completed';
                addMessage(`Contract completed: ${job.name}`);
                playSound('complete');
                
                // Calculate reward based on whether player has skill requirements
                let rewardMultiplier = 1.15; // 15% increase to credits
                let expMultiplier = 0.4; // 60% reduction to experience
                
                // Check if this job was accepted with a skill penalty
                if (job.forcedAccept) {
                  rewardMultiplier = 0.5 * 1.15; // 50% reduction for forced accept, then 15% increase
                  expMultiplier = 0.5 * 0.4; // 50% reduction for forced accept, then 60% reduction
                  addMessage(`Skill requirement not met: rewards reduced by 50%`);
                }
                
                // 5% chance for torcoin on job completion (higher with special equipment)
                const torcoinChance = Math.random();
                if (torcoinChance < 0.05) {
                  addMessage('You found a Torcoin in the contract data!');
                  playSound('torcoin');
                  
                  if (player) {
                    updatePlayer({
                      torcoins: player.torcoins + 1
                    });
                    
                    // Add to global chat
                    addSystemChatMessage(`${player.username} just found a torcoin!`);
                  }
                }
                
                // 1% chance for wraithcoin on job completion (only if player has wraith equipment)
                const wraithcoinChance = Math.random();
                const hasWraithEquipment = player.loadouts.some(loadout => 
                  loadout.active && (
                    loadout.baseId.includes('wraith') || 
                    loadout.motherboardId.includes('wraith') ||
                    Object.values(loadout.installedComponents).some(id => id.includes('wraith'))
                  )
                );
                
                if (hasWraithEquipment && wraithcoinChance < 0.01) {
                  addMessage('You found a rare WRAITHCOIN in the contract data!');
                  playSound('torcoin');
                  
                  if (player) {
                    updatePlayer({
                      wraithcoins: player.wraithcoins + 1
                    });
                    
                    // Add to global chat
                    addSystemChatMessage(`${player.username} found a wraithcoin!`);
                  }
                }
                
                if (player) {
                  const baseExpReward = job.difficulty === 'easy' ? 100 : job.difficulty === 'medium' ? 250 : 500;
                  const expReward = Math.floor(baseExpReward * expMultiplier);
                  const creditReward = Math.floor(job.reward * rewardMultiplier);
                  
                  updatePlayer({
                    credits: player.credits + creditReward,
                    experience: player.experience + expReward
                  });
                  
                  // Add message about rewards
                  addMessage(`Earned ${creditReward.toLocaleString()} credits and ${expReward} XP`);
                }
                
                // Update job status in database
                supabase
                  .from('player_jobs')
                  .update({
                    status: 'completed',
                    progress: 100,
                    completed_at: new Date().toISOString()
                  })
                  .eq('player_id', player.id)
                  .eq('job_id', job.id)
                  .then(() => {
                    console.log('Job updated in database');
                  })
                  .catch(error => {
                    console.error('Error updating job:', error);
                  });
              } else {
                // Update job progress in database
                supabase
                  .from('player_jobs')
                  .update({
                    progress: newProgress
                  })
                  .eq('player_id', player.id)
                  .eq('job_id', job.id)
                  .then(() => {
                    console.log('Job progress updated');
                  })
                  .catch(error => {
                    console.error('Error updating job progress:', error);
                  });
              }
            }
          }
        }
        
        return jobsChanged ? updatedJobs : currentJobs;
      });
    }, 1000 / timeMultiplier);
    
    return () => clearInterval(progressInterval);
  }, [player, timeMultiplier]);

  // XP to level conversion - improved to prevent multiple level-ups on refreshes
  useEffect(() => {
    if (!player || !isVisibleRef.current) return;
    
    // Prevent multiple simultaneous level-ups or level-ups that might happen too close together
    if (levelUpInProgressRef.current) return;
    
    // Prevent level ups from triggering again on refresh or tab switching
    // by checking if the experience hasn't changed from our last known value
    if (player.experience === lastExperienceUpdate) return;
    
    // Prevent rapid-fire level-ups (e.g., from multiple refreshes in a short time)
    const now = Date.now();
    if (now - lastLevelUpTimeRef.current < 2000) return; // At least 2 seconds between level-up operations
    
    // Check if player has enough XP for a level up
    if (player.experience >= 1000) {
      levelUpInProgressRef.current = true;
      lastLevelUpTimeRef.current = now;
      
      // Calculate how many levels should be gained
      const levelsToGain = Math.floor(player.experience / 1000);
      const remainingXP = player.experience % 1000;
      const newLevel = player.level + levelsToGain;
      const newSkillPoints = player.skills.skillPoints + levelsToGain;
      
      // Show message for level up(s)
      if (levelsToGain === 1) {
        addMessage(`Level up! You are now level ${newLevel}!`);
      } else {
        addMessage(`Multiple level up! You gained ${levelsToGain} levels and are now level ${newLevel}!`);
      }
      playSound('complete');
      
      // Important: Update lastExperienceUpdate BEFORE the player update
      // to prevent any race conditions in the state
      const newExp = remainingXP;
      setLastExperienceUpdate(newExp);
      
      // Update player data
      updatePlayer({
        level: newLevel,
        experience: newExp,
        skills: {
          ...player.skills,
          skillPoints: newSkillPoints
        }
      })
      .catch((error) => {
        console.error('Failed to process level up:', error);
        addMessage('ERROR: Failed to process level up. Please refresh the page.');
        // Reset lastExperienceUpdate if the update failed
        setLastExperienceUpdate(player.experience);
      })
      .finally(() => {
        // Always reset the flag
        setTimeout(() => {
          levelUpInProgressRef.current = false;
        }, 1000); // Longer timeout to ensure we don't get rapid-fire level-ups
      });
    } else {
      // If experience changed but not enough for level up, just update tracking
      setLastExperienceUpdate(player.experience);
    }
  }, [player?.experience]);

  // Job acceptance
  const handleAcceptJob = async (job: Job, forcedAccept = false) => {
    if (!player) {
      addMessage('ERROR: You need to be logged in to accept jobs');
      return;
    }
    
    if (job.status === 'completed') {
      addMessage(`Job "${job.name}" already completed`);
      return;
    }
    
    if (job.status === 'in-progress') {
      addMessage(`Job "${job.name}" already in progress`);
      return;
    }
    
    // No limit on concurrent jobs - removed MAX_CONCURRENT_JOBS check
    
    // Check skill requirements - only if not forced accept
    if (!forcedAccept && job.skillRequirements) {
      let requirementsMet = true;
      const missingSkills = [];
      
      for (const [skill, level] of Object.entries(job.skillRequirements)) {
        const playerSkillLevel = player.skills[skill as keyof typeof player.skills] || 0;
        if (playerSkillLevel < level) {
          requirementsMet = false;
          missingSkills.push(`${skill} (${playerSkillLevel}/${level})`);
        }
      }
      
      if (!requirementsMet) {
        addMessage(`ERROR: Required skills not met: ${missingSkills.join(', ')}`);
        addMessage('Use Force Accept for -50% rewards or improve your skills');
        return;
      }
    }
    
    try {
      // First check if there's already a job entry for this player and job
      const { data: existingJob, error: checkError } = await supabase
        .from('player_jobs')
        .select('id, status, progress, start_time')
        .eq('player_id', player.id)
        .eq('job_id', job.id)
        .maybeSingle();
      
      if (checkError && checkError.code !== 'PGRST116') {
        // Any error other than "no rows returned" should be handled as an error
        throw checkError;
      }
      
      // If a job record exists
      if (existingJob) {
        // If the job was completed before, reactivate it
        if (existingJob.status === 'completed') {
          const { error: updateError } = await supabase
            .from('player_jobs')
            .update({
              status: 'in-progress',
              progress: 0,
              start_time: new Date().toISOString(),
              completed_at: null
            })
            .eq('id', existingJob.id);
          
          if (updateError) throw updateError;
          
          addMessage(`Reactivated previously completed job: ${job.name}`);
        } else if (existingJob.status === 'in-progress') {
          // If it's actually in progress, update our UI to reflect that
          const startTime = new Date(existingJob.start_time).getTime();
          const elapsed = Date.now() - startTime;
          const progress = Math.min(100, Math.floor((elapsed / job.duration) * 100));
          
          // Update both allJobs and availableContracts
          setAllJobs(jobs => jobs.map(j => 
            j.id === job.id 
              ? { ...j, status: 'in-progress', progress, startTime } 
              : j
          ));
          
          setAvailableContracts(contracts => contracts.map(c => 
            c.id === job.id 
              ? { ...c, status: 'in-progress', progress, startTime } 
              : c
          ));
          
          addMessage(`Job "${job.name}" is already in progress (${progress}% complete)`);
          return;
        } else {
          // Job exists but isn't completed or in-progress (could be some other state)
          addMessage(`Job "${job.name}" is already assigned to you but has an unknown status`);
          return;
        }
      } else {
        // No existing job record, create a new one
        const newJobData = {
          player_id: player.id,
          job_id: job.id,
          status: 'in-progress',
          progress: 0,
          start_time: new Date().toISOString()
        };
        
        const { error } = await supabase
          .from('player_jobs')
          .insert([newJobData]);
      
        if (error) throw error;
        
        if (forcedAccept) {
          addMessage(`Job accepted with skill penalty: ${job.name} (-50% rewards)`);
        } else {
          addMessage(`Job accepted: ${job.name}`);
        }
      }
      
      // Update all jobs
      const updatedAllJobs = allJobs.map(j => {
        if (j.id === job.id) {
          return {
            ...j,
            status: 'in-progress' as const,
            progress: 0,
            startTime: Date.now(),
            forcedAccept // Add forcedAccept flag to track penalty
          };
        }
        return j;
      });
      
      setAllJobs(updatedAllJobs);
      
      // Also update available contracts
      const updatedAvailableContracts = availableContracts.map(j => {
        if (j.id === job.id) {
          return {
            ...j,
            status: 'in-progress' as const,
            progress: 0,
            startTime: Date.now(),
            forcedAccept
          };
        }
        return j;
      });
      
      setAvailableContracts(updatedAvailableContracts);
      
      // Update player's active jobs, avoiding duplicates
      setPlayer(prev => {
        if (!prev) return null;
        if (prev.activeJobs.includes(job.id)) {
          return prev; // Job already in active jobs, no need to update
        }
        return {
          ...prev,
          activeJobs: [...prev.activeJobs, job.id]
        };
      });
    } catch (error) {
      console.error('Error accepting job:', error);
      addMessage(`ERROR: Failed to accept job: ${(error as Error).message}`);
    }
  };

  // Player data update
  const updatePlayer = async (updates: Partial<Player>) => {
    if (!player || !user) return;
    
    try {
      const updatedPlayer = {
        ...player,
        ...updates
      };
      
      // Update local state first for responsive UI
      setPlayer(updatedPlayer);
      
      // Then update database
      let dbUpdates: any = {};
      
      if (updates.credits !== undefined) dbUpdates.credits = updates.credits;
      if (updates.torcoins !== undefined) dbUpdates.torcoins = updates.torcoins;
      if (updates.wraithcoins !== undefined) dbUpdates.wraithcoins = updates.wraithcoins;
      if (updates.level !== undefined) dbUpdates.level = updates.level;
      if (updates.experience !== undefined) dbUpdates.experience = updates.experience;
      if (updates.skills !== undefined) dbUpdates.skills = updates.skills;
      if (updates.inventory !== undefined) dbUpdates.inventory = updates.inventory;
      if (updates.loadouts !== undefined) {
        dbUpdates.equipment = {
          ...player.equipment,
          loadouts: updates.loadouts
        };
      }
      if (updates.reputation !== undefined) dbUpdates.reputation = updates.reputation;
      if (updates.tutorial_completed !== undefined) dbUpdates.tutorial_completed = updates.tutorial_completed;
      if (updates.tutorial_step !== undefined) dbUpdates.tutorial_step = updates.tutorial_step;
      if (updates.tutorial_seen_features !== undefined) dbUpdates.tutorial_seen_features = updates.tutorial_seen_features;
      if (updates.next_contract_refresh !== undefined) dbUpdates.next_contract_refresh = updates.next_contract_refresh;
      if (updates.last_contract_refresh !== undefined) dbUpdates.last_contract_refresh = updates.last_contract_refresh;
      if (updates.manual_refresh_available !== undefined) dbUpdates.manual_refresh_available = updates.manual_refresh_available;
      if (updates.next_manual_refresh !== undefined) dbUpdates.next_manual_refresh = updates.next_manual_refresh;
      
      const { error } = await supabase
        .from('players')
        .update(dbUpdates)
        .eq('id', player.id);
      
      if (error) throw error;
      
      // Return a resolved promise
      return Promise.resolve();
    } catch (error) {
      console.error('Error updating player:', error);
      addMessage(`ERROR: Failed to update player data: ${(error as Error).message}`);
      // Return a rejected promise
      return Promise.reject(error);
    }
  };

  // Equipment purchase
  const handlePurchaseEquipment = (id: string) => {
    if (!player) {
      addMessage('ERROR: You need to be logged in to purchase equipment');
      return;
    }
    
    const item = equipment.find(e => e.id === id);
    if (!item) {
      addMessage('ERROR: Equipment not found');
      return;
    }
    
    // Check if player already owns this item
    const owns = 
      player.inventory.bases?.some(e => e.id === id) || 
      player.inventory.motherboards?.some(e => e.id === id) || 
      player.inventory.components?.some(e => e.id === id);
      
    if (owns) {
      addMessage(`You already own ${item.name}`);
      return;
    }
    
    // Check if player has enough credits
    if (player.credits < item.cost) {
      addMessage(`ERROR: Not enough credits to purchase ${item.name}`);
      return;
    }
    
    // Check if player has enough torcoins if required
    if (item.torcoinCost && player.torcoins < item.torcoinCost) {
      addMessage(`ERROR: Not enough Torcoins to purchase ${item.name}`);
      return;
    }
    
    // Add item to inventory based on type
    const newInventory = { ...player.inventory };
    
    if (item.type === 'base') {
      newInventory.bases = [...(newInventory.bases || []), item];
    } else if (item.type === 'motherboard') {
      newInventory.motherboards = [...(newInventory.motherboards || []), item];
    } else if (item.type === 'component') {
      newInventory.components = [...(newInventory.components || []), item];
    }
    
    // Subtract cost from player
    const newCredits = player.credits - item.cost;
    const newTorcoins = item.torcoinCost 
      ? player.torcoins - item.torcoinCost 
      : player.torcoins;
    
    updatePlayer({
      credits: newCredits,
      torcoins: newTorcoins,
      inventory: newInventory
    });
    
    addMessage(`Purchased ${item.name} for $${item.cost.toLocaleString()}${item.torcoinCost ? ` and ${item.torcoinCost} Torcoins` : ''}`);
    playSound('complete');
    
    // Add to global chat for legendary or rare items
    if (item.rarity === 'legendary') {
      addSystemChatMessage(`${player.username} bought a ${item.name}!`);
    }
  };

  // Equipment loadout creation
  const handleCreateLoadout = (baseId: string, motherboardId: string) => {
    if (!player) return;
    
    const newLoadout = {
      id: `loadout_${Date.now()}`,
      baseId,
      motherboardId,
      installedComponents: {},
      active: player.loadouts.length === 0, // Make active if it's the first loadout
    };
    
    const updatedLoadouts = [...player.loadouts, newLoadout];
    
    updatePlayer({
      loadouts: updatedLoadouts
    });
    
    addMessage(`Created new equipment loadout with base and motherboard`);
  };

  // Equipment loadout activation
  const handleEquipLoadout = (loadoutId: string) => {
    if (!player) return;
    
    const updatedLoadouts = player.loadouts.map(loadout => ({
      ...loadout,
      active: loadout.id === loadoutId
    }));
    
    updatePlayer({
      loadouts: updatedLoadouts
    });
    
    addMessage(`Activated equipment loadout`);
  };

  // Component installation
  const handleInstallComponent = (loadoutId: string, slot: string, componentId: string) => {
    if (!player) return;
    
    const updatedLoadouts = player.loadouts.map(loadout => {
      if (loadout.id === loadoutId) {
        return {
          ...loadout,
          installedComponents: {
            ...loadout.installedComponents,
            [slot]: componentId
          }
        };
      }
      return loadout;
    });
    
    updatePlayer({
      loadouts: updatedLoadouts
    });
    
    addMessage(`Installed component in ${slot}`);
  };

  // Component uninstallation
  const handleUninstallComponent = (loadoutId: string, slot: string) => {
    if (!player) return;
    
    const updatedLoadouts = player.loadouts.map(loadout => {
      if (loadout.id === loadoutId) {
        const updatedComponents = { ...loadout.installedComponents };
        delete updatedComponents[slot];
        
        return {
          ...loadout,
          installedComponents: updatedComponents
        };
      }
      return loadout;
    });
    
    updatePlayer({
      loadouts: updatedLoadouts
    });
    
    addMessage(`Removed component from ${slot}`);
  };

  // Loadout deletion
  const handleDeleteLoadout = (loadoutId: string) => {
    if (!player) return;
    
    const loadoutToDelete = player.loadouts.find(l => l.id === loadoutId);
    if (!loadoutToDelete) return;
    
    const wasActive = loadoutToDelete.active;
    const remainingLoadouts = player.loadouts.filter(l => l.id !== loadoutId);
    
    // If the deleted loadout was active, make another one active if available
    if (wasActive && remainingLoadouts.length > 0) {
      remainingLoadouts[0].active = true;
    }
    
    updatePlayer({
      loadouts: remainingLoadouts
    });
    
    addMessage(`Deleted equipment loadout`);
  };

  // Skill upgrade
  const handleUpgradeSkill = (skill: keyof Player['skills']) => {
    if (!player || player.skills.skillPoints <= 0) return;
    
    if (skill === 'skillPoints') return; // Can't upgrade skill points directly
    
    const updatedSkills = {
      ...player.skills,
      [skill]: player.skills[skill] + 1,
      skillPoints: player.skills.skillPoints - 1
    };
    
    updatePlayer({
      skills: updatedSkills
    });
    
    addMessage(`Upgraded ${skill} to level ${updatedSkills[skill]}`);
  };

  // Contract refresh (for automatic refresh and admin panel)
  const handleRefreshContracts = async () => {
    if (!player) return;
    
    try {
      addMessage('Refreshing available contracts...');
      
      // If admin is refreshing, also clear completed job records from database
      if (isAdmin) {
        // First fetch all player jobs to identify in-progress jobs
        const { data: playerJobs, error: jobsError } = await supabase
          .from('player_jobs')
          .select('id, job_id, status, progress, start_time')
          .eq('player_id', player.id);
          
        if (jobsError) throw jobsError;
        
        // Reset completed jobs, but preserve in-progress jobs
        const completedJobIds = playerJobs
          ?.filter(job => job.status === 'completed')
          .map(job => job.id) || [];
          
        if (completedJobIds.length > 0) {
          const { error: deleteError } = await supabase
            .from('player_jobs')
            .delete()
            .in('id', completedJobIds);
          
          if (deleteError) {
            console.error('Error deleting completed jobs:', deleteError);
            // Continue anyway, it might work on the UI level
          } else {
            addMessage('Admin reset: Completed jobs cleared from database');
          }
        }
      }
      
      // Reset job statuses first
      const refreshedJobs = resetJobStatuses();
      setAllJobs(refreshedJobs);
      
      // Make sure to include all in-progress jobs in available contracts
      const inProgressJobs = refreshedJobs.filter(job => job.status === 'in-progress');
      
      // Select new random contracts
      const activeJobIds = refreshedJobs
        .filter(job => job.status === 'in-progress')
        .map(job => job.id);
        
      const selectedContracts = selectRandomContracts(refreshedJobs, activeJobIds);
      
      if (selectedContracts.length === 0) {
        console.warn('No contracts available for refresh');
      }
      
      setAvailableContracts(selectedContracts);
      
      // Update last refresh time
      const now = new Date();
      updatePlayer({
        last_contract_refresh: now.toISOString(),
        next_contract_refresh: new Date(now.getTime() + REFRESH_COOLDOWN).toISOString(),
        manual_refresh_available: false
      });
      
      setNextContractRefresh(new Date(now.getTime() + REFRESH_COOLDOWN));
      
      addMessage('Contract refresh complete. New jobs available.');
    } catch (error) {
      console.error('Error refreshing contracts:', error);
      addMessage(`ERROR: Failed to refresh contracts: ${(error as Error).message}`);
    }
  };

  // Manual contract refresh (once every 12 hours)
  const handleManualRefresh = async () => {
    if (!player || !player.manual_refresh_available) return;
    
    try {
      addMessage('Manually refreshing available contracts...');
      
      // Reset job statuses first
      const refreshedJobs = resetJobStatuses();
      setAllJobs(refreshedJobs);
      
      // Make sure to include in-progress jobs
      const inProgressJobs = refreshedJobs.filter(job => job.status === 'in-progress');
      
      // Select new random contracts
      const activeJobIds = refreshedJobs
        .filter(job => job.status === 'in-progress')
        .map(job => job.id);
        
      const selectedContracts = selectRandomContracts(refreshedJobs, activeJobIds);
      
      if (selectedContracts.length === 0) {
        console.warn('No contracts available for refresh');
      }
      
      setAvailableContracts(selectedContracts);
      
      // Set next manual refresh time (12 hours from now)
      const now = new Date();
      const nextManualRefreshTime = new Date(now.getTime() + MANUAL_REFRESH_COOLDOWN);
      
      updatePlayer({
        last_contract_refresh: now.toISOString(),
        manual_refresh_available: false,
        next_manual_refresh: nextManualRefreshTime.toISOString()
      });
      
      setNextManualRefresh(nextManualRefreshTime);
      
      // Also update the regular refresh timer
      const nextRegularRefresh = new Date(now.getTime() + REFRESH_COOLDOWN);
      setNextContractRefresh(nextRegularRefresh);
      updatePlayer({
        next_contract_refresh: nextRegularRefresh.toISOString()
      });
      
      addMessage('Manual contract refresh complete. New jobs available.');
      playSound('complete');
    } catch (error) {
      console.error('Error manually refreshing contracts:', error);
      addMessage(`ERROR: Failed to refresh contracts: ${(error as Error).message}`);
    }
  };

  // Event reward handling
  const handleEventReward = (torcoins: number) => {
    if (!player || torcoins <= 0) return;
    
    updatePlayer({
      torcoins: player.torcoins + torcoins
    });
    
    if (torcoins > 0) {
      addMessage(`Earned ${torcoins} Torcoin${torcoins !== 1 ? 's' : ''}!`);
      addSystemChatMessage(`${player.username} earned ${torcoins} Torcoin${torcoins !== 1 ? 's' : ''} from an event!`);
    }
  };

  // Reset events for admin
  const handleResetEvent = () => {
    if (!isAdmin) return;
    
    localStorage.removeItem('icebreaker_lockout');
    localStorage.removeItem('ghost_lockout');
    setEventKey(prev => prev + 1);
    addMessage('Event lockout has been reset by admin');
  };

  // Reset tutorial for admin
  const handleResetTutorial = () => {
    if (!isAdmin || !player) return;
    
    updatePlayer({
      tutorial_completed: false,
      tutorial_step: 0,
      tutorial_seen_features: []
    });
    
    addMessage('Tutorial has been reset by admin');
  };

  // Speed multiplier for admin
  const handleUpdateSpeed = (multiplier: number) => {
    if (!isAdmin) return;
    
    setTimeMultiplier(multiplier);
    addMessage(`Contract speed set to ${multiplier}x`);
  };

  return (
    <>
      <div className="matrix-bg"></div>
      <div className="relative text-green-400 min-h-screen pb-32 lg:pb-40">
        <div className="max-w-6xl mx-auto p-4 relative z-10">
          {user && player ? (
            <>
              <div className="player-stats mb-6">
                <PlayerStats player={player} onLogout={() => supabase.auth.signOut()} />
              </div>
              
              {/* Terminal and Chat panels above Contracts */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
                <div className="terminal-panel">
                  <Terminal messages={messages} />
                </div>
                <div className="chat-panel">
                  <GlobalChat 
                    messages={chatMessages} 
                    onSendMessage={addChatMessage} 
                  />
                </div>
              </div>
              
              {/* Contracts Panel with 2-row scrollable container */}
              <div className="contracts-panel mb-6">
                <h2 className="text-xl font-bold font-mono text-green-400 mb-4 flex items-center justify-between">
                  <span>Available Contracts</span>
                  <div className="flex items-center gap-4">
                    {nextContractRefresh && (
                      <span className="text-sm text-green-600">
                        Next refresh: {nextContractRefresh.toLocaleTimeString()}
                      </span>
                    )}
                    {player.manual_refresh_available && (
                      <button
                        onClick={handleManualRefresh}
                        className="flex items-center gap-2 px-3 py-1 border-2 border-green-500 rounded hover:bg-green-900/30 text-green-400 font-mono text-sm"
                      >
                        <RefreshCw className="w-4 h-4" />
                        Manual Refresh
                      </button>
                    )}
                    {!player.manual_refresh_available && nextManualRefresh && (
                      <span className="text-sm text-yellow-400">
                        Manual refresh available in: {Math.ceil((nextManualRefresh.getTime() - Date.now()) / (1000 * 60 * 60))}h
                      </span>
                    )}
                  </div>
                </h2>
                <div className="max-h-[500px] overflow-y-auto scrollbar-hide pr-2">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {availableContracts.length > 0 ? (
                      availableContracts.map((job) => (
                        <JobCard
                          key={job.id}
                          job={job}
                          onAccept={handleAcceptJob}
                          disabled={
                            job.status === 'completed' ||
                            job.status === 'in-progress'
                          }
                          playerSkills={player.skills}
                        />
                      ))
                    ) : (
                      <div className="col-span-2 text-center py-8 text-yellow-400 font-mono">
                        No contracts available. Please wait for the next refresh or manually refresh contracts.
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Admin panel - shown only if isAdmin is true and showAdminPanel is true */}
              {isAdmin && showAdminPanel && (
                <AdminPanel 
                  player={player}
                  onUpdatePlayer={updatePlayer}
                  onRefreshContracts={handleRefreshContracts}
                  onUpdateSpeed={handleUpdateSpeed}
                  onResetEvent={handleResetEvent}
                  onResetTutorial={handleResetTutorial}
                  timeMultiplier={timeMultiplier}
                />
              )}
              
              <Toolbar
                equipment={equipment}
                onPurchase={handlePurchaseEquipment}
                onEquip={() => {}}
                onUnequip={() => {}}
                activePanel={activePanel}
                onPanelChange={setActivePanel}
                eventKey={eventKey}
                isAdmin={isAdmin}
                playerCredits={player.credits}
                playerTorcoins={player.torcoins}
                player={player}
                onUpgradeSkill={handleUpgradeSkill}
                onEventReward={handleEventReward}
                onCreateLoadout={handleCreateLoadout}
                onEquipLoadout={handleEquipLoadout}
                onInstallComponent={handleInstallComponent}
                onUninstallComponent={handleUninstallComponent}
                onDeleteLoadout={handleDeleteLoadout}
                onUpdatePlayer={updatePlayer}
              />
              
              {!player.tutorial_completed && isInitialized && (
                <Tutorial 
                  player={player}
                  onComplete={() => {
                    updatePlayer({ tutorial_completed: true });
                  }}
                  onUpdatePlayer={updatePlayer}
                  isAdmin={isAdmin}
                  onOpenPanel={setActivePanel}
                />
              )}
            </>
          ) : (
            <div className="min-h-screen flex items-center justify-center">
              <LoginForm onLogin={() => {}} addMessage={addMessage} />
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default App;