-- Chat support: conversations table and message threading

-- Add columns to messages for threading and timestamps
ALTER TABLE messages 
  ADD COLUMN IF NOT EXISTS conversation_id TEXT,
  ADD COLUMN IF NOT EXISTS timestamp TIMESTAMPTZ DEFAULT NOW(),
  ADD COLUMN IF NOT EXISTS file_url TEXT,
  ADD COLUMN IF NOT EXISTS file_name TEXT,
  ADD COLUMN IF NOT EXISTS file_type TEXT,
  ADD COLUMN IF NOT EXISTS file_size BIGINT;

-- Conversations table to list chats between two users
CREATE TABLE IF NOT EXISTS conversations (
  id TEXT PRIMARY KEY, -- format: sorted `${user1}_${user2}`
  user1_id TEXT NOT NULL,
  user2_id TEXT NOT NULL,
  project_title TEXT,
  last_message TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_conversations_user1 ON conversations(user1_id);
CREATE INDEX IF NOT EXISTS idx_conversations_user2 ON conversations(user2_id);

-- RLS for conversations
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view their conversations" ON conversations;
DROP POLICY IF EXISTS "Users can insert conversations" ON conversations;
DROP POLICY IF EXISTS "Users can update conversations" ON conversations;

CREATE POLICY "Users can view their conversations" ON conversations FOR SELECT USING (
  auth.uid()::text = user1_id OR auth.uid()::text = user2_id OR true
);
CREATE POLICY "Users can insert conversations" ON conversations FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update conversations" ON conversations FOR UPDATE USING (
  auth.uid()::text = user1_id OR auth.uid()::text = user2_id OR true
);
