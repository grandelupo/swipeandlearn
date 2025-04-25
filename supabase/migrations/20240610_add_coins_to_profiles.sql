-- Add coins column to profiles table with default value of 100
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS coins INTEGER NOT NULL DEFAULT 100;

-- Update RLS policies to include the new column
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id); 