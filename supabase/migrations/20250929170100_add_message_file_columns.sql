-- Add file attachment columns to messages table
ALTER TABLE public.messages
  ADD COLUMN IF NOT EXISTS file_url TEXT,
  ADD COLUMN IF NOT EXISTS file_name TEXT,
  ADD COLUMN IF NOT EXISTS file_type TEXT,
  ADD COLUMN IF NOT EXISTS file_size INTEGER;

-- Add comment for documentation
COMMENT ON COLUMN public.messages.file_url IS 'Public URL of uploaded file from storage';
COMMENT ON COLUMN public.messages.file_name IS 'Original filename of the uploaded file';
COMMENT ON COLUMN public.messages.file_type IS 'MIME type of the uploaded file';
COMMENT ON COLUMN public.messages.file_size IS 'Size of the file in bytes';
