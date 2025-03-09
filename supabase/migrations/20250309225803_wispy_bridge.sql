/*
  # Fix check_job_limit function

  1. Changes
    - Updates the `check_job_limit` function to remove references to the non-existent max_concurrent_jobs column
    - Modifies the function to allow unlimited jobs (no job limit check)
*/

-- Drop and recreate the check_job_limit function to remove the job limit
CREATE OR REPLACE FUNCTION check_job_limit()
RETURNS TRIGGER AS $$
BEGIN
  -- Function now allows unlimited jobs (no job limit check)
  -- Always return NEW to allow the job to be created
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;