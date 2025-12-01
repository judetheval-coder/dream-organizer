-- Create flags table for admin moderation
CREATE TABLE IF NOT EXISTS flags (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  dream_id uuid NOT NULL REFERENCES dreams(id) ON DELETE CASCADE,
  user_id uuid REFERENCES users(id),
  reason text NOT NULL,
  resolved boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS flags_dream_id_idx ON flags(dream_id);
CREATE INDEX IF NOT EXISTS flags_user_id_idx ON flags(user_id);
