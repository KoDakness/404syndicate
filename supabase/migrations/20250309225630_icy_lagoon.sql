/*
  # Remove max_concurrent_jobs column

  1. Changes
    - Removes the `max_concurrent_jobs` column from the `players` table to fix application breaking issue
*/

-- Safely remove the max_concurrent_jobs column
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'players' AND column_name = 'max_concurrent_jobs'
  ) THEN
    ALTER TABLE players DROP COLUMN max_concurrent_jobs;
  END IF;
END $$;