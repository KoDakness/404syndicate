/*
  # Add torcoin and contract refresh tracking

  1. Changes
    - Add `torcoins` column to track player's torcoin balance
    - Add `last_contract_refresh` to track when contracts were last refreshed
    - Add `next_contract_refresh` to track when next refresh is available
    - Add `manual_refresh_available` to track if manual refresh is available
    - Set appropriate default values for new columns

  2. Security
    - Maintain existing RLS policies
*/

-- Add torcoins column with default value 0
ALTER TABLE players 
ADD COLUMN IF NOT EXISTS torcoins integer NOT NULL DEFAULT 0;

-- Add contract refresh tracking columns
ALTER TABLE players
ADD COLUMN IF NOT EXISTS last_contract_refresh timestamptz,
ADD COLUMN IF NOT EXISTS next_contract_refresh timestamptz,
ADD COLUMN IF NOT EXISTS manual_refresh_available boolean DEFAULT true;

-- Update existing rows to have default values
UPDATE players 
SET torcoins = 0 
WHERE torcoins IS NULL;

-- Add comment explaining the columns
COMMENT ON COLUMN players.torcoins IS 'Player''s torcoin balance earned from jobs and events';
COMMENT ON COLUMN players.last_contract_refresh IS 'Timestamp of last contract refresh';
COMMENT ON COLUMN players.next_contract_refresh IS 'Timestamp when next contract refresh is available';
COMMENT ON COLUMN players.manual_refresh_available IS 'Whether player can manually refresh contracts';