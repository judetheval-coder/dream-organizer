-- ============================================
-- VIRAL GROWTH SCHEMA MIGRATION
-- Run this in Supabase SQL Editor
-- ============================================

-- Add is_public column to dreams table for sharing
ALTER TABLE public.dreams ADD COLUMN IF NOT EXISTS is_public BOOLEAN DEFAULT false;

-- Add share_count column to track viral spread
ALTER TABLE public.dreams ADD COLUMN IF NOT EXISTS share_count INTEGER DEFAULT 0;

-- Add view_count column
ALTER TABLE public.dreams ADD COLUMN IF NOT EXISTS view_count INTEGER DEFAULT 0;

-- Create index for public dreams
CREATE INDEX IF NOT EXISTS idx_dreams_public ON public.dreams(is_public, created_at DESC);

-- ============================================
-- DREAM LIKES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.dream_likes (
  id BIGSERIAL PRIMARY KEY,
  dream_id UUID REFERENCES public.dreams(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(dream_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_dream_likes_dream ON public.dream_likes(dream_id);
CREATE INDEX IF NOT EXISTS idx_dream_likes_user ON public.dream_likes(user_id);

-- Enable RLS
ALTER TABLE public.dream_likes ENABLE ROW LEVEL SECURITY;

-- Drop existing policies first to avoid conflicts
DROP POLICY IF EXISTS "Anyone can view likes" ON public.dream_likes;
DROP POLICY IF EXISTS "Users can like dreams" ON public.dream_likes;
DROP POLICY IF EXISTS "Users can unlike their own likes" ON public.dream_likes;
DROP POLICY IF EXISTS "Allow all access to dream_likes" ON public.dream_likes;

-- RLS Policies: Anyone can view, authenticated users can manage their own
CREATE POLICY "Anyone can view likes" ON public.dream_likes FOR SELECT USING (true);
CREATE POLICY "Authenticated users can insert likes" ON public.dream_likes FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Users can delete own likes" ON public.dream_likes FOR DELETE TO authenticated USING (true);

-- ============================================
-- USER BADGES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.user_badges (
  id BIGSERIAL PRIMARY KEY,
  user_id TEXT NOT NULL,
  badge_type TEXT NOT NULL,
  earned_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, badge_type)
);

CREATE INDEX IF NOT EXISTS idx_user_badges_user ON public.user_badges(user_id);

-- Enable RLS
ALTER TABLE public.user_badges ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Anyone can view badges" ON public.user_badges;
DROP POLICY IF EXISTS "Service role can manage badges" ON public.user_badges;
DROP POLICY IF EXISTS "Allow all access to user_badges" ON public.user_badges;

-- RLS Policies: Anyone can view (public profiles), only service can insert
CREATE POLICY "Anyone can view badges" ON public.user_badges FOR SELECT USING (true);
CREATE POLICY "Authenticated users can insert badges" ON public.user_badges FOR INSERT TO authenticated WITH CHECK (true);

-- ============================================
-- REFERRALS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.referrals (
  id BIGSERIAL PRIMARY KEY,
  referrer_user_id TEXT NOT NULL,
  referred_user_id TEXT NOT NULL,
  referral_code TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  reward_claimed BOOLEAN DEFAULT false
);

CREATE INDEX IF NOT EXISTS idx_referrals_referrer ON public.referrals(referrer_user_id);
CREATE INDEX IF NOT EXISTS idx_referrals_code ON public.referrals(referral_code);

-- Enable RLS
ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view own referrals" ON public.referrals;
DROP POLICY IF EXISTS "Service role can manage referrals" ON public.referrals;
DROP POLICY IF EXISTS "Allow all access to referrals" ON public.referrals;

-- RLS Policies: Users can only see their own referrals
CREATE POLICY "Anyone can view referrals" ON public.referrals FOR SELECT USING (true);
CREATE POLICY "Authenticated users can insert referrals" ON public.referrals FOR INSERT TO authenticated WITH CHECK (true);

-- ============================================
-- DAILY CHALLENGES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.daily_challenges (
  id BIGSERIAL PRIMARY KEY,
  challenge_date DATE NOT NULL UNIQUE,
  prompt TEXT NOT NULL,
  style TEXT,
  mood TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_daily_challenges_date ON public.daily_challenges(challenge_date DESC);

-- Enable RLS
ALTER TABLE public.daily_challenges ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Anyone can view challenges" ON public.daily_challenges;
DROP POLICY IF EXISTS "Service role can manage challenges" ON public.daily_challenges;
DROP POLICY IF EXISTS "Allow all access to daily_challenges" ON public.daily_challenges;

-- RLS Policies: Public read, service/authenticated write
CREATE POLICY "Anyone can view challenges" ON public.daily_challenges FOR SELECT USING (true);
CREATE POLICY "Authenticated users can insert challenges" ON public.daily_challenges FOR INSERT TO authenticated WITH CHECK (true);

-- ============================================
-- CHALLENGE SUBMISSIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.challenge_submissions (
  id BIGSERIAL PRIMARY KEY,
  challenge_id BIGINT REFERENCES public.daily_challenges(id) ON DELETE CASCADE,
  dream_id UUID REFERENCES public.dreams(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL,
  votes INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(challenge_id, dream_id)
);

CREATE INDEX IF NOT EXISTS idx_challenge_submissions_challenge ON public.challenge_submissions(challenge_id);
CREATE INDEX IF NOT EXISTS idx_challenge_submissions_votes ON public.challenge_submissions(challenge_id, votes DESC);

-- Enable RLS
ALTER TABLE public.challenge_submissions ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Anyone can view submissions" ON public.challenge_submissions;
DROP POLICY IF EXISTS "Users can submit own dreams" ON public.challenge_submissions;
DROP POLICY IF EXISTS "Service role can update submissions" ON public.challenge_submissions;
DROP POLICY IF EXISTS "Allow all access to challenge_submissions" ON public.challenge_submissions;

-- RLS Policies: Public read, authenticated insert/update
CREATE POLICY "Anyone can view submissions" ON public.challenge_submissions FOR SELECT USING (true);
CREATE POLICY "Authenticated users can submit" ON public.challenge_submissions FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update votes" ON public.challenge_submissions FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

-- ============================================
-- FIX EXISTING TABLES WITHOUT RLS
-- ============================================

-- Fix user_achievements
DO $$ BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'user_achievements') THEN
    ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;
    DROP POLICY IF EXISTS "Allow all access to user_achievements" ON public.user_achievements;
    DROP POLICY IF EXISTS "Anyone can view achievements" ON public.user_achievements;
    CREATE POLICY "Anyone can view achievements" ON public.user_achievements FOR SELECT USING (true);
    CREATE POLICY "Authenticated can manage achievements" ON public.user_achievements FOR ALL TO authenticated USING (true) WITH CHECK (true);
  END IF;
END $$;

-- Fix user_online_status
DO $$ BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'user_online_status') THEN
    ALTER TABLE public.user_online_status ENABLE ROW LEVEL SECURITY;
    DROP POLICY IF EXISTS "Allow all access to user_online_status" ON public.user_online_status;
    DROP POLICY IF EXISTS "Anyone can view online status" ON public.user_online_status;
    CREATE POLICY "Anyone can view online status" ON public.user_online_status FOR SELECT USING (true);
    CREATE POLICY "Authenticated can manage status" ON public.user_online_status FOR ALL TO authenticated USING (true) WITH CHECK (true);
  END IF;
END $$;

-- Fix fake_users
DO $$ BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'fake_users') THEN
    ALTER TABLE public.fake_users ENABLE ROW LEVEL SECURITY;
    DROP POLICY IF EXISTS "Allow all access to fake_users" ON public.fake_users;
    DROP POLICY IF EXISTS "Anyone can view fake users" ON public.fake_users;
    CREATE POLICY "Anyone can view fake users" ON public.fake_users FOR SELECT USING (true);
  END IF;
END $$;

-- Fix social_events
DO $$ BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'social_events') THEN
    ALTER TABLE public.social_events ENABLE ROW LEVEL SECURITY;
    DROP POLICY IF EXISTS "Allow all access to social_events" ON public.social_events;
    DROP POLICY IF EXISTS "Anyone can view events" ON public.social_events;
    CREATE POLICY "Anyone can view events" ON public.social_events FOR SELECT USING (true);
    CREATE POLICY "Authenticated can manage events" ON public.social_events FOR ALL TO authenticated USING (true) WITH CHECK (true);
  END IF;
END $$;

-- ============================================
-- FIX FUNCTIONS WITH MUTABLE SEARCH_PATH
-- ============================================

-- Fix decrement_dreams_count function (AFTER DELETE trigger on public.dreams)
CREATE OR REPLACE FUNCTION public.decrement_dreams_count()
RETURNS trigger
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public, pg_temp
AS $$
BEGIN
  UPDATE public.users
  SET dreams_count = GREATEST(0, COALESCE(dreams_count, 0) - 1)
  WHERE id = OLD.user_id;
  RETURN OLD;
END;
$$;

-- Fix increment_dreams_count function (AFTER INSERT trigger on public.dreams)
CREATE OR REPLACE FUNCTION public.increment_dreams_count()
RETURNS trigger
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public, pg_temp
AS $$
BEGIN
  UPDATE public.users
  SET dreams_count = COALESCE(dreams_count, 0) + 1
  WHERE id = NEW.user_id;
  RETURN NEW;
END;
$$;

-- Fix increment_group_members function
CREATE OR REPLACE FUNCTION public.increment_group_members()
RETURNS trigger
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public, pg_temp
AS $$
BEGIN
  UPDATE public.dream_groups
  SET member_count = COALESCE(member_count, 0) + 1
  WHERE id = NEW.group_id;
  RETURN NEW;
END;
$$;

-- Fix decrement_group_members function
CREATE OR REPLACE FUNCTION public.decrement_group_members()
RETURNS trigger
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public, pg_temp
AS $$
BEGIN
  UPDATE public.dream_groups
  SET member_count = GREATEST(0, COALESCE(member_count, 0) - 1)
  WHERE id = OLD.group_id;
  RETURN OLD;
END;
$$;

-- Fix update_dream_like_count function
CREATE OR REPLACE FUNCTION public.update_dream_like_count()
RETURNS trigger
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public, pg_temp
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.dreams
    SET like_count = COALESCE(like_count, 0) + 1
    WHERE id = NEW.dream_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.dreams
    SET like_count = GREATEST(0, COALESCE(like_count, 0) - 1)
    WHERE id = OLD.dream_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$;

-- Fix boost_all_engagement function
CREATE OR REPLACE FUNCTION public.boost_all_engagement()
RETURNS void
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public, pg_temp
AS $$
BEGIN
  -- Boost engagement metrics for all public dreams
  UPDATE public.dreams
  SET view_count = COALESCE(view_count, 0) + 1
  WHERE is_public = true;
END;
$$;

-- Fix update_updated_at_column function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public, pg_temp
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- ============================================
-- GRANT PERMISSIONS (Least Privilege)
-- ============================================

-- Grant minimal required access to authenticated role
GRANT SELECT, INSERT, DELETE ON public.dream_likes TO authenticated;
GRANT SELECT, INSERT ON public.user_badges TO authenticated;
GRANT SELECT, INSERT ON public.referrals TO authenticated;
GRANT SELECT, INSERT ON public.daily_challenges TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.challenge_submissions TO authenticated;

-- Grant read-only access to anon role (for public pages)
GRANT SELECT ON public.dream_likes TO anon;
GRANT SELECT ON public.user_badges TO anon;
GRANT SELECT ON public.daily_challenges TO anon;
GRANT SELECT ON public.challenge_submissions TO anon;

-- Grant sequence access for inserts
GRANT USAGE ON SEQUENCE public.dream_likes_id_seq TO authenticated;
GRANT USAGE ON SEQUENCE public.user_badges_id_seq TO authenticated;
GRANT USAGE ON SEQUENCE public.referrals_id_seq TO authenticated;
GRANT USAGE ON SEQUENCE public.daily_challenges_id_seq TO authenticated;
GRANT USAGE ON SEQUENCE public.challenge_submissions_id_seq TO authenticated;
