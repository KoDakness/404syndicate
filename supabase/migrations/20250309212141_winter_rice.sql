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

ALTER TABLE players 
ADD COLUMN IF NOT EXISTS wraithcoins INTEGER NOT NULL DEFAULT 0;
    
COMMENT ON COLUMN players.wraithcoins IS 'Ultra-rare currency with 1% drop chance from contracts';