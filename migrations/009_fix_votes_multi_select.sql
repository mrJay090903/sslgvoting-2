-- Migration: Fix votes table constraint to allow multiple votes per position
-- Date: 2026-02-19
-- Issue: Unique constraint on (election_id, student_id, position_id) prevents
--        voting for 2 candidates on representative positions where max_votes = 2

-- Drop the unique constraint that prevents multiple votes per position
-- The constraint may be named differently depending on how it was created

-- Try dropping by common constraint names
DO $$
BEGIN
  -- Drop unique index if it exists
  DROP INDEX IF EXISTS votes_election_student_position_unique;
  DROP INDEX IF EXISTS idx_votes_unique;
  DROP INDEX IF EXISTS votes_unique_vote;
  DROP INDEX IF EXISTS unique_vote;
  DROP INDEX IF EXISTS votes_election_id_student_id_position_id_key;
  
  -- Try to drop named constraint
  BEGIN
    ALTER TABLE votes DROP CONSTRAINT IF EXISTS votes_election_student_position_unique;
  EXCEPTION WHEN undefined_object THEN NULL;
  END;
  
  BEGIN
    ALTER TABLE votes DROP CONSTRAINT IF EXISTS votes_election_id_student_id_position_id_key;
  EXCEPTION WHEN undefined_object THEN NULL;
  END;
  
  BEGIN
    ALTER TABLE votes DROP CONSTRAINT IF EXISTS unique_vote;
  EXCEPTION WHEN undefined_object THEN NULL;
  END;
  
  BEGIN
    ALTER TABLE votes DROP CONSTRAINT IF EXISTS votes_unique_vote;
  EXCEPTION WHEN undefined_object THEN NULL;
  END;
END $$;

-- Add a new unique constraint that allows multiple votes per position
-- but prevents voting for the same candidate twice in the same election
CREATE UNIQUE INDEX IF NOT EXISTS votes_election_student_candidate_unique
ON votes (election_id, student_id, candidate_id);
