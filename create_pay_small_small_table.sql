-- ===============================================================
-- SUPABASE DATABASE SCHEMA & RLS POLICIES FOR PAY SMALL SMALL
-- (INSTALLMENT LAYAWAY PLANS & PAYMENTS)
-- ===============================================================

-- 1. Create pay_small_small table
CREATE TABLE IF NOT EXISTS public.pay_small_small (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    product_id TEXT,
    product_name TEXT NOT NULL,
    product_brand TEXT,
    product_image TEXT,
    total_amount NUMERIC(10, 2) NOT NULL,
    paid_amount NUMERIC(10, 2) NOT NULL DEFAULT 0,
    balance_amount NUMERIC(10, 2) NOT NULL,
    frequency VARCHAR(20) NOT NULL DEFAULT 'monthly' CHECK (frequency IN ('weekly', 'bi-weekly', 'monthly')),
    installments_count INTEGER NOT NULL DEFAULT 1,
    installment_amount NUMERIC(10, 2) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'cancelled', 'delivered')),
    payments JSONB NOT NULL DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Create indexes for quick user queries and admin reports
CREATE INDEX IF NOT EXISTS idx_pay_small_small_user_id ON public.pay_small_small(user_id);
CREATE INDEX IF NOT EXISTS idx_pay_small_small_status ON public.pay_small_small(status);

-- 3. Enable Row Level Security (RLS)
ALTER TABLE public.pay_small_small ENABLE ROW LEVEL SECURITY;

-- 4. Clean up existing RLS policies
DROP POLICY IF EXISTS "Customers view own installment plans" ON public.pay_small_small;
DROP POLICY IF EXISTS "Customers insert own installment plans" ON public.pay_small_small;
DROP POLICY IF EXISTS "Customers update own installment plans" ON public.pay_small_small;
DROP POLICY IF EXISTS "Admins view all installment plans" ON public.pay_small_small;
DROP POLICY IF EXISTS "Admins update all installment plans" ON public.pay_small_small;
DROP POLICY IF EXISTS "Admins delete all installment plans" ON public.pay_small_small;

-- ===============================================================
-- RLS POLICIES FOR CUSTOMERS (AUTHENTICATED USERS)
-- ===============================================================

-- 5. Customer Policy: Users can view ONLY their own installment plans
CREATE POLICY "Customers view own installment plans"
ON public.pay_small_small
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- 6. Customer Policy: Users can create an installment plan for themselves
CREATE POLICY "Customers insert own installment plans"
ON public.pay_small_small
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- 7. Customer Policy: Users can update their own installment plan (making payments)
CREATE POLICY "Customers update own installment plans"
ON public.pay_small_small
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- ===============================================================
-- RLS POLICIES FOR ADMINISTRATORS (manikeeric@gmail.com)
-- ===============================================================

-- 8. Admin Policy: Admin can view ALL customer installment plans
CREATE POLICY "Admins view all installment plans"
ON public.pay_small_small
FOR SELECT
TO authenticated
USING (
    LOWER(auth.jwt() ->> 'email') IN ('manikeeric@gmail.com')
);

-- 9. Admin Policy: Admin can update ALL customer installment plans (mark completed/delivered)
CREATE POLICY "Admins update all installment plans"
ON public.pay_small_small
FOR UPDATE
TO authenticated
USING (
    LOWER(auth.jwt() ->> 'email') IN ('manikeeric@gmail.com')
);

-- 10. Admin Policy: Admin can delete installment plans
CREATE POLICY "Admins delete all installment plans"
ON public.pay_small_small
FOR DELETE
TO authenticated
USING (
    LOWER(auth.jwt() ->> 'email') IN ('manikeeric@gmail.com')
);

-- 11. Trigger for automatic updated_at timestamp updates
CREATE OR REPLACE FUNCTION update_pay_small_small_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_pay_small_small_updated_at ON public.pay_small_small;
CREATE TRIGGER trigger_pay_small_small_updated_at
BEFORE UPDATE ON public.pay_small_small
FOR EACH ROW
EXECUTE FUNCTION update_pay_small_small_updated_at();
