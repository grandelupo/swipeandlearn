-- Drop the existing function first (PostgreSQL doesn't allow changing return type)
DROP FUNCTION IF EXISTS public.record_referral_earning(UUID, DECIMAL, TEXT);

-- Create the record_referral_earning function with JSON return type for better debugging
CREATE FUNCTION public.record_referral_earning(
  referred_user_id UUID,
  transaction_amount DECIMAL(10,2),
  transaction_type TEXT
)
RETURNS JSON AS $$
DECLARE
  referral_record RECORD;
  commission_amount DECIMAL(10,2);
  result JSON;
BEGIN
  -- Get the referral information
  SELECT 
    ur.referral_code_id,
    rc.commission_rate,
    rc.influencer_user_id
  INTO referral_record
  FROM public.user_referrals ur
  JOIN public.referral_codes rc ON ur.referral_code_id = rc.id
  WHERE ur.user_id = referred_user_id;
  
  -- If no referral found, return info about it
  IF NOT FOUND THEN
    result := json_build_object(
      'success', false,
      'message', 'No referral found for user',
      'user_id', referred_user_id
    );
    RETURN result;
  END IF;
  
  -- Calculate commission (10% by default)
  commission_amount := (transaction_amount * referral_record.commission_rate) / 100;
  
  -- Record the earning
  INSERT INTO public.referral_earnings (
    referral_code_id,
    referred_user_id,
    transaction_amount,
    commission_amount,
    transaction_type
  ) VALUES (
    referral_record.referral_code_id,
    referred_user_id,
    transaction_amount,
    commission_amount,
    transaction_type
  );
  
  -- Return success info
  result := json_build_object(
    'success', true,
    'message', 'Referral earning recorded',
    'commission_amount', commission_amount,
    'referral_code_id', referral_record.referral_code_id,
    'influencer_user_id', referral_record.influencer_user_id
  );
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fix the use_referral_code function to resolve ambiguous column reference
CREATE OR REPLACE FUNCTION public.use_referral_code(code TEXT, user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  referral_code_record RECORD;
BEGIN
  -- Check if code exists and is active (be specific about which table's code column)
  SELECT * INTO referral_code_record 
  FROM public.referral_codes 
  WHERE referral_codes.code = use_referral_code.code AND is_active = true;
  
  IF NOT FOUND THEN
    RETURN FALSE;
  END IF;
  
  -- Check if user is trying to use their own code
  IF referral_code_record.influencer_user_id = user_id THEN
    RETURN FALSE;
  END IF;
  
  -- Check if user already has a referral
  IF EXISTS (SELECT 1 FROM public.user_referrals WHERE user_referrals.user_id = user_id) THEN
    RETURN FALSE;
  END IF;
  
  -- Create the referral relationship
  INSERT INTO public.user_referrals (user_id, referral_code_id)
  VALUES (user_id, referral_code_record.id);
  
  -- Update user's profile with referral code
  UPDATE public.profiles 
  SET referral_code_id = referral_code_record.id
  WHERE id = user_id;
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission on the updated function
GRANT EXECUTE ON FUNCTION public.record_referral_earning(UUID, DECIMAL, TEXT) TO authenticated; 