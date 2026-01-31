import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import Stripe from 'https://esm.sh/stripe@14.14.0?target=deno';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
  apiVersion: '2023-10-16',
  httpClient: Stripe.createFetchHttpClient(),
});

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Get the authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'No authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create Supabase client with user's token
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') || '',
      Deno.env.get('SUPABASE_ANON_KEY') || '',
      {
        global: {
          headers: { Authorization: authHeader },
        },
      }
    );

    // Get authenticated user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get request body
    const { reason } = await req.json().catch(() => ({ reason: 'Account deletion requested' }));

    // Use service role client for database operations
    const adminSupabase = createClient(
      Deno.env.get('SUPABASE_URL') || '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
    );

    // Get user's profile with Stripe customer ID
    const { data: profile, error: profileError } = await adminSupabase
      .from('profiles')
      .select('stripe_customer_id')
      .eq('id', user.id)
      .single();

    if (profileError) {
      console.error('Profile fetch error:', profileError);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch profile' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    let subscriptionCanceled = false;

    // Cancel Stripe subscription if customer exists
    if (profile?.stripe_customer_id) {
      try {
        // List active subscriptions for this customer
        const subscriptions = await stripe.subscriptions.list({
          customer: profile.stripe_customer_id,
          status: 'active',
        });

        // Cancel all active subscriptions
        for (const subscription of subscriptions.data) {
          await stripe.subscriptions.cancel(subscription.id, {
            cancellation_details: {
              comment: reason || 'Account deletion requested by user',
            },
          });
          subscriptionCanceled = true;
          console.log(`Canceled subscription ${subscription.id} for customer ${profile.stripe_customer_id}`);
        }

        // Also check for subscriptions that are past_due or trialing
        const otherSubscriptions = await stripe.subscriptions.list({
          customer: profile.stripe_customer_id,
          status: 'all',
        });

        for (const subscription of otherSubscriptions.data) {
          if (['past_due', 'trialing', 'unpaid'].includes(subscription.status)) {
            await stripe.subscriptions.cancel(subscription.id, {
              cancellation_details: {
                comment: reason || 'Account deletion requested by user',
              },
            });
            console.log(`Canceled ${subscription.status} subscription ${subscription.id}`);
          }
        }
      } catch (stripeError) {
        console.error('Stripe cancellation error:', stripeError);
        // Continue with account deletion even if Stripe fails
      }
    }

    // Calculate deletion date (60 days from now)
    const deletionDate = new Date();
    deletionDate.setDate(deletionDate.getDate() + 60);

    // Mark account for deletion in database (soft delete with 60-day retention)
    const { error: updateError } = await adminSupabase
      .from('profiles')
      .update({
        deletion_requested_at: new Date().toISOString(),
        deletion_scheduled_at: deletionDate.toISOString(),
        deletion_status: 'pending',
        deletion_reason: reason,
        subscription_status: 'canceled',
        is_archived: true,
      })
      .eq('id', user.id);

    if (updateError) {
      console.error('Profile update error:', updateError);
      return new Response(
        JSON.stringify({ error: 'Failed to process deletion request' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Update subscription record if exists
    await adminSupabase
      .from('subscriptions')
      .update({
        status: 'canceled',
        canceled_at: new Date().toISOString(),
        cancellation_reason: 'account_deletion',
      })
      .eq('user_id', user.id);

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Account deletion requested and subscription canceled',
        subscriptionCanceled,
        retentionDays: 60,
        deletionScheduledAt: deletionDate.toISOString(),
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
