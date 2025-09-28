-- Quick Database Update Script
-- Run this in your Supabase SQL Editor to fix the missing columns

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
