import { Equipment } from '../types';

export const availableEquipment: Equipment[] = [
  {
    id: 'proc1',
    name: 'Quantum Processor Mk I',
    type: 'processor',
    rarity: 'common',
    level: 1,
    cost: 50000,
    effects: {
      concurrent_jobs: 1,
      job_speed: 10,
    }
  },
  {
    id: 'mem1',
    name: 'Neural Memory Bank',
    type: 'memory',
    rarity: 'common',
    level: 1,
    cost: 30000,
    effects: {
      skill_boost: {
        decryption: 1,
      }
    }
  },
  {
    id: 'sec1',
    name: 'Proxy Tunneling Suite',
    type: 'security',
    rarity: 'common',
    level: 1,
    cost: 40000,
    effects: {
      skill_boost: {
        firewall: 1,
      }
    }
  },
  {
    id: 'sw1',
    name: 'Advanced Cryptography Package',
    type: 'software',
    rarity: 'rare',
    level: 2,
    cost: 180000,
    torcoinCost: 2,
    effects: {
      skill_boost: {
        spoofing: 1,
        decryption: 1,
      }
    }
  },
  {
    id: 'proc2',
    name: 'Quantum Processor Mk II',
    type: 'processor',
    rarity: 'rare',
    level: 2,
    cost: 150000,
    torcoinCost: 1,
    effects: {
      concurrent_jobs: 1,
      job_speed: 25,
    }
  },
  {
    id: 'mem2',
    name: 'Military-Grade Neural Core',
    type: 'memory',
    rarity: 'legendary',
    level: 3,
    cost: 500000,
    torcoinCost: 5,
    effects: {
      skill_boost: {
        decryption: 2,
        firewall: 1,
        spoofing: 1,
      }
    }
  }
];