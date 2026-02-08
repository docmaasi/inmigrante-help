import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Verify the user is authenticated
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') || '',
      Deno.env.get('SUPABASE_ANON_KEY') || '',
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      throw new Error('Unauthorized');
    }

    const body = await req.json();
    const {
      announcement_title,
      announcement_content,
      announcement_priority,
      author_name,
      team_members, // Array of { email, name, phone }
    } = body;

    if (!announcement_title || !team_members || team_members.length === 0) {
      throw new Error('Missing required fields');
    }

    const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');

    // Send email notifications if Resend is configured
    const emailResults = [];
    if (RESEND_API_KEY) {
      const priorityLabel = announcement_priority === 'urgent'
        ? '🚨 URGENT'
        : announcement_priority === 'important'
        ? '⚠️ Important'
        : '📢';

      for (const member of team_members) {
        if (!member.email) continue;

        try {
          const emailResponse = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${RESEND_API_KEY}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              from: 'FamilyCare.Help <notifications@familycare.help>',
              to: [member.email],
              subject: `${priorityLabel} Team Announcement: ${announcement_title}`,
              html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                  <div style="background: #0d9488; color: white; padding: 16px 24px; border-radius: 8px 8px 0 0;">
                    <h2 style="margin: 0; font-size: 18px;">FamilyCare.Help - Team Announcement</h2>
                  </div>
                  <div style="border: 1px solid #e2e8f0; border-top: none; padding: 24px; border-radius: 0 0 8px 8px;">
                    <div style="background: ${
                      announcement_priority === 'urgent' ? '#fef2f2' :
                      announcement_priority === 'important' ? '#fff7ed' : '#eff6ff'
                    }; padding: 12px 16px; border-radius: 6px; margin-bottom: 16px; border-left: 4px solid ${
                      announcement_priority === 'urgent' ? '#ef4444' :
                      announcement_priority === 'important' ? '#f97316' : '#3b82f6'
                    };">
                      <strong style="font-size: 16px;">${announcement_title}</strong>
                      <span style="display: inline-block; margin-left: 8px; padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: 600; background: ${
                        announcement_priority === 'urgent' ? '#fee2e2' :
                        announcement_priority === 'important' ? '#ffedd5' : '#dbeafe'
                      }; color: ${
                        announcement_priority === 'urgent' ? '#991b1b' :
                        announcement_priority === 'important' ? '#9a3412' : '#1e40af'
                      };">${announcement_priority}</span>
                    </div>
                    <p style="color: #334155; line-height: 1.6; margin: 0 0 16px 0;">${announcement_content}</p>
                    <p style="color: #64748b; font-size: 13px; margin: 0;">
                      Posted by <strong>${author_name}</strong>
                    </p>
                    <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
                    <p style="color: #94a3b8; font-size: 12px; margin: 0;">
                      <a href="https://dashboard.familycare.help/Collaboration" style="color: #0d9488; text-decoration: none;">View in FamilyCare.Help</a>
                      &nbsp;|&nbsp;
                      <a href="https://dashboard.familycare.help/CommunicationHub" style="color: #0d9488; text-decoration: none;">Communication Hub</a>
                    </p>
                  </div>
                </div>
              `,
            }),
          });

          const result = await emailResponse.json();
          emailResults.push({ email: member.email, success: emailResponse.ok, result });
        } catch (emailError) {
          emailResults.push({ email: member.email, success: false, error: emailError.message });
        }
      }
    } else {
      console.log('RESEND_API_KEY not configured - skipping email notifications');
    }

    return new Response(
      JSON.stringify({
        success: true,
        emails_sent: emailResults.filter(r => r.success).length,
        emails_failed: emailResults.filter(r => !r.success).length,
        resend_configured: !!RESEND_API_KEY,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error sending notifications:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
