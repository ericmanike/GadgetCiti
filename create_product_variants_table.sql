-- ===============================================================
-- SUPABASE DATABASE SCHEMA & RLS POLICIES FOR PRODUCT VARIANTS
-- Stores product variants (colors, storage sizes, RAM, price & stock)
-- ===============================================================

-- 1. Create product_variants table
CREATE TABLE IF NOT EXISTS public.product_variants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    color TEXT,                            -- e.g. 'Space Black', 'Natural Titanium', 'Silver'
    color_code TEXT,                       -- e.g. '#1c1c1e', '#8a8885'
    storage_size TEXT,                     -- e.g. '128GB', '256GB', '512GB', '1TB'
    ram_size TEXT,                         -- e.g. '8GB', '16GB', '32GB'
    sku TEXT,                              -- Stock Keeping Unit (e.g. 'APL-IP15PM-256-BLK')
    price NUMERIC(10, 2),                  -- Specific price for this variant (optional)
    price_modifier NUMERIC(10, 2) DEFAULT 0, -- Price adjustment relative to base product price
    stock INTEGER NOT NULL DEFAULT 0,      -- Variant inventory count
    is_active BOOLEAN NOT NULL DEFAULT true, -- Active availability flag
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Create indexes for performance queries
CREATE INDEX IF NOT EXISTS idx_product_variants_product_id ON public.product_variants(product_id);
CREATE INDEX IF NOT EXISTS idx_product_variants_color ON public.product_variants(color);
CREATE INDEX IF NOT EXISTS idx_product_variants_storage ON public.product_variants(storage_size);
CREATE INDEX IF NOT EXISTS idx_product_variants_sku ON public.product_variants(sku);

-- 3. Enable Row Level Security (RLS)
ALTER TABLE public.product_variants ENABLE ROW LEVEL SECURITY;

-- 4. Clean up existing RLS policies
DROP POLICY IF EXISTS "Public read access to product_variants" ON public.product_variants;
DROP POLICY IF EXISTS "Sellers and Admins insert product_variants" ON public.product_variants;
DROP POLICY IF EXISTS "Sellers and Admins update product_variants" ON public.product_variants;
DROP POLICY IF EXISTS "Sellers and Admins delete product_variants" ON public.product_variants;

-- 5. RLS Policy: Public & Authenticated Read Access
CREATE POLICY "Public read access to product_variants"
ON public.product_variants
FOR SELECT
USING (true);

-- 6. RLS Policy: Insert - Sellers (for own products) & Admin
CREATE POLICY "Sellers and Admins insert product_variants"
ON public.product_variants
FOR INSERT
TO authenticated
WITH CHECK (
    LOWER(auth.jwt() ->> 'email') IN ('manikeeric@gmail.com')
    OR EXISTS (
        SELECT 1 FROM public.products p
        WHERE p.id = product_id
        AND p.user_id = auth.uid()
    )
);

-- 7. RLS Policy: Update - Sellers (for own products) & Admin
CREATE POLICY "Sellers and Admins update product_variants"
ON public.product_variants
FOR UPDATE
TO authenticated
USING (
    LOWER(auth.jwt() ->> 'email') IN ('manikeeric@gmail.com')
    OR EXISTS (
        SELECT 1 FROM public.products p
        WHERE p.id = product_id
        AND p.user_id = auth.uid()
    )
)
WITH CHECK (
    LOWER(auth.jwt() ->> 'email') IN ('manikeeric@gmail.com')
    OR EXISTS (
        SELECT 1 FROM public.products p
        WHERE p.id = product_id
        AND p.user_id = auth.uid()
    )
);

-- 8. RLS Policy: Delete - Sellers (for own products) & Admin
CREATE POLICY "Sellers and Admins delete product_variants"
ON public.product_variants
FOR DELETE
TO authenticated
USING (
    LOWER(auth.jwt() ->> 'email') IN ('manikeeric@gmail.com')
    OR EXISTS (
        SELECT 1 FROM public.products p
        WHERE p.id = product_id
        AND p.user_id = auth.uid()
    )
);

-- 9. Trigger for automatic updated_at timestamp updates
CREATE OR REPLACE FUNCTION update_product_variants_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_product_variants_updated_at ON public.product_variants;
CREATE TRIGGER trigger_product_variants_updated_at
BEFORE UPDATE ON public.product_variants
FOR EACH ROW
EXECUTE FUNCTION update_product_variants_updated_at();
