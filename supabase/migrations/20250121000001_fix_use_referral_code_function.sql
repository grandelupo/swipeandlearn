-- Drop and recreate the use_referral_code function to fix ambiguous column reference
DROP FUNCTION IF EXISTS public.use_referral_code(TEXT, UUID);

-- Create the function with explicit parameter naming to avoid ambiguity
CREATE OR REPLACE FUNCTION public.use_referral_code(
  referral_code TEXT, 
  new_user_id UUID
)
RETURNS BOOLEAN AS $$
DECLARE
  referral_code_record RECORD;
BEGIN
  -- Check if code exists and is active (be explicit about parameter vs column)
  SELECT * INTO referral_code_record 
  FROM public.referral_codes 
  WHERE referral_codes.code = use_referral_code.referral_code AND is_active = true;
  
  IF NOT FOUND THEN
    RETURN FALSE;
  END IF;
  
  -- Check if user is trying to use their own code
  IF referral_code_record.influencer_user_id = new_user_id THEN
    RETURN FALSE;
  END IF;
  
  -- Check if user already has a referral (be explicit about table column)
  IF EXISTS (SELECT 1 FROM public.user_referrals WHERE user_referrals.user_id = new_user_id) THEN
    RETURN FALSE;
  END IF;
  
  -- Create the referral relationship
  INSERT INTO public.user_referrals (user_id, referral_code_id)
  VALUES (new_user_id, referral_code_record.id);
  
  -- Update user's profile with referral code (profiles table uses 'id' not 'user_id')
  UPDATE public.profiles 
  SET referral_code_id = referral_code_record.id
  WHERE id = new_user_id;
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission on the updated function
GRANT EXECUTE ON FUNCTION public.use_referral_code(TEXT, UUID) TO authenticated; 