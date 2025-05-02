-- Add vip field to profiles table
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS vip boolean DEFAULT false;

-- Update RLS policy to allow reading vip field
CREATE POLICY "Users can read their own vip status" ON public.profiles
  FOR SELECT
  USING (auth.uid() = id);

-- Add comment to explain the field's purpose
COMMENT ON COLUMN public.profiles.vip IS 'VIP status for users with access to premium features. Can only be modified by admins directly in the database.'; 