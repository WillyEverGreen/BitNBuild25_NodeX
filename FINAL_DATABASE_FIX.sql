-- ============================================
-- COMPLETE DATABASE FIX FOR BitNBuild25_NodeX
-- Run this ONCE in Supabase Dashboard → SQL Editor
-- This fixes ALL issues with your app
-- ============================================

-- 1. Fix user_profiles policies
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can view their own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Anyone can view public profiles" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.user_profiles;

CREATE POLICY "Users can insert their own profile" ON public.user_profiles
  FOR INSERT WITH CHECK (auth.role() = 'authenticated' AND auth.uid()::text = id::text);

CREATE POLICY "Users can view their own profile" ON public.user_profiles
  FOR SELECT USING (auth.uid()::text = id::text);

CREATE POLICY "Anyone can view public profiles" ON public.user_profiles
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Users can update their own profile" ON public.user_profiles
  FOR UPDATE USING (auth.uid()::text = id::text);

-- 2. Fix projects policies
DROP POLICY IF EXISTS "Anyone can view projects" ON public.projects;
DROP POLICY IF EXISTS "Companies can create projects" ON public.projects;
DROP POLICY IF EXISTS "Companies can update their projects" ON public.projects;

CREATE POLICY "Anyone can view projects" ON public.projects
  FOR SELECT USING (true);

CREATE POLICY "Companies can create projects" ON public.projects
  FOR INSERT WITH CHECK (auth.role() = 'authenticated' AND auth.uid()::text = client_id);

CREATE POLICY "Companies can update their projects" ON public.projects
  FOR UPDATE USING (auth.uid()::text = client_id);

-- 3. Fix bids policies
DROP POLICY IF EXISTS "Anyone can view bids" ON public.bids;
DROP POLICY IF EXISTS "Students can create bids" ON public.bids;
DROP POLICY IF EXISTS "Users can update their bids" ON public.bids;

CREATE POLICY "Anyone can view bids" ON public.bids
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Students can create bids" ON public.bids
  FOR INSERT WITH CHECK (auth.role() = 'authenticated' AND auth.uid()::text = student_id);

CREATE POLICY "Users can update their bids" ON public.bids
  FOR UPDATE USING (auth.role() = 'authenticated');

-- 4. Fix escrows policies
DROP POLICY IF EXISTS "Companies can create escrows" ON public.escrows;
DROP POLICY IF EXISTS "Users can view their escrows" ON public.escrows;
DROP POLICY IF EXISTS "Companies can update their escrows" ON public.escrows;

CREATE POLICY "Companies can create escrows" ON public.escrows
  FOR INSERT WITH CHECK (auth.role() = 'authenticated' AND auth.uid()::text = company_id);

CREATE POLICY "Users can view their escrows" ON public.escrows
  FOR SELECT USING (auth.uid()::text = company_id OR auth.uid()::text = student_id);

CREATE POLICY "Companies can update their escrows" ON public.escrows
  FOR UPDATE USING (auth.uid()::text = company_id);

-- 5. Fix wallets policies
DROP POLICY IF EXISTS "Users can view their wallet" ON public.wallets;
DROP POLICY IF EXISTS "Users can update their wallet" ON public.wallets;
DROP POLICY IF EXISTS "Users can create their wallet" ON public.wallets;

CREATE POLICY "Users can view their wallet" ON public.wallets
  FOR SELECT USING (auth.uid()::text = user_id);

CREATE POLICY "Users can update their wallet" ON public.wallets
  FOR UPDATE USING (auth.uid()::text = user_id);

CREATE POLICY "Users can create their wallet" ON public.wallets
  FOR INSERT WITH CHECK (auth.uid()::text = user_id);

-- 6. Fix transactions policies
DROP POLICY IF EXISTS "Users can view their transactions" ON public.transactions;
DROP POLICY IF EXISTS "Users can create transactions" ON public.transactions;

CREATE POLICY "Users can view their transactions" ON public.transactions
  FOR SELECT USING (auth.uid()::text = from_user_id OR auth.uid()::text = to_user_id);

CREATE POLICY "Users can create transactions" ON public.transactions
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- 7. Fix messages policies
DROP POLICY IF EXISTS "Users can view their messages" ON public.messages;
DROP POLICY IF EXISTS "Users can create messages" ON public.messages;
DROP POLICY IF EXISTS "Users can update their messages" ON public.messages;

CREATE POLICY "Users can view their messages" ON public.messages
  FOR SELECT USING (auth.uid()::text = sender_id OR auth.uid()::text = receiver_id);

CREATE POLICY "Users can create messages" ON public.messages
  FOR INSERT WITH CHECK (auth.role() = 'authenticated' AND auth.uid()::text = sender_id);

CREATE POLICY "Users can update their messages" ON public.messages
  FOR UPDATE USING (auth.uid()::text = receiver_id);

-- 8. Fix conversations policies
DROP POLICY IF EXISTS "Users can view their conversations" ON public.conversations;
DROP POLICY IF EXISTS "Users can create conversations" ON public.conversations;
DROP POLICY IF EXISTS "Users can update their conversations" ON public.conversations;

CREATE POLICY "Users can view their conversations" ON public.conversations
  FOR SELECT USING (auth.uid()::text = user1_id OR auth.uid()::text = user2_id);

CREATE POLICY "Users can create conversations" ON public.conversations
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can update their conversations" ON public.conversations
  FOR UPDATE USING (auth.uid()::text = user1_id OR auth.uid()::text = user2_id);

-- 9. Fix notifications policies
DROP POLICY IF EXISTS "Users can view their notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users can create notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users can update their notifications" ON public.notifications;

CREATE POLICY "Users can view their notifications" ON public.notifications
  FOR SELECT USING (auth.uid()::text = user_id);

CREATE POLICY "Users can create notifications" ON public.notifications
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can update their notifications" ON public.notifications
  FOR UPDATE USING (auth.uid()::text = user_id);

-- 10. Add missing columns to escrows
ALTER TABLE public.escrows
  ADD COLUMN IF NOT EXISTS assigned_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS released_at TIMESTAMPTZ;

-- 11. Add missing columns to messages
ALTER TABLE public.messages
  ADD COLUMN IF NOT EXISTS file_url TEXT,
  ADD COLUMN IF NOT EXISTS file_name TEXT,
  ADD COLUMN IF NOT EXISTS file_type TEXT,
  ADD COLUMN IF NOT EXISTS file_size INTEGER;

-- 12. Add missing columns to conversations
ALTER TABLE public.conversations
  ADD COLUMN IF NOT EXISTS user1_name TEXT,
  ADD COLUMN IF NOT EXISTS user2_name TEXT;

-- 13. Create storage bucket for chat files
INSERT INTO storage.buckets (id, name, public, file_size_limit)
VALUES ('chat-files', 'chat-files', true, 52428800)
ON CONFLICT (id) DO UPDATE SET public = true;

-- 14. Fix storage policies
DROP POLICY IF EXISTS "Authenticated users can upload chat files" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view chat files" ON storage.objects;

CREATE POLICY "Authenticated users can upload chat files" 
ON storage.objects FOR INSERT 
WITH CHECK (bucket_id = 'chat-files' AND auth.role() = 'authenticated');

CREATE POLICY "Anyone can view chat files" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'chat-files');

-- 15. Verify setup
SELECT '✅ Database setup complete!' as status;
SELECT 'Checking policies...' as step;
SELECT tablename, COUNT(*) as policy_count
FROM pg_policies 
WHERE schemaname = 'public'
GROUP BY tablename
ORDER BY tablename;

SELECT '✅ All done! Refresh your app and test the workflow.' as final_message;
