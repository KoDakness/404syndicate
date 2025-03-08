import { BlackMarketItem } from '../types';

export const blackMarketItems: BlackMarketItem[] = [
  {
    id: 'exp1',
    name: 'Corporate Network Backdoor',
    description: 'Pre-configured exploit for major corporate systems',
    cost: 15000,
    type: 'exploit',
    rarity: 'rare',
    effects: {
      skill_boost: 2,
      reputation_boost: 1,
    }
  },
  {
    id: 'tool1',
    name: 'Ghost Protocol Suite',
    description: 'Advanced tools for network infiltration',
    cost: 8000,
    type: 'tool',
    rarity: 'common',
    effects: {
      risk_reduction: 15,
    }
  },
  {
    id: 'data1',
    name: 'Encrypted Corporate Database',
    description: 'Valuable corporate secrets and access codes',
    cost: 25000,
    type: 'data',
    rarity: 'legendary',
    effects: {
      reputation_boost: 3,
      skill_boost: 1,
    }
  }
];