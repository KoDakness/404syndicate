/*
  # Store Player Data and Leaderboard

  1. New Tables
    - `players` table for storing:
      - Basic info (id, username)
      - Currency (credits, torcoins)
      - Progress (level, experience)
      - Game limits (max_concurrent_jobs)
      - Timestamps (last_refresh, created_at, updated_at)
      - JSON data (reputation, skills, equipment, inventory)
    - `player_jobs` table for active jobs
    - `player_events` table for event participation

  2. Security
    - Enable RLS on all tables
    - Policies for authenticated users to:
      - Create their own profile
      - Read their own data
      - Update their own data
      - Manage their own jobs and events

  3. Functions
    - Add updated_at timestamp trigger
*/

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS update_players_updated_at ON players;

-- Create or replace trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create players table if it doesn't exist
CREATE TABLE IF NOT EXISTS players (
  id uuid PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  username text UNIQUE NOT NULL,
  credits integer DEFAULT 1000 NOT NULL,
  torcoins integer DEFAULT 0 NOT NULL,
  level integer DEFAULT 1 NOT NULL,
  experience integer DEFAULT 0 NOT NULL,
  max_concurrent_jobs integer DEFAULT 2 NOT NULL,
  last_refresh timestamptz,
  reputation jsonb DEFAULT '{"corporate": 0, "underground": 0}'::jsonb NOT NULL,
  skills jsonb DEFAULT '{"firewall": 1, "spoofing": 1, "decryption": 1, "skillPoints": 3}'::jsonb NOT NULL,
  equipment jsonb DEFAULT '{"equipped": [], "inventory": []}'::jsonb NOT NULL,
  inventory jsonb DEFAULT '[]'::jsonb NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create updated_at trigger
CREATE TRIGGER update_players_updated_at
  BEFORE UPDATE ON players
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS
ALTER TABLE players ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Users can create own player profile" ON players;
DROP POLICY IF EXISTS "Users can read own player data" ON players;
DROP POLICY IF EXISTS "Users can update own player data" ON players;

-- Create RLS policies
CREATE POLICY "Users can create own player profile"
  ON players
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can read own player data"
  ON players
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own player data"
  ON players
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

-- Create player_jobs table if it doesn't exist
CREATE TABLE IF NOT EXISTS player_jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id uuid REFERENCES players(id) ON DELETE CASCADE,
  job_id text NOT NULL,
  status text DEFAULT 'in-progress' NOT NULL,
  progress integer DEFAULT 0 NOT NULL,
  start_time timestamptz DEFAULT now(),
  completed_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS on player_jobs
ALTER TABLE player_jobs ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Users can insert own jobs" ON player_jobs;
DROP POLICY IF EXISTS "Users can read own jobs" ON player_jobs;
DROP POLICY IF EXISTS "Users can update own jobs" ON player_jobs;

-- Create RLS policies for player_jobs
CREATE POLICY "Users can insert own jobs"
  ON player_jobs
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = player_id);

CREATE POLICY "Users can read own jobs"
  ON player_jobs
  FOR SELECT
  TO authenticated
  USING (auth.uid() = player_id);

CREATE POLICY "Users can update own jobs"
  ON player_jobs
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = player_id);

-- Create player_events table if it doesn't exist
CREATE TABLE IF NOT EXISTS player_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id uuid REFERENCES players(id) ON DELETE CASCADE,
  event_id text NOT NULL,
  status text DEFAULT 'locked' NOT NULL,
  last_attempt timestamptz,
  next_available timestamptz,
  completed_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS on player_events
ALTER TABLE player_events ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Users can insert own events" ON player_events;
DROP POLICY IF EXISTS "Users can read own events" ON player_events;
DROP POLICY IF EXISTS "Users can update own events" ON player_events;

-- Create RLS policies for player_events
CREATE POLICY "Users can insert own events"
  ON player_events
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = player_id);

CREATE POLICY "Users can read own events"
  ON player_events
  FOR SELECT
  TO authenticated
  USING (auth.uid() = player_id);

CREATE POLICY "Users can update own events"
  ON player_events
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = player_id);