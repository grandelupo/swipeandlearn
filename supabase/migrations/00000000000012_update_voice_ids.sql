-- First, update any existing records to use the new default voice ID
UPDATE public.profiles 
SET preferred_voice_id = '21m00Tcm4TlvDq8ikWAM' 
WHERE preferred_voice_id = 'rachel';

UPDATE public.audio_recordings 
SET voice_id = '21m00Tcm4TlvDq8ikWAM' 
WHERE voice_id = 'rachel';

-- First, drop the existing enum type (cascade will remove it from the columns that use it)
DROP TYPE voice_id CASCADE;

-- Drop the voice_id enum type since we're switching to text
DROP TYPE IF EXISTS voice_id;

-- Create storage bucket for audio recordings if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('audio-recordings', 'audio-recordings', true)
ON CONFLICT (id) DO NOTHING;

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

-- Drop the voice_id column from profiles (if it exists)
ALTER TABLE public.profiles
DROP COLUMN IF EXISTS preferred_voice_id;

-- Add the voice_id column as text to profiles
ALTER TABLE public.profiles
ADD COLUMN preferred_voice_id text DEFAULT '21m00Tcm4TlvDq8ikWAM';

-- Drop the voice_id column from audio_recordings (if it exists)
ALTER TABLE public.audio_recordings
DROP COLUMN IF EXISTS voice_id;

-- Add the voice_id column as text to audio_recordings
ALTER TABLE public.audio_recordings
ADD COLUMN voice_id text NOT NULL;

-- Recreate the unique constraint
ALTER TABLE public.audio_recordings
DROP CONSTRAINT IF EXISTS audio_recordings_story_page_voice_unique;

ALTER TABLE public.audio_recordings
ADD CONSTRAINT audio_recordings_story_page_voice_unique 
UNIQUE(story_id, page_number, voice_id); 