import { supabase } from './supabase';

export interface ReferralEarning {
  id: string;
  referral_code_id: string;
  referred_user_id: string;
  transaction_amount: number;
  commission_amount: number;
  transaction_type: string;
  transaction_date: string;
  created_at: string;
}

export interface ReferralStats {
  total_earnings: number;
  total_referrals: number;
}

export class ReferralService {
  /**
   * Record a transaction and calculate referral earnings
   */
  static async recordTransaction(
    userId: string,
    amount: number,
    transactionType: 'purchase' | 'subscription' | 'coin_purchase'
  ): Promise<void> {
    try {
      console.log('Recording referral transaction:', {
        referred_user_id: userId,
        transaction_amount: amount,
        transaction_type: transactionType
      });

      // First check if user has a referral (for debugging)
      const userReferral = await this.checkUserReferral(userId);
      if (!userReferral) {
        console.log('User has no referral, skipping commission recording');
        return;
      }

      const { data, error } = await supabase.rpc('record_referral_earning', {
        referred_user_id: userId,
        transaction_amount: amount,
        transaction_type: transactionType
      });

      if (error) {
        console.error('Error recording referral earning:', error);
        return;
      }

      console.log('Referral earning result:', data);

      if (data && !data.success) {
        console.log('No referral found for user:', data.message);
      } else if (data && data.success) {
        console.log('Referral earning recorded successfully:', {
          commission_amount: data.commission_amount,
          referral_code_id: data.referral_code_id,
          influencer_user_id: data.influencer_user_id
        });
      }
    } catch (error) {
      console.error('Error recording transaction:', error);
    }
  }

  /**
   * Get referral statistics for an influencer
   */
  static async getInfluencerStats(userId: string): Promise<ReferralStats | null> {
    try {
      const { data, error } = await supabase.rpc('get_influencer_earnings', {
        influencer_user_id: userId
      });

      if (error) {
        console.error('Error getting influencer stats:', error);
        return null;
      }

      console.log('Influencer stats:', data);

      return data;
    } catch (error) {
      console.error('Error getting influencer stats:', error);
      return null;
    }
  }

  /**
   * Get recent earnings for an influencer
   */
  static async getRecentEarnings(userId: string, limit: number = 10): Promise<ReferralEarning[]> {
    try {
      // First get the user's referral codes
      const { data: referralCodes, error: codesError } = await supabase
        .from('referral_codes')
        .select('id')
        .eq('influencer_user_id', userId);

      if (codesError || !referralCodes?.length) {
        return [];
      }

      const codeIds = referralCodes.map(code => code.id);

      const { data: earnings, error } = await supabase
        .from('referral_earnings')
        .select('*')
        .in('referral_code_id', codeIds)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('Error getting recent earnings:', error);
        return [];
      }

      return earnings || [];
    } catch (error) {
      console.error('Error getting recent earnings:', error);
      return [];
    }
  }

  /**
   * Create a referral code for a user
   */
  static async createReferralCode(userId: string): Promise<string | null> {
    try {
      const { data, error } = await supabase.rpc('create_referral_code_for_user', {
        user_id: userId
      });

      if (error) {
        console.error('Error creating referral code:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error creating referral code:', error);
      return null;
    }
  }

  /**
   * Get user's referral code
   */
  static async getUserReferralCode(userId: string): Promise<string | null> {
    try {
      const { data, error } = await supabase
        .from('referral_codes')
        .select('code')
        .eq('influencer_user_id', userId)
        .eq('is_active', true)
        .single();

      if (error) {
        console.error('Error getting referral code:', error);
        return null;
      }

      return data?.code || null;
    } catch (error) {
      console.error('Error getting referral code:', error);
      return null;
    }
  }

  /**
   * Validate a referral code
   */
  static async validateReferralCode(code: string): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('referral_codes')
        .select('id')
        .eq('code', code.toUpperCase())
        .eq('is_active', true)
        .single();

      if (error) {
        return false;
      }

      return !!data;
    } catch (error) {
      return false;
    }
  }

  /**
   * Check if a user has a referral (for debugging)
   */
  static async checkUserReferral(userId: string): Promise<any> {
    try {
      console.log('Checking referral for user:', userId);
      
      const { data, error } = await supabase
        .from('user_referrals')
        .select(`
          *,
          referral_codes (
            code,
            influencer_user_id,
            commission_rate
          )
        `)
        .eq('user_id', userId)
        .single();

      if (error) {
        console.log('No referral found for user:', userId, 'Error:', error.message);
        return null;
      }

      console.log('User referral found:', data);
      return data;
    } catch (error) {
      console.error('Error checking user referral:', error);
      return null;
    }
  }

  /**
   * Manually link a user to a referral code (for testing)
   */
  static async manuallyLinkUserToReferral(userId: string, referralCode: string): Promise<boolean> {
    try {
      console.log('Manually linking user to referral code:', { userId, referralCode });
      
      // First get the referral code ID
      const { data: referralCodeData, error: codeError } = await supabase
        .from('referral_codes')
        .select('id, influencer_user_id')
        .eq('code', referralCode.toUpperCase())
        .eq('is_active', true)
        .single();
      
      if (codeError || !referralCodeData) {
        console.error('Referral code not found:', codeError);
        return false;
      }
      
      console.log('Found referral code:', referralCodeData);
      
      // Check if user already has a referral
      const { data: existingReferral, error: checkError } = await supabase
        .from('user_referrals')
        .select('id')
        .eq('user_id', userId)
        .single();
      
      if (existingReferral) {
        console.log('User already has a referral');
        return true;
      }
      
      // Create the referral relationship
      const { data: referralData, error: referralError } = await supabase
        .from('user_referrals')
        .insert({
          user_id: userId,
          referral_code_id: referralCodeData.id
        })
        .select()
        .single();
      
      if (referralError) {
        console.error('Error creating referral relationship:', referralError);
        return false;
      }
      
      // Update user's profile with referral code
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ referral_code_id: referralCodeData.id })
        .eq('id', userId);
      
      if (profileError) {
        console.error('Error updating profile:', profileError);
      }
      
      console.log('User linked to referral successfully:', referralData);
      return true;
    } catch (error) {
      console.error('Error in manual linking:', error);
      return false;
    }
  }

  /**
   * Debug function to check all referrals in the system
   */
  static async debugAllReferrals(): Promise<void> {
    try {
      console.log('=== DEBUGGING ALL REFERRALS ===');
      
      // Check all referral codes
      const { data: codes, error: codesError } = await supabase
        .from('referral_codes')
        .select('*');
      
      if (codesError) {
        console.error('Error fetching referral codes:', codesError);
      } else {
        console.log('All referral codes:', codes);
      }
      
      // Check all user referrals
      const { data: referrals, error: referralsError } = await supabase
        .from('user_referrals')
        .select('*');
      
      if (referralsError) {
        console.error('Error fetching user referrals:', referralsError);
      } else {
        console.log('All user referrals:', referrals);
      }
      
      // Check all referral earnings
      const { data: earnings, error: earningsError } = await supabase
        .from('referral_earnings')
        .select('*');
      
      if (earningsError) {
        console.error('Error fetching referral earnings:', earningsError);
      } else {
        console.log('All referral earnings:', earnings);
      }
      
      console.log('=== END DEBUGGING ===');
    } catch (error) {
      console.error('Error in debug function:', error);
    }
  }
} 