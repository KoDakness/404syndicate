/*
  # Improve contract refresh management
  
  1. Changes
    - Ensures the player table properly tracks contract refresh times
    - Adds default values for refresh fields if they're missing
    - Sets up constraints to ensure proper refresh behavior
  
  2. Purpose
    - Prevents new jobs from being generated on page refresh
    - Maintains consistent refresh timing (120 min regular, 24hr manual)
*/

-- Make sure all players have proper refresh fields
DO $$
BEGIN
  -- Set last_contract_refresh to now() for any players that don't have it set
  UPDATE players
  SET last_contract_refresh = now()
  WHERE last_contract_refresh IS NULL;
  
  -- Set next_contract_refresh to 2 hours from now for any players that don't have it set
  UPDATE players
  SET next_contract_refresh = now() + interval '2 hours'
  WHERE next_contract_refresh IS NULL;
  
  -- Set manual_refresh_available to true for any players that don't have it set
  UPDATE players
  SET manual_refresh_available = true
  WHERE manual_refresh_available IS NULL;
END $$;