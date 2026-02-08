import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

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

    // Use service role client for database operations
    const adminSupabase = createClient(
      Deno.env.get('SUPABASE_URL') || '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
    );

    // Get user's profile to check if it's archived
    const { data: profile, error: profileError } = await adminSupabase
      .from('profiles')
      .select('deletion_status, deletion_scheduled_at, is_archived')
      .eq('id', user.id)
      .single();

    if (profileError) {
      return new Response(
        JSON.stringify({ error: 'Failed to fetch profile' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if account is within retention period
    if (!profile.is_archived && profile.deletion_status !== 'pending') {
      return new Response(
        JSON.stringify({ error: 'Account is not archived', restored: false }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if past retention period
    if (profile.deletion_scheduled_at) {
      const deletionDate = new Date(profile.deletion_scheduled_at);
      if (new Date() > deletionDate) {
        return new Response(
          JSON.stringify({
            error: 'Retention period has expired. Data may have been permanently deleted.',
            restored: false
          }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    // Restore the account
    const { error: updateError } = await adminSupabase
      .from('profiles')
      .update({
        deletion_requested_at: null,
        deletion_scheduled_at: null,
        deletion_status: null,
        deletion_reason: null,
        is_archived: false,
        restored_at: new Date().toISOString(),
      })
      .eq('id', user.id);

    if (updateError) {
      return new Response(
        JSON.stringify({ error: 'Failed to restore account' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Log the restoration
    await adminSupabase.from('admin_activity_log').insert({
      admin_user_id: user.id,
      action: 'account_restored',
      target_type: 'profile',
      target_id: user.id,
      details: { restored_by: 'user', method: 'resubscription' },
    }).catch(() => {}); // Don't fail if logging fails

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Account restored successfully! Your data has been recovered.',
        restored: true,
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
