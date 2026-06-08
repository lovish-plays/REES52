-- REES52 Educational Portal Database Migration & Update Script
-- Paste and run this script in your Supabase SQL Editor (https://supabase.com)
-- This creates the reviews table and updates the profiles schema.

-- =========================================================================
-- 1. CREATE REVIEWS TABLE
-- =========================================================================
CREATE TABLE IF NOT EXISTS public.reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    review TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- =========================================================================
-- 2. ALTER PROFILES TABLE (ADD MISSING COLUMNS)
-- =========================================================================
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS password_hash TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS provider TEXT DEFAULT 'email';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS progress JSONB DEFAULT '{}'::jsonb;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS badges JSONB DEFAULT '[]'::jsonb;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS streak JSONB DEFAULT '{"current": 0, "longest": 0, "lastActivityDate": ""}'::jsonb;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS certificates JSONB DEFAULT '[]'::jsonb;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS recently_viewed TEXT[] DEFAULT '{}'::text[];

-- =========================================================================
-- 3. ENABLE ROW LEVEL SECURITY (RLS) & POLICIES
-- =========================================================================
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Allow public read reviews" ON public.reviews;
DROP POLICY IF EXISTS "Allow public write reviews" ON public.reviews;

-- Create reviews policies
CREATE POLICY "Allow public read reviews" ON public.reviews FOR SELECT USING (true);
CREATE POLICY "Allow public write reviews" ON public.reviews FOR INSERT WITH CHECK (true);
