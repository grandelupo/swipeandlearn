

-- Create audio recordings table
CREATE TABLE public.audio_recordings (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  story_id uuid REFERENCES public.stories ON DELETE CASCADE,
  page_number integer NOT NULL,
  voice_id voice_id NOT NULL,
  audio_url text NOT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  
  -- Add a unique constraint to prevent duplicate recordings
  UNIQUE(story_id, page_number, voice_id)
);

-- Add voice preference to profiles table
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS preferred_voice_id text DEFAULT 'pNInz6obpgDQGcFmaJgB';

-- Set up RLS
ALTER TABLE public.audio_recordings ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view audio recordings for their stories"
  ON public.audio_recordings FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.stories
      WHERE stories.id = audio_recordings.story_id
      AND stories.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create audio recordings for their stories"
  ON public.audio_recordings FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.stories
      WHERE stories.id = audio_recordings.story_id
      AND stories.user_id = auth.uid()
    )
  );

-- Create indexes
CREATE INDEX audio_recordings_story_lookup_idx ON public.audio_recordings(story_id, page_number, voice_id); 