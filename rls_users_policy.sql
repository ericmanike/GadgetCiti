-- ===============================================================
-- SUPABASE ROW LEVEL SECURITY (RLS) POLICIES FOR 'users' TABLE
-- Allows Admins (manikeeric@gmail.com) to DELETE user profiles.
-- ===============================================================

-- 1. Enable RLS on users table (if not already enabled)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- 2. Clean up existing delete policies
DROP POLICY IF EXISTS "Allow admin delete on users" ON users;
DROP POLICY IF EXISTS "Allow public read access to users" ON users;
DROP POLICY IF EXISTS "Allow users read own profile" ON users;

-- 3. Allow public/authenticated read access to users table
CREATE POLICY "Allow public read access to users"
ON users
FOR SELECT
USING (true);

-- 4. Allow Admin (manikeeric@gmail.com) to DELETE from users table
CREATE POLICY "Allow admin delete on users"
ON users
FOR DELETE
TO authenticated
USING (
  LOWER(auth.jwt() ->> 'email') IN ('manikeeric@gmail.com')
  OR
  EXISTS (
    SELECT 1 FROM users AS admin_check
    WHERE admin_check.id = auth.uid()
    AND LOWER(admin_check.role) = 'admin'
  )
);
