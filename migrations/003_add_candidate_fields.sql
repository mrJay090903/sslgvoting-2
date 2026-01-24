-- Migration: Add vision and mission columns to candidates table
-- Date: 2026-01-17

-- Add vision column to candidates table
ALTER TABLE candidates
ADD COLUMN IF NOT EXISTS vision TEXT;

-- Add mission column to candidates table
ALTER TABLE candidates
ADD COLUMN IF NOT EXISTS mission TEXT;

-- Add photo_url column if it doesn't exist
ALTER TABLE candidates
ADD COLUMN IF NOT EXISTS photo_url VARCHAR(500);

-- Add comment for documentation
COMMENT ON COLUMN candidates.vision IS 'Candidate vision statement';
COMMENT ON COLUMN candidates.mission IS 'Candidate mission statement';
COMMENT ON COLUMN candidates.photo_url IS 'URL path to candidate photo';
