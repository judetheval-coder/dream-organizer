-- Dream Organizer Database Schema
-- Run this in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create users table (synced with Clerk)
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY, -- Clerk user ID
  email TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  subscription_tier TEXT DEFAULT 'free' CHECK (subscription_tier IN ('free', 'pro', 'premium')),
  dreams_count INTEGER DEFAULT 0,
  panels_generated_this_month INTEGER DEFAULT 0
);

-- Create dreams table
CREATE TABLE IF NOT EXISTS dreams (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  style TEXT,
  mood TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create panels table
CREATE TABLE IF NOT EXISTS panels (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  dream_id UUID NOT NULL REFERENCES dreams(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  style TEXT,
  mood TEXT,
  image_url TEXT,
  scene_number INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create subscriptions table for tracking payments
CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  stripe_subscription_id TEXT UNIQUE,
  tier TEXT NOT NULL CHECK (tier IN ('free', 'pro', 'premium')),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'canceled', 'past_due')),
  current_period_start TIMESTAMP WITH TIME ZONE,
  current_period_end TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_dreams_user_id ON dreams(user_id);
CREATE INDEX IF NOT EXISTS idx_dreams_created_at ON dreams(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_panels_dream_id ON panels(dream_id);
CREATE INDEX IF NOT EXISTS idx_panels_scene_number ON panels(dream_id, scene_number);
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add triggers to auto-update updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_dreams_updated_at BEFORE UPDATE ON dreams
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_panels_updated_at BEFORE UPDATE ON panels
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_subscriptions_updated_at BEFORE UPDATE ON subscriptions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE dreams ENABLE ROW LEVEL SECURITY;
ALTER TABLE panels ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for users table
CREATE POLICY "Users can view their own profile"
  ON users FOR SELECT
  USING (auth.uid()::text = id);

CREATE POLICY "Users can update their own profile"
  ON users FOR UPDATE
  USING (auth.uid()::text = id);

CREATE POLICY "Users can insert their own profile"
  ON users FOR INSERT
  WITH CHECK (auth.uid()::text = id);

-- RLS Policies for dreams table
CREATE POLICY "Users can view their own dreams"
  ON dreams FOR SELECT
  USING (auth.uid()::text = user_id);

CREATE POLICY "Users can create their own dreams"
  ON dreams FOR INSERT
  WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "Users can update their own dreams"
  ON dreams FOR UPDATE
  USING (auth.uid()::text = user_id);

CREATE POLICY "Users can delete their own dreams"
  ON dreams FOR DELETE
  USING (auth.uid()::text = user_id);

-- RLS Policies for panels table
CREATE POLICY "Users can view their own panels"
  ON panels FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM dreams
    WHERE dreams.id = panels.dream_id
    AND dreams.user_id = auth.uid()::text
  ));

CREATE POLICY "Users can create panels for their dreams"
  ON panels FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM dreams
    WHERE dreams.id = dream_id
    AND dreams.user_id = auth.uid()::text
  ));

CREATE POLICY "Users can update their own panels"
  ON panels FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM dreams
    WHERE dreams.id = panels.dream_id
    AND dreams.user_id = auth.uid()::text
  ));

CREATE POLICY "Users can delete their own panels"
  ON panels FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM dreams
    WHERE dreams.id = panels.dream_id
    AND dreams.user_id = auth.uid()::text
  ));

-- RLS Policies for subscriptions table
CREATE POLICY "Users can view their own subscriptions"
  ON subscriptions FOR SELECT
  USING (auth.uid()::text = user_id);

CREATE POLICY "Service role can manage all subscriptions"
  ON subscriptions FOR ALL
  USING (auth.role() = 'service_role');

-- Create a function to increment dreams count
CREATE OR REPLACE FUNCTION increment_dreams_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE users
  SET dreams_count = dreams_count + 1
  WHERE id = NEW.user_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-increment dreams count
CREATE TRIGGER increment_user_dreams_count
  AFTER INSERT ON dreams
  FOR EACH ROW
  EXECUTE FUNCTION increment_dreams_count();

-- Create a function to decrement dreams count
CREATE OR REPLACE FUNCTION decrement_dreams_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE users
  SET dreams_count = dreams_count - 1
  WHERE id = OLD.user_id;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-decrement dreams count
CREATE TRIGGER decrement_user_dreams_count
  AFTER DELETE ON dreams
  FOR EACH ROW
  EXECUTE FUNCTION decrement_dreams_count();

-- Dream Groups table
CREATE TABLE IF NOT EXISTS dream_groups (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  emoji TEXT DEFAULT '✨',
  is_private BOOLEAN DEFAULT false,
  category TEXT DEFAULT 'general',
  banner_url TEXT,
  icon_url TEXT,
  member_count INTEGER DEFAULT 0,
  created_by TEXT, -- user_id or 'admin'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Group Members table
CREATE TABLE IF NOT EXISTS group_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  group_id UUID NOT NULL REFERENCES dream_groups(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'member' CHECK (role IN ('member', 'moderator', 'leader')),
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(group_id, user_id)
);

-- Contests table
CREATE TABLE IF NOT EXISTS contests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  rules TEXT,
  prize_info TEXT,
  start_date TIMESTAMP WITH TIME ZONE,
  end_date TIMESTAMP WITH TIME ZONE,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'ended', 'cancelled')),
  participant_count INTEGER DEFAULT 0,
  winner_id TEXT REFERENCES users(id),
  created_by TEXT, -- user_id or 'admin'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Contest Entries table
CREATE TABLE IF NOT EXISTS contest_entries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  contest_id UUID NOT NULL REFERENCES contests(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  entry_data JSONB, -- for images, text, etc.
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(contest_id, user_id)
);

-- Fake Users table
CREATE TABLE IF NOT EXISTS fake_users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  username TEXT UNIQUE NOT NULL,
  display_name TEXT,
  bio TEXT,
  profile_pic_url TEXT,
  follower_count INTEGER DEFAULT 0,
  post_count INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Public Media table
CREATE TABLE IF NOT EXISTS public_media (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT REFERENCES users(id), -- can be fake or real
  title TEXT,
  description TEXT,
  media_url TEXT NOT NULL,
  media_type TEXT CHECK (media_type IN ('image', 'video', 'audio')),
  is_approved BOOLEAN DEFAULT true,
  is_featured BOOLEAN DEFAULT false,
  view_count INTEGER DEFAULT 0,
  like_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Comments table for social interaction
CREATE TABLE IF NOT EXISTS comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT REFERENCES users(id), -- can be fake or real
  content TEXT NOT NULL,
  parent_type TEXT CHECK (parent_type IN ('dream', 'panel', 'media', 'group_post')),
  parent_id UUID NOT NULL,
  like_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Group Posts table
CREATE TABLE IF NOT EXISTS group_posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  group_id UUID NOT NULL REFERENCES dream_groups(id) ON DELETE CASCADE,
  user_id TEXT REFERENCES users(id), -- can be fake or real
  title TEXT,
  content TEXT,
  media_url TEXT,
  like_count INTEGER DEFAULT 0,
  comment_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User achievements table
CREATE TABLE IF NOT EXISTS user_achievements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT REFERENCES users(id), -- can be fake or real
  achievement_type TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  unlocked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User online status table
CREATE TABLE IF NOT EXISTS user_online_status (
  user_id TEXT PRIMARY KEY REFERENCES users(id), -- can be fake or real
  is_online BOOLEAN DEFAULT false,
  last_seen TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  current_activity TEXT
);

-- Social events table for tracking interactions
CREATE TABLE IF NOT EXISTS social_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_type TEXT NOT NULL, -- like, follow, share, comment, save
  user_id TEXT REFERENCES users(id), -- can be fake or real
  target_type TEXT NOT NULL, -- dream, panel, media, group, etc.
  target_id TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  metadata JSONB DEFAULT '{}'
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_dream_groups_category ON dream_groups(category);
CREATE INDEX IF NOT EXISTS idx_group_members_group_id ON group_members(group_id);
CREATE INDEX IF NOT EXISTS idx_contests_status ON contests(status);
CREATE INDEX IF NOT EXISTS idx_contest_entries_contest_id ON contest_entries(contest_id);
CREATE INDEX IF NOT EXISTS idx_public_media_user_id ON public_media(user_id);
CREATE INDEX IF NOT EXISTS idx_public_media_featured ON public_media(is_featured);
CREATE INDEX IF NOT EXISTS idx_comments_parent ON comments(parent_type, parent_id);
CREATE INDEX IF NOT EXISTS idx_group_posts_group_id ON group_posts(group_id);
CREATE INDEX IF NOT EXISTS idx_user_achievements_user_id ON user_achievements(user_id);
CREATE INDEX IF NOT EXISTS idx_user_online_status_online ON user_online_status(is_online);
CREATE INDEX IF NOT EXISTS idx_social_events_type ON social_events(event_type);
CREATE INDEX IF NOT EXISTS idx_social_events_target ON social_events(target_type, target_id);

-- Functions
CREATE OR REPLACE FUNCTION boost_all_engagement(multiplier_val INTEGER DEFAULT 2)
RETURNS VOID AS $$
BEGIN
  -- Boost media engagement
  UPDATE public_media
  SET view_count = view_count * multiplier_val,
      like_count = like_count * multiplier_val;

  -- Boost dream engagement (if we add like_count to dreams later)
  -- UPDATE dreams SET like_count = like_count * multiplier_val;

  -- Boost group posts
  UPDATE group_posts
  SET like_count = like_count * multiplier_val,
      comment_count = comment_count * multiplier_val;

  -- Boost comments
  UPDATE comments
  SET like_count = like_count * multiplier_val;
END;
$$ LANGUAGE plpgsql;
