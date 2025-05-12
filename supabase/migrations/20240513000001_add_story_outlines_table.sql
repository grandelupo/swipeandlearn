-- Create a new table for storing multiple story outlines
CREATE TABLE story_outlines (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    story_id UUID NOT NULL REFERENCES stories(id) ON DELETE CASCADE,
    start_page INTEGER NOT NULL,
    end_page INTEGER NOT NULL,
    outline TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(story_id, start_page)
);

-- Add comment to explain the table's purpose
COMMENT ON TABLE story_outlines IS 'Stores multiple outlines for stories, with each outline covering a range of pages.';

-- Add RLS policies
ALTER TABLE story_outlines ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own story outlines"
    ON story_outlines
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM stories
            WHERE stories.id = story_outlines.story_id
            AND stories.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert their own story outlines"
    ON story_outlines
    FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM stories
            WHERE stories.id = story_outlines.story_id
            AND stories.user_id = auth.uid()
        )
    );

-- Create index for faster lookups
CREATE INDEX idx_story_outlines_story_id ON story_outlines(story_id); 