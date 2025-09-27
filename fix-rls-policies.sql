-- Fix RLS policies to allow user registration
-- Run this in your Supabase SQL editor

-- Drop existing restrictive policies
DROP POLICY IF EXISTS "Users can view own profile" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;
DROP POLICY IF EXISTS "Public profiles viewable" ON users;

-- Create new policies that allow registration
CREATE POLICY "Users can view own profile" ON users FOR SELECT USING (id = auth.uid()::uuid);
CREATE POLICY "Users can update own profile" ON users FOR UPDATE USING (id = auth.uid()::uuid);
CREATE POLICY "Allow user registration" ON users FOR INSERT WITH CHECK (true);
CREATE POLICY "Public profiles viewable" ON users FOR SELECT USING (true);

-- Also fix other table policies that might be too restrictive
DROP POLICY IF EXISTS "Companies can create projects" ON projects;
CREATE POLICY "Companies can create projects" ON projects FOR INSERT WITH CHECK (client_id = auth.uid()::uuid);

-- Allow students to create bids
DROP POLICY IF EXISTS "Students can create bids" ON bids;
CREATE POLICY "Students can create bids" ON bids FOR INSERT WITH CHECK (student_id = auth.uid()::uuid);

-- Allow viewing projects for everyone (so students can see projects to bid on)
DROP POLICY IF EXISTS "Anyone can view open projects" ON projects;
CREATE POLICY "Anyone can view open projects" ON projects FOR SELECT USING (true);

-- Allow viewing bids for project owners and bidders
DROP POLICY IF EXISTS "Students can view own bids" ON bids;
DROP POLICY IF EXISTS "Project owners can view bids" ON bids;
CREATE POLICY "Students can view own bids" ON bids FOR SELECT USING (student_id = auth.uid()::uuid);
CREATE POLICY "Project owners can view bids" ON bids FOR SELECT USING (
    EXISTS (SELECT 1 FROM projects WHERE projects.id = bids.project_id AND projects.client_id = auth.uid()::uuid)
);

-- Allow project owners to update bids (accept/reject)
CREATE POLICY "Project owners can update bids" ON bids FOR UPDATE USING (
    EXISTS (SELECT 1 FROM projects WHERE projects.id = bids.project_id AND projects.client_id = auth.uid()::uuid)
);

-- Allow project owners to update their projects
DROP POLICY IF EXISTS "Project owners can update" ON projects;
CREATE POLICY "Project owners can update" ON projects FOR UPDATE USING (client_id = auth.uid()::uuid);

-- Allow users to manage their own portfolio
DROP POLICY IF EXISTS "Users can manage own portfolio" ON portfolio_items;
CREATE POLICY "Users can manage own portfolio" ON portfolio_items FOR ALL USING (user_id = auth.uid()::uuid);

-- Allow public viewing of portfolio items
DROP POLICY IF EXISTS "Public portfolio viewable" ON portfolio_items;
CREATE POLICY "Public portfolio viewable" ON portfolio_items FOR SELECT USING (true);

-- Allow users to view their own badges
DROP POLICY IF EXISTS "Users can view own badges" ON badges;
CREATE POLICY "Users can view own badges" ON badges FOR SELECT USING (user_id = auth.uid()::uuid);

-- Allow public viewing of badges
DROP POLICY IF EXISTS "Public badges viewable" ON badges;
CREATE POLICY "Public badges viewable" ON badges FOR SELECT USING (true);

-- Allow users to send and receive messages
DROP POLICY IF EXISTS "Users can view own messages" ON messages;
DROP POLICY IF EXISTS "Users can send messages" ON messages;
DROP POLICY IF EXISTS "Users can update own messages" ON messages;
CREATE POLICY "Users can view own messages" ON messages FOR SELECT USING (
    sender_id = auth.uid()::uuid OR receiver_id = auth.uid()::uuid
);
CREATE POLICY "Users can send messages" ON messages FOR INSERT WITH CHECK (sender_id = auth.uid()::uuid);
CREATE POLICY "Users can update own messages" ON messages FOR UPDATE USING (receiver_id = auth.uid()::uuid);

-- Allow users to manage their own notifications
DROP POLICY IF EXISTS "Users can view own notifications" ON notifications;
CREATE POLICY "Users can view own notifications" ON notifications FOR ALL USING (user_id = auth.uid()::uuid);

-- Allow viewing transactions for project participants
DROP POLICY IF EXISTS "Users can view related transactions" ON transactions;
CREATE POLICY "Users can view related transactions" ON transactions FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM projects 
        WHERE projects.id = transactions.project_id 
        AND (projects.client_id = auth.uid()::uuid OR projects.assigned_to = auth.uid()::uuid)
    )
);
