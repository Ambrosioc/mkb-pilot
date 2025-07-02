-- Add RLS policies for users to update their own profile
-- This allows users to update their photo_url and other profile information

-- Enable RLS on users table if not already enabled
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Policy to allow users to read their own profile
CREATE POLICY "Users can read their own profile" ON users
    FOR SELECT USING (auth.uid() = auth_user_id);

-- Policy to allow users to update their own profile
CREATE POLICY "Users can update their own profile" ON users
    FOR UPDATE USING (auth.uid() = auth_user_id);

-- Policy to allow users to insert their own profile (if needed)
CREATE POLICY "Users can insert their own profile" ON users
    FOR INSERT WITH CHECK (auth.uid() = auth_user_id);

-- Add comment explaining the policies
COMMENT ON POLICY "Users can read their own profile" ON users IS 'Allows users to read their own profile information';
COMMENT ON POLICY "Users can update their own profile" ON users IS 'Allows users to update their own profile information including photo_url';
COMMENT ON POLICY "Users can insert their own profile" ON users IS 'Allows users to insert their own profile (for registration)'; 