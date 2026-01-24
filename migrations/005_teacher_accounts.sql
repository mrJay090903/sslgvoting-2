-- Migration: Add teacher accounts support
-- Date: 2026-01-18

-- Add teacher-specific columns to users table
ALTER TABLE users
ADD COLUMN IF NOT EXISTS assigned_grade INTEGER,
ADD COLUMN IF NOT EXISTS full_name VARCHAR(200),
ADD COLUMN IF NOT EXISTS contact_number VARCHAR(20),
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

-- Create index for faster teacher lookups
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_grade ON users(assigned_grade) WHERE assigned_grade IS NOT NULL;

-- Add comment for documentation
COMMENT ON COLUMN users.assigned_grade IS 'Grade level assigned to teacher (7-12)';
COMMENT ON COLUMN users.full_name IS 'Full name of the user';
COMMENT ON COLUMN users.is_active IS 'Whether the account is active';

-- Update RLS policies for users table
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own profile" ON users;
DROP POLICY IF EXISTS "Service role full access to users" ON users;
DROP POLICY IF EXISTS "Admins can view all users" ON users;
DROP POLICY IF EXISTS "Admins can manage all users" ON users;
DROP POLICY IF EXISTS "Allow all for authenticated users" ON users;

-- Allow authenticated users to read their own row (for login check)
CREATE POLICY "Users can view own profile"
ON users
FOR SELECT
TO authenticated
USING (id = auth.uid());

-- Allow authenticated users to read users table for role checking
CREATE POLICY "Authenticated users can read users"
ON users
FOR SELECT
TO authenticated
USING (true);

-- Service role can do everything (for API routes)
CREATE POLICY "Service role full access to users"
ON users
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);
