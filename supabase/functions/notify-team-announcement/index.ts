import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.1';
import { sendEmail } from '../_shared/send-email.ts';
import { announcementEmailHtml } from '../_shared/announcement-template.ts';

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

    const body = await req.json();
    const {
      announcement_title,
      announcement_content,
      announcement_priority,
      author_name,
      team_members,
    } = body;

    if (!announcement_title || !team_members?.length) {
      throw new Error('Missing required fields');
    }

    const priorityLabel =
      announcement_priority === 'urgent'
        ? '🚨 URGENT'
        : announcement_priority === 'important'
          ? '⚠️ Important'
          : '📢';

    const emailResults = [];

    for (const member of team_members) {
      if (!member.email) continue;

      const result = await sendEmail({
        to: member.email,
        subject: `${priorityLabel} Team Announcement: ${announcement_title}`,
        html: announcementEmailHtml(
          announcement_title,
          announcement_content,
          announcement_priority,
          author_name
        ),
      });

      emailResults.push({
        email: member.email,
        success: result.success,
        ...(result.error ? { error: result.error } : {}),
      });
    }

    return new Response(
      JSON.stringify({
        success: true,
        emails_sent: emailResults.filter((r) => r.success).length,
        emails_failed: emailResults.filter((r) => !r.success).length,
        resend_configured: !!Deno.env.get('RESEND_API_KEY'),
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error sending notifications:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
