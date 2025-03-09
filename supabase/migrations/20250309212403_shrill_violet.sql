/*
  # Add WraithCoin to players table

  1. Changes
    - Add `wraithcoins` column to the `players` table
      - Integer type with default value of 0
      - Not nullable
      - With comment explaining it's an ultra-rare currency with 1% drop chance
*/

-- Add wraithcoins column to players table
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'players' AND column_name = 'wraithcoins'
  ) THEN
    ALTER TABLE public.players 
    ADD COLUMN wraithcoins integer NOT NULL DEFAULT 0;
  END IF;
END $$;

-- Add comment to the wraithcoins column
COMMENT ON COLUMN public.players.wraithcoins IS 'Ultra-rare currency with 1% drop chance from contracts';