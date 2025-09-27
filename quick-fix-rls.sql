-- Quick fix for user registration RLS issue
-- Run this in your Supabase SQL editor

-- Drop the restrictive user policies
DROP POLICY IF EXISTS "Users can view own profile" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;
DROP POLICY IF EXISTS "Public profiles viewable" ON users;

-- Create new policies that allow registration
CREATE POLICY "Users can view own profile" ON users FOR SELECT USING (id = auth.uid()::uuid);
CREATE POLICY "Users can update own profile" ON users FOR UPDATE USING (id = auth.uid()::uuid);
CREATE POLICY "Allow user registration" ON users FOR INSERT WITH CHECK (true);
CREATE POLICY "Public profiles viewable" ON users FOR SELECT USING (true);
