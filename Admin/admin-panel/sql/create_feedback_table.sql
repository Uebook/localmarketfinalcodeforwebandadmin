-- Create feedback table for user and vendor feedback
CREATE TABLE IF NOT EXISTS public.feedback (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type TEXT NOT NULL DEFAULT 'user', -- 'user' | 'vendor' | 'suggestion'
    user_id TEXT,
    user_name TEXT,
    vendor_id TEXT,
    vendor_name TEXT,
    category TEXT NOT NULL DEFAULT 'General',
    rating INTEGER DEFAULT 0,
    comment TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending', -- 'pending' | 'reviewed' | 'resolved'
    location TEXT, -- Stores city/state or coordinates
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_feedback_type ON public.feedback(type);
CREATE INDEX IF NOT EXISTS idx_feedback_status ON public.feedback(status);
CREATE INDEX IF NOT EXISTS idx_feedback_created_at ON public.feedback(created_at DESC);

-- Enable Row Level Security (RLS)
ALTER TABLE public.feedback ENABLE ROW LEVEL SECURITY;

-- Create policies to allow access
-- Allow anyone (public/anon/authenticated) to insert feedback
CREATE POLICY "Allow public insert" ON public.feedback
    FOR INSERT WITH CHECK (true);

-- Allow everyone to select feedback (necessary for admin panel and verification)
CREATE POLICY "Allow public select" ON public.feedback
    FOR SELECT USING (true);

-- Allow updates (e.g. status changes by admin panel)
CREATE POLICY "Allow public update" ON public.feedback
    FOR UPDATE USING (true);

-- Allow deletes
CREATE POLICY "Allow public delete" ON public.feedback
    FOR DELETE USING (true);

-- Add comments for documentation
COMMENT ON TABLE public.feedback IS 'Table to store user and vendor feedback, reviews, suggestions';
COMMENT ON COLUMN public.feedback.type IS 'Type of feedback: user, vendor, suggestion';
COMMENT ON COLUMN public.feedback.status IS 'Status of the feedback: pending, reviewed, resolved';
