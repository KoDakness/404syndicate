/*
  # Add job tracking constraints

  1. Changes
    - Add composite unique constraint on player_jobs table for job_id and player_id
    - This enables upsert operations to work correctly when updating job progress
    - Ensures each player can only have one active instance of each job

  2. Security
    - Maintains existing RLS policies
    - No security changes needed
*/

-- Add composite unique constraint
ALTER TABLE player_jobs
ADD CONSTRAINT player_jobs_player_id_job_id_key UNIQUE (player_id, job_id);