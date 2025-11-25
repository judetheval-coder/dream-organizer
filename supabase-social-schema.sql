-- Social Features Schema for Dream Organizer
-- Run this in your Supabase SQL Editor after the main schema

-- ============= FOLLOWS TABLE =============
CREATE TABLE IF NOT EXISTS follows (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  follower_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  following_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(follower_id, following_id)
);

CREATE INDEX IF NOT EXISTS idx_follows_follower ON follows(follower_id);
CREATE INDEX IF NOT EXISTS idx_follows_following ON follows(following_id);

-- ============= DREAM GROUPS TABLE =============
CREATE TABLE IF NOT EXISTS dream_groups (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  image_url TEXT,
  created_by TEXT REFERENCES users(id) ON DELETE SET NULL,
  member_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_dream_groups_category ON dream_groups(category);

-- ============= GROUP MEMBERSHIPS TABLE =============
CREATE TABLE IF NOT EXISTS group_memberships (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  group_id UUID NOT NULL REFERENCES dream_groups(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'member' CHECK (role IN ('member', 'moderator', 'admin')),
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(group_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_group_memberships_user ON group_memberships(user_id);
CREATE INDEX IF NOT EXISTS idx_group_memberships_group ON group_memberships(group_id);

-- ============= PUBLISHED DREAMS TABLE =============
CREATE TABLE IF NOT EXISTS published_dreams (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  dream_id UUID NOT NULL REFERENCES dreams(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT,
  view_count INTEGER DEFAULT 0,
  like_count INTEGER DEFAULT 0,
  comment_count INTEGER DEFAULT 0,
  published_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(dream_id)
);

CREATE INDEX IF NOT EXISTS idx_published_dreams_user ON published_dreams(user_id);
CREATE INDEX IF NOT EXISTS idx_published_dreams_date ON published_dreams(published_at DESC);

-- ============= DREAM REACTIONS TABLE =============
CREATE TABLE IF NOT EXISTS dream_reactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  dream_id UUID NOT NULL REFERENCES dreams(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  reaction_type TEXT NOT NULL CHECK (reaction_type IN ('like', 'love', 'wow', 'dream', 'insightful')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(dream_id, user_id, reaction_type)
);

CREATE INDEX IF NOT EXISTS idx_dream_reactions_dream ON dream_reactions(dream_id);
CREATE INDEX IF NOT EXISTS idx_dream_reactions_user ON dream_reactions(user_id);

-- ============= DREAM COMMENTS TABLE =============
CREATE TABLE IF NOT EXISTS dream_comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  dream_id UUID NOT NULL REFERENCES dreams(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_dream_comments_dream ON dream_comments(dream_id);

-- ============= CONTEST ENTRIES TABLE =============
CREATE TABLE IF NOT EXISTS contest_entries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  dream_id UUID NOT NULL REFERENCES dreams(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  contest_id TEXT NOT NULL, -- 'weekly', 'monthly', etc.
  votes INTEGER DEFAULT 0,
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(dream_id, contest_id)
);

CREATE INDEX IF NOT EXISTS idx_contest_entries_contest ON contest_entries(contest_id);
CREATE INDEX IF NOT EXISTS idx_contest_entries_votes ON contest_entries(votes DESC);

-- ============= GIFT SUBSCRIPTIONS TABLE =============
CREATE TABLE IF NOT EXISTS gift_subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  purchaser_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  gift_code TEXT UNIQUE NOT NULL,
  tier TEXT NOT NULL CHECK (tier IN ('pro', 'premium')),
  duration TEXT NOT NULL CHECK (duration IN ('monthly', 'yearly')),
  recipient_email TEXT,
  recipient_name TEXT,
  message TEXT,
  redeemed BOOLEAN DEFAULT FALSE,
  redeemed_by TEXT REFERENCES users(id),
  redeemed_at TIMESTAMP WITH TIME ZONE,
  purchased_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX IF NOT EXISTS idx_gift_subscriptions_code ON gift_subscriptions(gift_code);
CREATE INDEX IF NOT EXISTS idx_gift_subscriptions_purchaser ON gift_subscriptions(purchaser_id);

-- ============= RLS POLICIES =============

ALTER TABLE follows ENABLE ROW LEVEL SECURITY;
ALTER TABLE dream_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE published_dreams ENABLE ROW LEVEL SECURITY;
ALTER TABLE dream_reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE dream_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE contest_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE gift_subscriptions ENABLE ROW LEVEL SECURITY;

-- Follows policies
CREATE POLICY "Anyone can view follows" ON follows FOR SELECT USING (true);
CREATE POLICY "Users can manage own follows" ON follows FOR ALL USING (follower_id = auth.uid()::text);

-- Dream groups policies  
CREATE POLICY "Anyone can view groups" ON dream_groups FOR SELECT USING (true);
CREATE POLICY "Users can create groups" ON dream_groups FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Group creators can update" ON dream_groups FOR UPDATE USING (created_by = auth.uid()::text);

-- Group memberships policies
CREATE POLICY "Anyone can view memberships" ON group_memberships FOR SELECT USING (true);
CREATE POLICY "Users can manage own memberships" ON group_memberships FOR ALL USING (user_id = auth.uid()::text);

-- Published dreams policies
CREATE POLICY "Anyone can view published" ON published_dreams FOR SELECT USING (true);
CREATE POLICY "Users can manage own published" ON published_dreams FOR ALL USING (user_id = auth.uid()::text);

-- Reactions policies
CREATE POLICY "Anyone can view reactions" ON dream_reactions FOR SELECT USING (true);
CREATE POLICY "Users can manage own reactions" ON dream_reactions FOR ALL USING (user_id = auth.uid()::text);

-- Comments policies
CREATE POLICY "Anyone can view comments" ON dream_comments FOR SELECT USING (true);
CREATE POLICY "Users can create comments" ON dream_comments FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Users can manage own comments" ON dream_comments FOR UPDATE USING (user_id = auth.uid()::text);
CREATE POLICY "Users can delete own comments" ON dream_comments FOR DELETE USING (user_id = auth.uid()::text);

-- Contest entries policies
CREATE POLICY "Anyone can view entries" ON contest_entries FOR SELECT USING (true);
CREATE POLICY "Users can manage own entries" ON contest_entries FOR ALL USING (user_id = auth.uid()::text);

-- Gift subscriptions policies
CREATE POLICY "Users can view own gifts" ON gift_subscriptions FOR SELECT 
  USING (purchaser_id = auth.uid()::text OR redeemed_by = auth.uid()::text);
CREATE POLICY "Users can create gifts" ON gift_subscriptions FOR INSERT WITH CHECK (purchaser_id = auth.uid()::text);
CREATE POLICY "Anyone can redeem with code" ON gift_subscriptions FOR UPDATE USING (true);

-- ============= HELPER FUNCTIONS =============

-- Function to increment group member count
CREATE OR REPLACE FUNCTION increment_group_members()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE dream_groups SET member_count = member_count + 1 WHERE id = NEW.group_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to decrement group member count
CREATE OR REPLACE FUNCTION decrement_group_members()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE dream_groups SET member_count = member_count - 1 WHERE id = OLD.group_id;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER increment_group_member_count
  AFTER INSERT ON group_memberships
  FOR EACH ROW EXECUTE FUNCTION increment_group_members();

CREATE TRIGGER decrement_group_member_count
  AFTER DELETE ON group_memberships
  FOR EACH ROW EXECUTE FUNCTION decrement_group_members();

-- Function to update reaction counts
CREATE OR REPLACE FUNCTION update_dream_like_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE published_dreams SET like_count = like_count + 1 WHERE dream_id = NEW.dream_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE published_dreams SET like_count = like_count - 1 WHERE dream_id = OLD.dream_id;
    RETURN OLD;
  END IF;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_like_count_on_reaction
  AFTER INSERT OR DELETE ON dream_reactions
  FOR EACH ROW EXECUTE FUNCTION update_dream_like_count();

-- Insert default dream groups
INSERT INTO dream_groups (name, description, category, member_count) VALUES
  ('Lucid Dreamers', 'Share your lucid dreaming experiences and techniques', 'lucid', 0),
  ('Nightmare Support', 'A safe space to discuss and overcome nightmares', 'nightmares', 0),
  ('Recurring Dreams', 'Explore patterns in your recurring dream themes', 'recurring', 0),
  ('Prophetic Dreams', 'Discuss dreams that seemed to predict the future', 'prophetic', 0),
  ('Flying Dreams', 'For those who soar in their sleep', 'flying', 0),
  ('Dream Interpretation', 'Help each other understand dream symbolism', 'interpretation', 0)
ON CONFLICT DO NOTHING;
