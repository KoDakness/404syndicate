/*
  # Game Database Schema

  1. New Tables
    - `players`
      - Core player data including credits, level, experience
      - Equipment and inventory stored as JSONB
      - Skills and reputation as nested JSON structures
    - `player_jobs`
      - Tracks active and completed jobs
      - Links to player profiles
    - `player_events`
      - Tracks event completion and lockouts
      - Stores event-specific data and rewards

  2. Security
    - Enable RLS on all tables
    - Players can only access their own data
    - Authentication handled by Supabase auth
*/

-- Create players table
CREATE TABLE IF NOT EXISTS players (
  id uuid PRIMARY KEY REFERENCES auth.users(id),
  username text UNIQUE NOT NULL,
  credits integer NOT NULL DEFAULT 1000,
  torcoins integer NOT NULL DEFAULT 0,
  level integer NOT NULL DEFAULT 1,
  experience integer NOT NULL DEFAULT 0,
  max_concurrent_jobs integer NOT NULL DEFAULT 2,
  last_refresh timestamp with time zone,
  reputation jsonb NOT NULL DEFAULT '{"corporate": 0, "underground": 0}'::jsonb,
  skills jsonb NOT NULL DEFAULT '{"decryption": 1, "firewall": 1, "spoofing": 1, "skillPoints": 3}'::jsonb,
  equipment jsonb NOT NULL DEFAULT '{"equipped": [], "inventory": []}'::jsonb,
  inventory jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Create player_jobs table
CREATE TABLE IF NOT EXISTS player_jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id uuid REFERENCES players(id) ON DELETE CASCADE,
  job_id text NOT NULL,
  status text NOT NULL DEFAULT 'in-progress',
  progress integer NOT NULL DEFAULT 0,
  start_time timestamp with time zone DEFAULT now(),
  completed_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now()
);

-- Create player_events table
CREATE TABLE IF NOT EXISTS player_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id uuid REFERENCES players(id) ON DELETE CASCADE,
  event_id text NOT NULL,
  status text NOT NULL DEFAULT 'locked',
  last_attempt timestamp with time zone,
  next_available timestamp with time zone,
  completed_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS
ALTER TABLE players ENABLE ROW LEVEL SECURITY;
ALTER TABLE player_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE player_events ENABLE ROW LEVEL SECURITY;

-- Create policies
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

CREATE POLICY "Users can read own jobs"
  ON player_jobs
  FOR SELECT
  TO authenticated
  USING (auth.uid() = player_id);

CREATE POLICY "Users can insert own jobs"
  ON player_jobs
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = player_id);

CREATE POLICY "Users can update own jobs"
  ON player_jobs
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = player_id);

CREATE POLICY "Users can read own events"
  ON player_events
  FOR SELECT
  TO authenticated
  USING (auth.uid() = player_id);

CREATE POLICY "Users can insert own events"
  ON player_events
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = player_id);

CREATE POLICY "Users can update own events"
  ON player_events
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = player_id);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_players_updated_at
  BEFORE UPDATE ON players
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();