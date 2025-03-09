/*
  # Equipment Database Schema

  1. New Tables
    - Creates equipment reference tables if they don't exist
    - Adds necessary columns and constraints
    - Ensures proper indexing
  2. Security
    - Enable RLS on all tables
    - Set up proper policies for public read access
    - Allow authenticated users to create loadouts
*/

-- Create equipment base table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.equipment_bases (
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

-- Create equipment motherboards table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.equipment_motherboards (
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

-- Create equipment components table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.equipment_components (
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

-- Create player equipment loadouts table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.player_equipment_loadouts (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    player_id uuid REFERENCES public.players(id) ON DELETE CASCADE,
    base_id uuid REFERENCES public.equipment_bases(id),
    motherboard_id uuid REFERENCES public.equipment_motherboards(id),
    installed_components jsonb NOT NULL DEFAULT '{}'::jsonb,
    active boolean NOT NULL DEFAULT false,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Create unique index for active loadout per player
CREATE UNIQUE INDEX IF NOT EXISTS player_active_loadout_idx 
ON public.player_equipment_loadouts (player_id) 
WHERE (active = true);

-- Enable RLS on all tables
ALTER TABLE public.equipment_bases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.equipment_motherboards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.equipment_components ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.player_equipment_loadouts ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for public read access
DO $$
BEGIN
  -- Read policy for equipment_bases
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'equipment_bases' 
    AND policyname = 'Anyone can view equipment'
  ) THEN
    CREATE POLICY "Anyone can view equipment" 
      ON public.equipment_bases
      FOR SELECT 
      USING (true);
  END IF;
  
  -- Read policy for equipment_motherboards
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'equipment_motherboards' 
    AND policyname = 'Anyone can view motherboards'
  ) THEN
    CREATE POLICY "Anyone can view motherboards" 
      ON public.equipment_motherboards
      FOR SELECT 
      USING (true);
  END IF;
  
  -- Read policy for equipment_components
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'equipment_components' 
    AND policyname = 'Anyone can view components'
  ) THEN
    CREATE POLICY "Anyone can view components" 
      ON public.equipment_components
      FOR SELECT 
      USING (true);
  END IF;
END
$$;

-- Create RLS policies for player loadouts
DO $$
BEGIN
  -- Players can insert their own loadouts
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'player_equipment_loadouts' 
    AND policyname = 'Players can insert own loadouts'
  ) THEN
    CREATE POLICY "Players can insert own loadouts" 
      ON public.player_equipment_loadouts
      FOR INSERT 
      TO authenticated
      WITH CHECK (auth.uid() = player_id);
  END IF;
  
  -- Players can update their own loadouts
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'player_equipment_loadouts' 
    AND policyname = 'Players can update own loadouts'
  ) THEN
    CREATE POLICY "Players can update own loadouts" 
      ON public.player_equipment_loadouts
      FOR UPDATE
      TO authenticated
      USING (auth.uid() = player_id);
  END IF;
  
  -- Players can view their own loadouts
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'player_equipment_loadouts' 
    AND policyname = 'Players can view own loadouts'
  ) THEN
    CREATE POLICY "Players can view own loadouts" 
      ON public.player_equipment_loadouts
      FOR SELECT
      TO authenticated
      USING (auth.uid() = player_id);
  END IF;
END
$$;

-- Create trigger function for updating loadout timestamps
CREATE OR REPLACE FUNCTION update_loadout_timestamp()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = now();
   RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updating loadout timestamps
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger 
    WHERE tgname = 'update_loadout_updated_at'
  ) THEN
    CREATE TRIGGER update_loadout_updated_at
    BEFORE UPDATE ON public.player_equipment_loadouts
    FOR EACH ROW
    EXECUTE FUNCTION update_loadout_timestamp();
  END IF;
END
$$;