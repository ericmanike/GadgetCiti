-- ===============================================================
-- SUPABASE DATABASE SCHEMA & RLS POLICIES FOR USER VERIFICATIONS
-- Stores user identity / Ghana Card verification details & status
-- Admin privileges strictly restricted by email ('manikeeric@gmail.com')
-- ===============================================================

-- 1. Create user_verifications table
CREATE TABLE IF NOT EXISTS public.user_verifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
    ghana_card_number TEXT,
    ghana_card_front TEXT,
    ghana_card_back TEXT,
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'verified', 'rejected')),
    rejection_reason TEXT,
    verified_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_verifications_user_id ON public.user_verifications(user_id);
CREATE INDEX IF NOT EXISTS idx_user_verifications_status ON public.user_verifications(status);

-- 3. Enable Row Level Security (RLS)
ALTER TABLE public.user_verifications ENABLE ROW LEVEL SECURITY;

-- 4. Clean up existing RLS policies
DROP POLICY IF EXISTS "Users can view own verification record" ON public.user_verifications;
DROP POLICY IF EXISTS "Users can insert own verification record" ON public.user_verifications;
DROP POLICY IF EXISTS "Users can update own verification record" ON public.user_verifications;
DROP POLICY IF EXISTS "Admins can view all verification records" ON public.user_verifications;
DROP POLICY IF EXISTS "Admins can update all verification records" ON public.user_verifications;
DROP POLICY IF EXISTS "Admins can delete all verification records" ON public.user_verifications;

-- 5. RLS Policy: Users can view their own verification record
CREATE POLICY "Users can view own verification record"
ON public.user_verifications
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- 6. RLS Policy: Users can insert their own verification record (default status = 'pending')
CREATE POLICY "Users can insert own verification record"
ON public.user_verifications
FOR INSERT
TO authenticated
WITH CHECK (
    auth.uid() = user_id
    AND status = 'pending'
);

-- 7. RLS Policy: Users can update their own verification details (images, card number) but status must remain 'pending'
CREATE POLICY "Users can update own verification record"
ON public.user_verifications
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (
    auth.uid() = user_id
    AND (status = 'pending' OR status = OLD.status)
);

-- 8. RLS Policy: Admins (by email) can view, update, and delete all verification records
CREATE POLICY "Admins can view all verification records"
ON public.user_verifications
FOR SELECT
TO authenticated
USING (
    LOWER(auth.jwt() ->> 'email') IN ('manikeeric@gmail.com')
);

CREATE POLICY "Admins can update all verification records"
ON public.user_verifications
FOR UPDATE
TO authenticated
USING (
    LOWER(auth.jwt() ->> 'email') IN ('manikeeric@gmail.com')
);

CREATE POLICY "Admins can delete all verification records"
ON public.user_verifications
FOR DELETE
TO authenticated
USING (
    LOWER(auth.jwt() ->> 'email') IN ('manikeeric@gmail.com')
);

-- 9. Trigger: Enforce that ONLY Admin (by email) can change status from 'pending' to 'verified' or 'rejected'
CREATE OR REPLACE FUNCTION protect_user_verification_status()
RETURNS TRIGGER AS $$
BEGIN
    -- Check if status is being modified
    IF (OLD.status IS DISTINCT FROM NEW.status) THEN
        -- Verify if the user executing the UPDATE is the admin email
        IF NOT (LOWER(auth.jwt() ->> 'email') IN ('manikeeric@gmail.com')) THEN
            -- Non-admin cannot alter verification status; preserve existing status
            NEW.status := OLD.status;
        END IF;

        -- Automatically set verified_at timestamp when status becomes 'verified'
        IF NEW.status = 'verified' AND OLD.status != 'verified' THEN
            NEW.verified_at := NOW();
        END IF;
    END IF;

    -- Update timestamp
    NEW.updated_at := NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trigger_protect_user_verification_status ON public.user_verifications;
CREATE TRIGGER trigger_protect_user_verification_status
BEFORE UPDATE ON public.user_verifications
FOR EACH ROW
EXECUTE FUNCTION protect_user_verification_status();
