/**
 * Cron-based function that sends trial expiry reminder emails.
 *
 * Runs daily (like cleanup-expired-trials). It queries profiles
 * whose trial ends in 3 days, 1 day, or has already expired, and
 * sends the appropriate email. Uses `trial_reminders_sent` column
 * to avoid sending duplicates.
 */
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.1';
import { sendEmail } from '../_shared/send-email.ts';
import {
  trialReminderHtml,
  trialExpiredHtml,
} from '../_shared/email-templates.ts';

serve(async () => {
  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') || '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
    );

    const now = new Date();
    const results: Array<{
      email: string;
      type: string;
      success: boolean;
    }> = [];

    // Get all profiles on a free trial (no active subscription)
    const { data: profiles, error } = await supabase
      .from('profiles')
      .select(
        'id, email, full_name, trial_ends_at, trial_reminders_sent'
      )
      .not('trial_ends_at', 'is', null)
      .neq('subscription_status', 'active');

    if (error) throw error;
    if (!profiles?.length) {
      return jsonResponse({
        message: 'No trial profiles found',
        sent: 0,
      });
    }

    for (const profile of profiles) {
      if (!profile.email || !profile.trial_ends_at) continue;

      const trialEnd = new Date(profile.trial_ends_at);
      const msLeft = trialEnd.getTime() - now.getTime();
      const daysLeft = Math.ceil(msLeft / (1000 * 60 * 60 * 24));
      const sent: string[] = profile.trial_reminders_sent || [];

      // Determine which reminder to send (if any)
      let reminderType: string | null = null;
      let html: string | null = null;
      let subject: string | null = null;
      const userName = profile.full_name || 'there';

      const formattedDate = trialEnd.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });

      if (daysLeft <= 0 && !sent.includes('expired')) {
        reminderType = 'expired';
        const deletionDate = new Date(trialEnd);
        deletionDate.setDate(deletionDate.getDate() + 10);
        const formattedDeletion = deletionDate.toLocaleDateString(
          'en-US',
          {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          }
        );
        subject = 'Your FamilyCare.Help trial has expired';
        html = trialExpiredHtml(userName, formattedDeletion);
      } else if (
        daysLeft > 0 &&
        daysLeft <= 1 &&
        !sent.includes('1day')
      ) {
        reminderType = '1day';
        subject =
          'Your FamilyCare.Help trial ends tomorrow';
        html = trialReminderHtml(userName, 1, formattedDate);
      } else if (
        daysLeft > 1 &&
        daysLeft <= 3 &&
        !sent.includes('3day')
      ) {
        reminderType = '3day';
        subject = `Your FamilyCare.Help trial ends in ${daysLeft} days`;
        html = trialReminderHtml(userName, daysLeft, formattedDate);
      }

      if (!reminderType || !html || !subject) continue;

      const emailResult = await sendEmail({
        to: profile.email,
        subject,
        html,
      });

      // Record that this reminder was sent
      if (emailResult.success) {
        const updatedSent = [...sent, reminderType];
        await supabase
          .from('profiles')
          .update({ trial_reminders_sent: updatedSent })
          .eq('id', profile.id);
      }

      results.push({
        email: profile.email,
        type: reminderType,
        success: emailResult.success,
      });
    }

    return jsonResponse({
      message: `Processed ${results.length} reminder(s)`,
      sent: results.filter((r) => r.success).length,
      results,
    });
  } catch (err) {
    console.error('Trial reminder error:', err);
    return jsonResponse({ error: err.message }, 500);
  }
});

function jsonResponse(
  body: Record<string, unknown>,
  status = 200
): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}
