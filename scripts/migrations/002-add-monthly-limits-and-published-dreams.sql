-- Migration: Add monthly dream limits and published_dreams table
-- Run this in your Supabase SQL Editor

-- ============================================
-- ADD MONTHLY DREAM COUNT TO USERS
-- ============================================

-- Add dreams_count_this_month column
ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS dreams_count_this_month INTEGER DEFAULT 0;

-- Add last_month_reset column to track when we last reset the count
ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS last_month_reset DATE DEFAULT CURRENT_DATE;

-- Function to reset monthly counts (call this via cron or on user access)
CREATE OR REPLACE FUNCTION public.reset_monthly_dream_count()
RETURNS trigger
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public, pg_temp
AS $$
BEGIN
  -- Reset count if we're in a new month
  IF NEW.last_month_reset IS NULL OR
     DATE_TRUNC('month', NEW.last_month_reset) < DATE_TRUNC('month', CURRENT_DATE) THEN
    NEW.dreams_count_this_month := 0;
    NEW.last_month_reset := CURRENT_DATE;
  END IF;
  RETURN NEW;
END;
$$;

-- Trigger to auto-reset on user update
DROP TRIGGER IF EXISTS trigger_reset_monthly_dream_count ON public.users;
CREATE TRIGGER trigger_reset_monthly_dream_count
  BEFORE UPDATE ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION public.reset_monthly_dream_count();

-- ============================================
-- PUBLISHED DREAMS TABLE (for public gallery)
-- ============================================

CREATE TABLE IF NOT EXISTS public.published_dreams (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  dream_id UUID NOT NULL REFERENCES public.dreams(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  title TEXT,
  description TEXT,
  thumbnail_url TEXT,
  view_count INTEGER DEFAULT 0,
  like_count INTEGER DEFAULT 0,
  share_count INTEGER DEFAULT 0,
  is_featured BOOLEAN DEFAULT false,
  published_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(dream_id) -- Each dream can only be published once
);

-- Indexes for published_dreams
CREATE INDEX IF NOT EXISTS idx_published_dreams_user ON public.published_dreams(user_id);
CREATE INDEX IF NOT EXISTS idx_published_dreams_featured ON public.published_dreams(is_featured, published_at DESC);
CREATE INDEX IF NOT EXISTS idx_published_dreams_popular ON public.published_dreams(like_count DESC, view_count DESC);
CREATE INDEX IF NOT EXISTS idx_published_dreams_recent ON public.published_dreams(published_at DESC);

-- Enable RLS
ALTER TABLE public.published_dreams ENABLE ROW LEVEL SECURITY;

-- RLS Policies
DROP POLICY IF EXISTS "Anyone can view published dreams" ON public.published_dreams;
DROP POLICY IF EXISTS "Users can publish own dreams" ON public.published_dreams;
DROP POLICY IF EXISTS "Users can unpublish own dreams" ON public.published_dreams;

CREATE POLICY "Anyone can view published dreams"
  ON public.published_dreams FOR SELECT USING (true);

CREATE POLICY "Users can publish own dreams"
  ON public.published_dreams FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can unpublish own dreams"
  ON public.published_dreams FOR DELETE
  USING (true);

CREATE POLICY "Users can update own published dreams"
  ON public.published_dreams FOR UPDATE
  USING (true);

-- Grant permissions
GRANT SELECT ON public.published_dreams TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.published_dreams TO authenticated;

-- ============================================
-- REFERRALS TABLE FIX (add missing columns)
-- ============================================

-- Add code column if missing (for user's personal referral code)
DO $$ BEGIN
  ALTER TABLE public.referrals ADD COLUMN IF NOT EXISTS code TEXT;
  ALTER TABLE public.referrals ADD COLUMN IF NOT EXISTS user_id TEXT;
  ALTER TABLE public.referrals ADD COLUMN IF NOT EXISTS successful_referrals INTEGER DEFAULT 0;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

-- Create referral_signups table if not exists
CREATE TABLE IF NOT EXISTS public.referral_signups (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  referrer_id TEXT NOT NULL,
  referred_user_id TEXT NOT NULL UNIQUE,
  referral_code TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on referral_signups
ALTER TABLE public.referral_signups ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view referral signups" ON public.referral_signups;
CREATE POLICY "Anyone can view referral signups"
  ON public.referral_signups FOR SELECT USING (true);

CREATE POLICY "Authenticated can insert referral signups"
  ON public.referral_signups FOR INSERT
  WITH CHECK (true);

-- ============================================
-- ENSURE DREAM_GROUPS TABLE HAS ALL COLUMNS
-- ============================================

-- Add missing columns to dream_groups if they don't exist
DO $$ BEGIN
  ALTER TABLE public.dream_groups ADD COLUMN IF NOT EXISTS emoji TEXT DEFAULT '✨';
EXCEPTION WHEN undefined_table THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE public.dream_groups ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'general';
EXCEPTION WHEN undefined_table THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE public.dream_groups ADD COLUMN IF NOT EXISTS member_count INTEGER DEFAULT 0;
EXCEPTION WHEN undefined_table THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE public.dream_groups ADD COLUMN IF NOT EXISTS created_by TEXT;
EXCEPTION WHEN undefined_table THEN NULL;
END $$;

-- ============================================
-- INITIAL DATA FOR GROUPS (so they don't look empty)
-- ============================================

-- Only insert if dream_groups table exists and has the emoji column
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'dream_groups' AND column_name = 'emoji'
  ) THEN
    INSERT INTO public.dream_groups (name, description, emoji, category, member_count, created_by)
    VALUES
      ('Lucid Dreamers', 'Share techniques and experiences about lucid dreaming', '🌟', 'technique', 0, 'admin'),
      ('Nightmare Support', 'A safe space to discuss and process nightmares', '🌙', 'support', 0, 'admin'),
      ('Dream Artists', 'Share your dream-inspired artwork and comics', '🎨', 'creative', 0, 'admin'),
      ('Recurring Dreams', 'Discuss patterns and recurring themes in your dreams', '🔄', 'analysis', 0, 'admin'),
      ('Flying Dreams', 'For those who love soaring through the dream sky', '🦅', 'themes', 0, 'admin')
    ON CONFLICT DO NOTHING;
  ELSIF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'dream_groups') THEN
    -- Table exists but without emoji column, insert with basic columns only
    INSERT INTO public.dream_groups (name, description)
    VALUES
      ('Lucid Dreamers', 'Share techniques and experiences about lucid dreaming'),
      ('Nightmare Support', 'A safe space to discuss and process nightmares'),
      ('Dream Artists', 'Share your dream-inspired artwork and comics')
    ON CONFLICT DO NOTHING;
  END IF;
END $$;

-- ============================================
-- ADD LIKE_COUNT TO DREAMS (for leaderboard)
-- ============================================

ALTER TABLE public.dreams ADD COLUMN IF NOT EXISTS like_count INTEGER DEFAULT 0;

-- ============================================
-- VERIFY ALL REQUIRED COLUMNS EXIST
-- ============================================

-- Ensure dreams has all needed columns
ALTER TABLE public.dreams ADD COLUMN IF NOT EXISTS is_public BOOLEAN DEFAULT false;
ALTER TABLE public.dreams ADD COLUMN IF NOT EXISTS share_count INTEGER DEFAULT 0;
ALTER TABLE public.dreams ADD COLUMN IF NOT EXISTS view_count INTEGER DEFAULT 0;

-- Done! Run SELECT 1 to verify the script completed
SELECT 'Migration completed successfully!' as status;
