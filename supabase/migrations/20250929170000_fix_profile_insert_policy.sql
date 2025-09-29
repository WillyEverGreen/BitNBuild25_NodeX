-- Fix user_profiles INSERT policy to allow users to create their own profile
-- Drop the existing policy
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.user_profiles;

-- Recreate with correct check that matches auth.uid() to the id being inserted
CREATE POLICY "Users can insert their own profile" ON public.user_profiles
  FOR INSERT WITH CHECK (auth.role() = 'authenticated' AND auth.uid() = id);
