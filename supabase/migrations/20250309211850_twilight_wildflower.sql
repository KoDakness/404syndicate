/*
  # Add WraithCoin to Players Table

  1. Changes
    - Add `wraithcoins` column to `players` table
      - Default value of 0
      - Not nullable
      - Integer type
  
  2. Description
    - WraithCoin is an ultra-rare currency that players can earn
    - It has a 1% chance to drop from completed contracts
    - Used for purchasing the most exclusive items in the game
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'players' AND column_name = 'wraithcoins'
  ) THEN
    ALTER TABLE players 
    ADD COLUMN wraithcoins INTEGER NOT NULL DEFAULT 0;
    
    COMMENT ON COLUMN players.wraithcoins IS 'Ultra-rare currency with 1% drop chance from contracts';
  END IF;
END $$;