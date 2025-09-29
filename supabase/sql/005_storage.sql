-- Storage bucket and policies for chat files

-- bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('chat-files','chat-files', true)
ON CONFLICT (id) DO NOTHING;

-- policies
DO $$ BEGIN
  PERFORM 1 FROM pg_policies WHERE schemaname='storage' AND tablename='objects' AND policyname='Authenticated users can upload chat files';
  IF FOUND THEN EXECUTE 'DROP POLICY "Authenticated users can upload chat files" ON storage.objects'; END IF;
  PERFORM 1 FROM pg_policies WHERE schemaname='storage' AND tablename='objects' AND policyname='Anyone can view chat files';
  IF FOUND THEN EXECUTE 'DROP POLICY "Anyone can view chat files" ON storage.objects'; END IF;
END $$;

CREATE POLICY "Authenticated users can upload chat files" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'chat-files' AND auth.role() = 'authenticated'
);

CREATE POLICY "Anyone can view chat files" ON storage.objects
FOR SELECT USING (
  bucket_id = 'chat-files'
);
