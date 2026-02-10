import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.1';

serve(async (req) => {
  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') || '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
    );

    // Find profiles past their deletion date with no active sub
    const { data: expiredProfiles, error: fetchError } = await supabase
      .from('profiles')
      .select('id, email, data_deletion_scheduled_at')
      .lt('data_deletion_scheduled_at', new Date().toISOString())
      .neq('subscription_status', 'active');

    if (fetchError) {
      throw new Error(`Failed to fetch expired profiles: ${fetchError.message}`);
    }

    if (!expiredProfiles || expiredProfiles.length === 0) {
      return new Response(
        JSON.stringify({ message: 'No expired profiles to clean up', count: 0 }),
        { headers: { 'Content-Type': 'application/json' } }
      );
    }

    const results = [];

    for (const profile of expiredProfiles) {
      try {
        // Tables with user_id foreign key (CASCADE will handle most,
        // but we delete explicitly to be thorough and log each step)
        const tables = [
          'care_recipients', 'team_members', 'appointments',
          'caregiver_shifts', 'caregiver_availability',
          'medications', 'medication_logs', 'medication_refills',
          'tasks', 'task_comments', 'care_tasks',
          'care_plans', 'care_plan_details', 'care_notes',
          'conversations', 'messages', 'notifications',
          'external_communications', 'team_announcements',
          'documents', 'subscriptions', 'receipts',
          'legal_acceptances', 'onboarding_progress',
          'widget_preferences', 'client_access',
          'action_logs', 'expenses',
        ];

        for (const table of tables) {
          await supabase.from(table).delete().eq('user_id', profile.id);
        }

        // Add email to blocked list
        if (profile.email) {
          await supabase.from('blocked_trial_emails').upsert(
            {
              email: profile.email,
              reason: 'trial_expired_no_subscription',
              blocked_at: new Date().toISOString(),
            },
            { onConflict: 'email' }
          );
        }

        // Mark profile as archived/deleted
        await supabase
          .from('profiles')
          .update({
            is_archived: true,
            deletion_status: 'completed',
            data_deletion_scheduled_at: null,
          })
          .eq('id', profile.id);

        results.push({
          id: profile.id,
          email: profile.email,
          status: 'cleaned',
        });

        console.log(`Cleaned up profile ${profile.id} (${profile.email})`);
      } catch (profileError) {
        results.push({
          id: profile.id,
          email: profile.email,
          status: 'error',
          error: profileError.message,
        });
        console.error(`Error cleaning profile ${profile.id}:`, profileError);
      }
    }

    return new Response(
      JSON.stringify({
        message: `Processed ${results.length} expired profiles`,
        count: results.length,
        results,
      }),
      { headers: { 'Content-Type': 'application/json' } }
    );
  } catch (err) {
    console.error('Cleanup error:', err);
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
});
