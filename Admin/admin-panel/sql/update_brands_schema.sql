-- SQL to create/update the brands table with all necessary columns
-- Run this in your Supabase SQL Editor

CREATE TABLE IF NOT EXISTS public.brands (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    logo_url TEXT,
    category TEXT,
    description TEXT,
    address TEXT,
    phone VARCHAR(20),
    website_url TEXT,
    status TEXT DEFAULT 'active',
    featured BOOLEAN DEFAULT false,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Ensure columns exist if table was already created (Safe migration)
ALTER TABLE public.brands ADD COLUMN IF NOT EXISTS address TEXT;
ALTER TABLE public.brands ADD COLUMN IF NOT EXISTS phone VARCHAR(20);
ALTER TABLE public.brands ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE public.brands ADD COLUMN IF NOT EXISTS website_url TEXT;
ALTER TABLE public.brands ADD COLUMN IF NOT EXISTS featured BOOLEAN DEFAULT false;
ALTER TABLE public.brands ADD COLUMN IF NOT EXISTS display_order INTEGER DEFAULT 0;

-- Enable Row Level Security (Optional but recommended)
-- ALTER TABLE public.brands ENABLE ROW LEVEL SECURITY;

-- Policy to allow everyone to read
-- CREATE POLICY "Allow public read" ON public.brands FOR SELECT USING (true);
