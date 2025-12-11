import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    // Get user from auth header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create client with user's token to get user_id
    const supabaseUser = createClient(supabaseUrl, Deno.env.get('SUPABASE_ANON_KEY')!, {
      global: { headers: { Authorization: authHeader } }
    });
    
    const { data: { user }, error: userError } = await supabaseUser.auth.getUser();
    if (userError || !user) {
      console.error('Auth error:', userError);
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { promo_code } = await req.json();
    
    if (!promo_code || typeof promo_code !== 'string') {
      return new Response(
        JSON.stringify({ error: 'Промокод не указан' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const trimmedCode = promo_code.trim().toUpperCase();
    console.log(`Applying promo code "${trimmedCode}" for user ${user.id}`);

    // Use service role client for database operations
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    // Check if promo code exists in bloggers table
    const { data: blogger, error: bloggerError } = await supabaseAdmin
      .from('bloggers')
      .select('id, name, promo_code')
      .eq('promo_code', trimmedCode)
      .maybeSingle();

    if (bloggerError) {
      console.error('Error fetching blogger:', bloggerError);
      return new Response(
        JSON.stringify({ error: 'Ошибка проверки промокода' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!blogger) {
      console.log(`Promo code "${trimmedCode}" not found`);
      return new Response(
        JSON.stringify({ error: 'Промокод не найден', valid: false }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Found blogger: ${blogger.name} (${blogger.id})`);

    // Update profile with promo code info
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .update({
        promo_code_used: trimmedCode,
        referred_by_blogger_id: blogger.id
      })
      .eq('id', user.id);

    if (profileError) {
      console.error('Error updating profile:', profileError);
      return new Response(
        JSON.stringify({ error: 'Ошибка обновления профиля' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Update subscription: extend trial to 14 days from now
    const trialEndsAt = new Date();
    trialEndsAt.setDate(trialEndsAt.getDate() + 14);

    const { error: subError } = await supabaseAdmin
      .from('subscriptions')
      .update({
        trial_ends_at: trialEndsAt.toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('user_id', user.id);

    if (subError) {
      console.error('Error updating subscription:', subError);
      return new Response(
        JSON.stringify({ error: 'Ошибка обновления подписки' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Successfully applied promo code "${trimmedCode}" for user ${user.id}. Trial extended to ${trialEndsAt.toISOString()}`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        valid: true,
        blogger_name: blogger.name,
        trial_days: 14,
        trial_ends_at: trialEndsAt.toISOString()
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Unexpected error:', error);
    return new Response(
      JSON.stringify({ error: 'Внутренняя ошибка сервера' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
