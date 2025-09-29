-- Add user name columns to conversations table for better UX
ALTER TABLE public.conversations
  ADD COLUMN IF NOT EXISTS user1_name TEXT,
  ADD COLUMN IF NOT EXISTS user2_name TEXT;

-- Add comment for documentation
COMMENT ON COLUMN public.conversations.user1_name IS 'Name of user1 for display in chat';
COMMENT ON COLUMN public.conversations.user2_name IS 'Name of user2 for display in chat';
