-- Add category_ids column to festive_offers table to store category-level scopes
DO $$ 
BEGIN
    -- Add category_ids column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'festive_offers' AND COLUMN_NAME = 'category_ids') THEN
        ALTER TABLE public.festive_offers ADD COLUMN category_ids UUID[] DEFAULT '{}';
        COMMENT ON COLUMN public.festive_offers.category_ids IS 'Array of category IDs if offer_scope is specific_categories';
    END IF;
END $$;

-- Create GIN index for category_ids lookups
CREATE INDEX IF NOT EXISTS idx_festive_offers_category_ids ON public.festive_offers USING gin (category_ids);
