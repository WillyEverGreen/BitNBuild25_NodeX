-- Fix for user profile updates not working
-- This allows the system to update user profiles when projects complete
-- Run this in Supabase Dashboard → SQL Editor

-- Drop existing update policy
DROP POLICY IF EXISTS "Users can update their own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "System can update user profiles" ON public.user_profiles;

-- Allow users to update their own profile
CREATE POLICY "Users can update their own profile" ON public.user_profiles
  FOR UPDATE USING (auth.uid()::text = id::text);

-- Allow authenticated users to update any profile (for system operations like completing projects)
CREATE POLICY "System can update user profiles" ON public.user_profiles
  FOR UPDATE USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- Verify
SELECT 'User profile update policies:' as info;
SELECT policyname, cmd, qual, with_check
FROM pg_policies 
WHERE tablename = 'user_profiles' AND cmd = 'UPDATE';
