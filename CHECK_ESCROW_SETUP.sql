-- Quick diagnostic to check if escrow setup is correct
-- Run this in Supabase Dashboard → SQL Editor

-- 1. Check if escrows table exists
SELECT 'Checking escrows table...' as step;
SELECT EXISTS (
  SELECT FROM information_schema.tables 
  WHERE table_schema = 'public' 
  AND table_name = 'escrows'
) as table_exists;

-- 2. Check escrows table columns
SELECT 'Escrows table columns:' as step;
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'escrows' AND table_schema = 'public'
ORDER BY ordinal_position;

-- 3. Check if RLS is enabled
SELECT 'RLS status:' as step;
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' AND tablename = 'escrows';

-- 4. Check escrow policies
SELECT 'Escrow policies:' as step;
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies 
WHERE tablename = 'escrows';

-- 5. If no policies found, here's the fix:
SELECT '⚠️ If no policies shown above, run QUICK_FIX.sql!' as warning;
