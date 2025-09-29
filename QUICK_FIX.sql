-- QUICK FIX FOR SIGNUP AND FILE UPLOAD
-- Run this in Supabase Dashboard → SQL Editor

-- 1. Fix user_profiles policies
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can view their own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Anyone can view public profiles" ON public.user_profiles;

CREATE POLICY "Users can insert their own profile" ON public.user_profiles
  FOR INSERT WITH CHECK (auth.role() = 'authenticated' AND auth.uid() = id);

CREATE POLICY "Users can view their own profile" ON public.user_profiles
  FOR SELECT USING (auth.uid() = id);

-- Allow authenticated users to view other users' public profile info (for bids, chat, etc.)
CREATE POLICY "Anyone can view public profiles" ON public.user_profiles
  FOR SELECT USING (auth.role() = 'authenticated');

-- 2. Create storage bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public, file_size_limit)
VALUES ('chat-files', 'chat-files', true, 52428800)
ON CONFLICT (id) DO UPDATE SET public = true;

-- 3. Fix storage policies
DROP POLICY IF EXISTS "Authenticated users can upload chat files" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view chat files" ON storage.objects;

CREATE POLICY "Authenticated users can upload chat files" 
ON storage.objects FOR INSERT 
WITH CHECK (bucket_id = 'chat-files' AND auth.role() = 'authenticated');

CREATE POLICY "Anyone can view chat files" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'chat-files');

-- 4. Add conversation name columns for better chat UX
ALTER TABLE public.conversations
  ADD COLUMN IF NOT EXISTS user1_name TEXT,
  ADD COLUMN IF NOT EXISTS user2_name TEXT;

-- 5. Add file columns to messages table
ALTER TABLE public.messages
  ADD COLUMN IF NOT EXISTS file_url TEXT,
  ADD COLUMN IF NOT EXISTS file_name TEXT,
  ADD COLUMN IF NOT EXISTS file_type TEXT,
  ADD COLUMN IF NOT EXISTS file_size INTEGER;

-- 6. Add missing columns to escrows table
ALTER TABLE public.escrows
  ADD COLUMN IF NOT EXISTS assigned_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS released_at TIMESTAMPTZ;

-- 7. Fix escrow policies (with proper UUID casting)
DROP POLICY IF EXISTS "Companies can create escrows" ON public.escrows;
DROP POLICY IF EXISTS "Users can view their escrows" ON public.escrows;
DROP POLICY IF EXISTS "Companies can update their escrows" ON public.escrows;

CREATE POLICY "Companies can create escrows" ON public.escrows
  FOR INSERT WITH CHECK (auth.role() = 'authenticated' AND auth.uid()::text = company_id::text);

CREATE POLICY "Users can view their escrows" ON public.escrows
  FOR SELECT USING (auth.uid()::text = company_id::text OR auth.uid()::text = student_id::text);

CREATE POLICY "Companies can update their escrows" ON public.escrows
  FOR UPDATE USING (auth.uid()::text = company_id::text);

-- 8. Verify setup
SELECT 'Checking user_profiles policies...' as step;
SELECT * FROM pg_policies WHERE tablename = 'user_profiles';

SELECT 'Checking storage bucket...' as step;
SELECT * FROM storage.buckets WHERE id = 'chat-files';

SELECT 'Checking storage policies...' as step;
SELECT * FROM pg_policies WHERE tablename = 'objects' AND schemaname = 'storage';

SELECT '✅ Setup complete! Try signup, file upload, and chat now.' as result;
