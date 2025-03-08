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
  };
  riskLevel: 'low' | 'medium' | 'high';
  type: 'hack' | 'decrypt' | 'infiltrate' | 'analyze' | 'exploit';
  difficulty: 'easy' | 'medium' | 'hard';
  faction: 'corporate' | 'underground' | 'freelance';
  messages: string[];
  status: 'available' | 'in-progress' | 'completed';
  progress: number; // 0-100
  startTime?: number;
}

export interface Equipment {
  id: string;
  name: string;
  rarity: 'common' | 'rare' | 'legendary';
  type: 'processor' | 'memory' | 'security' | 'software';
  level: number;
  cost: number;
  torcoinCost?: number;
  effects: {
    concurrent_jobs?: number;
    job_speed?: number;
    skill_boost?: {
      decryption?: number;
      firewall?: number;
      spoofing?: number;
    };
  };
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
  description: string;
  status?: 'active' | 'completed' | 'failed';
  puzzle?: {
    type: 'sequence' | 'proxy' | 'unscramble';
    data: any;
    solution: any;
    attempts: number;
    maxAttempts: number;
    timeLimit: number;
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
  lastRefresh: string | null;
  reputation: {
    corporate: number;
    underground: number;
  };
  equipment: {
    equipped: Equipment[];
    inventory: Equipment[];
  };
  inventory: BlackMarketItem[];
  activeEvents: RandomEvent[];
  level: number;
  experience: number;
  maxConcurrentJobs: number;
  skills: {
    decryption: number;
    firewall: number;
    spoofing: number;
    skillPoints: number;
  };
  activeJobs: string[];
}