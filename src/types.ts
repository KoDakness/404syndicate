export interface Job {
  id: string;
  name: string;
  description: string;
  duration: number; // in milliseconds
  reward: number;
  skillRequirements?: {
    decryption?: number;
    firewall?: number;
    spoofing?: number;
    social?: number;
  };
  riskLevel: 'low' | 'medium' | 'high';
  type: 'hack' | 'decrypt' | 'infiltrate' | 'analyze' | 'exploit' | 'social';
  difficulty: 'easy' | 'medium' | 'hard';
  faction: 'corporate' | 'underground' | 'freelance';
  messages: string[];
  status: 'available' | 'in-progress' | 'completed';
  progress: number; // 0-100
  startTime?: number;
  forcedAccept?: boolean; // Flag for contracts accepted without required skills
}

export interface Equipment {
  id: string;
  name: string;
  type: 'base' | 'motherboard' | 'component';
  componentType?: 'cpu' | 'ram' | 'storage' | 'gpu';
  rarity: 'common' | 'rare' | 'legendary';
  level: number;
  cost: number;
  torcoinCost?: number;
  stats: {
    decryption?: number;
    firewall?: number;
    spoofing?: number;
    social?: number;
  };
  specialEffects: {
    name: string;
    description: string;
    effect: string;
    cooldown?: number;
    uses?: number;
    chance?: number;
  }[];
  slotCount?: number;
  installedComponents?: {
    [slot: string]: string; // component ID
  };
}

export interface EquipmentLoadout {
  id: string;
  baseId: string;
  motherboardId: string;
  installedComponents: {
    [slot: string]: string;
  };
  active: boolean;
  stats: Equipment['stats'];
  specialEffects: Equipment['specialEffects'];
}

export interface BlackMarketItem {
  id: string;
  name: string;
  description: string;
  cost: number;
  type: 'exploit' | 'tool' | 'data';
  rarity: 'common' | 'rare' | 'legendary';
  effects: {
    skill_boost?: number;
    reputation_boost?: number;
    risk_reduction?: number;
  };
}

export interface RandomEvent {
  id: string;
  type: 'threat' | 'opportunity' | 'challenge';
  name: string;
  attempts: number;
  max_attempts: number;
  lockout_until: string | null;
  description: string;
  status?: 'active' | 'completed' | 'failed';
  puzzle?: {
    type: 'sequence' | 'proxy' | 'unscramble';
    data: any;
    solution: any;
    attempts: number;
    maxAttempts: number;
    timeLimit: number;
    torcoinChance: number;
  };
  duration: number;
  effects: {
    credits?: number;
    reputation?: {
      corporate?: number;
      underground?: number;
    };
    risk_level?: number;
    rewards?: {
      software?: Equipment;
      darkCredits?: number;
      reputation?: number;
    };
  };
}

export interface Player {
  credits: number;
  torcoins: number;
  wraithcoins: number;
  last_contract_refresh: string | null;
  next_contract_refresh: string | null;
  next_manual_refresh?: string | null;
  manual_refresh_available: boolean;
  reputation: {
    corporate: number;
    underground: number;
  };
  inventory: {
    bases?: Equipment[];
    motherboards?: Equipment[];
    components?: Equipment[];
  };
  loadouts: EquipmentLoadout[];
  activeLoadout?: string;
  level: number;
  experience: number;
  maxConcurrentJobs: number;
  tutorial_completed: boolean;
  tutorial_step: number;
  tutorial_seen_features: string[];
  skills: {
    decryption: number;
    firewall: number;
    spoofing: number;
    social: number;
    skillPoints: number;
  };
  activeJobs: string[];
}