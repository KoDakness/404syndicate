/*
  # Add Tutorial State to Players

  1. New Columns
    - `tutorial_completed`: Boolean to track if tutorial is finished
    - `tutorial_step`: Integer to track current tutorial progress
    - `tutorial_seen_features`: JSONB array to track which features have been explained

  2. Security
    - Maintain existing RLS policies
*/

ALTER TABLE players
ADD COLUMN tutorial_completed BOOLEAN DEFAULT false,
ADD COLUMN tutorial_step INTEGER DEFAULT 0,
ADD COLUMN tutorial_seen_features JSONB DEFAULT '[]'::jsonb;