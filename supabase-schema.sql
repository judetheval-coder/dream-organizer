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
