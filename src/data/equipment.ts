import { Equipment } from '../types';

// Core PC Builds (Base Equipment)
const baseEquipment: Equipment[] = [
  {
    id: 'base_black_ice_mk1',
    name: 'Black Ice MK-1',
    description: 'Custom-built cyberdeck optimized for deep web infiltration',
    type: 'base',
    rarity: 'rare',
    level: 2,
    cost: 75000,
    stats: {
      processing: 15,
      stealth: 20,
      security: 10
    },
    specialEffects: [
      {
        name: 'Deep Web Mastery',
        description: 'Increases success rate of darknet operations',
        effect: 'darknet_boost'
      }
    ]
  },
  {
    id: 'base_specter_9',
    name: 'Specter-9',
    description: 'Compact, low-power stealth rig for covert ops',
    type: 'base',
    rarity: 'rare',
    level: 2,
    cost: 85000,
    stats: {
      stealth: 25,
      security: 15,
      stability: 10
    },
    specialEffects: [
      {
        name: 'Ghost Protocol',
        description: 'Reduces trace detection chance',
        effect: 'stealth_boost'
      }
    ]
  },
  {
    id: 'base_titanium_node',
    name: 'Titanium Node',
    description: 'High-security workstation resistant to tracebacks',
    type: 'base',
    rarity: 'rare',
    level: 2,
    cost: 95000,
    stats: {
      security: 25,
      stability: 20,
      processing: 10
    },
    specialEffects: [
      {
        name: 'Fortress Protocol',
        description: 'Enhanced protection against counter-hacks',
        effect: 'defense_boost'
      }
    ]
  }
];

// Motherboards
const motherboards: Equipment[] = [
  {
    id: 'mb_neural_nexus_x',
    name: 'Neural Nexus X',
    description: 'Increases overall hacking efficiency by 10%',
    type: 'motherboard',
    rarity: 'rare',
    level: 2,
    cost: 120000,
    slotCount: 4,
    stats: {
      processing: 10,
      memory: 10,
      stability: 10
    },
    specialEffects: [
      {
        name: 'Efficiency Boost',
        description: 'All operations complete 10% faster',
        effect: 'speed_boost'
      }
    ]
  },
  {
    id: 'mb_quantum_weave_m7',
    name: 'Quantum Weave M7',
    description: 'Reduces detection risk on failed hacks',
    type: 'motherboard',
    rarity: 'rare',
    level: 2,
    cost: 150000,
    slotCount: 4,
    stats: {
      security: 15,
      stealth: 15,
      stability: 10
    },
    specialEffects: [
      {
        name: 'Quantum Shield',
        description: 'Failed hacks have 50% less chance of triggering alarms',
        effect: 'failure_protection'
      }
    ]
  },
  {
    id: 'mb_daemonlink_zeta',
    name: 'Daemonlink Zeta',
    description: 'Boosts performance in deception-based exploits',
    type: 'motherboard',
    rarity: 'rare',
    level: 2,
    cost: 135000,
    slotCount: 4,
    stats: {
      processing: 12,
      memory: 15,
      stealth: 13
    },
    specialEffects: [
      {
        name: 'Deception Master',
        description: 'Social engineering attacks are 25% more effective',
        effect: 'social_boost'
      }
    ]
  }
];

// Components
const components: Equipment[] = [
  // CPUs
  {
    id: 'cpu_overclocked_cortex_x',
    name: 'Overclocked Cortex-X',
    description: 'Increases speed for brute-force attacks',
    type: 'component',
    componentType: 'cpu',
    rarity: 'rare',
    level: 2,
    cost: 45000,
    stats: {
      processing: 25,
      stability: -5
    },
    specialEffects: [
      {
        name: 'Brute Force Specialist',
        description: 'Password cracking attempts are 30% faster',
        effect: 'crack_speed_boost'
      }
    ]
  },
  {
    id: 'cpu_neural_threadripper',
    name: 'Neural Threadripper',
    description: 'Optimized for deep-learning password cracks',
    type: 'component',
    componentType: 'cpu',
    rarity: 'rare',
    level: 2,
    cost: 55000,
    stats: {
      processing: 20,
      memory: 15
    },
    specialEffects: [
      {
        name: 'Neural Enhancement',
        description: 'AI-assisted operations are 40% more effective',
        effect: 'ai_boost'
      }
    ]
  },
  {
    id: 'cpu_phantom_core',
    name: 'Phantom Core',
    description: 'Reduces overheating when running multiple scripts',
    type: 'component',
    componentType: 'cpu',
    rarity: 'rare',
    level: 2,
    cost: 48000,
    stats: {
      processing: 18,
      stability: 15,
      cooling: 20
    },
    specialEffects: [
      {
        name: 'Cool Operations',
        description: 'Eliminates performance penalties from running multiple scripts',
        effect: 'heat_reduction'
      }
    ]
  },
  {
    id: 'cpu_stealth_protocol_2',
    name: 'Stealth Protocol-2',
    description: 'Makes script execution harder to detect',
    type: 'component',
    componentType: 'cpu',
    rarity: 'rare',
    level: 2,
    cost: 52000,
    stats: {
      processing: 15,
      stealth: 25
    },
    specialEffects: [
      {
        name: 'Ghost Execution',
        description: 'Scripts have 35% less chance of being detected',
        effect: 'stealth_boost'
      }
    ]
  },

  // RAM
  {
    id: 'ram_ghost_ram_256',
    name: 'GhostRAM 256GB',
    description: 'Allows running multiple social engineering scripts at once',
    type: 'component',
    componentType: 'ram',
    rarity: 'rare',
    level: 2,
    cost: 42000,
    stats: {
      memory: 25,
      stealth: 15
    },
    specialEffects: [
      {
        name: 'Multi-Threading',
        description: 'Can run an additional social engineering script',
        effect: 'social_multitask'
      }
    ]
  },
  {
    id: 'ram_neural_expansion',
    name: 'Neural Expansion Kit',
    description: 'Boosts the success rate of deception-based attacks',
    type: 'component',
    componentType: 'ram',
    rarity: 'rare',
    level: 2,
    cost: 46000,
    stats: {
      memory: 20,
      processing: 15
    },
    specialEffects: [
      {
        name: 'Enhanced Deception',
        description: 'Deception attacks have 25% higher success rate',
        effect: 'deception_boost'
      }
    ]
  },
  {
    id: 'ram_eclipse_cache_x',
    name: 'Eclipse Cache-X',
    description: 'Stores keystroke data for quicker password retrieval',
    type: 'component',
    componentType: 'ram',
    rarity: 'rare',
    level: 2,
    cost: 44000,
    stats: {
      memory: 22,
      processing: 12
    },
    specialEffects: [
      {
        name: 'Keystroke Cache',
        description: 'Password cracking becomes more effective with each attempt',
        effect: 'learning_boost'
      }
    ]
  },
  {
    id: 'ram_hyperthread_synapse',
    name: 'HyperThread Synapse',
    description: 'Improves AI-generated phishing attempts',
    type: 'component',
    componentType: 'ram',
    rarity: 'rare',
    level: 2,
    cost: 48000,
    stats: {
      memory: 20,
      processing: 18
    },
    specialEffects: [
      {
        name: 'AI Enhancement',
        description: 'Phishing attacks are 30% more convincing',
        effect: 'phishing_boost'
      }
    ]
  },

  // Storage
  {
    id: 'storage_dark_vault_ssd',
    name: 'DarkVault SSD',
    description: 'Reduces traceable logs after an intrusion',
    type: 'component',
    componentType: 'storage',
    rarity: 'rare',
    level: 2,
    cost: 38000,
    stats: {
      storage: 20,
      stealth: 20
    },
    specialEffects: [
      {
        name: 'Log Elimination',
        description: 'Automatically erases 75% of operation traces',
        effect: 'trace_reduction'
      }
    ]
  },
  {
    id: 'storage_shadow_archive',
    name: 'ShadowArchive',
    description: 'Stores stolen credentials with encryption',
    type: 'component',
    componentType: 'storage',
    rarity: 'rare',
    level: 2,
    cost: 42000,
    stats: {
      storage: 25,
      security: 15
    },
    specialEffects: [
      {
        name: 'Secure Storage',
        description: 'Stolen data cannot be traced back to you',
        effect: 'secure_storage'
      }
    ]
  },
  {
    id: 'storage_cloaked_drive_v3',
    name: 'Cloaked Drive V3',
    description: 'Auto-wipes failed hack attempts',
    type: 'component',
    componentType: 'storage',
    rarity: 'rare',
    level: 2,
    cost: 40000,
    stats: {
      storage: 18,
      stealth: 22
    },
    specialEffects: [
      {
        name: 'Failed Attempt Purge',
        description: 'Failed hacks leave no trace',
        effect: 'failure_cleanup'
      }
    ]
  },
  {
    id: 'storage_data_leech_mk2',
    name: 'Data Leech MK2',
    description: 'Increases loot stolen from corporate servers',
    type: 'component',
    componentType: 'storage',
    rarity: 'rare',
    level: 2,
    cost: 45000,
    stats: {
      storage: 30,
      processing: 10
    },
    specialEffects: [
      {
        name: 'Enhanced Extraction',
        description: 'Steal 50% more data per operation',
        effect: 'loot_boost'
      }
    ]
  },

  // GPUs
  {
    id: 'gpu_black_phantom_gtx',
    name: 'Black Phantom GTX',
    description: 'Renders fake IDs faster for social engineering',
    type: 'component',
    componentType: 'gpu',
    rarity: 'rare',
    level: 2,
    cost: 58000,
    stats: {
      graphics: 25,
      processing: 15
    },
    specialEffects: [
      {
        name: 'Rapid Forgery',
        description: 'ID generation is 40% faster',
        effect: 'forge_speed_boost'
      }
    ]
  },
  {
    id: 'gpu_mirage_vortex_x',
    name: 'Mirage Vortex X',
    description: 'Enhances firewall evasion techniques',
    type: 'component',
    componentType: 'gpu',
    rarity: 'rare',
    level: 2,
    cost: 62000,
    stats: {
      graphics: 20,
      stealth: 20
    },
    specialEffects: [
      {
        name: 'Visual Masking',
        description: 'Firewall detection rate reduced by 35%',
        effect: 'firewall_evasion'
      }
    ]
  },
  {
    id: 'gpu_quantum_render',
    name: 'Quantum Render Chip',
    description: 'Optimizes deepfake creation for deception',
    type: 'component',
    componentType: 'gpu',
    rarity: 'rare',
    level: 2,
    cost: 65000,
    stats: {
      graphics: 30,
      processing: 10
    },
    specialEffects: [
      {
        name: 'Deepfake Mastery',
        description: 'Generated deepfakes are 45% more convincing',
        effect: 'deepfake_boost'
      }
    ]
  },
  {
    id: 'gpu_illusionist_9000',
    name: 'Illusionist-9000',
    description: 'Generates AI-based voice & face spoofing',
    type: 'component',
    componentType: 'gpu',
    rarity: 'rare',
    level: 2,
    cost: 68000,
    stats: {
      graphics: 25,
      processing: 15
    },
    specialEffects: [
      {
        name: 'Perfect Mimicry',
        description: 'Voice and face spoofing is nearly undetectable',
        effect: 'spoof_master'
      }
    ]
  }
];

// Legendary Equipment
const legendaryEquipment: Equipment[] = [
  // Legendary PC Builds
  {
    id: 'legendary_oblivion_terminal',
    name: 'Oblivion Terminal',
    description: 'A prototype hacking rig built from military-grade AI processors',
    type: 'base',
    rarity: 'legendary',
    level: 3,
    cost: 500000,
    torcoinCost: 25,
    stats: {
      processing: 50,
      security: 40,
      stability: 35
    },
    specialEffects: [
      {
        name: 'Instant Breach',
        description: 'Can instantly complete a brute-force attack once per contract',
        effect: 'instant_breach',
        cooldown: 3600000 // 1 hour
      }
    ]
  },
  {
    id: 'legendary_daemonforge',
    name: 'Daemonforge',
    description: 'Advanced multi-tasking system with increased risk',
    type: 'base',
    rarity: 'legendary',
    level: 3,
    cost: 450000,
    torcoinCost: 20,
    stats: {
      processing: 45,
      memory: 40,
      stability: -20
    },
    specialEffects: [
      {
        name: 'Parallel Processing',
        description: 'Run two contracts simultaneously with 50% increased trace risk',
        effect: 'dual_contract'
      }
    ]
  },
  {
    id: 'legendary_black_widow_node',
    name: 'Black Widow Node',
    description: 'Advanced system capable of controlling botnets',
    type: 'base',
    rarity: 'legendary',
    level: 3,
    cost: 550000,
    torcoinCost: 30,
    stats: {
      processing: 40,
      security: 45,
      stealth: 35
    },
    specialEffects: [
      {
        name: 'Botnet Control',
        description: 'Can hijack and control botnets for DDoS attacks',
        effect: 'botnet_master'
      }
    ]
  },

  // Legendary Motherboards
  {
    id: 'legendary_neural_overlord_z999',
    name: 'Neural Overlord Z999',
    description: 'Revolutionary dual-CPU motherboard',
    type: 'motherboard',
    rarity: 'legendary',
    level: 3,
    cost: 400000,
    torcoinCost: 20,
    slotCount: 6,
    stats: {
      processing: 35,
      memory: 30,
      stability: 25
    },
    specialEffects: [
      {
        name: 'Dual CPU Support',
        description: 'Can install and utilize two CPU components',
        effect: 'dual_cpu'
      }
    ]
  },
  {
    id: 'legendary_phantom_matrix',
    name: 'Phantom Matrix',
    description: 'Advanced stealth system with failure protection',
    type: 'motherboard',
    rarity: 'legendary',
    level: 3,
    cost: 380000,
    torcoinCost: 18,
    slotCount: 5,
    stats: {
      stealth: 40,
      security: 35,
      stability: 25
    },
    specialEffects: [
      {
        name: 'Failure Shield',
        description: 'Prevents one failed hack from triggering alerts per contract',
        effect: 'failure_protection'
      }
    ]
  },
  {
    id: 'legendary_quantum_paradox_x',
    name: 'Quantum Paradox X',
    description: 'Quantum computing motherboard for encryption breaking',
    type: 'motherboard',
    rarity: 'legendary',
    level: 3,
    cost: 420000,
    torcoinCost: 22,
    slotCount: 5,
    stats: {
      processing: 45,
      memory: 35,
      stability: 20
    },
    specialEffects: [
      {
        name: 'Quantum Breakthrough',
        description: 'Reduces encryption cracking time by 75%',
        effect: 'quantum_crack'
      }
    ]
  }
];

// Combine all equipment
export const availableEquipment: Equipment[] = [
  ...baseEquipment,
  ...motherboards,
  ...components,
  ...legendaryEquipment
];