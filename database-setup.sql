-- Database Setup for Dream Organizer Dev Tools
-- Run this in your Supabase SQL Editor to create the required tables

-- Create fake_users table for simulation
CREATE TABLE IF NOT EXISTS fake_users (
  id TEXT PRIMARY KEY,
  username TEXT UNIQUE,
  display_name TEXT,
  bio TEXT,
  profile_pic_url TEXT,
  follower_count INTEGER DEFAULT 0,
  post_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user_achievements table
CREATE TABLE IF NOT EXISTS user_achievements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT REFERENCES users(id),
  achievement_type TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  unlocked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user_online_status table
CREATE TABLE IF NOT EXISTS user_online_status (
  user_id TEXT PRIMARY KEY REFERENCES users(id),
  is_online BOOLEAN DEFAULT false,
  last_seen TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  current_activity TEXT
);

-- Create social_events table
CREATE TABLE IF NOT EXISTS social_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_type TEXT NOT NULL,
  user_id TEXT REFERENCES users(id),
  target_type TEXT NOT NULL,
  target_id TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  metadata JSONB DEFAULT '{}'
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_achievements_user_id ON user_achievements(user_id);
CREATE INDEX IF NOT EXISTS idx_user_online_status_online ON user_online_status(is_online);
CREATE INDEX IF NOT EXISTS idx_social_events_type ON social_events(event_type);
CREATE INDEX IF NOT EXISTS idx_social_events_target ON social_events(target_type, target_id);

-- Create boost function
CREATE OR REPLACE FUNCTION boost_all_engagement(multiplier_val INTEGER DEFAULT 2)
RETURNS VOID AS $$
BEGIN
  -- Boost media engagement
  UPDATE public_media
  SET view_count = view_count * multiplier_val,
      like_count = like_count * multiplier_val;

  -- Boost group posts
  UPDATE group_posts
  SET like_count = like_count * multiplier_val,
      comment_count = comment_count * multiplier_val;

  -- Boost comments
  UPDATE comments
  SET like_count = like_count * multiplier_val;
END;
$$ LANGUAGE plpgsql;

-- Insert some sample fake users for testing
INSERT INTO fake_users (id, username, display_name, bio, profile_pic_url, follower_count, post_count)
VALUES
  ('fake-user-1', 'dreamer_alice', 'Alice Dreamer', 'Love exploring the subconscious mind', 'https://api.dicebear.com/7.x/avataaars/svg?seed=alice', 45, 12),
  ('fake-user-2', 'lucid_bob', 'Bob Lucid', 'Master of lucid dreaming techniques', 'https://api.dicebear.com/7.x/avataaars/svg?seed=bob', 78, 23),
  ('fake-user-3', 'nightmare_nina', 'Nina Night', 'Turning nightmares into beautiful art', 'https://api.dicebear.com/7.x/avataaars/svg?seed=nina', 32, 8)
ON CONFLICT (id) DO NOTHING;