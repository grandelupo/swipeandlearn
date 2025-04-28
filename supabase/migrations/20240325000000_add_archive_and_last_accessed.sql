-- Add archived column to stories table
ALTER TABLE stories
ADD COLUMN archived BOOLEAN NOT NULL DEFAULT FALSE;

-- Create an index on archived for better performance when filtering
CREATE INDEX idx_stories_archived ON stories(archived);

-- Add a comment to explain the purpose of the archived column
COMMENT ON COLUMN stories.archived IS 'Indicates whether the story has been archived by the user';

-- Add a comment to explain the purpose of the last_accessed column
COMMENT ON COLUMN stories.last_accessed IS 'Timestamp of when the story was last accessed by the user'; 