-- ===============================================================
-- SUPABASE DATABASE SCHEMA & RLS POLICIES FOR USER ADDRESSES
-- Manages customer shipping/delivery addresses for checkout & profiles
-- Admin privileges strictly restricted by email ('manikeeric@gmail.com')
-- ===============================================================

-- 1. Create user_addresses table
CREATE TABLE IF NOT EXISTS public.user_addresses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT,                             -- Recipient full name
    phone_number TEXT,                          -- Primary contact phone number
    additional_phone TEXT,                      -- Alternative contact phone number
    address TEXT NOT NULL,                      -- Street address / Building / House number / Digital Address
    city TEXT NOT NULL,                         -- City / Town (e.g. Accra, Kumasi, Takoradi)
    region TEXT NOT NULL,                       -- Region (e.g. Greater Accra, Ashanti, Western)
    postal_code TEXT,                           -- Postal Code / Ghana Post GPS Code (e.g. GA-183-9024)
    address_additional_info TEXT,               -- Delivery instructions or nearest landmarks
    address_label VARCHAR(50) DEFAULT 'Home' CHECK (address_label IN ('Home', 'Work', 'Office', 'Other')),
    is_default BOOLEAN NOT NULL DEFAULT false,  -- Flag to designate primary default address
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Create performance indexes
CREATE INDEX IF NOT EXISTS idx_user_addresses_user_id ON public.user_addresses(user_id);
CREATE INDEX IF NOT EXISTS idx_user_addresses_is_default ON public.user_addresses(user_id, is_default);
CREATE INDEX IF NOT EXISTS idx_user_addresses_city_region ON public.user_addresses(city, region);

-- 3. Enable Row Level Security (RLS)
ALTER TABLE public.user_addresses ENABLE ROW LEVEL SECURITY;

-- 4. Clean up existing RLS policies
DROP POLICY IF EXISTS "Users can view own addresses" ON public.user_addresses;
DROP POLICY IF EXISTS "Users can insert own addresses" ON public.user_addresses;
DROP POLICY IF EXISTS "Users can update own addresses" ON public.user_addresses;
DROP POLICY IF EXISTS "Users can delete own addresses" ON public.user_addresses;
DROP POLICY IF EXISTS "Admins can view all user addresses" ON public.user_addresses;
DROP POLICY IF EXISTS "Admins can update all user addresses" ON public.user_addresses;
DROP POLICY IF EXISTS "Admins can delete all user addresses" ON public.user_addresses;

-- ===============================================================
-- RLS POLICIES FOR AUTHENTICATED USERS (CUSTOMERS)
-- ===============================================================

-- 5. RLS Policy: Users can view ONLY their own addresses
CREATE POLICY "Users can view own addresses"
ON public.user_addresses
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- 6. RLS Policy: Users can insert addresses for themselves
CREATE POLICY "Users can insert own addresses"
ON public.user_addresses
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- 7. RLS Policy: Users can update ONLY their own addresses
CREATE POLICY "Users can update own addresses"
ON public.user_addresses
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- 8. RLS Policy: Users can delete ONLY their own addresses
CREATE POLICY "Users can delete own addresses"
ON public.user_addresses
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- ===============================================================
-- RLS POLICIES FOR ADMINISTRATORS (manikeeric@gmail.com)
-- ===============================================================

-- 9. Admin Policy: Admin can view ALL addresses
CREATE POLICY "Admins can view all user addresses"
ON public.user_addresses
FOR SELECT
TO authenticated
USING (
    LOWER(auth.jwt() ->> 'email') IN ('manikeeric@gmail.com')
);

-- 10. Admin Policy: Admin can update ALL addresses
CREATE POLICY "Admins can update all user addresses"
ON public.user_addresses
FOR UPDATE
TO authenticated
USING (
    LOWER(auth.jwt() ->> 'email') IN ('manikeeric@gmail.com')
);

-- 11. Admin Policy: Admin can delete ALL addresses
CREATE POLICY "Admins can delete all user addresses"
ON public.user_addresses
FOR DELETE
TO authenticated
USING (
    LOWER(auth.jwt() ->> 'email') IN ('manikeeric@gmail.com')
);

-- ===============================================================
-- TRIGGERS FOR AUTOMATION
-- ===============================================================

-- 12. Trigger Function: Automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_user_addresses_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_user_addresses_updated_at ON public.user_addresses;
CREATE TRIGGER trigger_user_addresses_updated_at
BEFORE UPDATE ON public.user_addresses
FOR EACH ROW
EXECUTE FUNCTION update_user_addresses_updated_at();

-- 13. Trigger Function: Automatically manage single default address per user
CREATE OR REPLACE FUNCTION handle_single_default_user_address()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.is_default = true THEN
        UPDATE public.user_addresses
        SET is_default = false
        WHERE user_id = NEW.user_id
          AND id != NEW.id
          AND is_default = true;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_single_default_user_address ON public.user_addresses;
CREATE TRIGGER trigger_single_default_user_address
AFTER INSERT OR UPDATE OF is_default ON public.user_addresses
FOR EACH ROW
WHEN (NEW.is_default = true)
EXECUTE FUNCTION handle_single_default_user_address();
