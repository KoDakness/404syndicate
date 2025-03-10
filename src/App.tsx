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
import type { Job, Player, Equipment, EquipmentLoadout } from './types';

// Helper function to get stored contracts from localStorage
function getStoredContracts(): Job[] | null {
  const stored = localStorage.getItem('current_contracts');
  if (!stored) return null;
  try {
    return JSON.parse(stored);
  } catch (e) {
    return null;
  }
}

// Helper function to get random contracts
function getRandomContracts(contracts: Job[], count: number): Job[] {
  const shuffled = [...contracts].sort(() => Math.random() - 0.5);
  const selected = shuffled.slice(0, 8).map(job => ({
    ...job,
    status: 'available',
    progress: 0,
    startTime: null
  }));
  localStorage.setItem('current_contracts', JSON.stringify(selected));
  return selected;
}

const initialPlayer: Player = {
  credits: 1000,
  torcoins: 0,
  lastRefresh: null,
  loadouts: [],
  reputation: {
    corporate: 0,
    underground: 0,
  },
  inventory: {
    bases: [],
    motherboards: [],
    components: []
  },
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
  const [jobs, setJobs] = useState<Job[]>(() => {
    const stored = getStoredContracts();
    return stored || getRandomContracts(availableJobs, 8);
  });
  const [showAdmin, setShowAdmin] = useState(false);
  const [timeMultiplier, setTimeMultiplier] = useState(1);
  const [nextRefresh, setNextRefresh] = useState<Date>(new Date(Date.now() + 2 * 60 * 60 * 1000));
  const [showEventIndicator, setShowEventIndicator] = useState(true);
  const [showGhostIndicator, setShowGhostIndicator] = useState(true);
  const [eventKey, setEventKey] = useState(0);
  const [adminKeyPressed, setAdminKeyPressed] = useState(false);
  const [activePanel, setActivePanel] = useState<string | null>(null);
  const [showTutorial, setShowTutorial] = useState<boolean>(false);
  const [messages, setMessages] = useState<string[]>([
    'Initializing system...',
    'Connecting to network...',
    'Ready for operations.',
  ]);
  const [lastProgressUpdate, setLastProgressUpdate] = useState<{[key: string]: number}>({});
  const [unsavedChanges, setUnsavedChanges] = useState(false);
  const [databaseEquipment, setDatabaseEquipment] = useState<{
    bases: any[],
    motherboards: any[],
    components: any[]
  }>({
    bases: [],
    motherboards: [],
    components: []
  });
  const [isLoadingEquipment, setIsLoadingEquipment] = useState(false);

  const handleLogout = async () => {
    // Save stats before logout
    await syncPlayerData({
      credits: player.credits,
      torcoins: player.torcoins,
      level: player.level,
      experience: player.experience,
      reputation: player.reputation,
      skills: player.skills,
      equipment: player.equipment,
      inventory: player.inventory
    });
    
    await supabase.auth.signOut();
    localStorage.clear(); // Clear any stored tokens
    const newJobs = getRandomContracts(availableJobs, 8);
    playSound('click');
    setSession(null);
    setPlayer(initialPlayer);
    setJobs(newJobs);
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

  // Fetch available equipment from database
  const fetchEquipment = async () => {
    try {
      setIsLoadingEquipment(true);
      // Fetch bases
      const { data: basesData, error: basesError } = await supabase
        .from('equipment_bases')
        .select('*');

      if (basesError) {
        console.error('Error fetching bases:', basesError);
        addMessage('ERROR: Failed to fetch equipment data');
        setIsLoadingEquipment(false);
        return;
      }

      // Fetch motherboards
      const { data: motherboardsData, error: motherboardsError } = await supabase
        .from('equipment_motherboards')
        .select('*');

      if (motherboardsError) {
        console.error('Error fetching motherboards:', motherboardsError);
        addMessage('ERROR: Failed to fetch equipment data');
        setIsLoadingEquipment(false);
        return;
      }

      // Fetch components
      const { data: componentsData, error: componentsError } = await supabase
        .from('equipment_components')
        .select('*');

      if (componentsError) {
        console.error('Error fetching components:', componentsError);
        addMessage('ERROR: Failed to fetch equipment data');
        setIsLoadingEquipment(false);
        return;
      }

      setDatabaseEquipment({
        bases: basesData || [],
        motherboards: motherboardsData || [],
        components: componentsData || []
      });

      console.log('Equipment data loaded from database:', {
        bases: basesData?.length || 0,
        motherboards: motherboardsData?.length || 0,
        components: componentsData?.length || 0
      });
      setIsLoadingEquipment(false);
    } catch (error) {
      console.error('Error in fetchEquipment:', error);
      addMessage('ERROR: Failed to fetch equipment data');
      setIsLoadingEquipment(false);
    }
  };

  const handleLogin = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    setSession(session);
    
    if (session) {
      addMessage('Establishing secure connection...');

      // Fetch equipment data
      await fetchEquipment();

      // Fetch active jobs from database
      const { data: activeJobsData, error: activeJobsError } = await supabase
        .from('player_jobs')
        .select('*')
        .eq('player_id', session.user.id)
        .eq('status', 'in-progress');

      if (activeJobsError) {
        addMessage(`ERROR: Failed to fetch active jobs - ${activeJobsError.message}`);
      }

      // Get stored contracts or generate new ones
      const storedContracts = getStoredContracts();
      const baseContracts = storedContracts || getRandomContracts(availableJobs, 8);
      
      const activeJobs = activeJobsData?.map(jobData => {
        const baseJob = availableJobs.find(j => j.id === jobData.job_id);
        if (!baseJob) return null;
        return {
          ...baseJob,
          status: 'in-progress' as const,
          progress: jobData.progress,
          startTime: new Date(jobData.start_time || Date.now()).getTime()
        };
      }).filter(Boolean) || [];
      
      // Merge active jobs with base contracts
      const mergedJobs = baseContracts.map(job => {
        const activeJob = activeJobs?.find(aj => aj?.id === job.id);
        return activeJob || job;
      });
      
      setJobs(mergedJobs);
      
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
            id: newPlayer.id,
            username: newPlayer.username,
            tutorial_completed: newPlayer.tutorial_completed || false,
            tutorial_step: newPlayer.tutorial_step || 0,
            tutorial_seen_features: newPlayer.tutorial_seen_features || []
          });
          addMessage(`Welcome to the Syndicate, ${newPlayer.username}!`);
        }
      } else if (error) {
        addMessage(`ERROR: ${error.message}`);
        return;
      } else if (playerData) {
        setPlayer({
          ...initialPlayer,
          id: playerData.id,
          username: playerData.username,
          credits: parseInt(String(playerData.credits)),
          torcoins: parseInt(String(playerData.torcoins)),
          level: parseInt(String(playerData.level)),
          experience: parseInt(String(playerData.experience)),
          maxConcurrentJobs: parseInt(String(playerData.max_concurrent_jobs)),
          skills: typeof playerData.skills === 'string'
            ? JSON.parse(playerData.skills)
            : playerData.skills,
          equipment: playerData.equipment,
          reputation: playerData.reputation,
          inventory: {
            bases: playerData.inventory?.bases || [],
            motherboards: playerData.inventory?.motherboards || [],
            components: playerData.inventory?.components || []
          },
          tutorial_completed: playerData.tutorial_completed || false,
          tutorial_step: playerData.tutorial_step || 0,
          tutorial_seen_features: playerData.tutorial_seen_features || [],
          last_contract_refresh: playerData.last_contract_refresh,
          next_contract_refresh: playerData.next_contract_refresh,
          manual_refresh_available: playerData.manual_refresh_available
        });
        addMessage(`Welcome back, ${playerData.username}!`);
        
        // Update next refresh time if needed
        if (playerData.next_contract_refresh) {
          const nextRefresh = new Date(playerData.next_contract_refresh);
          setNextRefresh(nextRefresh);
        }
      }
      
      // Fetch player loadouts
      fetchPlayerLoadouts(session.user.id);
    }
  };
  
  // Fetch player loadouts from database
  const fetchPlayerLoadouts = async (playerId: string) => {
    try {
      const { data: loadoutsData, error: loadoutsError } = await supabase
        .from('player_equipment_loadouts')
        .select('*')
        .eq('player_id', playerId);
        
      if (loadoutsError) {
        addMessage(`ERROR: Failed to fetch loadouts - ${loadoutsError.message}`);
        return;
      }
      
      if (loadoutsData && loadoutsData.length > 0) {
        // Create a lookup map to find frontend equipment by name
        const findFrontendEquipment = (type: 'base' | 'motherboard' | 'component', dbId: string) => {
          const dbItem = type === 'base' 
            ? databaseEquipment.bases.find(b => b.id === dbId)
            : type === 'motherboard'
              ? databaseEquipment.motherboards.find(m => m.id === dbId)
              : databaseEquipment.components.find(c => c.id === dbId);
          
          if (!dbItem) return null;
          
          return availableEquipment.find(e => 
            e.type === type && e.name === dbItem.name
          );
        };
        
        const loadouts: EquipmentLoadout[] = loadoutsData.map(loadout => {
          // Find matching frontend IDs based on name
          const frontendBase = findFrontendEquipment('base', loadout.base_id);
          const frontendMotherboard = findFrontendEquipment('motherboard', loadout.motherboard_id);
          
          // Map installed components to frontend IDs
          const installedComponents: Record<string, string> = {};
          
          // Process each installed component
          Object.entries(loadout.installed_components || {}).forEach(([slot, componentId]) => {
            if (typeof componentId === 'string') {
              const frontendComponent = findFrontendEquipment('component', componentId as string);
              if (frontendComponent) {
                installedComponents[slot] = frontendComponent.id;
              } else {
                installedComponents[slot] = componentId as string;
              }
            }
          });
          
          return {
            id: loadout.id,
            baseId: frontendBase?.id || loadout.base_id,
            motherboardId: frontendMotherboard?.id || loadout.motherboard_id,
            installedComponents: installedComponents,
            active: loadout.active,
            stats: {},
            specialEffects: []
          };
        });
        
        console.log("Loaded loadouts:", loadouts);
        setPlayer(prev => ({
          ...prev,
          loadouts
        }));
      }
    } catch (error) {
      console.error('Error in fetchPlayerLoadouts:', error);
      addMessage(`ERROR: Failed to fetch loadouts - ${(error as Error).message}`);
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

  // Save stats when tab closes or user navigates away
  useEffect(() => {
    const handleBeforeUnload = async (e: BeforeUnloadEvent) => {
      if (session?.user?.id && unsavedChanges) {
        e.preventDefault();
        e.returnValue = '';
        
        await syncPlayerData({
          credits: player.credits,
          torcoins: player.torcoins,
          level: player.level,
          experience: player.experience,
          reputation: player.reputation,
          skills: player.skills,
          equipment: player.equipment,
          inventory: player.inventory
        });
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [session, player, unsavedChanges]);

  // Mark changes as unsaved when player stats update
  useEffect(() => {
    setUnsavedChanges(true);
  }, [player.credits, player.torcoins, player.level, player.experience]);

  // Auto-save every 5 minutes if there are unsaved changes
  useEffect(() => {
    if (!session?.user?.id || !unsavedChanges) return;

    const autoSaveInterval = setInterval(async () => {
      if (unsavedChanges) {
        await syncPlayerData({
          credits: player.credits,
          torcoins: player.torcoins,
          level: player.level,
          experience: player.experience,
          reputation: player.reputation,
          skills: player.skills,
          equipment: player.equipment,
          inventory: player.inventory
        });
        setUnsavedChanges(false);
      }
    }, 5 * 60 * 1000); // 5 minutes

    return () => clearInterval(autoSaveInterval);
  }, [session, player, unsavedChanges]);

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
    
    const sanitizedUpdates = {
      ...updates,
      skills: updates.skills ? JSON.stringify(updates.skills) : undefined,
      reputation: updates.reputation ? JSON.stringify(updates.reputation) : undefined,
      inventory: updates.inventory ? {
        bases: updates.inventory.bases || [],
        motherboards: updates.inventory.motherboards || [],
        components: updates.inventory.components || []
      } : undefined
    };

    const { error } = await supabase
      .from('players')
      .update(sanitizedUpdates)
      .eq('id', session.user.id);

    if (error) {
      addMessage(`ERROR: Failed to sync player data - ${error.message}`);
      return false;
    }
    setUnsavedChanges(false);
    return true;
  };

  // Helper function to get DB equipment ID from frontend ID
  const getDatabaseEquipmentId = (frontendId: string, type: 'base' | 'motherboard' | 'component'): string | null => {
    try {
      const frontendItem = availableEquipment.find(e => e.id === frontendId);
      if (!frontendItem) {
        console.error(`Frontend item not found for ID: ${frontendId} of type ${type}`);
        return null;
      }
      
      if (type === 'base') {
        const baseItem = databaseEquipment.bases.find(
          base => base.name === frontendItem.name
        );
        
        if (baseItem) {
          console.log(`Mapped frontend base ID ${frontendId} to database ID ${baseItem.id}`);
          return baseItem.id;
        }
      } else if (type === 'motherboard') {
        const mbItem = databaseEquipment.motherboards.find(
          mb => mb.name === frontendItem.name
        );
        
        if (mbItem) {
          console.log(`Mapped frontend motherboard ID ${frontendId} to database ID ${mbItem.id}`);
          return mbItem.id;
        }
      } else if (type === 'component') {
        const componentItem = databaseEquipment.components.find(
          comp => comp.name === frontendItem.name
        );
        
        if (componentItem) {
          console.log(`Mapped frontend component ID ${frontendId} to database ID ${componentItem.id}`);
          return componentItem.id;
        }
      }
      
      console.error(`Failed to find database ID for ${type} with frontend ID: ${frontendId}`);
      return null;
    } catch (err) {
      console.error('Error getting database equipment ID:', err);
      return null;
    }
  };

  const purchaseEquipment = async (equipmentId: string) => {
    const equipment = availableEquipment.find(e => e.id === equipmentId);
    if (!equipment) return;
    
    if (player.credits < equipment.cost) {
      addMessage(`Insufficient credits for ${equipment.name}`);
      return;
    }
    
    if (equipment.torcoinCost && player.torcoins < equipment.torcoinCost) {
      addMessage(`Insufficient torcoins for ${equipment.name}`);
      return;
    }
    
    // Get total count based on equipment type
    let totalCount = 0;
    if (equipment.type === 'base') {
      totalCount = (player.inventory.bases || []).length;
    } else if (equipment.type === 'motherboard') {
      totalCount = (player.inventory.motherboards || []).length;
    } else if (equipment.type === 'component') {
      totalCount = (player.inventory.components || []).length;
    }
    
    if (totalCount >= 10) {
      addMessage('ERROR: Maximum equipment capacity reached');
      return;
    }
    
    const updatedPlayer = {
      ...player,
      credits: player.credits - (equipment.cost || 0),
      torcoins: player.torcoins - (equipment.torcoinCost || 0),
      inventory: {
        ...player.inventory,
        bases: equipment.type === 'base' 
          ? [...(player.inventory.bases || []), equipment]
          : (player.inventory.bases || []),
        motherboards: equipment.type === 'motherboard'
          ? [...(player.inventory.motherboards || []), equipment]
          : (player.inventory.motherboards || []),
        components: equipment.type === 'component'
          ? [...(player.inventory.components || []), equipment]
          : (player.inventory.components || [])
      }
    };
    
    // Update database first
    const success = await syncPlayerData({
      credits: updatedPlayer.credits,
      torcoins: updatedPlayer.torcoins,
      inventory: updatedPlayer.inventory
    });
    
    if (success) {
      setPlayer(updatedPlayer);
      playSound('complete');
      addMessage(`Purchased ${equipment.name} for ${equipment.cost.toLocaleString()} credits${
        equipment.torcoinCost ? ` and ${equipment.torcoinCost} torcoins` : ''
      }`);
    }
  };

  const createLoadout = async (baseId: string, motherboardId: string) => {
    if (!session?.user?.id) {
      addMessage('ERROR: Not logged in');
      return;
    }
    
    // Check if player already has the maximum number of loadouts (2)
    if (player.loadouts.length >= 2) {
      addMessage('ERROR: Maximum number of loadouts (2) reached. Delete a loadout first.');
      return;
    }
    
    console.log(`Creating loadout with base ${baseId} and motherboard ${motherboardId}`);
    
    // Check if database equipment is loaded
    if (databaseEquipment.bases.length === 0 || databaseEquipment.motherboards.length === 0) {
      console.log("Database equipment not loaded, fetching again...");
      await fetchEquipment();
    }
    
    // Get database IDs for base and motherboard
    const dbBaseId = getDatabaseEquipmentId(baseId, 'base');
    const dbMotherboardId = getDatabaseEquipmentId(motherboardId, 'motherboard');
    
    if (!dbBaseId) {
      console.error(`Failed to find database ID for base ${baseId}`);
      addMessage('ERROR: Base equipment not found in database');
      return;
    }
    
    if (!dbMotherboardId) {
      console.error(`Failed to find database ID for motherboard ${motherboardId}`);
      addMessage('ERROR: Motherboard not found in database');
      return;
    }
    
    console.log(`Mapped IDs: base ${baseId} -> ${dbBaseId}, motherboard ${motherboardId} -> ${dbMotherboardId}`);
    
    // Insert new loadout into database
    try {
      const { data: newLoadout, error } = await supabase
        .from('player_equipment_loadouts')
        .insert({
          player_id: session.user.id,
          base_id: dbBaseId,
          motherboard_id: dbMotherboardId,
          installed_components: {},
          active: player.loadouts.length === 0 // Make active if it's the first loadout
        })
        .select()
        .single();
      
      if (error) {
        console.error('Error creating loadout:', error);
        addMessage(`ERROR: Failed to create loadout - ${error.message}`);
        return;
      }
      
      if (newLoadout) {
        console.log('Loadout created successfully:', newLoadout);
        
        const base = player.inventory.bases.find(b => b.id === baseId);
        const motherboard = player.inventory.motherboards.find(m => m.id === motherboardId);
        
        const loadout: EquipmentLoadout = {
          id: newLoadout.id,
          baseId,
          motherboardId,
          installedComponents: {},
          active: newLoadout.active,
          stats: {},
          specialEffects: []
        };
        
        setPlayer(prev => {
          const updatedPlayer = {
            ...prev,
            loadouts: [...prev.loadouts, loadout]
          };
          console.log('Updated player loadouts:', updatedPlayer.loadouts);
          return updatedPlayer;
        });
        
        addMessage(`Created new loadout with ${base?.name} and ${motherboard?.name}`);
        
        // Refetch loadouts to ensure we have the latest data
        await fetchPlayerLoadouts(session.user.id);
      }
    } catch (error) {
      console.error('Error in createLoadout:', error);
      addMessage(`ERROR: Failed to create loadout - ${(error as Error).message}`);
    }
  };
  
  const activateLoadout = async (loadoutId: string) => {
    if (!session?.user?.id) {
      addMessage('ERROR: Not logged in');
      return;
    }
    
    // First, set all loadouts to inactive
    const { error: updateError } = await supabase
      .from('player_equipment_loadouts')
      .update({ active: false })
      .eq('player_id', session.user.id);
    
    if (updateError) {
      addMessage(`ERROR: Failed to update loadouts - ${updateError.message}`);
      return;
    }
    
    // Then, set the selected loadout to active
    const { error: activateError } = await supabase
      .from('player_equipment_loadouts')
      .update({ active: true })
      .eq('id', loadoutId)
      .eq('player_id', session.user.id);
    
    if (activateError) {
      addMessage(`ERROR: Failed to activate loadout - ${activateError.message}`);
      return;
    }
    
    // Update local state
    setPlayer(prev => ({
      ...prev,
      loadouts: prev.loadouts.map(loadout => ({
        ...loadout,
        active: loadout.id === loadoutId
      }))
    }));
    
    addMessage(`Activated loadout`);
  };
  
  const installComponent = async (loadoutId: string, slot: string, componentId: string) => {
    if (!session?.user?.id) {
      addMessage('ERROR: Not logged in');
      return;
    }
    
    const loadout = player.loadouts.find(l => l.id === loadoutId);
    if (!loadout) {
      addMessage('ERROR: Loadout not found');
      return;
    }
    
    // Get database ID for component
    const dbComponentId = getDatabaseEquipmentId(componentId, 'component');
    
    if (!dbComponentId) {
      console.error(`Failed to find database ID for component ${componentId}`);
      addMessage('ERROR: Component not found in database');
      return;
    }
    
    console.log(`Installing component ${componentId} -> ${dbComponentId} in slot ${slot} of loadout ${loadoutId}`);
    
    const updatedComponents = {
      ...loadout.installedComponents,
      [slot]: dbComponentId
    };
    
    // Update database
    const { error } = await supabase
      .from('player_equipment_loadouts')
      .update({ installed_components: updatedComponents })
      .eq('id', loadoutId)
      .eq('player_id', session.user.id);
    
    if (error) {
      console.error('Error installing component:', error);
      addMessage(`ERROR: Failed to install component - ${error.message}`);
      return;
    }
    
    // Update local state
    const component = player.inventory.components.find(c => c.id === componentId);
    
    setPlayer(prev => {
      const updatedLoadouts = prev.loadouts.map(l => 
        l.id === loadoutId
          ? { ...l, installedComponents: {...l.installedComponents, [slot]: componentId} }
          : l
      );
      console.log('Updated loadouts after component install:', updatedLoadouts);
      return {
        ...prev,
        loadouts: updatedLoadouts
      };
    });
    
    addMessage(`Installed ${component?.name || 'component'} in slot ${slot}`);
    
    // Refetch loadouts to ensure data is up to date
    await fetchPlayerLoadouts(session.user.id);
  };
  
  const uninstallComponent = async (loadoutId: string, slot: string) => {
    if (!session?.user?.id) {
      addMessage('ERROR: Not logged in');
      return;
    }
    
    const loadout = player.loadouts.find(l => l.id === loadoutId);
    if (!loadout) {
      addMessage('ERROR: Loadout not found');
      return;
    }
    
    const componentId = loadout.installedComponents[slot];
    if (!componentId) {
      addMessage('ERROR: No component installed in this slot');
      return;
    }
    
    console.log(`Uninstalling component from slot ${slot} of loadout ${loadoutId}`);
    
    const updatedComponents = { ...loadout.installedComponents };
    delete updatedComponents[slot];
    
    // Update database
    const { error } = await supabase
      .from('player_equipment_loadouts')
      .update({ installed_components: updatedComponents })
      .eq('id', loadoutId)
      .eq('player_id', session.user.id);
    
    if (error) {
      console.error('Error uninstalling component:', error);
      addMessage(`ERROR: Failed to uninstall component - ${error.message}`);
      return;
    }
    
    // Update local state
    setPlayer(prev => {
      const updatedLoadouts = prev.loadouts.map(l => {
        if (l.id === loadoutId) {
          const newInstalledComponents = { ...l.installedComponents };
          delete newInstalledComponents[slot];
          return { ...l, installedComponents: newInstalledComponents };
        }
        return l;
      });
      console.log('Updated loadouts after component uninstall:', updatedLoadouts);
      return {
        ...prev,
        loadouts: updatedLoadouts
      };
    });
    
    // Find component name from player's inventory or equipment list
    const frontendComponent = player.inventory.components.find(c => c.id === componentId) || 
                             availableEquipment.find(e => e.id === componentId && e.type === 'component');
    const componentName = frontendComponent?.name || 'Component';
    
    addMessage(`Uninstalled ${componentName} from slot ${slot}`);
    
    // Refetch loadouts to ensure data is up to date
    await fetchPlayerLoadouts(session.user.id);
  };
  
  const deleteLoadout = async (loadoutId: string) => {
    if (!session?.user?.id) {
      addMessage('ERROR: Not logged in');
      return;
    }
    
    const loadout = player.loadouts.find(l => l.id === loadoutId);
    if (!loadout) {
      addMessage('ERROR: Loadout not found');
      return;
    }
    
    console.log(`Deleting loadout ${loadoutId}`);
    
    // Don't allow deleting the active loadout if it's the only one
    if (loadout.active && player.loadouts.length === 1) {
      addMessage('ERROR: Cannot delete the only active loadout');
      return;
    }
    
    // Delete from database
    try {
      const { error } = await supabase
        .from('player_equipment_loadouts')
        .delete()
        .eq('id', loadoutId)
        .eq('player_id', session.user.id);
      
      if (error) {
        console.error('Error deleting loadout:', error);
        addMessage(`ERROR: Failed to delete loadout - ${error.message}`);
        return;
      }
      
      // If this was the active loadout, make another one active
      if (loadout.active && player.loadouts.length > 1) {
        const nextLoadoutId = player.loadouts.find(l => l.id !== loadoutId)?.id;
        if (nextLoadoutId) {
          await activateLoadout(nextLoadoutId);
        }
      }
      
      // Update local state
      setPlayer(prev => {
        const updatedLoadouts = prev.loadouts.filter(l => l.id !== loadoutId);
        console.log('Updated loadouts after deletion:', updatedLoadouts);
        return {
          ...prev,
          loadouts: updatedLoadouts
        };
      });
      
      addMessage('Loadout deleted');
      
      // Refetch loadouts to ensure clean state
      await fetchPlayerLoadouts(session.user.id);
    } catch (error) {
      console.error('Error in deleteLoadout:', error);
      addMessage(`ERROR: Failed to delete loadout - ${(error as Error).message}`);
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
    const newJobs = getRandomContracts(availableJobs, 8);
    localStorage.setItem('current_contracts', JSON.stringify(newJobs));
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
    if (!session?.user?.id) {
      addMessage('ERROR: Not logged in');
      return;
    }
    
    // Count only in-progress jobs
    const activeJobCount = jobs.filter(j => 
      j.status === 'in-progress' && 
      player.activeJobs.includes(j.id)
    ).length;
    
    if (activeJobCount >= player.maxConcurrentJobs) {
      addMessage('ERROR: Maximum concurrent jobs reached');
      return;
    }
    
    const startTime = Date.now();

    // Initial job message
    addMessage(`\n[CONTRACT START] ${job.name}`);
    addMessage(job.messages[0]);

    // Save job to database
    supabase
      .from('player_jobs')
      .upsert([{
        player_id: session?.user?.id,
        job_id: job.id,
        status: 'in-progress',
        progress: 0,
        start_time: new Date(startTime).toISOString()
      }], {
        onConflict: 'job_id,player_id'
      })
      .then(({ error }) => {
        if (error) {
          addMessage(`ERROR: Failed to save job progress - ${error.message}`);
        }
      });

    const updatedJobs = jobs.map(j => 
      j.id === job.id 
        ? { ...j, status: 'in-progress' as const, startTime }
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
        if (!session?.user?.id || !prevJobs) return prevJobs;
        
        let jobsCompleted = false;
        
        const updatedJobs = prevJobs.map(job => {
          if (job.status !== 'in-progress' || !job.startTime) return job;

          const elapsed = Date.now() - job.startTime;
          const newProgress = Math.min(100, Math.round((elapsed * timeMultiplier / job.duration) * 100));
          
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
            
            // Update job status in database
            supabase
              .from('player_jobs')
              .update({ 
                status: 'completed',
                progress: 100,
                completed_at: new Date().toISOString()
              })
              .eq('job_id', job.id)
              .eq('player_id', session?.user?.id)
              .then(({ error }) => {
                if (error) {
                  addMessage(`ERROR: Failed to update job status - ${error.message}`);
                }
              });
            
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

          // Update progress in database
          const lastUpdate = lastProgressUpdate[job.id] || 0;
          const shouldUpdate = newProgress !== job.progress && 
                             (newProgress === 100 || // Always update on completion
                              Date.now() - lastUpdate >= 2000); // Throttle to every 2 seconds
          
          if (shouldUpdate) {
            setLastProgressUpdate(prev => ({
              ...prev,
              [job.id]: Date.now()
            }));
            
            supabase
              .from('player_jobs')
              .upsert({
                player_id: session.user.id,
                job_id: job.id,
                status: 'in-progress',
                progress: newProgress,
                start_time: job.startTime ? new Date(job.startTime).toISOString() : new Date().toISOString()
              }, {
                onConflict: 'job_id,player_id'
              })
              .then(({ error }) => {
                if (error) {
                  addMessage(`ERROR: Failed to update job progress - ${error.message}`);
                }
              });
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
    }, 50); // Update more frequently

    return () => clearInterval(interval);
  }, [timeMultiplier, session?.user?.id]); // Add session to dependencies

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
            
            {(!player.tutorial_completed && player.tutorial_step === 0) && (
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
            torcoins: player.torcoins + torcoins,
            credits: player.credits + 18000 // Add medium contract reward
          };
          setPlayer(updatedPlayer);
          syncPlayerData({ 
            torcoins: updatedPlayer.torcoins,
            credits: updatedPlayer.credits
          });
          addMessage(`[REWARD] Received ${18000} credits${torcoins > 0 ? ` and ${torcoins} Torcoins!` : '!'}`);
        }}
        onCreateLoadout={createLoadout}
        onEquipLoadout={activateLoadout}
        onInstallComponent={installComponent}
        onUninstallComponent={uninstallComponent}
        onDeleteLoadout={deleteLoadout}
      /></div>}
    </div>
  );
}

export default App;