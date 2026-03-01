-- Migration: Add is_admin flag to user_profiles
-- This allows admin gating for journal CRUD and stop editing

-- Add is_admin column
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT FALSE;

-- Set admin flag for Travis's accounts
-- Update these UUIDs after first login, or use email-based matching
UPDATE user_profiles
SET is_admin = TRUE
WHERE id IN (
  SELECT id FROM auth.users
  WHERE email IN ('travis@pham.dev', 'tphambolio@gmail.com')
);

-- Create a helper function to check admin status (usable in RLS policies)
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
  SELECT COALESCE(
    (SELECT is_admin FROM public.user_profiles WHERE id = auth.uid()),
    FALSE
  );
$$ LANGUAGE SQL STABLE SECURITY DEFINER;
