-- Migration: Add comments, reactions, and user profiles for public blog
-- Run this in Supabase SQL Editor

-- ============================================
-- User Profiles (for display names on comments)
-- ============================================
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name VARCHAR(100),
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Auto-create profile when user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (id, display_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- Comments (threaded, authenticated only)
-- ============================================
CREATE TABLE IF NOT EXISTS comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  journal_id UUID NOT NULL REFERENCES journals(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  parent_comment_id UUID REFERENCES comments(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for faster queries
CREATE INDEX IF NOT EXISTS idx_comments_journal_id ON comments(journal_id);
CREATE INDEX IF NOT EXISTS idx_comments_parent_id ON comments(parent_comment_id);
CREATE INDEX IF NOT EXISTS idx_comments_user_id ON comments(user_id);

-- ============================================
-- Reactions (multiple types per journal)
-- ============================================
CREATE TABLE IF NOT EXISTS reactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  journal_id UUID NOT NULL REFERENCES journals(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  reaction_type VARCHAR(20) NOT NULL CHECK (reaction_type IN ('like', 'heart', 'amazed', 'inspired')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(journal_id, user_id)
);

-- Index for faster queries
CREATE INDEX IF NOT EXISTS idx_reactions_journal_id ON reactions(journal_id);

-- ============================================
-- Enable Row Level Security
-- ============================================
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE reactions ENABLE ROW LEVEL SECURITY;

-- ============================================
-- User Profiles Policies
-- ============================================
-- Anyone can view profiles (needed for displaying commenter names)
CREATE POLICY "Public profiles are viewable by everyone"
  ON user_profiles FOR SELECT
  USING (true);

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON user_profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- ============================================
-- Comments Policies
-- ============================================
-- Anyone can view comments on public journals
CREATE POLICY "View comments on public journals"
  ON comments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM journals
      WHERE journals.id = comments.journal_id
      AND journals.is_public = TRUE
    )
  );

-- Journal owners can view all comments on their journals
CREATE POLICY "Journal owners can view all comments"
  ON comments FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM journals
      WHERE journals.id = comments.journal_id
      AND journals.user_id = auth.uid()
    )
  );

-- Authenticated users can insert comments on public journals
CREATE POLICY "Authenticated users can comment on public journals"
  ON comments FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = user_id
    AND EXISTS (
      SELECT 1 FROM journals
      WHERE journals.id = comments.journal_id
      AND journals.is_public = TRUE
    )
  );

-- Users can update their own comments
CREATE POLICY "Users can update own comments"
  ON comments FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their own comments
CREATE POLICY "Users can delete own comments"
  ON comments FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Journal owners can delete any comment on their journals
CREATE POLICY "Journal owners can delete comments"
  ON comments FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM journals
      WHERE journals.id = comments.journal_id
      AND journals.user_id = auth.uid()
    )
  );

-- ============================================
-- Reactions Policies
-- ============================================
-- Anyone can view reactions on public journals
CREATE POLICY "View reactions on public journals"
  ON reactions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM journals
      WHERE journals.id = reactions.journal_id
      AND journals.is_public = TRUE
    )
  );

-- Authenticated users can add reactions to public journals
CREATE POLICY "Authenticated users can react to public journals"
  ON reactions FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = user_id
    AND EXISTS (
      SELECT 1 FROM journals
      WHERE journals.id = reactions.journal_id
      AND journals.is_public = TRUE
    )
  );

-- Users can update their own reactions (change reaction type)
CREATE POLICY "Users can update own reactions"
  ON reactions FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Users can remove their own reactions
CREATE POLICY "Users can delete own reactions"
  ON reactions FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- ============================================
-- Additional Policies for Public Content
-- ============================================
-- Allow anonymous users to view public journals (add to existing policy)
DROP POLICY IF EXISTS "View public journals" ON journals;
CREATE POLICY "View public journals"
  ON journals FOR SELECT
  USING (is_public = TRUE OR auth.uid() = user_id);

-- Allow anonymous users to view public photos
DROP POLICY IF EXISTS "View public photos" ON photos;
CREATE POLICY "View public photos"
  ON photos FOR SELECT
  USING (is_public = TRUE OR auth.uid() = user_id);

-- ============================================
-- Helper function to get reaction counts
-- ============================================
CREATE OR REPLACE FUNCTION get_reaction_counts(p_journal_id UUID)
RETURNS JSON AS $$
  SELECT json_object_agg(reaction_type, count)
  FROM (
    SELECT reaction_type, COUNT(*) as count
    FROM reactions
    WHERE journal_id = p_journal_id
    GROUP BY reaction_type
  ) counts;
$$ LANGUAGE SQL STABLE;

-- ============================================
-- Helper function to get comment count
-- ============================================
CREATE OR REPLACE FUNCTION get_comment_count(p_journal_id UUID)
RETURNS INTEGER AS $$
  SELECT COUNT(*)::INTEGER
  FROM comments
  WHERE journal_id = p_journal_id;
$$ LANGUAGE SQL STABLE;
