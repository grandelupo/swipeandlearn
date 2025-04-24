-- Create storage bucket for audio recordings if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('audio-recordings', 'audio-recordings', true)
ON CONFLICT (id) DO NOTHING;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload audio recordings" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete their own recordings" ON storage.objects;

-- Enable public access to the bucket
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING (bucket_id = 'audio-recordings');

-- Allow authenticated users to upload to the bucket
CREATE POLICY "Authenticated users can upload audio recordings"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'audio-recordings'
  AND auth.role() = 'authenticated'
);

-- Allow authenticated users to delete their own recordings
CREATE POLICY "Authenticated users can delete their own recordings"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'audio-recordings'
  AND auth.role() = 'authenticated'
); 