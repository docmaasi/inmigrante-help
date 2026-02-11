/**
 * Sends a welcome email to a newly signed-up user.
 * Called from the frontend auth-context after signUp succeeds.
 */
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.1';
import { sendEmail } from '../_shared/send-email.ts';
import { welcomeEmailHtml } from '../_shared/email-templates.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) throw new Error('No authorization header');

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') || '',
      Deno.env.get('SUPABASE_ANON_KEY') || '',
      { global: { headers: { Authorization: authHeader } } }
    );

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();
    if (userError || !user) throw new Error('Unauthorized');

    // Fetch profile to get name and trial end date
    const { data: profile } = await supabase
      .from('profiles')
      .select('full_name, trial_ends_at')
      .eq('id', user.id)
      .single();

    const userName = profile?.full_name || 'there';
    const trialEndDate = profile?.trial_ends_at
      ? new Date(profile.trial_ends_at).toLocaleDateString('en-US', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        })
      : '10 days from now';

    const result = await sendEmail({
      to: user.email!,
      subject: 'Welcome to FamilyCare.Help!',
      html: welcomeEmailHtml(userName, trialEndDate),
    });

    return new Response(
      JSON.stringify({ success: result.success }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Welcome email error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
