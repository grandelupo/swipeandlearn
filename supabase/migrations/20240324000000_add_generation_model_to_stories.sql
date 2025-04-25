-- Add generation_model column to stories table
ALTER TABLE public.stories
ADD COLUMN IF NOT EXISTS generation_model text;

-- Update existing stories to use 'gpt-4' as default
UPDATE public.stories
SET generation_model = 'gpt-4'
WHERE generation_model IS NULL; 