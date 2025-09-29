-- Check if chat-files bucket exists
SELECT * FROM storage.buckets WHERE id = 'chat-files';

-- If it doesn't exist, create it (run this in Supabase SQL Editor)
-- INSERT INTO storage.buckets (id, name, public) 
-- VALUES ('chat-files', 'chat-files', true)
-- ON CONFLICT (id) DO NOTHING;

-- Check storage policies
SELECT * FROM pg_policies 
WHERE schemaname = 'storage' 
AND tablename = 'objects';
