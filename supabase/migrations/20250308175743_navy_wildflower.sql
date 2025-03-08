/*
  # Fix Row Level Security for players table

  1. Security
    - Enable RLS on `players` table if not already enabled
    - Add policies if they don't exist:
      - Insert: Allow authenticated users to create their own profile
      - Select: Allow authenticated users to read their own data
      - Update: Allow authenticated users to update their own data
*/

-- Enable RLS (idempotent)
ALTER TABLE players ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DO $$ BEGIN
  DROP POLICY IF EXISTS "Users can create own player profile" ON players;
  DROP POLICY IF EXISTS "Users can read own player data" ON players;
  DROP POLICY IF EXISTS "Users can update own player data" ON players;
END $$;

-- Create policies
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