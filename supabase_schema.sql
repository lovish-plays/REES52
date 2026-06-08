-- REES52 Educational Portal Database Setup Script
-- Paste and run this script in your Supabase SQL Editor (https://supabase.com)
-- This will create the missing profiles table, set up trigger-based automatic profile generation,
-- configure Row Level Security (RLS) policies, and seed initial data with correct columns.

-- =========================================================================
-- 1. CREATE MISSING TABLES & TRIGGERS
-- =========================================================================

-- Create profiles table linked to Supabase Auth
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT,
    email TEXT,
    role TEXT DEFAULT 'Student',
    enrolled_videos TEXT[] DEFAULT '{}',
    purchased_ebooks TEXT[] DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Ensure email column exists on profiles table (Migration/Update for existing tables)
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS email TEXT;

-- Automate profile generation when a new user registers via Supabase Auth
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, name, email, role, enrolled_videos, purchased_ebooks)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    new.email,
    'Student',
    ARRAY[]::TEXT[],
    ARRAY[]::TEXT[]
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop trigger if it exists and recreate it
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Sync emails for existing profiles from auth.users table
UPDATE public.profiles p
SET email = u.email
FROM auth.users u
WHERE p.id = u.id AND p.email IS NULL;

-- Insert missing profiles for existing users in auth.users table
INSERT INTO public.profiles (id, name, email, role, enrolled_videos, purchased_ebooks)
SELECT 
  u.id,
  COALESCE(u.raw_user_meta_data->>'name', split_part(u.email, '@', 1)),
  u.email,
  'Student',
  ARRAY[]::TEXT[],
  ARRAY[]::TEXT[]
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.id
WHERE p.id IS NULL;

-- Create notifications table
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    message TEXT NOT NULL,
    link TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- =========================================================================
-- 2. SETUP ROW LEVEL SECURITY (RLS) POLICIES
-- =========================================================================

-- Enable RLS on all tables
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ebooks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.webinars ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Allow public read categories" ON public.categories;
DROP POLICY IF EXISTS "Allow public write categories" ON public.categories;
DROP POLICY IF EXISTS "Allow public read products" ON public.products;
DROP POLICY IF EXISTS "Allow public write products" ON public.products;
DROP POLICY IF EXISTS "Allow public read ebooks" ON public.ebooks;
DROP POLICY IF EXISTS "Allow public write ebooks" ON public.ebooks;
DROP POLICY IF EXISTS "Allow public read videos" ON public.videos;
DROP POLICY IF EXISTS "Allow public write videos" ON public.videos;
DROP POLICY IF EXISTS "Allow public read webinars" ON public.webinars;
DROP POLICY IF EXISTS "Allow public write webinars" ON public.webinars;
DROP POLICY IF EXISTS "Allow public read profiles" ON public.profiles;
DROP POLICY IF EXISTS "Allow individual update profiles" ON public.profiles;
DROP POLICY IF EXISTS "Allow individual insert profiles" ON public.profiles;
DROP POLICY IF EXISTS "Allow public read notifications" ON public.notifications;
DROP POLICY IF EXISTS "Allow public write notifications" ON public.notifications;

-- Create Policies (Allow Public Read)
CREATE POLICY "Allow public read categories" ON public.categories FOR SELECT USING (true);
CREATE POLICY "Allow public read products" ON public.products FOR SELECT USING (true);
CREATE POLICY "Allow public read ebooks" ON public.ebooks FOR SELECT USING (true);
CREATE POLICY "Allow public read videos" ON public.videos FOR SELECT USING (true);
CREATE POLICY "Allow public read webinars" ON public.webinars FOR SELECT USING (true);
CREATE POLICY "Allow public read profiles" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Allow public read notifications" ON public.notifications FOR SELECT USING (true);

-- Create Policies (Allow Public/Admin Writes for Dev/Admin Console access via anon key)
CREATE POLICY "Allow public write categories" ON public.categories FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public write products" ON public.products FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public write ebooks" ON public.ebooks FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public write videos" ON public.videos FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public write webinars" ON public.webinars FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public write notifications" ON public.notifications FOR ALL USING (true) WITH CHECK (true);

-- Create Policies for Profiles (Allow user CRUD)
CREATE POLICY "Allow individual insert profiles" ON public.profiles FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow individual update profiles" ON public.profiles FOR UPDATE USING (auth.uid() = id OR true) WITH CHECK (true);

-- =========================================================================
-- 3. SEED INITIAL DATA (WITH DETERMINISTIC UUID MAPPINGS)
-- =========================================================================

-- Clear existing seeded data to avoid duplication/primary key violations
TRUNCATE public.webinars CASCADE;
TRUNCATE public.videos CASCADE;
TRUNCATE public.ebooks CASCADE;
TRUNCATE public.products CASCADE;
TRUNCATE public.categories CASCADE;

-- Insert Categories
INSERT INTO public.categories (id, name, slug) VALUES
('11111111-1111-1111-1111-111111111111', 'Robotics & Smart Cars', 'robotics-smart-cars'),
('11111111-1111-1111-1111-111111111112', 'Arduino & Microcontrollers', 'arduino-microcontrollers'),
('11111111-1111-1111-1111-111111111113', 'IoT & Sensors', 'iot-sensors'),
('11111111-1111-1111-1111-111111111114', 'Drones & Quadcopters', 'drones-quadcopters');

-- Insert Products
INSERT INTO public.products (id, name, external_url, image_url, category_id) VALUES
('22222222-2222-2222-2222-222222222221', 'REES52 Uno R3 Starter Kit', 'https://rees52.com/microcontroller/123-rees52-uno-r3-starter-kit.html', 'https://images.unsplash.com/photo-1608564697071-ddf911d81370?w=600&auto=format&fit=crop&q=60', '11111111-1111-1111-1111-111111111112'),
('22222222-2222-2222-2222-222222222222', 'REES52 4WD Smart Robot Car Kit v2.0', 'https://rees52.com/robotics/456-rees52-4wd-smart-robot-car-kit.html', 'https://images.unsplash.com/photo-1546776310-eef45dd6d63c?w=600&auto=format&fit=crop&q=60', '11111111-1111-1111-1111-111111111111'),
('22222222-2222-2222-2222-222222222223', 'REES52 Ultimate Sensor Kit (37 in 1)', 'https://rees52.com/sensors/789-rees52-ultimate-sensor-kit.html', 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=600&auto=format&fit=crop&q=60', '11111111-1111-1111-1111-111111111113'),
('22222222-2222-2222-2222-222222222224', 'REES52 F450 Drone DIY Builder Kit', 'https://rees52.com/drones/101-rees52-f450-drone-diy-kit.html', 'https://images.unsplash.com/photo-1508614589041-895b88991e3e?w=600&auto=format&fit=crop&q=60', '11111111-1111-1111-1111-111111111114');

-- Insert Ebooks
INSERT INTO public.ebooks (id, title, pdf_url, category_id, product_id, created_at) VALUES
('33333333-3333-3333-3333-333333333331', 'Getting Started with Arduino Uno R3', 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', '11111111-1111-1111-1111-111111111112', '22222222-2222-2222-2222-222222222221', '2026-05-10T10:00:00Z'),
('33333333-3333-3333-3333-333333333332', 'DIY 4WD Smart Car Building Guide', 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', '11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222', '2026-05-12T12:00:00Z'),
('33333333-3333-3333-3333-333333333333', 'Comprehensive Sensors Handbook (37-in-1)', 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', '11111111-1111-1111-1111-111111111113', '22222222-2222-2222-2222-222222222223', '2026-05-15T08:30:00Z');

-- Insert Videos
INSERT INTO public.videos (id, title, youtube_url, category_id, product_id, created_at) VALUES
('44444444-4444-4444-4444-444444444441', 'Arduino Uno Setup and Blink Tutorial', 'https://www.youtube.com/watch?v=d8_xXNcGYgo', '11111111-1111-1111-1111-111111111112', '22222222-2222-2222-2222-222222222221', '2026-05-11T09:00:00Z'),
('44444444-4444-4444-4444-444444444442', 'Assembling your 4WD Smart Robot Car Step-by-Step', 'https://www.youtube.com/watch?v=hBwslH_Wn4I', '11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222', '2026-05-13T14:20:00Z'),
('44444444-4444-4444-4444-444444444443', 'Interfacing Temperature Sensor (DHT11) with Arduino', 'https://www.youtube.com/watch?v=yG0-nle3rO8', '11111111-1111-1111-1111-111111111113', '22222222-2222-2222-2222-222222222223', '2026-05-16T11:00:00Z');

-- Insert Webinars
INSERT INTO public.webinars (id, title, description, meeting_url, schedule_date, is_live) VALUES
('55555555-5555-5555-5555-555555555551', 'Live Masterclass: Building Autonomous Drones at Home', 'Learn the principles of aeronautics, flight controllers, and assembling drone parts from scratch with REES52 engineers.', 'https://meet.google.com/abc-defg-hij', '2026-06-15T15:00:00Z', TRUE),
('55555555-5555-5555-5555-555555555552', 'IoT Sensors Integration with Dashboard Apps', 'A deep-dive workshop on piping sensor readings from ESP8266/ESP32 into Next.js applications and web databases.', 'https://meet.google.com/xyz-pdqr-lmn', '2026-06-20T17:00:00Z', FALSE);
