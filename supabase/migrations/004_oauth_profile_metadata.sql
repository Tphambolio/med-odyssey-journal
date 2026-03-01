-- Migration: Update user profile trigger to extract OAuth metadata
-- Supports Google and Facebook OAuth providers alongside magic link auth

-- Replace the handle_new_user function to extract OAuth metadata
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (id, display_name, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(
      NEW.raw_user_meta_data->>'full_name',
      NEW.raw_user_meta_data->>'name',
      split_part(NEW.email, '@', 1)
    ),
    COALESCE(
      NEW.raw_user_meta_data->>'avatar_url',
      NEW.raw_user_meta_data->>'picture'
    )
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- The existing trigger on auth.users already calls handle_new_user(),
-- so no need to recreate it. The updated function will be used automatically
-- for all new signups (magic link, Google, and Facebook).
