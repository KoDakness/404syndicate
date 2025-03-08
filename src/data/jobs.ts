import { Job } from '../types';

export const availableJobs: Job[] = [
  {
    id: 'social_phish_001',
    name: 'Password Reset Phishing Attack',
    description: 'Create a convincing security alert to obtain executive credentials.',
    duration: 300000, // 5 minutes
    reward: 25000,
    type: 'social',
    riskLevel: 'high',
    skillRequirements: {
      social: 2,
      spoofing: 1,
    },
    messages: [
      "Analyzing executive communication patterns...",
      "Crafting security alert template...",
      "Spoofing ArasakaCorp security domain...",
      "Deploying fake login portal...",
      "Monitoring credential capture..."
    ],
    difficulty: 'hard',
    faction: 'underground',
    status: 'available',
    progress: 0
  },
  {
    id: 'social_malware_001',
    name: 'Bonus Voucher Malware Campaign',
    description: 'Deploy malware through an enticing employee bonus offer.',
    duration: 240000, // 4 minutes
    reward: 18000,
    type: 'social',
    riskLevel: 'medium',
    skillRequirements: {
      social: 1,
      spoofing: 2,
    },
    messages: [
      "Creating convincing bonus document...",
      "Embedding stealth malware payload...",
      "Bypassing antivirus signatures...",
      "Deploying email campaign...",
      "Monitoring infection status..."
    ],
    difficulty: 'medium',
    faction: 'underground',
    status: 'available',
    progress: 0
  },
  {
    id: 'social_ceo_001',
    name: 'CEO File Transfer Impersonation',
    description: 'Pose as the CEO to obtain confidential corporate files.',
    duration: 180000, // 3 minutes
    reward: 30000,
    type: 'social',
    riskLevel: 'high',
    skillRequirements: {
      social: 3,
      spoofing: 2,
    },
    messages: [
      "Analyzing CEO writing patterns...",
      "Crafting urgent request email...",
      "Spoofing executive email chain...",
      "Deploying time-pressure tactics...",
      "Awaiting file transfer..."
    ],
    difficulty: 'hard',
    faction: 'underground',
    status: 'available',
    progress: 0
  },
  {
    id: 'social_update_001',
    name: 'Fake Security Update Attack',
    description: 'Trick IT staff into installing a compromised security patch.',
    duration: 360000, // 6 minutes
    reward: 35000,
    type: 'social',
    riskLevel: 'high',
    skillRequirements: {
      social: 2,
      spoofing: 3,
    },
    messages: [
      "Preparing fake security update...",
      "Modifying file signatures...",
      "Bypassing security checksum...",
      "Deploying to IT network...",
      "Monitoring installation status..."
    ],
    difficulty: 'hard',
    faction: 'underground',
    status: 'available',
    progress: 0
  },
  {
    id: 'job1',
    name: 'Corporate Firewall Breach',
    description: 'Bypass Arasaka Corp\'s security system to extract employee records.',
    duration: 1200000, // 20 minutes
    reward: 15000,
    type: 'hack',
    riskLevel: 'medium',
    skillRequirements: {
      firewall: 2,
      spoofing: 1,
    },
    messages: [
      "Initializing GhostNet v2.3... | Checking system integrity",
      "MAC address spoof successful | Generating fake credentials",
      "Connection established to ArasakaCorp_SECNET | Ping: 23ms",
      "Proxy chain active | Route: TOK > SEL > HKG > SIN > NYC > LON > BER",
      "Breaching firewall layer 1... | Bypass successful",
      "Breaching firewall layer 2... | Found vulnerability CVE-2025-1337",
      "Extracting employee records... | Progress: 1.3TB/2.1TB",
      "Covering tracks... | Modifying system logs",
      "Mission accomplished | Reward transfer initiated"
    ],
    difficulty: 'medium',
    faction: 'underground',
    status: 'available',
    progress: 0
  },
  {
    id: 'job2',
    name: 'Neural Network Infiltration',
    description: 'Access and manipulate a corporate AI training facility.',
    duration: 3600000, // 1 hour
    reward: 45000,
    type: 'hack',
    riskLevel: 'high',
    skillRequirements: {
      decryption: 3,
    },
    messages: [
      "Establishing connection to research subnet... | Port scan complete",
      "Mapping neural network topology... | Found 7 security layers",
      "Bypassing biometric authentication... | Using synthetic patterns",
      "Accessing training datasets... | Size: 8.7 petabytes",
      "Injecting modified parameters... | Checksum verification in progress",
      "Training model with corrupted data... | Epoch 1/5",
      "Monitoring system response... | No anomalies detected",
      "Finalizing changes... | Updating neural weights",
      "Operation complete | AI successfully compromised"
    ],
    difficulty: 'hard',
    faction: 'underground',
    status: 'available',
    progress: 0
  },
  {
    id: 'job3',
    name: 'Cryptocurrency Heist',
    description: 'Intercept and redirect cryptocurrency transactions.',
    duration: 3600000, // 1 hour
    reward: 50000,
    type: 'exploit',
    riskLevel: 'high',
    skillRequirements: {
      decryption: 2,
      spoofing: 2,
    },
    messages: [
      "Analyzing blockchain network... | Block height: 1,423,897",
      "Scanning for vulnerable nodes... | Found 3 potential targets",
      "Preparing intercept vectors... | Mempool analysis complete",
      "Deploying smart contract exploit... | Gas optimization active",
      "Redirecting transaction flow... | Volume: 125.7 BTC",
      "Laundering through mixer... | Entropy increasing",
      "Covering blockchain traces... | Using zero-knowledge proofs",
      "Funds secured | Transfer complete"
    ],
    difficulty: 'hard',
    faction: 'freelance',
    status: 'available',
    progress: 0
  },
  {
    id: 'job4',
    name: 'Security Audit',
    description: 'Perform legitimate security testing for a corporation.',
    duration: 120000, // 2 minutes
    reward: 5000,
    type: 'analyze',
    riskLevel: 'low',
    skillRequirements: {
      firewall: 1,
    },
    messages: [
      "Initializing security scan... | Protocol: NIST SP 800-53",
      "Testing network endpoints... | 147/312 complete",
      "Analyzing firewall rules... | Found 23 misconfigurations",
      "Scanning for known CVEs... | Database updated",
      "Testing access controls... | OAuth implementation secure",
      "Generating comprehensive report... | Adding recommendations",
      "Audit complete | Security score: 82/100"
    ],
    difficulty: 'easy',
    faction: 'corporate',
    status: 'available',
    progress: 0
  },
  {
    id: 'job5',
    name: 'Data Recovery',
    description: 'Recover deleted files from a secure server.',
    duration: 360000, // 6 minutes
    reward: 15000,
    type: 'decrypt',
    riskLevel: 'medium',
    skillRequirements: {
      decryption: 2,
    },
    messages: [
      "Scanning deleted sectors...",
      "Reconstructing file fragments...",
      "Decrypting recovered data...",
      "Recovery successful"
    ],
    difficulty: 'medium',
    faction: 'corporate',
    status: 'available',
    progress: 0
  },
  {
    id: 'job6',
    name: 'Ghost Protocol',
    description: 'Remove all traces of corporate activity from public networks.',
    duration: 360000, // 6 minutes
    reward: 18000,
    type: 'infiltrate',
    riskLevel: 'medium',
    skillRequirements: {
      spoofing: 2,
      firewall: 1,
    },
    messages: [
      "Identifying digital footprints...",
      "Erasing network logs...",
      "Planting false trails...",
      "Traces eliminated"
    ],
    difficulty: 'medium',
    faction: 'corporate',
    status: 'available',
    progress: 0
  },
  {
    id: 'job7',
    name: 'Black Market Access',
    description: 'Gain entry to an exclusive underground trading network.',
    duration: 1080000, // 18 minutes
    reward: 45000,
    type: 'hack',
    riskLevel: 'high',
    skillRequirements: {
      spoofing: 3,
      decryption: 2,
    },
    messages: [
      "Establishing dark web connection...",
      "Verifying credentials...",
      "Bypassing security checks...",
      "Access granted"
    ],
    difficulty: 'hard',
    faction: 'underground',
    status: 'available',
    progress: 0
  },
  {
    id: 'job8',
    name: 'Prototype Theft',
    description: 'Steal experimental technology blueprints.',
    duration: 1080000, // 18 minutes
    reward: 50000,
    type: 'infiltrate',
    riskLevel: 'high',
    skillRequirements: {
      decryption: 3,
      firewall: 2,
    },
    messages: [
      "Accessing R&D network...",
      "Locating prototype data...",
      "Downloading blueprints...",
      "Extraction complete"
    ],
    difficulty: 'hard',
    faction: 'underground',
    status: 'available',
    progress: 0
  },
  {
    id: 'job9',
    name: 'System Maintenance',
    description: 'Perform routine system updates for a corporate client.',
    duration: 120000, // 2 minutes
    reward: 4500,
    type: 'analyze',
    riskLevel: 'low',
    skillRequirements: {
      firewall: 1,
    },
    messages: [
      "Running diagnostics...",
      "Updating security protocols...",
      "Testing systems...",
      "Maintenance complete"
    ],
    difficulty: 'easy',
    faction: 'corporate',
    status: 'available',
    progress: 0
  },
  {
    id: 'job10',
    name: 'Identity Theft',
    description: 'Create and sell fake digital identities.',
    duration: 360000, // 6 minutes
    reward: 16000,
    type: 'exploit',
    riskLevel: 'medium',
    skillRequirements: {
      spoofing: 2,
    },
    messages: [
      "Gathering identity templates...",
      "Generating credentials...",
      "Validating forgeries...",
      "Identities ready"
    ],
    difficulty: 'medium',
    faction: 'underground',
    status: 'available',
    progress: 0
  },
  {
    id: 'job11',
    name: 'Ransomware Deployment',
    description: 'Deploy ransomware in corporate networks.',
    duration: 1080000, // 18 minutes
    reward: 48000,
    type: 'exploit',
    riskLevel: 'high',
    skillRequirements: {
      decryption: 3,
      spoofing: 2,
    },
    messages: [
      "Preparing ransomware package...",
      "Identifying targets...",
      "Deploying payload...",
      "Ransom demands sent"
    ],
    difficulty: 'hard',
    faction: 'underground',
    status: 'available',
    progress: 0
  },
  {
    id: 'job12',
    name: 'Corporate Espionage',
    description: 'Steal trade secrets from competing corporations.',
    duration: 1080000, // 18 minutes
    reward: 42000,
    type: 'infiltrate',
    riskLevel: 'high',
    skillRequirements: {
      spoofing: 2,
      firewall: 2,
    },
    messages: [
      "Infiltrating corporate network...",
      "Accessing classified files...",
      "Extracting trade secrets...",
      "Mission accomplished"
    ],
    difficulty: 'hard',
    faction: 'corporate',
    status: 'available',
    progress: 0
  },
  {
    id: 'job13',
    name: 'Network Debug',
    description: 'Fix network issues for a legitimate client.',
    duration: 120000, // 2 minutes
    reward: 4800,
    type: 'analyze',
    riskLevel: 'low',
    skillRequirements: {
      firewall: 1,
    },
    messages: [
      "Analyzing network traffic...",
      "Identifying bottlenecks...",
      "Optimizing routing...",
      "Debug complete"
    ],
    difficulty: 'easy',
    faction: 'corporate',
    status: 'available',
    progress: 0
  },
  {
    id: 'job14',
    name: 'AI Manipulation',
    description: 'Reprogram security AI to ignore specific signatures.',
    duration: 360000, // 6 minutes
    reward: 20000,
    type: 'hack',
    riskLevel: 'medium',
    skillRequirements: {
      decryption: 2,
      spoofing: 2,
    },
    messages: [
      "Accessing AI core...",
      "Modifying recognition patterns...",
      "Implementing backdoor...",
      "AI successfully modified"
    ],
    difficulty: 'medium',
    faction: 'underground',
    status: 'available',
    progress: 0
  },
  {
    id: 'job15',
    name: 'Database Encryption',
    description: 'Encrypt sensitive corporate databases.',
    duration: 120000, // 2 minutes
    reward: 5200,
    type: 'analyze',
    riskLevel: 'low',
    skillRequirements: {
      decryption: 1,
    },
    messages: [
      "Preparing encryption protocols...",
      "Backing up data...",
      "Applying encryption...",
      "Database secured"
    ],
    difficulty: 'easy',
    faction: 'corporate',
    status: 'available',
    progress: 0
  },
  {
    id: 'social1',
    name: 'Corporate Phishing Campaign',
    description: 'Create a convincing email to trick corporate employees into revealing sensitive data.',
    duration: 300000, // 5 minutes
    reward: 12000,
    type: 'social',
    riskLevel: 'medium',
    skillRequirements: {
      social: 1,
      spoofing: 1,
    },
    messages: [
      "Analyzing corporate communication patterns...",
      "Crafting email template...",
      "Spoofing sender address...",
      "Deploying phishing campaign...",
      "Collecting responses..."
    ],
    difficulty: 'medium',
    faction: 'underground',
    status: 'available',
    progress: 0
  },
  {
    id: 'social2',
    name: 'Executive Impersonation',
    description: 'Pose as a high-ranking executive to request an emergency fund transfer.',
    duration: 600000, // 10 minutes
    reward: 25000,
    type: 'social',
    riskLevel: 'high',
    skillRequirements: {
      social: 2,
      spoofing: 2,
    },
    messages: [
      "Building executive profile...",
      "Mimicking writing style...",
      "Creating urgent scenario...",
      "Sending transfer request...",
      "Monitoring response..."
    ],
    difficulty: 'hard',
    faction: 'underground',
    status: 'available',
    progress: 0
  },
  {
    id: 'social3',
    name: 'Help Desk Infiltration',
    description: 'Convince IT support to reset credentials for a "locked" account.',
    duration: 240000, // 4 minutes
    reward: 8000,
    type: 'social',
    riskLevel: 'low',
    skillRequirements: {
      social: 1,
    },
    messages: [
      "Researching company protocols...",
      "Preparing support ticket...",
      "Engaging with help desk...",
      "Following up on request...",
      "Access granted..."
    ],
    difficulty: 'easy',
    faction: 'underground',
    status: 'available',
    progress: 0
  }
];