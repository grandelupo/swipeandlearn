-- Add is_cached column to story_pages table
ALTER TABLE public.story_pages
ADD COLUMN IF NOT EXISTS is_cached boolean DEFAULT false;

-- Update RLS policies to handle cached pages
CREATE POLICY "Users can view non-cached pages for their stories"
  ON public.story_pages FOR SELECT
  USING (
    (NOT is_cached) AND
    EXISTS (
      SELECT 1 FROM public.stories
      WHERE stories.id = story_pages.story_id
      AND stories.user_id = auth.uid()
    )
  );

-- Drop old policy if it exists
DROP POLICY IF EXISTS "Users can view story pages for their stories" ON public.story_pages;

-- Create index for faster cached page lookups
CREATE INDEX IF NOT EXISTS idx_story_pages_cached 
ON public.story_pages(story_id, page_number, is_cached); 