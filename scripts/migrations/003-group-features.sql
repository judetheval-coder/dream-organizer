-- ============================================
-- GROUP FEATURES MIGRATION
-- Adds structured dream posting, reactions, reflections, rituals, and matching
-- ============================================

-- Extend group_posts with structured dream data
ALTER TABLE group_posts ADD COLUMN IF NOT EXISTS dream_type TEXT CHECK (dream_type IN ('flying', 'falling', 'lucid', 'nightmare', 'recurring', 'prophetic', 'adventure', 'mystical', 'other'));
ALTER TABLE group_posts ADD COLUMN IF NOT EXISTS dream_mood TEXT CHECK (dream_mood IN ('calm', 'fear', 'euphoric', 'confusing', 'peaceful', 'anxious', 'joyful', 'mysterious'));
ALTER TABLE group_posts ADD COLUMN IF NOT EXISTS vividness INTEGER CHECK (vividness >= 1 AND vividness <= 10);
ALTER TABLE group_posts ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}';
ALTER TABLE group_posts ADD COLUMN IF NOT EXISTS dream_title TEXT;

-- Dream Reactions table (replaces simple likes)
CREATE TABLE IF NOT EXISTS dream_reactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id UUID NOT NULL REFERENCES group_posts(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  reaction_type TEXT NOT NULL CHECK (reaction_type IN ('soaring', 'haunting', 'lucid', 'familiar', 'intense')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(post_id, user_id, reaction_type)
);

CREATE INDEX IF NOT EXISTS idx_dream_reactions_post ON dream_reactions(post_id);
CREATE INDEX IF NOT EXISTS idx_dream_reactions_user ON dream_reactions(user_id);

-- Reflections table (themed comments)
CREATE TABLE IF NOT EXISTS dream_reflections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id UUID NOT NULL REFERENCES group_posts(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  quoted_text TEXT, -- For quoting specific lines from the dream
  reflection_type TEXT CHECK (reflection_type IN ('interpretation', 'question', 'connection', 'memory', 'general')),
  like_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_dream_reflections_post ON dream_reflections(post_id);

-- Circle Rituals table (group prompts)
CREATE TABLE IF NOT EXISTS circle_rituals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  group_id UUID NOT NULL REFERENCES dream_groups(id) ON DELETE CASCADE,
  prompt_text TEXT NOT NULL,
  ritual_type TEXT CHECK (ritual_type IN ('daily', 'weekly', 'special')),
  scheduled_date DATE,
  is_active BOOLEAN DEFAULT true,
  created_by TEXT REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_circle_rituals_group ON circle_rituals(group_id);
CREATE INDEX IF NOT EXISTS idx_circle_rituals_active ON circle_rituals(is_active, scheduled_date);

-- Dream Matching table (tracks similarities)
CREATE TABLE IF NOT EXISTS dream_matches (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  group_id UUID NOT NULL REFERENCES dream_groups(id) ON DELETE CASCADE,
  post_id_1 UUID NOT NULL REFERENCES group_posts(id) ON DELETE CASCADE,
  post_id_2 UUID NOT NULL REFERENCES group_posts(id) ON DELETE CASCADE,
  similarity_score INTEGER CHECK (similarity_score >= 0 AND similarity_score <= 100),
  matched_symbols TEXT[],
  matched_emotions TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(post_id_1, post_id_2)
);

CREATE INDEX IF NOT EXISTS idx_dream_matches_group ON dream_matches(group_id);

-- Dream Streaks table
CREATE TABLE IF NOT EXISTS dream_streaks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  group_id UUID NOT NULL REFERENCES dream_groups(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  last_post_date DATE,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(group_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_dream_streaks_group ON dream_streaks(group_id);
CREATE INDEX IF NOT EXISTS idx_dream_streaks_user ON dream_streaks(user_id);

-- Dream Symbols Map (for constellation visualization)
CREATE TABLE IF NOT EXISTS dream_symbols (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  group_id UUID NOT NULL REFERENCES dream_groups(id) ON DELETE CASCADE,
  symbol TEXT NOT NULL, -- emoji or text like "🪽", "🌊", "🌕"
  count INTEGER DEFAULT 1,
  last_seen TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(group_id, symbol)
);

CREATE INDEX IF NOT EXISTS idx_dream_symbols_group ON dream_symbols(group_id);

-- Group Roles (extend group_members with earned roles)
ALTER TABLE group_members ADD COLUMN IF NOT EXISTS earned_role TEXT CHECK (earned_role IN ('dream_keeper', 'circle_guide', 'wanderer', 'lucid_one', NULL));

-- Functions for reaction counts
CREATE OR REPLACE FUNCTION get_post_reaction_counts(post_uuid UUID)
RETURNS JSONB AS $$
  SELECT jsonb_object_agg(reaction_type, count)
  FROM (
    SELECT reaction_type, COUNT(*) as count
    FROM dream_reactions
    WHERE post_id = post_uuid
    GROUP BY reaction_type
  ) sub;
$$ LANGUAGE sql;

-- Function to update dream symbols
CREATE OR REPLACE FUNCTION update_dream_symbols(group_uuid UUID, symbol_text TEXT)
RETURNS VOID AS $$
BEGIN
  INSERT INTO dream_symbols (group_id, symbol, count, last_seen)
  VALUES (group_uuid, symbol_text, 1, NOW())
  ON CONFLICT (group_id, symbol)
  DO UPDATE SET 
    count = dream_symbols.count + 1,
    last_seen = NOW();
END;
$$ LANGUAGE plpgsql;

-- Function to calculate dream similarity (simple keyword/emotion matching)
CREATE OR REPLACE FUNCTION calculate_dream_similarity(post1_id UUID, post2_id UUID)
RETURNS INTEGER AS $$
DECLARE
  score INTEGER := 0;
  post1_tags TEXT[];
  post2_tags TEXT[];
  post1_mood TEXT;
  post2_mood TEXT;
  post1_type TEXT;
  post2_type TEXT;
BEGIN
  -- Get post data
  SELECT tags, dream_mood, dream_type INTO post1_tags, post1_mood, post1_type
  FROM group_posts WHERE id = post1_id;
  
  SELECT tags, dream_mood, dream_type INTO post2_tags, post2_mood, post2_type
  FROM group_posts WHERE id = post2_id;
  
  -- Match on type (30 points)
  IF post1_type = post2_type AND post1_type IS NOT NULL THEN
    score := score + 30;
  END IF;
  
  -- Match on mood (25 points)
  IF post1_mood = post2_mood AND post1_mood IS NOT NULL THEN
    score := score + 25;
  END IF;
  
  -- Match on tags (45 points, distributed)
  IF post1_tags IS NOT NULL AND post2_tags IS NOT NULL THEN
    score := score + LEAST(45, array_length(array(
      SELECT unnest(post1_tags) INTERSECT SELECT unnest(post2_tags)
    ), 1) * 15);
  END IF;
  
  RETURN LEAST(100, score);
END;
$$ LANGUAGE plpgsql;

