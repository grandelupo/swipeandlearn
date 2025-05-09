-- Add story_outline column to stories table
ALTER TABLE stories
ADD COLUMN story_outline TEXT;

-- Add comment to explain the column's purpose
COMMENT ON COLUMN stories.story_outline IS 'A detailed outline of the story structure, including key scenes and plot points for each page.';

-- Update RLS policies to include the new column
ALTER POLICY "Users can view their own stories" ON stories
    USING (auth.uid() = user_id);

ALTER POLICY "Users can update their own stories" ON stories
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id); 