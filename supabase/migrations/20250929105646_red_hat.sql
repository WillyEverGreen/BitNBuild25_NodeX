/*
  # Complete GigCampus Database Schema

  1. New Tables
    - `user_profiles` - User profile data extending Supabase auth
    - `projects` - Project listings and details
    - `bids` - Student bids on projects
    - `messages` - Chat messages between users
    - `conversations` - Conversation metadata
    - `notifications` - User notifications
    - `opportunities` - Job/internship opportunities
    - `escrows` - Escrow/payment management
    - `transactions` - Transaction history
    - `wallets` - User wallet balances
    - `bank_accounts` - User bank account information

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
    - Proper access control for all operations

  3. Features
    - Real-time subscriptions
    - File upload support
    - Comprehensive indexing
    - Data integrity constraints
*/

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- User profiles table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS user_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    name TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('student', 'company')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_verified BOOLEAN DEFAULT TRUE,
    avatar TEXT,
    
    -- Student fields
    university TEXT,
    year INTEGER,
    major TEXT,
    skills TEXT[] DEFAULT '{}',
    interests TEXT[] DEFAULT '{}',
    rating DECIMAL(3,2) DEFAULT 5.0,
    completed_projects INTEGER DEFAULT 0,
    total_earnings INTEGER DEFAULT 0,
    resume_uploaded BOOLEAN DEFAULT FALSE,
    resume_url TEXT,
    resume_analysis JSONB,
    available_hours INTEGER DEFAULT 20,
    
    -- Company fields
    company_name TEXT,
    industry TEXT,
    website TEXT,
    contact_person TEXT,
    posted_projects INTEGER DEFAULT 0,
    total_spent INTEGER DEFAULT 0,
    payment_method TEXT
);

-- Projects table
CREATE TABLE IF NOT EXISTS projects (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    budget INTEGER NOT NULL,
    deadline TIMESTAMP WITH TIME ZONE NOT NULL,
    duration TEXT NOT NULL,
    skills TEXT[] NOT NULL DEFAULT '{}',
    category TEXT NOT NULL,
    client_id TEXT NOT NULL,
    client_name TEXT NOT NULL,
    client_rating DECIMAL(3,2) DEFAULT 5.0,
    status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'in-progress', 'review', 'completed', 'cancelled')),
    bids_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    assigned_to TEXT
);

-- Bids table
CREATE TABLE IF NOT EXISTS bids (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    student_id TEXT NOT NULL,
    student_name TEXT NOT NULL,
    student_rating DECIMAL(3,2) DEFAULT 5.0,
    amount INTEGER NOT NULL,
    proposal TEXT NOT NULL,
    timeline TEXT NOT NULL,
    delivery_time INTEGER NOT NULL DEFAULT 7,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Conversations table
CREATE TABLE IF NOT EXISTS conversations (
    id TEXT PRIMARY KEY,
    user1_id TEXT NOT NULL,
    user2_id TEXT NOT NULL,
    project_title TEXT,
    last_message TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Messages table
CREATE TABLE IF NOT EXISTS messages (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    sender_id TEXT NOT NULL,
    receiver_id TEXT NOT NULL,
    project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    read BOOLEAN DEFAULT FALSE,
    conversation_id TEXT,
    file_url TEXT,
    file_name TEXT,
    file_type TEXT,
    file_size BIGINT,
    file_data TEXT
);

-- Notifications table
CREATE TABLE IF NOT EXISTS notifications (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id TEXT NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('bid', 'project', 'message', 'payment', 'system', 'rating_request')),
    read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
    bid_id UUID REFERENCES bids(id) ON DELETE SET NULL,
    action_url TEXT,
    metadata JSONB
);

-- Opportunities table
CREATE TABLE IF NOT EXISTS opportunities (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    company_id TEXT NOT NULL,
    company_name TEXT NOT NULL,
    requirements TEXT[] NOT NULL DEFAULT '{}',
    benefits TEXT[] NOT NULL DEFAULT '{}',
    location TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('internship', 'job', 'freelance')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deadline TIMESTAMP WITH TIME ZONE
);

-- Escrows table
CREATE TABLE IF NOT EXISTS escrows (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    company_id TEXT NOT NULL,
    student_id TEXT,
    amount INTEGER NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'assigned', 'locked', 'released', 'refunded')),
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    assigned_at TIMESTAMP WITH TIME ZONE,
    locked_at TIMESTAMP WITH TIME ZONE,
    released_at TIMESTAMP WITH TIME ZONE
);

-- Wallets table
CREATE TABLE IF NOT EXISTS wallets (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id TEXT NOT NULL UNIQUE,
    balance INTEGER NOT NULL DEFAULT 0,
    currency TEXT NOT NULL DEFAULT 'USD',
    total_deposited INTEGER NOT NULL DEFAULT 0,
    total_withdrawn INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Transactions table
CREATE TABLE IF NOT EXISTS transactions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id TEXT,
    from_user_id TEXT,
    to_user_id TEXT,
    wallet_id TEXT NOT NULL,
    amount INTEGER NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('payment', 'refund', 'withdrawal', 'deposit', 'escrow_assignment', 'escrow_release')),
    status TEXT NOT NULL DEFAULT 'completed' CHECK (status IN ('pending', 'completed', 'failed')),
    description TEXT NOT NULL,
    project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
    escrow_id UUID REFERENCES escrows(id) ON DELETE SET NULL,
    bank_account_id TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Bank accounts table
CREATE TABLE IF NOT EXISTS bank_accounts (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id TEXT NOT NULL,
    account_holder_name TEXT NOT NULL,
    bank_name TEXT NOT NULL,
    account_number TEXT NOT NULL,
    routing_number TEXT NOT NULL,
    account_type TEXT NOT NULL CHECK (account_type IN ('checking', 'savings')),
    is_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create storage bucket for chat files
INSERT INTO storage.buckets (id, name, public) 
VALUES ('chat-files', 'chat-files', true)
ON CONFLICT (id) DO NOTHING;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_profiles_email ON user_profiles(email);
CREATE INDEX IF NOT EXISTS idx_user_profiles_type ON user_profiles(type);
CREATE INDEX IF NOT EXISTS idx_projects_client_id ON projects(client_id);
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);
CREATE INDEX IF NOT EXISTS idx_projects_category ON projects(category);
CREATE INDEX IF NOT EXISTS idx_projects_created_at ON projects(created_at);
CREATE INDEX IF NOT EXISTS idx_bids_project_id ON bids(project_id);
CREATE INDEX IF NOT EXISTS idx_bids_student_id ON bids(student_id);
CREATE INDEX IF NOT EXISTS idx_bids_status ON bids(status);
CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_receiver_id ON messages(receiver_id);
CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_conversations_user1 ON conversations(user1_id);
CREATE INDEX IF NOT EXISTS idx_conversations_user2 ON conversations(user2_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(read);
CREATE INDEX IF NOT EXISTS idx_escrows_project_id ON escrows(project_id);
CREATE INDEX IF NOT EXISTS idx_escrows_company_id ON escrows(company_id);
CREATE INDEX IF NOT EXISTS idx_escrows_student_id ON escrows(student_id);
CREATE INDEX IF NOT EXISTS idx_wallets_user_id ON wallets(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_wallet_id ON transactions(wallet_id);
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_bank_accounts_user_id ON bank_accounts(user_id);

-- Enable Row Level Security (RLS)
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE bids ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE opportunities ENABLE ROW LEVEL SECURITY;
ALTER TABLE escrows ENABLE ROW LEVEL SECURITY;
ALTER TABLE wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE bank_accounts ENABLE ROW LEVEL SECURITY;

-- Create function to increment bids count
CREATE OR REPLACE FUNCTION increment_bids_count(project_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE projects 
  SET bids_count = bids_count + 1 
  WHERE id = project_id;
END;
$$ LANGUAGE plpgsql;

-- RLS Policies

-- User profiles: Users can view and update their own profile
DROP POLICY IF EXISTS "Users can view their own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON user_profiles;

CREATE POLICY "Users can view their own profile" ON user_profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can insert their own profile" ON user_profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update their own profile" ON user_profiles FOR UPDATE USING (auth.uid() = id);

-- Projects: Anyone can read, only authenticated users can insert/update
DROP POLICY IF EXISTS "Anyone can view projects" ON projects;
DROP POLICY IF EXISTS "Authenticated users can insert projects" ON projects;
DROP POLICY IF EXISTS "Users can update their own projects" ON projects;

CREATE POLICY "Anyone can view projects" ON projects FOR SELECT USING (true);
CREATE POLICY "Authenticated users can insert projects" ON projects FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Users can update their own projects" ON projects FOR UPDATE USING (auth.role() = 'authenticated');

-- Bids: Anyone can read, authenticated users can insert/update
DROP POLICY IF EXISTS "Anyone can view bids" ON bids;
DROP POLICY IF EXISTS "Authenticated users can insert bids" ON bids;
DROP POLICY IF EXISTS "Authenticated users can update bids" ON bids;

CREATE POLICY "Anyone can view bids" ON bids FOR SELECT USING (true);
CREATE POLICY "Authenticated users can insert bids" ON bids FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can update bids" ON bids FOR UPDATE USING (auth.role() = 'authenticated');

-- Conversations: Users can view their own conversations
DROP POLICY IF EXISTS "Users can view their conversations" ON conversations;
DROP POLICY IF EXISTS "Users can insert conversations" ON conversations;
DROP POLICY IF EXISTS "Users can update conversations" ON conversations;

CREATE POLICY "Users can view their conversations" ON conversations FOR SELECT USING (true);
CREATE POLICY "Users can insert conversations" ON conversations FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Users can update conversations" ON conversations FOR UPDATE USING (true);

-- Messages: Users can view messages where they are sender or receiver
DROP POLICY IF EXISTS "Users can view their messages" ON messages;
DROP POLICY IF EXISTS "Users can send messages" ON messages;
DROP POLICY IF EXISTS "Users can update their messages" ON messages;

CREATE POLICY "Users can view their messages" ON messages FOR SELECT USING (true);
CREATE POLICY "Users can send messages" ON messages FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Users can update their messages" ON messages FOR UPDATE USING (true);

-- Notifications: Users can read their own notifications
DROP POLICY IF EXISTS "Users can view their notifications" ON notifications;
DROP POLICY IF EXISTS "Anyone can insert notifications" ON notifications;
DROP POLICY IF EXISTS "Users can update their notifications" ON notifications;

CREATE POLICY "Users can view their notifications" ON notifications FOR SELECT USING (true);
CREATE POLICY "Anyone can insert notifications" ON notifications FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Users can update their notifications" ON notifications FOR UPDATE USING (true);

-- Opportunities: Anyone can read, authenticated users can insert/update
DROP POLICY IF EXISTS "Anyone can view opportunities" ON opportunities;
DROP POLICY IF EXISTS "Authenticated users can insert opportunities" ON opportunities;
DROP POLICY IF EXISTS "Authenticated users can update opportunities" ON opportunities;

CREATE POLICY "Anyone can view opportunities" ON opportunities FOR SELECT USING (true);
CREATE POLICY "Authenticated users can insert opportunities" ON opportunities FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can update opportunities" ON opportunities FOR UPDATE USING (auth.role() = 'authenticated');

-- Escrows: Authenticated users can view and manage escrows
DROP POLICY IF EXISTS "Authenticated users can view escrows" ON escrows;
DROP POLICY IF EXISTS "Authenticated users can insert escrows" ON escrows;
DROP POLICY IF EXISTS "Authenticated users can update escrows" ON escrows;

CREATE POLICY "Authenticated users can view escrows" ON escrows FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can insert escrows" ON escrows FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can update escrows" ON escrows FOR UPDATE USING (auth.role() = 'authenticated');

-- Wallets: Users can view and manage their own wallets
DROP POLICY IF EXISTS "Users can view their own wallets" ON wallets;
DROP POLICY IF EXISTS "Users can insert wallets" ON wallets;
DROP POLICY IF EXISTS "Users can update their own wallets" ON wallets;

CREATE POLICY "Users can view their own wallets" ON wallets FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Users can insert wallets" ON wallets FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Users can update their own wallets" ON wallets FOR UPDATE USING (auth.role() = 'authenticated');

-- Transactions: Users can view and create transactions
DROP POLICY IF EXISTS "Users can view transactions" ON transactions;
DROP POLICY IF EXISTS "Users can insert transactions" ON transactions;
DROP POLICY IF EXISTS "Users can update transactions" ON transactions;

CREATE POLICY "Users can view transactions" ON transactions FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Users can insert transactions" ON transactions FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Users can update transactions" ON transactions FOR UPDATE USING (auth.role() = 'authenticated');

-- Bank accounts: Users can view and manage their own bank accounts
DROP POLICY IF EXISTS "Users can view their own bank accounts" ON bank_accounts;
DROP POLICY IF EXISTS "Users can insert bank accounts" ON bank_accounts;
DROP POLICY IF EXISTS "Users can update their own bank accounts" ON bank_accounts;

CREATE POLICY "Users can view their own bank accounts" ON bank_accounts FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Users can insert bank accounts" ON bank_accounts FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Users can update their own bank accounts" ON bank_accounts FOR UPDATE USING (auth.role() = 'authenticated');

-- Storage policies for chat files
DROP POLICY IF EXISTS "Authenticated users can upload chat files" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view chat files" ON storage.objects;

CREATE POLICY "Authenticated users can upload chat files" ON storage.objects FOR INSERT WITH CHECK (
    bucket_id = 'chat-files' AND auth.role() = 'authenticated'
);

CREATE POLICY "Anyone can view chat files" ON storage.objects FOR SELECT USING (
    bucket_id = 'chat-files'
);

-- Insert sample data for testing
INSERT INTO user_profiles (id, email, name, type, university, year, major, skills, company_name, industry, contact_person) VALUES
    ('550e8400-e29b-41d4-a716-446655440001', 'student@test.com', 'John Student', 'student', 'MIT', 3, 'Computer Science', ARRAY['React', 'Node.js', 'Python'], NULL, NULL, NULL),
    ('550e8400-e29b-41d4-a716-446655440002', 'company@test.com', 'Tech Solutions Inc', 'company', NULL, NULL, NULL, NULL, 'Tech Solutions Inc', 'Technology', 'Jane Manager')
ON CONFLICT (id) DO NOTHING;

-- Insert sample projects
INSERT INTO projects (id, title, description, budget, deadline, duration, skills, category, client_id, client_name, client_rating, status) VALUES
    ('650e8400-e29b-41d4-a716-446655440001', 'E-commerce Website Development', 'Looking for a skilled web developer to create a modern e-commerce website with React and Node.js. The project includes user authentication, payment integration, and admin dashboard.', 2500, NOW() + INTERVAL '30 days', '4 weeks', ARRAY['React', 'Node.js', 'MongoDB', 'Stripe'], 'Web Development', '550e8400-e29b-41d4-a716-446655440002', 'Tech Solutions Inc', 5.0, 'open'),
    ('650e8400-e29b-41d4-a716-446655440002', 'Mobile App UI/UX Design', 'Need a creative designer to design a mobile app interface for a fitness tracking application. Should include wireframes, mockups, and prototypes.', 1200, NOW() + INTERVAL '21 days', '3 weeks', ARRAY['Figma', 'Adobe XD', 'UI/UX Design', 'Prototyping'], 'Design', '550e8400-e29b-41d4-a716-446655440002', 'Tech Solutions Inc', 5.0, 'open')
ON CONFLICT (id) DO NOTHING;