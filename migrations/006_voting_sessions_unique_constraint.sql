-- Add unique constraint for voting_sessions to enable upsert
-- Run this in your Supabase SQL editor

-- Add unique constraint if not exists
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'voting_sessions_election_student_unique'
  ) THEN
    ALTER TABLE voting_sessions 
    ADD CONSTRAINT voting_sessions_election_student_unique 
    UNIQUE (election_id, student_id);
  END IF;
END $$;

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_voting_sessions_election_student 
ON voting_sessions(election_id, student_id);
