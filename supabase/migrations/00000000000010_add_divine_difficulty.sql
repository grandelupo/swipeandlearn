-- First, we need to remove the NOT NULL constraint to modify existing data
ALTER TABLE public.stories
ALTER COLUMN difficulty DROP NOT NULL;

-- Add the new enum value
ALTER TYPE difficulty_level ADD VALUE IF NOT EXISTS 'Divine';

-- Add back the NOT NULL constraint
ALTER TABLE public.stories
ALTER COLUMN difficulty SET NOT NULL; 