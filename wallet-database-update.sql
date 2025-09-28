-- Complete Database Update Script
-- Run this in your Supabase SQL Editor to add wallet functionality

-- Add missing columns to existing bids table
ALTER TABLE bids 
ADD COLUMN IF NOT EXISTS student_rating DECIMAL(3,2) DEFAULT 5.0,
ADD COLUMN IF NOT EXISTS delivery_time INTEGER DEFAULT 7,
ADD COLUMN IF NOT EXISTS timeline TEXT DEFAULT '7 days';

-- Update existing bids to have default values
UPDATE bids 
SET student_rating = 5.0 
WHERE student_rating IS NULL;

UPDATE bids 
SET delivery_time = 7 
WHERE delivery_time IS NULL;

UPDATE bids 
SET timeline = '7 days' 
WHERE timeline IS NULL;

-- Make the new columns NOT NULL after setting defaults
ALTER TABLE bids 
ALTER COLUMN student_rating SET NOT NULL,
ALTER COLUMN delivery_time SET NOT NULL,
ALTER COLUMN timeline SET NOT NULL;

-- Create wallets table
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

-- Update transactions table to include wallet fields
ALTER TABLE transactions 
ADD COLUMN IF NOT EXISTS wallet_id TEXT,
ADD COLUMN IF NOT EXISTS escrow_id UUID REFERENCES escrows(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'completed' CHECK (status IN ('pending', 'completed', 'failed')),
ADD COLUMN IF NOT EXISTS completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Update transaction types
ALTER TABLE transactions 
DROP CONSTRAINT IF EXISTS transactions_type_check;

ALTER TABLE transactions 
ADD CONSTRAINT transactions_type_check 
CHECK (type IN ('payment', 'refund', 'withdrawal', 'deposit', 'escrow_assignment', 'escrow_release'));

-- Create indexes for wallets
CREATE INDEX IF NOT EXISTS idx_wallets_user_id ON wallets(user_id);
CREATE INDEX IF NOT EXISTS idx_wallets_balance ON wallets(balance);
CREATE INDEX IF NOT EXISTS idx_transactions_wallet_id ON transactions(wallet_id);

-- Enable RLS for wallets
ALTER TABLE wallets ENABLE ROW LEVEL SECURITY;

-- Create policies for wallets
CREATE POLICY "Users can view their own wallets" ON wallets FOR SELECT USING (true);
CREATE POLICY "Users can insert wallets" ON wallets FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update their own wallets" ON wallets FOR UPDATE USING (true);

-- Update existing transactions to have wallet_id (optional)
-- UPDATE transactions SET wallet_id = from_user_id WHERE wallet_id IS NULL;
