-- ===============================================================
-- SUPABASE ROW LEVEL SECURITY (RLS) POLICIES FOR 'products' TABLE
-- Only Admins (by email: manikeeric@gmail.com) can INSERT, UPDATE, and DELETE.
-- Everyone (Public/Anon/Auth) can READ (SELECT) products.
-- ===============================================================

-- 1. Enable Row Level Security on products table
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if needed to avoid conflicts
DROP POLICY IF EXISTS "Allow public read access to products" ON products;
DROP POLICY IF EXISTS "Allow admin insert on products" ON products;
DROP POLICY IF EXISTS "Allow admin update on products" ON products;
DROP POLICY IF EXISTS "Allow admin delete on products" ON products;

-- 2. PUBLIC READ POLICY (Anyone can view products)
CREATE POLICY "Allow public read access to products"
ON products
FOR SELECT
USING (true);

-- 3. ADMIN INSERT POLICY (Only authenticated users with admin email)
CREATE POLICY "Allow admin insert on products"
ON products
FOR INSERT
TO authenticated
WITH CHECK (
  LOWER(auth.jwt() ->> 'email') IN ('manikeeric@gmail.com')
);

-- 4. ADMIN UPDATE POLICY (Only authenticated users with admin email)
CREATE POLICY "Allow admin update on products"
ON products
FOR UPDATE
TO authenticated
USING (
  LOWER(auth.jwt() ->> 'email') IN ('manikeeric@gmail.com')
)
WITH CHECK (
  LOWER(auth.jwt() ->> 'email') IN ('manikeeric@gmail.com')
);

-- 5. ADMIN DELETE POLICY (Only authenticated users with admin email)
CREATE POLICY "Allow admin delete on products"
ON products
FOR DELETE
TO authenticated
USING (
  LOWER(auth.jwt() ->> 'email') IN ('manikeeric@gmail.com')
);
