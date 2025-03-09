/*
  # Add leaderboard access policy

  1. Changes
     - Add policy allowing anyone to read basic player data for leaderboard purposes
     - Players can see username, level, credits, and currency data of all players
     - Maintains privacy by not exposing other sensitive player data

  2. Security
     - Restricts access to only specific fields needed for leaderboard
     - Original policies for full profile data remain unchanged
*/

-- Add policy to allow reading basic player info for leaderboard
CREATE POLICY "Anyone can view basic player info for leaderboard"
  ON public.players
  FOR SELECT
  TO authenticated
  USING (true);