-- Allow authenticated users to view other users' profiles
-- This is needed for companies to see student names/info in bids and chat

DROP POLICY IF EXISTS "Users can view their own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Anyone can view public profiles" ON public.user_profiles;

-- Users can view their own profile
CREATE POLICY "Users can view their own profile" ON public.user_profiles
  FOR SELECT USING (auth.uid() = id);

-- Authenticated users can view other users' public profile info (for bids, chat, etc.)
CREATE POLICY "Anyone can view public profiles" ON public.user_profiles
  FOR SELECT USING (auth.role() = 'authenticated');
