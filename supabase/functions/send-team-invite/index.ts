/**
 * Sends a team invite email after a new team member row is created.
 *
 * If the invited email already belongs to an existing FamilyCare account,
 * the team_members row is immediately linked (status → accepted) so the
 * user gets access without having to sign up again.
 *
 * Called fire-and-forget from useInviteTeamMember's onSuccess handler.
 */
import { createClient } from 'jsr:@supabase/supabase-js@2';
import { sendEmail } from '../_shared/send-email.ts';
import { teamInviteHtml } from '../_shared/email-templates.ts';

const DASHBOARD_URL = 'https://dashboard.familycare.help';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
    const authHeader = req.headers.get('Authorization');

    if (!authHeader) throw new Error('No authorization header');

    // Verify the calling user is authenticated (the workspace owner who sent the invite).
    const userClient = createClient(supabaseUrl, Deno.env.get('SUPABASE_ANON_KEY') ?? '', {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user }, error: userError } = await userClient.auth.getUser();
    if (userError || !user) throw new Error('Unauthorized');

    // Service-role client — can read all profiles and update team_members.
    const admin = createClient(supabaseUrl, supabaseServiceKey);

    const { teamMemberEmail, teamMemberName, caregiverName, careRecipientNames } =
      await req.json() as {
        teamMemberEmail: string;
        teamMemberName: string;
        caregiverName: string;
        careRecipientNames: string[];
      };

    if (!teamMemberEmail) throw new Error('teamMemberEmail is required');

    // Check if a profile already exists for this email address.
    const { data: existingProfile } = await admin
      .from('profiles')
      .select('id')
      .eq('email', teamMemberEmail.toLowerCase())
      .maybeSingle();

    if (existingProfile) {
      // Existing FamilyCare user — link them immediately so they get access right away.
      await admin
        .from('team_members')
        .update({
          invited_user_id: existingProfile.id,
          status: 'accepted',
          accepted_at: new Date().toISOString(),
        })
        .eq('user_id', user.id)
        .eq('email', teamMemberEmail.toLowerCase())
        .eq('status', 'pending');
    }

    // Send the invite email whether the account is new or existing.
    const signupUrl = `${DASHBOARD_URL}/signup?email=${encodeURIComponent(teamMemberEmail)}`;

    await sendEmail({
      to: teamMemberEmail,
      subject: `${caregiverName} invited you to FamilyCare.Help`,
      html: teamInviteHtml({
        inviteeName: teamMemberName || teamMemberEmail,
        caregiverName,
        careRecipientNames: careRecipientNames ?? [],
        signupUrl,
      }),
    });

    return new Response(
      JSON.stringify({ success: true }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    console.error('send-team-invite error:', message);
    return new Response(
      JSON.stringify({ error: message }),
      {
        status: message === 'Unauthorized' ? 401 : 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
