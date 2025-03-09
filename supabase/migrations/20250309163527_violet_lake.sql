/*
  # Insert Initial Equipment Data
  
  1. Equipment Inserts
     - Insert base systems
     - Insert motherboards
     - Insert components (CPUs, RAM, storage, GPUs)
  
  2. Purpose
     - Populates the equipment database with initial hardware options
     - Provides a variety of options for players to purchase
*/

-- Base Systems
INSERT INTO equipment_bases (name, description, rarity, base_stats, special_effects, cost, torcoin_cost)
SELECT 'Black Ice MK-1', 'Custom-built cyberdeck optimized for deep web infiltration', 'rare', 
   '{"processing": 15, "stealth": 20, "security": 10}'::jsonb,
   ARRAY['{"name": "Deep Web Mastery", "description": "Increases success rate of darknet operations", "effect": "darknet_boost"}'::jsonb],
   75000, NULL
WHERE NOT EXISTS (
  SELECT 1 FROM equipment_bases WHERE name = 'Black Ice MK-1'
);
   
INSERT INTO equipment_bases (name, description, rarity, base_stats, special_effects, cost, torcoin_cost)
SELECT 'Specter-9', 'Compact, low-power stealth rig for covert ops', 'rare', 
   '{"stealth": 25, "security": 15, "stability": 10}'::jsonb,
   ARRAY['{"name": "Ghost Protocol", "description": "Reduces trace detection chance", "effect": "stealth_boost"}'::jsonb],
   85000, NULL
WHERE NOT EXISTS (
  SELECT 1 FROM equipment_bases WHERE name = 'Specter-9'
);
   
INSERT INTO equipment_bases (name, description, rarity, base_stats, special_effects, cost, torcoin_cost)
SELECT 'Titanium Node', 'High-security workstation resistant to tracebacks', 'rare', 
   '{"security": 25, "stability": 20, "processing": 10}'::jsonb,
   ARRAY['{"name": "Fortress Protocol", "description": "Enhanced protection against counter-hacks", "effect": "defense_boost"}'::jsonb],
   95000, NULL
WHERE NOT EXISTS (
  SELECT 1 FROM equipment_bases WHERE name = 'Titanium Node'
);
   
INSERT INTO equipment_bases (name, description, rarity, base_stats, special_effects, cost, torcoin_cost)
SELECT 'Oblivion Terminal', 'A prototype hacking rig built from military-grade AI processors', 'legendary', 
   '{"processing": 50, "security": 40, "stability": 35}'::jsonb,
   ARRAY['{"name": "Instant Breach", "description": "Can instantly complete a brute-force attack once per contract", "effect": "instant_breach", "cooldown": 3600000}'::jsonb],
   500000, 25
WHERE NOT EXISTS (
  SELECT 1 FROM equipment_bases WHERE name = 'Oblivion Terminal'
);
   
INSERT INTO equipment_bases (name, description, rarity, base_stats, special_effects, cost, torcoin_cost)
SELECT 'Daemonforge', 'Advanced multi-tasking system with increased risk', 'legendary', 
   '{"processing": 45, "memory": 40, "stability": -20}'::jsonb,
   ARRAY['{"name": "Parallel Processing", "description": "Run two contracts simultaneously with 50% increased trace risk", "effect": "dual_contract"}'::jsonb],
   450000, 20
WHERE NOT EXISTS (
  SELECT 1 FROM equipment_bases WHERE name = 'Daemonforge'
);
   
INSERT INTO equipment_bases (name, description, rarity, base_stats, special_effects, cost, torcoin_cost)
SELECT 'Black Widow Node', 'Advanced system capable of controlling botnets', 'legendary', 
   '{"processing": 40, "security": 45, "stealth": 35}'::jsonb,
   ARRAY['{"name": "Botnet Control", "description": "Can hijack and control botnets for DDoS attacks", "effect": "botnet_master"}'::jsonb],
   550000, 30
WHERE NOT EXISTS (
  SELECT 1 FROM equipment_bases WHERE name = 'Black Widow Node'
);

-- Motherboards
INSERT INTO equipment_motherboards (name, description, rarity, slot_count, base_stats, special_effects, cost, torcoin_cost)
SELECT 'Neural Nexus X', 'Increases overall hacking efficiency by 10%', 'rare', 4,
   '{"processing": 10, "memory": 10, "stability": 10}'::jsonb,
   ARRAY['{"name": "Efficiency Boost", "description": "All operations complete 10% faster", "effect": "speed_boost"}'::jsonb],
   120000, NULL
WHERE NOT EXISTS (
  SELECT 1 FROM equipment_motherboards WHERE name = 'Neural Nexus X'
);
   
INSERT INTO equipment_motherboards (name, description, rarity, slot_count, base_stats, special_effects, cost, torcoin_cost)
SELECT 'Quantum Weave M7', 'Reduces detection risk on failed hacks', 'rare', 4,
   '{"security": 15, "stealth": 15, "stability": 10}'::jsonb,
   ARRAY['{"name": "Quantum Shield", "description": "Failed hacks have 50% less chance of triggering alarms", "effect": "failure_protection"}'::jsonb],
   150000, NULL
WHERE NOT EXISTS (
  SELECT 1 FROM equipment_motherboards WHERE name = 'Quantum Weave M7'
);
   
INSERT INTO equipment_motherboards (name, description, rarity, slot_count, base_stats, special_effects, cost, torcoin_cost)
SELECT 'Daemonlink Zeta', 'Boosts performance in deception-based exploits', 'rare', 4,
   '{"processing": 12, "memory": 15, "stealth": 13}'::jsonb,
   ARRAY['{"name": "Deception Master", "description": "Social engineering attacks are 25% more effective", "effect": "social_boost"}'::jsonb],
   135000, NULL
WHERE NOT EXISTS (
  SELECT 1 FROM equipment_motherboards WHERE name = 'Daemonlink Zeta'
);
   
INSERT INTO equipment_motherboards (name, description, rarity, slot_count, base_stats, special_effects, cost, torcoin_cost)
SELECT 'Neural Overlord Z999', 'Revolutionary dual-CPU motherboard', 'legendary', 6,
   '{"processing": 35, "memory": 30, "stability": 25}'::jsonb,
   ARRAY['{"name": "Dual CPU Support", "description": "Can install and utilize two CPU components", "effect": "dual_cpu"}'::jsonb],
   400000, 20
WHERE NOT EXISTS (
  SELECT 1 FROM equipment_motherboards WHERE name = 'Neural Overlord Z999'
);
   
INSERT INTO equipment_motherboards (name, description, rarity, slot_count, base_stats, special_effects, cost, torcoin_cost)
SELECT 'Phantom Matrix', 'Advanced stealth system with failure protection', 'legendary', 5,
   '{"stealth": 40, "security": 35, "stability": 25}'::jsonb,
   ARRAY['{"name": "Failure Shield", "description": "Prevents one failed hack from triggering alerts per contract", "effect": "failure_protection"}'::jsonb],
   380000, 18
WHERE NOT EXISTS (
  SELECT 1 FROM equipment_motherboards WHERE name = 'Phantom Matrix'
);
   
INSERT INTO equipment_motherboards (name, description, rarity, slot_count, base_stats, special_effects, cost, torcoin_cost)
SELECT 'Quantum Paradox X', 'Quantum computing motherboard for encryption breaking', 'legendary', 5,
   '{"processing": 45, "memory": 35, "stability": 20}'::jsonb,
   ARRAY['{"name": "Quantum Breakthrough", "description": "Reduces encryption cracking time by 75%", "effect": "quantum_crack"}'::jsonb],
   420000, 22
WHERE NOT EXISTS (
  SELECT 1 FROM equipment_motherboards WHERE name = 'Quantum Paradox X'
);

-- Components (CPUs)
INSERT INTO equipment_components (name, description, type, rarity, stats, special_effects, cost, torcoin_cost)
SELECT 'Overclocked Cortex-X', 'Increases speed for brute-force attacks', 'cpu', 'rare',
   '{"processing": 25, "stability": -5}'::jsonb,
   ARRAY['{"name": "Brute Force Specialist", "description": "Password cracking attempts are 30% faster", "effect": "crack_speed_boost"}'::jsonb],
   45000, NULL
WHERE NOT EXISTS (
  SELECT 1 FROM equipment_components WHERE name = 'Overclocked Cortex-X'
);
   
INSERT INTO equipment_components (name, description, type, rarity, stats, special_effects, cost, torcoin_cost)
SELECT 'Neural Threadripper', 'Optimized for deep-learning password cracks', 'cpu', 'rare',
   '{"processing": 20, "memory": 15}'::jsonb,
   ARRAY['{"name": "Neural Enhancement", "description": "AI-assisted operations are 40% more effective", "effect": "ai_boost"}'::jsonb],
   55000, NULL
WHERE NOT EXISTS (
  SELECT 1 FROM equipment_components WHERE name = 'Neural Threadripper'
);
   
INSERT INTO equipment_components (name, description, type, rarity, stats, special_effects, cost, torcoin_cost)
SELECT 'Phantom Core', 'Reduces overheating when running multiple scripts', 'cpu', 'rare',
   '{"processing": 18, "stability": 15, "cooling": 20}'::jsonb,
   ARRAY['{"name": "Cool Operations", "description": "Eliminates performance penalties from running multiple scripts", "effect": "heat_reduction"}'::jsonb],
   48000, NULL
WHERE NOT EXISTS (
  SELECT 1 FROM equipment_components WHERE name = 'Phantom Core'
);
   
INSERT INTO equipment_components (name, description, type, rarity, stats, special_effects, cost, torcoin_cost)
SELECT 'Stealth Protocol-2', 'Makes script execution harder to detect', 'cpu', 'rare',
   '{"processing": 15, "stealth": 25}'::jsonb,
   ARRAY['{"name": "Ghost Execution", "description": "Scripts have 35% less chance of being detected", "effect": "stealth_boost"}'::jsonb],
   52000, NULL
WHERE NOT EXISTS (
  SELECT 1 FROM equipment_components WHERE name = 'Stealth Protocol-2'
);

-- Components (RAM)
INSERT INTO equipment_components (name, description, type, rarity, stats, special_effects, cost, torcoin_cost)
SELECT 'GhostRAM 256GB', 'Allows running multiple social engineering scripts at once', 'ram', 'rare',
   '{"memory": 25, "stealth": 15}'::jsonb,
   ARRAY['{"name": "Multi-Threading", "description": "Can run an additional social engineering script", "effect": "social_multitask"}'::jsonb],
   42000, NULL
WHERE NOT EXISTS (
  SELECT 1 FROM equipment_components WHERE name = 'GhostRAM 256GB'
);
   
INSERT INTO equipment_components (name, description, type, rarity, stats, special_effects, cost, torcoin_cost)
SELECT 'Neural Expansion Kit', 'Boosts the success rate of deception-based attacks', 'ram', 'rare',
   '{"memory": 20, "processing": 15}'::jsonb,
   ARRAY['{"name": "Enhanced Deception", "description": "Deception attacks have 25% higher success rate", "effect": "deception_boost"}'::jsonb],
   46000, NULL
WHERE NOT EXISTS (
  SELECT 1 FROM equipment_components WHERE name = 'Neural Expansion Kit'
);
   
INSERT INTO equipment_components (name, description, type, rarity, stats, special_effects, cost, torcoin_cost)
SELECT 'Eclipse Cache-X', 'Stores keystroke data for quicker password retrieval', 'ram', 'rare',
   '{"memory": 22, "processing": 12}'::jsonb,
   ARRAY['{"name": "Keystroke Cache", "description": "Password cracking becomes more effective with each attempt", "effect": "learning_boost"}'::jsonb],
   44000, NULL
WHERE NOT EXISTS (
  SELECT 1 FROM equipment_components WHERE name = 'Eclipse Cache-X'
);
   
INSERT INTO equipment_components (name, description, type, rarity, stats, special_effects, cost, torcoin_cost)
SELECT 'HyperThread Synapse', 'Improves AI-generated phishing attempts', 'ram', 'rare',
   '{"memory": 20, "processing": 18}'::jsonb,
   ARRAY['{"name": "AI Enhancement", "description": "Phishing attacks are 30% more convincing", "effect": "phishing_boost"}'::jsonb],
   48000, NULL
WHERE NOT EXISTS (
  SELECT 1 FROM equipment_components WHERE name = 'HyperThread Synapse'
);

-- Components (Storage)
INSERT INTO equipment_components (name, description, type, rarity, stats, special_effects, cost, torcoin_cost)
SELECT 'DarkVault SSD', 'Reduces traceable logs after an intrusion', 'storage', 'rare',
   '{"storage": 20, "stealth": 20}'::jsonb,
   ARRAY['{"name": "Log Elimination", "description": "Automatically erases 75% of operation traces", "effect": "trace_reduction"}'::jsonb],
   38000, NULL
WHERE NOT EXISTS (
  SELECT 1 FROM equipment_components WHERE name = 'DarkVault SSD'
);
   
INSERT INTO equipment_components (name, description, type, rarity, stats, special_effects, cost, torcoin_cost)
SELECT 'ShadowArchive', 'Stores stolen credentials with encryption', 'storage', 'rare',
   '{"storage": 25, "security": 15}'::jsonb,
   ARRAY['{"name": "Secure Storage", "description": "Stolen data cannot be traced back to you", "effect": "secure_storage"}'::jsonb],
   42000, NULL
WHERE NOT EXISTS (
  SELECT 1 FROM equipment_components WHERE name = 'ShadowArchive'
);
   
INSERT INTO equipment_components (name, description, type, rarity, stats, special_effects, cost, torcoin_cost)
SELECT 'Cloaked Drive V3', 'Auto-wipes failed hack attempts', 'storage', 'rare',
   '{"storage": 18, "stealth": 22}'::jsonb,
   ARRAY['{"name": "Failed Attempt Purge", "description": "Failed hacks leave no trace", "effect": "failure_cleanup"}'::jsonb],
   40000, NULL
WHERE NOT EXISTS (
  SELECT 1 FROM equipment_components WHERE name = 'Cloaked Drive V3'
);
   
INSERT INTO equipment_components (name, description, type, rarity, stats, special_effects, cost, torcoin_cost)
SELECT 'Data Leech MK2', 'Increases loot stolen from corporate servers', 'storage', 'rare',
   '{"storage": 30, "processing": 10}'::jsonb,
   ARRAY['{"name": "Enhanced Extraction", "description": "Steal 50% more data per operation", "effect": "loot_boost"}'::jsonb],
   45000, NULL
WHERE NOT EXISTS (
  SELECT 1 FROM equipment_components WHERE name = 'Data Leech MK2'
);

-- Components (GPU)
INSERT INTO equipment_components (name, description, type, rarity, stats, special_effects, cost, torcoin_cost)
SELECT 'Black Phantom GTX', 'Renders fake IDs faster for social engineering', 'gpu', 'rare',
   '{"graphics": 25, "processing": 15}'::jsonb,
   ARRAY['{"name": "Rapid Forgery", "description": "ID generation is 40% faster", "effect": "forge_speed_boost"}'::jsonb],
   58000, NULL
WHERE NOT EXISTS (
  SELECT 1 FROM equipment_components WHERE name = 'Black Phantom GTX'
);
   
INSERT INTO equipment_components (name, description, type, rarity, stats, special_effects, cost, torcoin_cost)
SELECT 'Mirage Vortex X', 'Enhances firewall evasion techniques', 'gpu', 'rare',
   '{"graphics": 20, "stealth": 20}'::jsonb,
   ARRAY['{"name": "Visual Masking", "description": "Firewall detection rate reduced by 35%", "effect": "firewall_evasion"}'::jsonb],
   62000, NULL
WHERE NOT EXISTS (
  SELECT 1 FROM equipment_components WHERE name = 'Mirage Vortex X'
);
   
INSERT INTO equipment_components (name, description, type, rarity, stats, special_effects, cost, torcoin_cost)
SELECT 'Quantum Render Chip', 'Optimizes deepfake creation for deception', 'gpu', 'rare',
   '{"graphics": 30, "processing": 10}'::jsonb,
   ARRAY['{"name": "Deepfake Mastery", "description": "Generated deepfakes are 45% more convincing", "effect": "deepfake_boost"}'::jsonb],
   65000, NULL
WHERE NOT EXISTS (
  SELECT 1 FROM equipment_components WHERE name = 'Quantum Render Chip'
);
   
INSERT INTO equipment_components (name, description, type, rarity, stats, special_effects, cost, torcoin_cost)
SELECT 'Illusionist-9000', 'Generates AI-based voice & face spoofing', 'gpu', 'rare',
   '{"graphics": 25, "processing": 15}'::jsonb,
   ARRAY['{"name": "Perfect Mimicry", "description": "Voice and face spoofing is nearly undetectable", "effect": "spoof_master"}'::jsonb],
   68000, NULL
WHERE NOT EXISTS (
  SELECT 1 FROM equipment_components WHERE name = 'Illusionist-9000'
);