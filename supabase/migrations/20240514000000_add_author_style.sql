-- Create author_style enum if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'author_style') THEN
        CREATE TYPE author_style AS ENUM (
            'Default',
            'Ernest Hemingway',
            'Terry Pratchett',
            'Douglas Adams',
            'George Orwell',
            'Joan Didion',
            'Adam Mickiewicz',
            'Alexandre Dumas',
            'Vladimir Nabokov',
            'Oscar Wilde',
            'F. Scott Fitzgerald'
        );
    END IF;
END $$;

-- Add author_style column to stories table with default value 'Default'
ALTER TABLE public.stories
ADD COLUMN IF NOT EXISTS author_style author_style NOT NULL DEFAULT 'Default';

-- Update RLS policies to include the new column
DROP POLICY IF EXISTS "Users can view their own stories" ON public.stories;
CREATE POLICY "Users can view their own stories"
  ON public.stories FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create their own stories" ON public.stories;
CREATE POLICY "Users can create their own stories"
  ON public.stories FOR INSERT
  WITH CHECK (auth.uid() = user_id); 