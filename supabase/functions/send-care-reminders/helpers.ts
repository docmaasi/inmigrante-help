/**
 * Helper functions for the send-care-reminders edge function.
 * Handles querying appointments/medications and dispatching reminder emails
 * to all relevant parties: caregiver, care recipient, and accepted team members.
 * Also sends SMS to the caregiver if they have opted in via sms_reminders_enabled.
 */

import { sendEmail } from '../_shared/send-email.ts';
import { sendSms } from '../_shared/send-sms.ts';
import {
  appointmentReminderHtml,
  medicationRefillReminderHtml,
} from '../_shared/care-reminder-templates.ts';

interface EmailTarget {
  email: string;
  name: string;
}

interface CaregiverProfile {
  email: string;
  full_name: string;
  phone: string | null;
  sms_reminders_enabled: boolean;
}

/**
 * Builds the full list of email recipients for a given care recipient:
 *  1. The caregiver (account owner)
 *  2. The care recipient themselves (only if they have an email on file)
 *  3. Any accepted team members assigned to that care recipient
 */
async function collectRecipients(
  supabase: any,
  caregiverId: string,
  caregiverEmail: string,
  caregiverName: string,
  careRecipientId: string,
  careRecipientEmail: string | null,
  careRecipientName: string
): Promise<EmailTarget[]> {
  const targets: EmailTarget[] = [
    { email: caregiverEmail, name: caregiverName },
  ];

  if (careRecipientEmail) {
    targets.push({ email: careRecipientEmail, name: careRecipientName });
  }

  const { data: teamMembers } = await supabase
    .from('team_members')
    .select('email, full_name')
    .eq('user_id', caregiverId)
    .eq('status', 'accepted')
    .contains('care_recipient_ids', [careRecipientId]);

  for (const tm of teamMembers || []) {
    if (tm.email) {
      targets.push({ email: tm.email, name: tm.full_name || 'Team Member' });
    }
  }

  return targets;
}

/**
 * Queries all appointments happening tomorrow that haven't had a reminder sent,
 * emails every relevant party, sends SMS to caregiver if opted in,
 * then stamps reminder_sent_at on the row.
 * Returns the number of appointment rows processed.
 */
export async function processAppointmentReminders(
  supabase: any
): Promise<number> {
  // Build a UTC date window for "tomorrow"
  const tomorrow = new Date();
  tomorrow.setUTCDate(tomorrow.getUTCDate() + 1);
  const dateStr = tomorrow.toISOString().split('T')[0];
  const windowStart = `${dateStr}T00:00:00.000Z`;
  const windowEnd = `${dateStr}T23:59:59.999Z`;

  const { data: appointments, error } = await supabase
    .from('appointments')
    .select(
      `id, title, start_time, provider_name, location, user_id, care_recipient_id,
       care_recipients ( first_name, last_name, email ),
       profiles ( email, full_name, phone, sms_reminders_enabled )`
    )
    .gte('start_time', windowStart)
    .lte('start_time', windowEnd)
    .is('reminder_sent_at', null)
    .neq('status', 'cancelled');

  if (error) {
    console.error('Error fetching appointments:', error);
    return 0;
  }

  let processed = 0;

  for (const appt of appointments || []) {
    const profile = appt.profiles as CaregiverProfile | null;
    const cr = appt.care_recipients as {
      first_name: string;
      last_name: string;
      email: string | null;
    } | null;

    if (!profile?.email || !cr) continue;

    const careRecipientName = `${cr.first_name} ${cr.last_name}`;

    const targets = await collectRecipients(
      supabase,
      appt.user_id,
      profile.email,
      profile.full_name || 'Caregiver',
      appt.care_recipient_id,
      cr.email,
      careRecipientName
    );

    const apptDate = new Date(appt.start_time);
    const date = apptDate.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
    const time = apptDate.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });

    for (const target of targets) {
      const result = await sendEmail({
        to: target.email,
        subject: `Reminder: ${appt.title} is tomorrow`,
        html: appointmentReminderHtml({
          recipientName: target.name,
          careRecipientName,
          appointmentTitle: appt.title,
          date,
          time,
          provider: appt.provider_name || undefined,
          location: appt.location || undefined,
        }),
      });
      if (!result.success) {
        console.error(
          `Failed to send appointment reminder to ${target.email}:`,
          result.error
        );
      }
    }

    // Send SMS only to the caregiver, only if they've explicitly opted in
    if (profile.sms_reminders_enabled && profile.phone) {
      const smsBody = `FamilyCare: ${careRecipientName}'s appt "${appt.title}" is tomorrow at ${time}.`;
      const smsResult = await sendSms({ to: profile.phone, body: smsBody });
      if (!smsResult.success) {
        console.error(
          `Failed to send appointment SMS to ${profile.phone}:`,
          smsResult.error
        );
      }
    }

    // Stamp row so this appointment isn't re-processed on the next run
    await supabase
      .from('appointments')
      .update({ reminder_sent_at: new Date().toISOString() })
      .eq('id', appt.id);

    processed++;
  }

  return processed;
}

/**
 * Queries all active medications with 0 or 1 refills remaining that haven't
 * had a refill reminder sent, emails every relevant party, sends SMS to
 * caregiver if opted in, then stamps refill_reminder_sent_at on the row.
 * Returns the number of medication rows processed.
 */
export async function processMedicationRefillReminders(
  supabase: any
): Promise<number> {
  const { data: medications, error } = await supabase
    .from('medications')
    .select(
      `id, name, dosage, user_id, care_recipient_id, refills_remaining,
       care_recipients ( first_name, last_name, email ),
       profiles ( email, full_name, phone, sms_reminders_enabled )`
    )
    .eq('is_active', true)
    .in('refills_remaining', [0, 1])
    .is('refill_reminder_sent_at', null);

  if (error) {
    console.error('Error fetching medications:', error);
    return 0;
  }

  let processed = 0;

  for (const med of medications || []) {
    const profile = med.profiles as CaregiverProfile | null;
    const cr = med.care_recipients as {
      first_name: string;
      last_name: string;
      email: string | null;
    } | null;

    if (!profile?.email || !cr) continue;

    const careRecipientName = `${cr.first_name} ${cr.last_name}`;

    const targets = await collectRecipients(
      supabase,
      med.user_id,
      profile.email,
      profile.full_name || 'Caregiver',
      med.care_recipient_id,
      cr.email,
      careRecipientName
    );

    for (const target of targets) {
      const result = await sendEmail({
        to: target.email,
        subject: `Medication refill needed: ${med.name}`,
        html: medicationRefillReminderHtml({
          recipientName: target.name,
          careRecipientName,
          medicationName: med.name,
          dosage: med.dosage || undefined,
          refillsRemaining: med.refills_remaining,
        }),
      });
      if (!result.success) {
        console.error(
          `Failed to send refill reminder to ${target.email}:`,
          result.error
        );
      }
    }

    // Send SMS only to the caregiver, only if they've explicitly opted in
    if (profile.sms_reminders_enabled && profile.phone) {
      const refillsLeft = med.refills_remaining === 0 ? 'no' : med.refills_remaining;
      const smsBody = `FamilyCare: ${med.name} for ${careRecipientName} needs a refill — ${refillsLeft} refill(s) left.`;
      const smsResult = await sendSms({ to: profile.phone, body: smsBody });
      if (!smsResult.success) {
        console.error(
          `Failed to send refill SMS to ${profile.phone}:`,
          smsResult.error
        );
      }
    }

    // Stamp row so this medication isn't re-processed on the next run
    await supabase
      .from('medications')
      .update({ refill_reminder_sent_at: new Date().toISOString() })
      .eq('id', med.id);

    processed++;
  }

  return processed;
}
