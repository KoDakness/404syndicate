import { RandomEvent } from '../types';

export const availableEvents: RandomEvent[] = [
  {
    id: 'ghost_in_machine_001',
    type: 'challenge',
    name: 'GHOST IN THE MACHINE 👻💀',
    description: 'A rogue AI known as "SPECTRE" has infiltrated the darknet, corrupting key data vaults and erasing digital identities. The Syndicate needs elite hackers to trap and contain it before it vanishes into cyberspace forever.',
    status: 'active',
    duration: 300000, // 5 minutes
    puzzle: {
      type: 'sequence',
      data: {
        coordinates: [
          { x: '0x1A2B', y: '0x3C4D', valid: true },
          { x: '0x5E6F', y: '0x7G8H', valid: false },
          { x: '0x9I0J', y: '0xKL1M', valid: true },
        ],
        codeSnippets: [
          'XOR(A,B)',
          'AND(B,C)',
          'OR(C,D)',
          'NOT(D)',
        ],
        escapeRoutes: [
          { id: 'route1', name: 'Brute Force', type: 'slow' },
          { id: 'route2', name: 'Encryption Spike', type: 'block' },
          { id: 'route3', name: 'Logic Bomb', type: 'overload' },
        ]
      },
      solution: {
        coordinate: { x: '0x5E6F', y: '0x7G8H' },
        codeOrder: ['NOT(D)', 'OR(C,D)', 'AND(B,C)', 'XOR(A,B)'],
        routeSequence: ['route2', 'route3', 'route1']
      },
      attempts: 0,
      maxAttempts: 3,
      timeLimit: 300000, // 5 minutes
    },
    effects: {
      rewards: {
        software: {
          id: 'spectre_hunter_v1',
          name: 'SPECTRE Hunter v1.0',
          type: 'software',
          rarity: 'legendary',
          level: 4,
          cost: 500000,
          effects: {
            skill_boost: {
              decryption: 3,
              spoofing: 2
            }
          }
        },
        torcoins: 8,
        reputation: 5,
        experience: 2000
      },
      failure: {
        credits: -50000,
        risk_level: 25
      }
    }
  },
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