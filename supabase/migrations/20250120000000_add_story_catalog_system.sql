-- Add publishing and catalog fields to stories table
ALTER TABLE public.stories
ADD COLUMN IF NOT EXISTS is_published BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS published_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS like_count INTEGER DEFAULT 0;

-- Create story_likes table to track user likes
CREATE TABLE IF NOT EXISTS public.story_likes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  story_id UUID REFERENCES public.stories(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE(story_id, user_id)
);

-- Create story_shares table for deep links
CREATE TABLE IF NOT EXISTS public.story_shares (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  story_id UUID REFERENCES public.stories(id) ON DELETE CASCADE NOT NULL,
  share_code TEXT UNIQUE NOT NULL,
  created_by UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  expires_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT TRUE
);

-- Enable RLS on new tables
ALTER TABLE public.story_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.story_shares ENABLE ROW LEVEL SECURITY;

-- RLS policies for story_likes
CREATE POLICY "Users can view all story likes"
  ON public.story_likes FOR SELECT
  USING (true);

CREATE POLICY "Users can like stories"
  ON public.story_likes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can unlike their own likes"
  ON public.story_likes FOR DELETE
  USING (auth.uid() = user_id);

-- RLS policies for story_shares
CREATE POLICY "Anyone can view active story shares"
  ON public.story_shares FOR SELECT
  USING (is_active = true AND (expires_at IS NULL OR expires_at > NOW()));

CREATE POLICY "Users can create story shares"
  ON public.story_shares FOR INSERT
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update their own story shares"
  ON public.story_shares FOR UPDATE
  USING (auth.uid() = created_by);

CREATE POLICY "Users can delete their own story shares"
  ON public.story_shares FOR DELETE
  USING (auth.uid() = created_by);

-- Update stories RLS policies to allow public access to published stories
DROP POLICY IF EXISTS "Users can view their own stories" ON public.stories;
CREATE POLICY "Users can view their own stories or published stories"
  ON public.stories FOR SELECT
  USING (auth.uid() = user_id OR is_published = true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_stories_published ON public.stories(is_published, published_at DESC);
CREATE INDEX IF NOT EXISTS idx_stories_like_count ON public.stories(is_published, like_count DESC);
CREATE INDEX IF NOT EXISTS idx_story_likes_story_user ON public.story_likes(story_id, user_id);
CREATE INDEX IF NOT EXISTS idx_story_shares_code ON public.story_shares(share_code);
CREATE INDEX IF NOT EXISTS idx_story_shares_story ON public.story_shares(story_id);

-- Function to update like count when likes are added/removed
CREATE OR REPLACE FUNCTION update_story_like_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.stories 
    SET like_count = like_count + 1 
    WHERE id = NEW.story_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.stories 
    SET like_count = like_count - 1 
    WHERE id = OLD.story_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for like count updates
DROP TRIGGER IF EXISTS trigger_update_like_count_insert ON public.story_likes;
CREATE TRIGGER trigger_update_like_count_insert
  AFTER INSERT ON public.story_likes
  FOR EACH ROW
  EXECUTE FUNCTION update_story_like_count();

DROP TRIGGER IF EXISTS trigger_update_like_count_delete ON public.story_likes;
CREATE TRIGGER trigger_update_like_count_delete
  AFTER DELETE ON public.story_likes
  FOR EACH ROW
  EXECUTE FUNCTION update_story_like_count();

-- Function to generate unique share codes
CREATE OR REPLACE FUNCTION generate_share_code()
RETURNS TEXT AS $$
DECLARE
  code TEXT;
  exists_already BOOLEAN;
BEGIN
  LOOP
    -- Generate a 6-character alphanumeric code
    code := upper(substring(md5(random()::text) from 1 for 6));
    
    -- Check if code already exists
    SELECT EXISTS(SELECT 1 FROM public.story_shares WHERE share_code = code) INTO exists_already;
    
    -- If code doesn't exist, return it
    IF NOT exists_already THEN
      RETURN code;
    END IF;
  END LOOP;
END;
$$ LANGUAGE plpgsql; 