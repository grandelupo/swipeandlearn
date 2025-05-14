import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';

const AD_REWARD_AMOUNT = 2;

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    console.log('Request received:', req.method);
    
    // Create Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get request body
    const body = await req.json();
    console.log('Request body:', body);
    
    const { userId } = body;

    if (!userId) {
      console.error('Missing userId in request body');
      throw new Error('User ID is required');
    }

    console.log('Checking ad cooldown for user:', userId);

    // Check if user has watched an ad in the last hour
    const { data: lastAdWatch, error: lastAdError } = await supabaseClient
      .from('ad_watches')
      .select('watched_at')
      .eq('user_id', userId)
      .order('watched_at', { ascending: false })
      .limit(1)
      .single();

    if (lastAdError && lastAdError.code !== 'PGRST116') {
      console.error('Error checking last ad watch:', lastAdError);
      throw lastAdError;
    }

    console.log('Last ad watch data:', lastAdWatch);

    if (lastAdWatch) {
      const lastWatchTime = new Date(lastAdWatch.watched_at);
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);

      console.log('Last watch time:', lastWatchTime);
      console.log('One hour ago:', oneHourAgo);

      if (lastWatchTime > oneHourAgo) {
        console.log('User needs to wait before watching another ad');
        return new Response(
          JSON.stringify({
            success: false,
            error: 'Please wait an hour between watching ads'
          }),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 400
          }
        );
      }
    }

    console.log('Recording new ad watch');

    // Record the ad watch
    const { error: watchError } = await supabaseClient
      .from('ad_watches')
      .insert({
        user_id: userId,
        watched_at: new Date().toISOString(),
        reward_amount: AD_REWARD_AMOUNT
      });

    if (watchError) {
      console.error('Error recording ad watch:', watchError);
      throw watchError;
    }

    console.log('Updating user coin balance');

    // Get user's current coin balance
    const { data: userData, error: userError } = await supabaseClient
      .from('profiles')
      .select('coins')
      .eq('id', userId)
      .single();

    if (userError) {
      console.error('Error getting user data:', userError);
      throw userError;
    }

    const currentCoins = userData?.coins || 0;

    // Update user's coin balance
    const { error: updateError } = await supabaseClient
      .from('profiles')
      .update({ coins: currentCoins + AD_REWARD_AMOUNT })
      .eq('id', userId);

    if (updateError) {
      console.error('Error updating coin balance:', updateError);
      throw updateError;
    }

    console.log('Successfully processed ad reward');

    return new Response(
      JSON.stringify({ 
        success: true,
        reward: AD_REWARD_AMOUNT
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    );
  } catch (error) {
    console.error('Error in show-ad function:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400
      }
    );
  }
}); 