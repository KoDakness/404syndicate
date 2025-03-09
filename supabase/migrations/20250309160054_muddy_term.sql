/*
  # Populate Equipment Data

  1. New Data
    - Adds initial equipment data to the database
    - Provides base systems, motherboards, and components
  2. Security
    - Only inserts data if tables are empty
*/

-- Populate equipment_bases if empty
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.equipment_bases LIMIT 1) THEN
    INSERT INTO public.equipment_bases (name, description, rarity, base_stats, special_effects, cost, torcoin_cost)
    VALUES 
      ('Black Ice MK-1', 'Custom-built cyberdeck optimized for deep web infiltration', 'rare', 
       '{"processing": 15, "stealth": 20, "security": 10}'::jsonb, 
       ARRAY['{"name": "Deep Web Mastery", "description": "Increases success rate of darknet operations", "effect": "darknet_boost"}'::jsonb], 
       75000, NULL),
      
      ('Specter-9', 'Compact, low-power stealth rig for covert ops', 'rare', 
       '{"stealth": 25, "security": 15, "stability": 10}'::jsonb, 
       ARRAY['{"name": "Ghost Protocol", "description": "Reduces trace detection chance", "effect": "stealth_boost"}'::jsonb], 
       85000, NULL),
      
      ('Titanium Node', 'High-security workstation resistant to tracebacks', 'rare', 
       '{"security": 25, "stability": 20, "processing": 10}'::jsonb, 
       ARRAY['{"name": "Fortress Protocol", "description": "Enhanced protection against counter-hacks", "effect": "defense_boost"}'::jsonb], 
       95000, NULL),
      
      ('Oblivion Terminal', 'A prototype hacking rig built from military-grade AI processors', 'legendary', 
       '{"processing": 50, "security": 40, "stability": 35}'::jsonb, 
       ARRAY['{"name": "Instant Breach", "description": "Can instantly complete a brute-force attack once per contract", "effect": "instant_breach", "cooldown": 3600000}'::jsonb], 
       500000, 25);
  END IF;
END $$;

-- Populate equipment_motherboards if empty
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.equipment_motherboards LIMIT 1) THEN
    INSERT INTO public.equipment_motherboards (name, description, rarity, slot_count, base_stats, special_effects, cost, torcoin_cost)
    VALUES 
      ('Neural Nexus X', 'Increases overall hacking efficiency by 10%', 'rare', 4,
       '{"processing": 10, "memory": 10, "stability": 10}'::jsonb, 
       ARRAY['{"name": "Efficiency Boost", "description": "All operations complete 10% faster", "effect": "speed_boost"}'::jsonb], 
       120000, NULL),
      
      ('Quantum Weave M7', 'Reduces detection risk on failed hacks', 'rare', 4,
       '{"security": 15, "stealth": 15, "stability": 10}'::jsonb, 
       ARRAY['{"name": "Quantum Shield", "description": "Failed hacks have 50% less chance of triggering alarms", "effect": "failure_protection"}'::jsonb], 
       150000, NULL),
      
      ('Daemonlink Zeta', 'Boosts performance in deception-based exploits', 'rare', 4,
       '{"processing": 12, "memory": 15, "stealth": 13}'::jsonb, 
       ARRAY['{"name": "Deception Master", "description": "Social engineering attacks are 25% more effective", "effect": "social_boost"}'::jsonb], 
       135000, NULL),
      
      ('Neural Overlord Z999', 'Revolutionary dual-CPU motherboard', 'legendary', 6,
       '{"processing": 35, "memory": 30, "stability": 25}'::jsonb, 
       ARRAY['{"name": "Dual CPU Support", "description": "Can install and utilize two CPU components", "effect": "dual_cpu"}'::jsonb], 
       400000, 20);
  END IF;
END $$;

-- Populate equipment_components if empty
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.equipment_components LIMIT 1) THEN
    -- CPUs
    INSERT INTO public.equipment_components (name, description, type, rarity, stats, special_effects, cost)
    VALUES 
      ('Overclocked Cortex-X', 'Increases speed for brute-force attacks', 'cpu', 'rare', 
       '{"processing": 25, "stability": -5}'::jsonb, 
       ARRAY['{"name": "Brute Force Specialist", "description": "Password cracking attempts are 30% faster", "effect": "crack_speed_boost"}'::jsonb], 
       45000),
      
      ('Neural Threadripper', 'Optimized for deep-learning password cracks', 'cpu', 'rare', 
       '{"processing": 20, "memory": 15}'::jsonb, 
       ARRAY['{"name": "Neural Enhancement", "description": "AI-assisted operations are 40% more effective", "effect": "ai_boost"}'::jsonb], 
       55000);
    
    -- RAM
    INSERT INTO public.equipment_components (name, description, type, rarity, stats, special_effects, cost)
    VALUES 
      ('GhostRAM 256GB', 'Allows running multiple social engineering scripts at once', 'ram', 'rare', 
       '{"memory": 25, "stealth": 15}'::jsonb, 
       ARRAY['{"name": "Multi-Threading", "description": "Can run an additional social engineering script", "effect": "social_multitask"}'::jsonb], 
       42000),
      
      ('Neural Expansion Kit', 'Boosts the success rate of deception-based attacks', 'ram', 'rare', 
       '{"memory": 20, "processing": 15}'::jsonb, 
       ARRAY['{"name": "Enhanced Deception", "description": "Deception attacks have 25% higher success rate", "effect": "deception_boost"}'::jsonb], 
       46000);
    
    -- Storage
    INSERT INTO public.equipment_components (name, description, type, rarity, stats, special_effects, cost)
    VALUES 
      ('DarkVault SSD', 'Reduces traceable logs after an intrusion', 'storage', 'rare', 
       '{"storage": 20, "stealth": 20}'::jsonb, 
       ARRAY['{"name": "Log Elimination", "description": "Automatically erases 75% of operation traces", "effect": "trace_reduction"}'::jsonb], 
       38000),
      
      ('ShadowArchive', 'Stores stolen credentials with encryption', 'storage', 'rare', 
       '{"storage": 25, "security": 15}'::jsonb, 
       ARRAY['{"name": "Secure Storage", "description": "Stolen data cannot be traced back to you", "effect": "secure_storage"}'::jsonb], 
       42000);
    
    -- GPUs
    INSERT INTO public.equipment_components (name, description, type, rarity, stats, special_effects, cost)
    VALUES 
      ('Black Phantom GTX', 'Renders fake IDs faster for social engineering', 'gpu', 'rare', 
       '{"graphics": 25, "processing": 15}'::jsonb, 
       ARRAY['{"name": "Rapid Forgery", "description": "ID generation is 40% faster", "effect": "forge_speed_boost"}'::jsonb], 
       58000),
      
      ('Mirage Vortex X', 'Enhances firewall evasion techniques', 'gpu', 'rare', 
       '{"graphics": 20, "stealth": 20}'::jsonb, 
       ARRAY['{"name": "Visual Masking", "description": "Firewall detection rate reduced by 35%", "effect": "firewall_evasion"}'::jsonb], 
       62000);
  END IF;
END $$;