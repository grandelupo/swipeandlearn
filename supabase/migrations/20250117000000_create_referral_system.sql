-- Create referral codes table
CREATE TABLE public.referral_codes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT UNIQUE NOT NULL,
  influencer_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  is_active BOOLEAN DEFAULT true,
  commission_rate DECIMAL(5,2) DEFAULT 10.00, -- 10% default commission
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create user referrals table to track who used which code
CREATE TABLE public.user_referrals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  referral_code_id UUID REFERENCES public.referral_codes(id) ON DELETE CASCADE NOT NULL,
  referred_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(user_id) -- Each user can only be referred once
);

-- Create referral earnings table to track commissions
CREATE TABLE public.referral_earnings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  referral_code_id UUID REFERENCES public.referral_codes(id) ON DELETE CASCADE NOT NULL,
  referred_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  transaction_amount DECIMAL(10,2) NOT NULL,
  commission_amount DECIMAL(10,2) NOT NULL,
  transaction_type TEXT NOT NULL, -- 'purchase', 'subscription', etc.
  transaction_date TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Add referral_code_id to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS referral_code_id UUID REFERENCES public.referral_codes(id);

-- Enable RLS on all tables
ALTER TABLE public.referral_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referral_earnings ENABLE ROW LEVEL SECURITY;

-- RLS Policies for referral_codes
CREATE POLICY "Users can view their own referral codes"
  ON public.referral_codes FOR SELECT
  USING (auth.uid() = influencer_user_id);

CREATE POLICY "Users can create their own referral codes"
  ON public.referral_codes FOR INSERT
  WITH CHECK (auth.uid() = influencer_user_id);

CREATE POLICY "Users can update their own referral codes"
  ON public.referral_codes FOR UPDATE
  USING (auth.uid() = influencer_user_id);

-- Allow public to view active referral codes for validation
CREATE POLICY "Public can view active referral codes"
  ON public.referral_codes FOR SELECT
  USING (is_active = true);

-- RLS Policies for user_referrals
CREATE POLICY "Users can view their own referral data"
  ON public.user_referrals FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view referrals they made"
  ON public.user_referrals FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.referral_codes 
      WHERE referral_codes.id = user_referrals.referral_code_id 
      AND referral_codes.influencer_user_id = auth.uid()
    )
  );

CREATE POLICY "Service role can insert user referrals"
  ON public.user_referrals FOR INSERT
  WITH CHECK (true);

-- RLS Policies for referral_earnings
CREATE POLICY "Influencers can view their earnings"
  ON public.referral_earnings FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.referral_codes 
      WHERE referral_codes.id = referral_earnings.referral_code_id 
      AND referral_codes.influencer_user_id = auth.uid()
    )
  );

CREATE POLICY "Service role can insert referral earnings"
  ON public.referral_earnings FOR INSERT
  WITH CHECK (true);

-- Create indexes for better performance
CREATE INDEX idx_referral_codes_code ON public.referral_codes(code);
CREATE INDEX idx_referral_codes_influencer ON public.referral_codes(influencer_user_id);
CREATE INDEX idx_user_referrals_user_id ON public.user_referrals(user_id);
CREATE INDEX idx_user_referrals_code_id ON public.user_referrals(referral_code_id);
CREATE INDEX idx_referral_earnings_code_id ON public.referral_earnings(referral_code_id);
CREATE INDEX idx_referral_earnings_date ON public.referral_earnings(transaction_date);

-- Function to generate unique referral code
CREATE OR REPLACE FUNCTION public.generate_referral_code()
RETURNS TEXT AS $$
DECLARE
  code TEXT;
  counter INTEGER := 0;
BEGIN
  LOOP
    -- Generate a 6-character alphanumeric code
    code := upper(substring(md5(random()::text || clock_timestamp()::text) from 1 for 6));
    
    -- Check if code already exists
    IF NOT EXISTS (SELECT 1 FROM public.referral_codes WHERE referral_codes.code = code) THEN
      RETURN code;
    END IF;
    
    counter := counter + 1;
    IF counter > 100 THEN
      RAISE EXCEPTION 'Unable to generate unique referral code after 100 attempts';
    END IF;
  END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to create referral code for a user
CREATE OR REPLACE FUNCTION public.create_referral_code_for_user(user_id UUID)
RETURNS TEXT AS $$
DECLARE
  new_code TEXT;
BEGIN
  -- Generate unique code
  new_code := public.generate_referral_code();
  
  -- Insert the referral code
  INSERT INTO public.referral_codes (code, influencer_user_id)
  VALUES (new_code, user_id);
  
  RETURN new_code;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to validate and use referral code
CREATE OR REPLACE FUNCTION public.use_referral_code(code TEXT, user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  referral_code_record RECORD;
BEGIN
  -- Check if code exists and is active
  SELECT * INTO referral_code_record 
  FROM public.referral_codes 
  WHERE referral_codes.code = code AND is_active = true;
  
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

-- Function to record referral earnings
CREATE OR REPLACE FUNCTION public.record_referral_earning(
  referred_user_id UUID,
  transaction_amount DECIMAL(10,2),
  transaction_type TEXT
)
RETURNS VOID AS $$
DECLARE
  referral_record RECORD;
  commission_amount DECIMAL(10,2);
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
  
  -- If no referral found, do nothing
  IF NOT FOUND THEN
    RETURN;
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
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get influencer earnings summary
CREATE OR REPLACE FUNCTION public.get_influencer_earnings(influencer_user_id UUID)
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'total_earnings', COALESCE(SUM(re.commission_amount), 0),
    'total_referrals', COUNT(DISTINCT ur.user_id)
  ) INTO result
  FROM public.referral_codes rc
  LEFT JOIN public.user_referrals ur ON rc.id = ur.referral_code_id
  LEFT JOIN public.referral_earnings re ON rc.id = re.referral_code_id
  WHERE rc.influencer_user_id = get_influencer_earnings.influencer_user_id;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION public.generate_referral_code() TO authenticated;
GRANT EXECUTE ON FUNCTION public.create_referral_code_for_user(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.use_referral_code(TEXT, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.record_referral_earning(UUID, DECIMAL, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_influencer_earnings(UUID) TO authenticated;

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_referral_codes_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER referral_codes_updated_at_trigger
  BEFORE UPDATE ON public.referral_codes
  FOR EACH ROW
  EXECUTE FUNCTION public.update_referral_codes_updated_at(); 