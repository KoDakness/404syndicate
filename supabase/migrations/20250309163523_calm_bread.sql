/*
  # Initialize Equipment Tables

  1. New Tables
     - `equipment_bases` - Base systems for player loadouts
     - `equipment_motherboards` - Motherboards that can be installed in base systems
     - `equipment_components` - Components like CPUs, RAM, etc. that can be installed in motherboards
     - `player_equipment_loadouts` - Player's equipment configurations

  2. Security
     - Enable RLS on all tables
     - Add policies for authenticated users to access their own data and equipment
*/

-- Equipment Bases
CREATE TABLE IF NOT EXISTS equipment_bases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text NOT NULL,
  rarity text NOT NULL CHECK (rarity IN ('common', 'rare', 'legendary')),
  base_stats jsonb NOT NULL DEFAULT '{}'::jsonb,
  special_effects jsonb[] DEFAULT ARRAY[]::jsonb[],
  cost integer NOT NULL DEFAULT 0,
  torcoin_cost integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE equipment_bases ENABLE ROW LEVEL SECURITY;

-- Equipment Motherboards
CREATE TABLE IF NOT EXISTS equipment_motherboards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text NOT NULL,
  rarity text NOT NULL CHECK (rarity IN ('common', 'rare', 'legendary')),
  slot_count integer NOT NULL DEFAULT 4,
  base_stats jsonb NOT NULL DEFAULT '{}'::jsonb,
  special_effects jsonb[] DEFAULT ARRAY[]::jsonb[],
  cost integer NOT NULL DEFAULT 0,
  torcoin_cost integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE equipment_motherboards ENABLE ROW LEVEL SECURITY;

-- Equipment Components
CREATE TABLE IF NOT EXISTS equipment_components (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text NOT NULL,
  type text NOT NULL CHECK (type IN ('cpu', 'ram', 'storage', 'gpu')),
  rarity text NOT NULL CHECK (rarity IN ('common', 'rare', 'legendary')),
  stats jsonb NOT NULL DEFAULT '{}'::jsonb,
  special_effects jsonb[] DEFAULT ARRAY[]::jsonb[],
  cost integer NOT NULL DEFAULT 0,
  torcoin_cost integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE equipment_components ENABLE ROW LEVEL SECURITY;

-- Player Equipment Loadouts
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

-- Create the unique index only if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes 
    WHERE indexname = 'player_active_loadout_idx'
  ) THEN
    CREATE UNIQUE INDEX player_active_loadout_idx ON player_equipment_loadouts (player_id) WHERE (active = true);
  END IF;
END $$;

ALTER TABLE player_equipment_loadouts ENABLE ROW LEVEL SECURITY;

-- Security Policies for Equipment Tables
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'equipment_bases' AND policyname = 'Anyone can view equipment bases'
  ) THEN
    CREATE POLICY "Anyone can view equipment bases" 
      ON equipment_bases
      FOR SELECT
      TO public
      USING (true);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'equipment_motherboards' AND policyname = 'Anyone can view motherboards'
  ) THEN
    CREATE POLICY "Anyone can view motherboards" 
      ON equipment_motherboards
      FOR SELECT
      TO public
      USING (true);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'equipment_components' AND policyname = 'Anyone can view components'
  ) THEN
    CREATE POLICY "Anyone can view components" 
      ON equipment_components
      FOR SELECT
      TO public
      USING (true);
  END IF;
END $$;

-- Security Policies for Player Equipment Loadouts
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'player_equipment_loadouts' AND policyname = 'Players can view own loadouts'
  ) THEN
    CREATE POLICY "Players can view own loadouts" 
      ON player_equipment_loadouts
      FOR SELECT
      TO authenticated
      USING (auth.uid() = player_id);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'player_equipment_loadouts' AND policyname = 'Players can insert own loadouts'
  ) THEN
    CREATE POLICY "Players can insert own loadouts" 
      ON player_equipment_loadouts
      FOR INSERT
      TO authenticated
      WITH CHECK (auth.uid() = player_id);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'player_equipment_loadouts' AND policyname = 'Players can update own loadouts'
  ) THEN
    CREATE POLICY "Players can update own loadouts" 
      ON player_equipment_loadouts
      FOR UPDATE
      TO authenticated
      USING (auth.uid() = player_id);
  END IF;
END $$;

-- Create the function and trigger only if they don't exist
CREATE OR REPLACE FUNCTION update_loadout_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger 
    WHERE tgname = 'update_loadout_updated_at' AND tgrelid = 'player_equipment_loadouts'::regclass
  ) THEN
    CREATE TRIGGER update_loadout_updated_at
    BEFORE UPDATE ON player_equipment_loadouts
    FOR EACH ROW
    EXECUTE FUNCTION update_loadout_timestamp();
  END IF;
EXCEPTION
  WHEN undefined_table THEN
    -- If the table doesn't exist yet, we can skip this step
    NULL;
END $$;