-- Migration: Allow multiple markets within a single Circle/Area
-- Run this SQL in your Supabase SQL Editor to drop the single hierarchy index
-- and replace it with two new indexes that allow multiple markets per Circle.

-- Drop the old unique index that restricted one market per Circle/Area
DROP INDEX IF EXISTS public.locations_unique_hierarchy_idx;

-- Create a unique index for base Circle/Area locations (where circle/market is null)
-- This ensures only one base circle record exists per hierarchy path
CREATE UNIQUE INDEX IF NOT EXISTS locations_unique_circle_null_idx 
  ON public.locations(state, city, town, tehsil, sub_tehsil) 
  WHERE circle IS NULL;

-- Create a unique index for markets (where circle/market is NOT null)
-- This ensures that multiple distinct markets can be created in the same Circle/Area,
-- but prevents creating duplicate markets with the same name within the same Circle/Area.
CREATE UNIQUE INDEX IF NOT EXISTS locations_unique_circle_not_null_idx 
  ON public.locations(state, city, town, tehsil, sub_tehsil, circle) 
  WHERE circle IS NOT NULL;
