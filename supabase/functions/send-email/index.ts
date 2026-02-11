/**
 * Generic email endpoint.
 * Called by RefillReminders.jsx and any other frontend feature that
 * needs to send a one-off email.
 *
 * Expected body: { to, subject, text?, html?, from_name? }
 */
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.1';
import { sendEmail } from '../_shared/send-email.ts';
import { emailLayout } from '../_shared/email-templates.ts';

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
    // Require authentication
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

    const { to, subject, text, html, from_name } = await req.json();

    if (!to || !subject) {
      throw new Error('Missing required fields: to, subject');
    }

    // If only plain text was provided, wrap it in the branded layout
    const emailHtml =
      html ||
      emailLayout(
        `<p style="color:#334155;line-height:1.6;white-space:pre-line;">${text || ''}</p>`
      );

    const from = from_name
      ? `${from_name} <admin@familycare.help>`
      : undefined;

    const result = await sendEmail({
      to,
      subject,
      html: emailHtml,
      ...(from ? { from } : {}),
    });

    if (!result.success) {
      throw new Error(result.error || 'Failed to send email');
    }

    return new Response(
      JSON.stringify({ success: true, id: result.id }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('send-email error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
