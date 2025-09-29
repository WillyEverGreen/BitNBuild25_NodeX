-- Ensure chat-files bucket exists and is public
DO $$
BEGIN
  INSERT INTO storage.buckets (id, name, public, file_size_limit)
  VALUES ('chat-files', 'chat-files', true, 52428800)
  ON CONFLICT (id) DO UPDATE SET public = true, file_size_limit = 52428800;
EXCEPTION WHEN OTHERS THEN
  -- Bucket might already exist, continue
  NULL;
END $$;

-- Drop existing policies to recreate them
DROP POLICY IF EXISTS "Authenticated users can upload chat files" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view chat files" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own chat files" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own chat files" ON storage.objects;

-- Allow authenticated users to upload files
CREATE POLICY "Authenticated users can upload chat files" 
ON storage.objects
FOR INSERT 
TO authenticated
WITH CHECK (bucket_id = 'chat-files');

-- Allow anyone to view files (since bucket is public)
CREATE POLICY "Anyone can view chat files" 
ON storage.objects
FOR SELECT 
TO public
USING (bucket_id = 'chat-files');

-- Allow users to update their own files
CREATE POLICY "Users can update their own chat files"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'chat-files' AND auth.uid()::text = owner)
WITH CHECK (bucket_id = 'chat-files');

-- Allow users to delete their own files
CREATE POLICY "Users can delete their own chat files"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'chat-files' AND auth.uid()::text = owner);
