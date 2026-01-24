-- Security Migration: Add session_token column to voting_sessions
-- Run this in your Supabase SQL editor

-- Add session_token column for secure vote submission
ALTER TABLE voting_sessions 
ADD COLUMN IF NOT EXISTS session_token TEXT;

-- Add index for faster session lookups
CREATE INDEX IF NOT EXISTS idx_voting_sessions_token 
ON voting_sessions(session_token) 
WHERE session_token IS NOT NULL;

-- Add unique constraint to prevent token reuse
CREATE UNIQUE INDEX IF NOT EXISTS idx_voting_sessions_unique_token 
ON voting_sessions(session_token) 
WHERE session_token IS NOT NULL AND has_voted = false;

-- Update RLS policies for enhanced security
-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow students to create voting sessions" ON voting_sessions;
DROP POLICY IF EXISTS "Allow students to update own voting sessions" ON voting_sessions;
DROP POLICY IF EXISTS "Allow students to view own voting sessions" ON voting_sessions;
DROP POLICY IF EXISTS "Service role full access to voting_sessions" ON voting_sessions;
DROP POLICY IF EXISTS "Students can view own sessions" ON voting_sessions;

-- Create secure RLS policies
-- Only allow authenticated service role for voting_sessions
ALTER TABLE voting_sessions ENABLE ROW LEVEL SECURITY;

-- Policy: Only service role can manage voting sessions
CREATE POLICY "Service role full access to voting_sessions"
ON voting_sessions
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Ensure votes table has proper RLS
DROP POLICY IF EXISTS "Students can insert votes" ON votes;
DROP POLICY IF EXISTS "Students can view own votes" ON votes;
DROP POLICY IF EXISTS "Service role full access to votes" ON votes;

ALTER TABLE votes ENABLE ROW LEVEL SECURITY;

-- Only service role can insert votes (prevents client-side manipulation)
CREATE POLICY "Service role full access to votes"
ON votes
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Add audit log table for security monitoring
CREATE TABLE IF NOT EXISTS security_audit_log (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    event_type TEXT NOT NULL,
    event_data JSONB,
    ip_address TEXT,
    user_agent TEXT,
    user_id UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for audit log queries
CREATE INDEX IF NOT EXISTS idx_audit_log_type ON security_audit_log(event_type);
CREATE INDEX IF NOT EXISTS idx_audit_log_created ON security_audit_log(created_at);
CREATE INDEX IF NOT EXISTS idx_audit_log_user ON security_audit_log(user_id);

-- Enable RLS on audit log
ALTER TABLE security_audit_log ENABLE ROW LEVEL SECURITY;

-- Drop existing audit policies
DROP POLICY IF EXISTS "Service role full access to audit_log" ON security_audit_log;
DROP POLICY IF EXISTS "Admins can view audit_log" ON security_audit_log;

-- Only service role can access audit log
CREATE POLICY "Service role full access to audit_log"
ON security_audit_log
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Admins can read audit log (using users.id which matches auth.uid())
CREATE POLICY "Admins can view audit_log"
ON security_audit_log
FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM users 
        WHERE users.id::uuid = auth.uid() 
        AND users.role = 'admin'
    )
);
