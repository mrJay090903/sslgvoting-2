-- Migration: Update representative positions to allow 2 votes
-- Date: 2026-02-19

-- Update all grade representative positions to allow 2 votes
UPDATE positions 
SET max_votes = 2
WHERE name LIKE '%Representative%';
