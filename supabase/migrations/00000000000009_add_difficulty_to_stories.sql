-- Create difficulty level enum if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'difficulty_level') THEN
        CREATE TYPE difficulty_level AS ENUM (
            'A1',
            'A2',
            'B1',
            'B2',
            'C1',
            'C2'
        );
    END IF;
END $$;

-- Add difficulty column to stories table with default value 'A1'
ALTER TABLE public.stories
ADD COLUMN IF NOT EXISTS difficulty difficulty_level NOT NULL DEFAULT 'A1';

-- Update RLS policies to include the new column
DROP POLICY IF EXISTS "Users can view their own stories" ON public.stories;
CREATE POLICY "Users can view their own stories"
  ON public.stories FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create their own stories" ON public.stories;
CREATE POLICY "Users can create their own stories"
  ON public.stories FOR INSERT
  WITH CHECK (auth.uid() = user_id); 