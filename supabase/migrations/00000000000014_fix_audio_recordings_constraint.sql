-- Drop the existing unique constraint
ALTER TABLE public.audio_recordings
DROP CONSTRAINT IF EXISTS audio_recordings_story_page_voice_unique;

-- Add index for better query performance
CREATE INDEX IF NOT EXISTS idx_audio_recordings_lookup 
ON public.audio_recordings(story_id, page_number, voice_id);

-- Add created_at column if it doesn't exist (for versioning)
ALTER TABLE public.audio_recordings
ADD COLUMN IF NOT EXISTS created_at timestamptz DEFAULT now(); 