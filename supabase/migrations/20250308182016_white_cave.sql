/*
  # Add tracking columns for contracts and events

  1. Changes to players table
    - Add last_contract_refresh: When contracts were last refreshed
    - Add next_contract_refresh: When contracts can be refreshed again
    - Add manual_refresh_available: Whether manual refresh is available

  2. Changes to player_events table
    - Add attempts: Track number of failed attempts
    - Add max_attempts: Maximum allowed attempts
    - Add lockout_until: When event becomes available again

  This migration adds proper tracking for:
    - Contract refresh cooldowns (2 hour auto + 1 daily manual)
    - Event attempt limits and lockouts
*/

-- Add contract refresh tracking columns to players
ALTER TABLE players 
ADD COLUMN IF NOT EXISTS last_contract_refresh timestamptz,
ADD COLUMN IF NOT EXISTS next_contract_refresh timestamptz,
ADD COLUMN IF NOT EXISTS manual_refresh_available boolean DEFAULT true;

-- Add event tracking columns to player_events
ALTER TABLE player_events
ADD COLUMN IF NOT EXISTS attempts integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS max_attempts integer DEFAULT 3,
ADD COLUMN IF NOT EXISTS lockout_until timestamptz;