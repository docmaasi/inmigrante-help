/**
 * Cron-based function that sends care reminder emails daily.
 *
 * Runs at 14:00 UTC (9:00 AM US Eastern) each day. Sends:
 *  - Appointment reminders for appointments happening tomorrow
 *  - Medication refill reminders for active meds with 0 or 1 refills left
 *
 * Each reminder goes to the caregiver, the care recipient (if they have an
 * email on file), and any accepted team members assigned to that care recipient.
 * Tracking columns prevent duplicate sends across runs.
 */
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.1';
import {
  processAppointmentReminders,
  processMedicationRefillReminders,
} from './helpers.ts';

serve(async () => {
  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') || '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
    );

    const [appointmentsSent, refillsSent] = await Promise.all([
      processAppointmentReminders(supabase),
      processMedicationRefillReminders(supabase),
    ]);

    const total = appointmentsSent + refillsSent;

    return jsonResponse({
      message: `Processed ${total} reminder(s), sent ${total}`,
      appointmentsSent,
      refillsSent,
    });
  } catch (err) {
    console.error('Care reminder error:', err);
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
