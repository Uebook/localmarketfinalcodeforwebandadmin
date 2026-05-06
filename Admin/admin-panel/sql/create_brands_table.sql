-- Create brands table for storing premium brands data
-- Run this SQL in your Supabase SQL Editor

CREATE TABLE IF NOT EXISTS public.brands (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  logo_url TEXT,
  category TEXT,
  description TEXT,
  website_url TEXT,
  featured BOOLEAN DEFAULT false,
  status TEXT DEFAULT 'active', -- 'active', 'inactive'
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_brands_status ON public.brands(status);
CREATE INDEX IF NOT EXISTS idx_brands_featured ON public.brands(featured);
CREATE INDEX IF NOT EXISTS idx_brands_category ON public.brands(category);

-- Create a trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_brands_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER brands_updated_at
  BEFORE UPDATE ON public.brands
  FOR EACH ROW
  EXECUTE FUNCTION update_brands_updated_at();

-- Enable RLS (Row Level Security)
ALTER TABLE public.brands ENABLE ROW LEVEL SECURITY;

-- Create a policy to allow all operations (Admin access)
CREATE POLICY "Allow all operations on brands"
  ON public.brands
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Seed some initial premium brands data
INSERT INTO public.brands (name, logo_url, category, description, featured)
VALUES 
('Nike', 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400', 'Footwear', 'Just Do It', true),
('Adidas', 'https://images.unsplash.com/photo-1587563871167-1ee9c731aefb?w=400', 'Sports', 'Impossible is Nothing', true),
('Puma', 'https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=400', 'Athleisure', 'Forever Faster', true),
('Levi''s', 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=400', 'Apparel', 'Quality never goes out of style', true),
('Apple', 'https://images.unsplash.com/photo-1611186871348-b1ec696e5237?w=400', 'Electronics', 'Think Different', true)
ON CONFLICT DO NOTHING;

-- Verify the table was created
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
AND table_name = 'brands'
ORDER BY ordinal_position;
