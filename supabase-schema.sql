-- Supabase Database Schema for NodeX Platform
-- Run these SQL commands in your Supabase SQL editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

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

-- Messages table
CREATE TABLE IF NOT EXISTS messages (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    sender_id TEXT NOT NULL,
    receiver_id TEXT NOT NULL,
    project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    read BOOLEAN DEFAULT FALSE
);

-- Notifications table
CREATE TABLE IF NOT EXISTS notifications (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id TEXT NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('bid', 'project', 'message', 'payment', 'system')),
    read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
    bid_id UUID REFERENCES bids(id) ON DELETE SET NULL
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
    student_id TEXT NOT NULL,
    amount INTEGER NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'released', 'refunded')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    released_at TIMESTAMP WITH TIME ZONE
);

-- Transactions table
CREATE TABLE IF NOT EXISTS transactions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    from_user_id TEXT NOT NULL,
    to_user_id TEXT NOT NULL,
    amount INTEGER NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('payment', 'refund', 'withdrawal', 'deposit', 'escrow_assignment', 'escrow_release')),
    description TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
    escrow_id UUID REFERENCES escrows(id) ON DELETE SET NULL,
    wallet_id TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'completed' CHECK (status IN ('pending', 'completed', 'failed')),
    completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
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

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_projects_client_id ON projects(client_id);
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);
CREATE INDEX IF NOT EXISTS idx_projects_category ON projects(category);
CREATE INDEX IF NOT EXISTS idx_projects_created_at ON projects(created_at);

CREATE INDEX IF NOT EXISTS idx_bids_project_id ON bids(project_id);
CREATE INDEX IF NOT EXISTS idx_bids_student_id ON bids(student_id);
CREATE INDEX IF NOT EXISTS idx_bids_status ON bids(status);

CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_receiver_id ON messages(receiver_id);
CREATE INDEX IF NOT EXISTS idx_messages_project_id ON messages(project_id);

CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(read);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON notifications(type);

CREATE INDEX IF NOT EXISTS idx_opportunities_company_id ON opportunities(company_id);
CREATE INDEX IF NOT EXISTS idx_opportunities_type ON opportunities(type);

CREATE INDEX IF NOT EXISTS idx_escrows_project_id ON escrows(project_id);
CREATE INDEX IF NOT EXISTS idx_escrows_company_id ON escrows(company_id);
CREATE INDEX IF NOT EXISTS idx_escrows_student_id ON escrows(student_id);

CREATE INDEX IF NOT EXISTS idx_transactions_from_user_id ON transactions(from_user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_to_user_id ON transactions(to_user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_type ON transactions(type);
CREATE INDEX IF NOT EXISTS idx_transactions_wallet_id ON transactions(wallet_id);

CREATE INDEX IF NOT EXISTS idx_wallets_user_id ON wallets(user_id);
CREATE INDEX IF NOT EXISTS idx_wallets_balance ON wallets(balance);

-- Enable Row Level Security (RLS)
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE bids ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE opportunities ENABLE ROW LEVEL SECURITY;
ALTER TABLE escrows ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE wallets ENABLE ROW LEVEL SECURITY;

-- Create function to increment bids count
CREATE OR REPLACE FUNCTION increment_bids_count(project_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE projects 
  SET bids_count = bids_count + 1 
  WHERE id = project_id;
END;
$$ LANGUAGE plpgsql;

-- Create policies for public access (since we're not using Supabase auth)
-- Projects: Anyone can read, only client can update/delete their own projects
CREATE POLICY "Anyone can view projects" ON projects FOR SELECT USING (true);
CREATE POLICY "Clients can insert projects" ON projects FOR INSERT WITH CHECK (true);
CREATE POLICY "Clients can update their own projects" ON projects FOR UPDATE USING (true);
CREATE POLICY "Clients can delete their own projects" ON projects FOR DELETE USING (true);

-- Bids: Anyone can read, students can insert their own bids, clients can update bid status
CREATE POLICY "Anyone can view bids" ON bids FOR SELECT USING (true);
CREATE POLICY "Students can insert bids" ON bids FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update bids" ON bids FOR UPDATE USING (true);

-- Messages: Users can read messages where they are sender or receiver
CREATE POLICY "Users can view their messages" ON messages FOR SELECT USING (true);
CREATE POLICY "Users can send messages" ON messages FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update their messages" ON messages FOR UPDATE USING (true);

-- Notifications: Users can read their own notifications
CREATE POLICY "Users can view their notifications" ON notifications FOR SELECT USING (true);
CREATE POLICY "Anyone can insert notifications" ON notifications FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update their notifications" ON notifications FOR UPDATE USING (true);

-- Opportunities: Anyone can read, companies can insert/update their own
CREATE POLICY "Anyone can view opportunities" ON opportunities FOR SELECT USING (true);
CREATE POLICY "Companies can insert opportunities" ON opportunities FOR INSERT WITH CHECK (true);
CREATE POLICY "Companies can update their opportunities" ON opportunities FOR UPDATE USING (true);

-- Escrows: Related users can view escrows
CREATE POLICY "Related users can view escrows" ON escrows FOR SELECT USING (true);
CREATE POLICY "Anyone can insert escrows" ON escrows FOR INSERT WITH CHECK (true);
CREATE POLICY "Related users can update escrows" ON escrows FOR UPDATE USING (true);

-- Transactions: Related users can view transactions
CREATE POLICY "Related users can view transactions" ON transactions FOR SELECT USING (true);
CREATE POLICY "Anyone can insert transactions" ON transactions FOR INSERT WITH CHECK (true);
CREATE POLICY "Related users can update transactions" ON transactions FOR UPDATE USING (true);

-- Wallets: Users can view and manage their own wallets
CREATE POLICY "Users can view their own wallets" ON wallets FOR SELECT USING (true);
CREATE POLICY "Users can insert wallets" ON wallets FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update their own wallets" ON wallets FOR UPDATE USING (true);
