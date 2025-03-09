/*
  # Equipment System Schema

  1. New Tables
    - equipment_bases: Base PC builds
    - equipment_motherboards: Motherboard configurations
    - equipment_components: Individual components (CPU, RAM, etc)
    - player_equipment_loadouts: Player equipment configurations

  2. Security
    - Enable RLS on all tables
    - Add policies for viewing equipment
    - Add policies for player loadout management

  3. Initial Data
    - Add legendary equipment examples
*/

-- Equipment base builds (main PC rigs)
CREATE TABLE IF NOT EXISTS equipment_bases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text NOT NULL,
  rarity text NOT NULL CHECK (rarity IN ('common', 'rare', 'legendary')),
  base_stats jsonb NOT NULL DEFAULT '{}'::jsonb,
  special_effects jsonb[] DEFAULT array[]::jsonb[],
  cost integer NOT NULL DEFAULT 0,
  torcoin_cost integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Motherboards that components slot into
CREATE TABLE IF NOT EXISTS equipment_motherboards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text NOT NULL,
  rarity text NOT NULL CHECK (rarity IN ('common', 'rare', 'legendary')),
  slot_count integer NOT NULL DEFAULT 4,
  base_stats jsonb NOT NULL DEFAULT '{}'::jsonb,
  special_effects jsonb[] DEFAULT array[]::jsonb[],
  cost integer NOT NULL DEFAULT 0,
  torcoin_cost integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Individual components that can be installed
CREATE TABLE IF NOT EXISTS equipment_components (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text NOT NULL,
  type text NOT NULL CHECK (type IN ('cpu', 'ram', 'storage', 'gpu')),
  rarity text NOT NULL CHECK (rarity IN ('common', 'rare', 'legendary')),
  stats jsonb NOT NULL DEFAULT '{}'::jsonb,
  special_effects jsonb[] DEFAULT array[]::jsonb[],
  cost integer NOT NULL DEFAULT 0,
  torcoin_cost integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Player equipment loadouts
CREATE TABLE IF NOT EXISTS player_equipment_loadouts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id uuid REFERENCES players(id) ON DELETE CASCADE,
  base_id uuid REFERENCES equipment_bases(id),
  motherboard_id uuid REFERENCES equipment_motherboards(id),
  installed_components jsonb NOT NULL DEFAULT '{}'::jsonb,
  active boolean NOT NULL DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Add constraint for single active loadout per player
CREATE UNIQUE INDEX player_active_loadout_idx ON player_equipment_loadouts (player_id) WHERE active = true;

-- Enable RLS
ALTER TABLE equipment_bases ENABLE ROW LEVEL SECURITY;
ALTER TABLE equipment_motherboards ENABLE ROW LEVEL SECURITY;
ALTER TABLE equipment_components ENABLE ROW LEVEL SECURITY;
ALTER TABLE player_equipment_loadouts ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Anyone can view equipment" ON equipment_bases
  FOR SELECT USING (true);

CREATE POLICY "Anyone can view motherboards" ON equipment_motherboards
  FOR SELECT USING (true);

CREATE POLICY "Anyone can view components" ON equipment_components
  FOR SELECT USING (true);

CREATE POLICY "Players can view own loadouts" ON player_equipment_loadouts
  FOR SELECT TO authenticated
  USING (auth.uid() = player_id);

CREATE POLICY "Players can insert own loadouts" ON player_equipment_loadouts
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = player_id);

CREATE POLICY "Players can update own loadouts" ON player_equipment_loadouts
  FOR UPDATE TO authenticated
  USING (auth.uid() = player_id);

-- Insert some legendary gear
INSERT INTO equipment_bases (name, description, rarity, base_stats, special_effects, cost, torcoin_cost) VALUES
  (
    'Oblivion Terminal',
    'A prototype hacking rig built from military-grade AI processors',
    'legendary',
    '{"processing": 100, "stealth": 75, "security": 90}'::jsonb,
    ARRAY['{"effect": "instant_bruteforce", "cooldown": 3600}'::jsonb],
    1000000,
    25
  ),
  (
    'Daemonforge',
    'Advanced multi-threading rig for parallel contract execution',
    'legendary',
    '{"processing": 85, "multi_threading": 100, "risk": 50}'::jsonb,
    ARRAY['{"effect": "dual_contracts"}'::jsonb],
    800000,
    20
  );

INSERT INTO equipment_motherboards (name, description, rarity, slot_count, base_stats, special_effects, cost, torcoin_cost) VALUES
  (
    'Neural Overlord Z999',
    'Revolutionary dual-CPU architecture motherboard',
    'legendary',
    6,
    '{"processing": 50, "cooling": 75}'::jsonb,
    ARRAY['{"effect": "dual_cpu_support"}'::jsonb],
    500000,
    15
  ),
  (
    'Phantom Matrix',
    'Advanced stealth-focused motherboard with fail-safe systems',
    'legendary',
    4,
    '{"stealth": 90, "security": 85}'::jsonb,
    ARRAY['{"effect": "prevent_alert", "uses": 1}'::jsonb],
    450000,
    12
  );

INSERT INTO equipment_components (name, description, type, rarity, stats, special_effects, cost, torcoin_cost) VALUES
  (
    'ZeroPoint Reactor',
    'Experimental quantum CPU with instant processing capabilities',
    'cpu',
    'legendary',
    '{"processing": 100, "stability": 25}'::jsonb,
    ARRAY['{"effect": "instant_execution", "crash_chance": 0.1}'::jsonb],
    300000,
    10
  ),
  (
    'Mnemonic Vault',
    'Neural-enhanced RAM with advanced pattern recognition',
    'ram',
    'legendary',
    '{"memory": 95, "analysis": 90}'::jsonb,
    ARRAY['{"effect": "bruteforce_memory"}'::jsonb],
    250000,
    8
  );

-- Update trigger for loadout changes
CREATE OR REPLACE FUNCTION update_loadout_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_loadout_updated_at
  BEFORE UPDATE ON player_equipment_loadouts
  FOR EACH ROW
  EXECUTE FUNCTION update_loadout_timestamp();