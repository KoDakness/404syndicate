import { Equipment } from '../types';

// Core PC Builds (Base Equipment)
const baseEquipment: Equipment[] = [
  {
    id: 'base_black_ice_mk1',
    name: 'Black Ice MK-1',
    description: 'Custom-built cyberdeck optimized for deep web infiltration',
    type: 'base',
    rarity: 'common',
    level: 2,
    cost: 75000,
    stats: {
      decryption: 2,
      firewall: 1,
      spoofing: 3
    },
    specialEffects: [
      {
        name: 'Credit Booster',
        description: '5% more credits earned on contract completion',
        effect: 'credit_boost'
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
      spoofing: 3,
      firewall: 2,
      social: 1
    },
    specialEffects: [
      {
        name: 'Credit Booster',
        description: '10% more credits earned on contract completion',
        effect: 'credit_boost'
      }
    ]
  },
  {
    id: 'base_titanium_node',
    name: 'Titanium Node',
    description: 'High-security workstation resistant to tracebacks',
    type: 'base',
    rarity: 'legendary',
    level: 2,
    cost: 95000,
    stats: {
      firewall: 3,
      decryption: 2,
      social: 1
    },
    specialEffects: [
      {
        name: 'Credit Booster',
        description: '15% more credits earned on contract completion',
        effect: 'credit_boost'
      }
    ]
  }
];

// Motherboards
const motherboards: Equipment[] = [
  {
    id: 'mb_neural_nexus_x',
    name: 'Neural Nexus X',
    description: 'Increases overall hacking efficiency',
    type: 'motherboard',
    rarity: 'rare',
    level: 2,
    cost: 120000,
    slotCount: 4,
    stats: {
      decryption: 2,
      spoofing: 2,
      firewall: 2
    },
    specialEffects: [
      {
        name: 'Experience Boost',
        description: '10% XP boost from completed contracts',
        effect: 'exp_boost'
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
      firewall: 3,
      spoofing: 2,
      social: 1
    },
    specialEffects: [
      {
        name: 'Contract Multitasker',
        description: '+1 to maximum concurrent contracts',
        effect: 'max_contracts_boost'
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
      social: 3,
      decryption: 2,
      spoofing: 1
    },
    specialEffects: [
      {
        name: 'Hard Contract Hunter',
        description: 'Double chance at hard contracts on refresh',
        effect: 'hard_contract_boost'
      }
    ]
  },
  {
    id: 'mb_wraith_matrix',
    name: 'Wraith Matrix',
    description: 'Ultra-rare experimental motherboard with quantum entanglement computing',
    type: 'motherboard',
    rarity: 'legendary',
    level: 3,
    cost: 10000000,
    torcoinCost: 5,
    slotCount: 6,
    stats: {
      decryption: 5,
      firewall: 5,
      social: 5,
      spoofing: 5
    },
    specialEffects: [
      {
        name: 'Wraith Hunter',
        description: '1% chance to earn the ultra-rare WraithCoin from completed contracts',
        effect: 'wraithcoin_chance_boost'
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
      decryption: 3,
      firewall: -1
    },
    specialEffects: [
      {
        name: 'Speed Daemon',
        description: 'Increases contract completion time by 15%',
        effect: 'completion_time_boost'
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
      decryption: 2,
      spoofing: 2
    },
    specialEffects: [
      {
        name: 'Credit Booster',
        description: '20% more credits earned on contract completion',
        effect: 'credit_boost'
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
      decryption: 2,
      firewall: 2
    },
    specialEffects: [
      {
        name: 'Contract Multitasker',
        description: '+1 to maximum concurrent contracts',
        effect: 'max_contracts_boost'
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
      decryption: 1,
      spoofing: 3
    },
    specialEffects: [
      {
        name: 'Torcoin Hunter',
        description: '5% extra chance to receive a torcoin on completion',
        effect: 'torcoin_chance_boost'
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
      social: 3,
      spoofing: 1
    },
    specialEffects: [
      {
        name: 'Experience Boost',
        description: '10% XP boost from completed contracts',
        effect: 'exp_boost'
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
      social: 2,
      decryption: 2
    },
    specialEffects: [
      {
        name: 'Hard Contract Hunter',
        description: 'Double chance at hard contracts on refresh',
        effect: 'hard_contract_boost'
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
      social: 2,
      decryption: 2
    },
    specialEffects: [
      {
        name: 'Credit Booster',
        description: '20% more credits earned on contract completion',
        effect: 'credit_boost'
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
      social: 3,
      decryption: 1
    },
    specialEffects: [
      {
        name: 'Contract Multitasker',
        description: '+1 to maximum concurrent contracts',
        effect: 'max_contracts_boost'
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
      firewall: 2,
      spoofing: 2
    },
    specialEffects: [
      {
        name: 'Easy Money',
        description: 'All contracts will be easy and reward 50% credits',
        effect: 'easy_contracts'
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
      firewall: 3,
      decryption: 1
    },
    specialEffects: [
      {
        name: 'Torcoin Hunter',
        description: '5% extra chance to receive a torcoin on completion',
        effect: 'torcoin_chance_boost'
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
      firewall: 2,
      spoofing: 2
    },
    specialEffects: [
      {
        name: 'Speed Daemon',
        description: 'Increases contract completion time by 15%',
        effect: 'completion_time_boost'
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
      firewall: 3,
      decryption: 1
    },
    specialEffects: [
      {
        name: 'Credit Booster',
        description: '20% more credits earned on contract completion',
        effect: 'credit_boost'
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
      social: 3,
      decryption: 1
    },
    specialEffects: [
      {
        name: 'Experience Boost',
        description: '10% XP boost from completed contracts',
        effect: 'exp_boost'
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
      spoofing: 3,
      firewall: 1
    },
    specialEffects: [
      {
        name: 'Hard Contract Hunter',
        description: 'Double chance at hard contracts on refresh',
        effect: 'hard_contract_boost'
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
      social: 3,
      spoofing: 1
    },
    specialEffects: [
      {
        name: 'Credit Booster',
        description: '20% more credits earned on contract completion',
        effect: 'credit_boost'
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
      social: 2,
      spoofing: 2
    },
    specialEffects: [
      {
        name: 'Easy Money',
        description: 'All contracts will be easy and reward 50% credits',
        effect: 'easy_contracts'
      }
    ]
  },
  {
    id: 'gpu_wraith_processor',
    name: 'Wraith Processor',
    description: 'Ultra-rare quantum computing chip with multidimensional processing',
    type: 'component',
    componentType: 'gpu',
    rarity: 'legendary',
    level: 3,
    cost: 10000000,
    torcoinCost: 5,
    stats: {
      social: 4,
      spoofing: 4,
      decryption: 4
    },
    specialEffects: [
      {
        name: 'Wraith Hunter',
        description: '1% chance to earn the ultra-rare WraithCoin from completed contracts',
        effect: 'wraithcoin_chance_boost'
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
      decryption: 5,
      firewall: 4, 
      spoofing: 3
    },
    specialEffects: [
      {
        name: 'Ultimate Boost',
        description: 'Combines Speed Daemon, Credit Booster and Torcoin Hunter effects',
        effect: 'multi_boost'
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
      decryption: 4,
      social: 4,
      firewall: -2
    },
    specialEffects: [
      {
        name: 'Contract Master',
        description: '+2 to maximum concurrent contracts',
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
      firewall: 4,
      spoofing: 4,
      social: 4
    },
    specialEffects: [
      {
        name: 'Master of All',
        description: 'Combines Experience Boost, Credit Booster and Hard Contract Hunter',
        effect: 'master_of_all'
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
      decryption: 5,
      social: 3,
      firewall: 2
    },
    specialEffects: [
      {
        name: 'Ultimate Booster',
        description: '30% more credits earned and 20% XP boost',
        effect: 'dual_boost'
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
      spoofing: 5,
      firewall: 3,
      social: 2
    },
    specialEffects: [
      {
        name: 'Torcoin Master',
        description: '10% chance to receive a torcoin on completion',
        effect: 'advanced_torcoin_boost'
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
      decryption: 6,
      social: 3,
      firewall: 1
    },
    specialEffects: [
      {
        name: 'Contract Accelerator',
        description: 'Increases contract completion time by 25%',
        effect: 'advanced_completion_boost'
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