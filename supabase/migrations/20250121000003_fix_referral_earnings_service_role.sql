-- Add policy to allow service role to access referral earnings for influencer dashboard
-- This is needed because the PHP dashboard uses service role authentication

-- Drop existing policy that only works for authenticated users
DROP POLICY IF EXISTS "Influencers can view their earnings" ON public.referral_earnings;

-- Create new policy that works with both authenticated users and service role
CREATE POLICY "Influencers can view their earnings"
  ON public.referral_earnings FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.referral_codes 
      WHERE referral_codes.id = referral_earnings.referral_code_id 
      AND referral_codes.influencer_user_id = auth.uid()
    )
  );

-- Also add a policy specifically for service role access
CREATE POLICY "Service role can view all referral earnings"
  ON public.referral_earnings FOR SELECT
  USING (true);

-- Grant necessary permissions to the service role
GRANT SELECT ON public.referral_earnings TO service_role;
GRANT SELECT ON public.referral_codes TO service_role;
GRANT SELECT ON public.user_referrals TO service_role; 