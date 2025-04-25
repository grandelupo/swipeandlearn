-- Create model type enum
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'ai_model') THEN
        CREATE TYPE ai_model AS ENUM (
            'gpt4',
            'grok'
        );
    END IF;
END $$;

-- Add preferred_model column to profiles table with default value 'gpt4'
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS preferred_model ai_model NOT NULL DEFAULT 'gpt4';

-- Update RLS policies to include the new column
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id); 