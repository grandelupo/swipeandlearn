-- Fix RLS policies for story_pages to allow access to published stories
-- Drop existing policies that are too restrictive
DROP POLICY IF EXISTS "Users can view non-cached pages for their stories" ON public.story_pages;
DROP POLICY IF EXISTS "Users can view their story pages" ON public.story_pages;

-- Create new policy that allows access to published stories' pages
CREATE POLICY "Users can view their own story pages or published story pages"
  ON public.story_pages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.stories
      WHERE stories.id = story_pages.story_id
      AND (
        stories.user_id = auth.uid() OR 
        stories.is_published = true
      )
    )
  );

-- Also update the cached pages policy to allow access to published stories
CREATE POLICY "Users can view non-cached pages for their stories or published stories"
  ON public.story_pages FOR SELECT
  USING (
    (NOT is_cached) AND
    EXISTS (
      SELECT 1 FROM public.stories
      WHERE stories.id = story_pages.story_id
      AND (
        stories.user_id = auth.uid() OR 
        stories.is_published = true
      )
    )
  );

-- Update other policies to maintain security for non-published stories
DROP POLICY IF EXISTS "Users can create pages for their stories" ON public.story_pages;
CREATE POLICY "Users can create pages for their own stories"
  ON public.story_pages FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.stories
      WHERE stories.id = story_pages.story_id
      AND stories.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can update their story pages" ON public.story_pages;
CREATE POLICY "Users can update their own story pages"
  ON public.story_pages FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.stories
      WHERE stories.id = story_pages.story_id
      AND stories.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can delete their story pages" ON public.story_pages;
CREATE POLICY "Users can delete their own story pages"
  ON public.story_pages FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.stories
      WHERE stories.id = story_pages.story_id
      AND stories.user_id = auth.uid()
    )
  ); 