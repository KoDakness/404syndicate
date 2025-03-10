/*
  # Add next_manual_refresh column to players table

  1. Changes
     - Adds `next_manual_refresh` column to the players table to track when the player's next manual contract refresh will be available
     - This supports the new feature that allows players to manually refresh contracts once every 12 hours

  2. Purpose
     - The column stores a timestamp indicating when the player will next be able to manually refresh contracts
     - Works alongside the existing `manual_refresh_available` boolean field
*/

-- Add next_manual_refresh column to players table if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'players' AND column_name = 'next_manual_refresh'
  ) THEN
    ALTER TABLE players ADD COLUMN next_manual_refresh timestamptz;
    COMMENT ON COLUMN players.next_manual_refresh IS 'Timestamp when next manual contract refresh is available';
  END IF;
END $$;