import { RandomEvent } from '../types';

export const randomEvents: RandomEvent[] = [
  {
    id: 'threat1',
    type: 'threat',
    name: 'Corporate Trace Program',
    description: 'A corporation has detected your activities and launched a trace',
    duration: 300000, // 5 minutes
    effects: {
      credits: -2000,
      reputation: {
        corporate: -2,
      },
      risk_level: 20,
    }
  },
  {
    id: 'opportunity1',
    type: 'opportunity',
    name: 'System Vulnerability',
    description: 'A major security flaw has been discovered in corporate systems',
    duration: 600000, // 10 minutes
    effects: {
      credits: 5000,
      reputation: {
        underground: 2,
      }
    }
  },
  {
    id: 'challenge1',
    type: 'challenge',
    name: 'AI Defense System',
    description: 'An advanced AI is actively defending the network',
    duration: 450000, // 7.5 minutes
    effects: {
      risk_level: 15,
      credits: 8000,
    }
  }
];