/**
 * HTML email templates for care reminder notifications.
 * Kept in a separate file to stay within the 200-line guideline for email-templates.ts.
 */

import { emailLayout } from './email-templates.ts';

const DASHBOARD_URL = 'https://dashboard.familycare.help';

function p(text: string): string {
  return `<p style="color:#334155;line-height:1.6;">${text}</p>`;
}

function banner(text: string, color: string, bg: string): string {
  return `<div style="background:${bg};border-left:4px solid ${color};padding:12px 16px;border-radius:6px;margin-bottom:16px;">
  <strong style="color:${color};">${text}</strong>
</div>`;
}

function detailRow(label: string, value: string): string {
  return `<tr>
    <td style="padding:8px 0;color:#64748b;font-size:14px;width:120px;vertical-align:top;">${label}</td>
    <td style="padding:8px 0;color:#1e293b;">${value}</td>
  </tr>`;
}

function actionBtn(href: string, label: string, color: string): string {
  return `<div style="text-align:center;margin:24px 0;">
  <a href="${href}" style="background:${color};color:#fff;padding:12px 28px;border-radius:6px;text-decoration:none;font-weight:600;display:inline-block;">${label}</a>
</div>`;
}

// ============================================
// APPOINTMENT REMINDER
// ============================================

export interface AppointmentReminderParams {
  recipientName: string;
  careRecipientName: string;
  appointmentTitle: string;
  date: string;
  time: string;
  provider?: string;
  location?: string;
}

export function appointmentReminderHtml(
  params: AppointmentReminderParams
): string {
  const {
    recipientName,
    careRecipientName,
    appointmentTitle,
    date,
    time,
    provider,
    location,
  } = params;

  return emailLayout(`
    ${banner('Appointment Tomorrow', '#1d4ed8', '#eff6ff')}
    ${p(`Hi ${recipientName},`)}
    ${p(`This is a reminder that <strong>${careRecipientName}</strong> has an appointment scheduled for tomorrow.`)}
    <table style="width:100%;border-collapse:collapse;margin:16px 0;">
      ${detailRow('Appointment', `<strong>${appointmentTitle}</strong>`)}
      ${detailRow('Date', date)}
      ${detailRow('Time', time)}
      ${provider ? detailRow('Provider', provider) : ''}
      ${location ? detailRow('Location', location) : ''}
    </table>
    ${actionBtn(DASHBOARD_URL, 'View in FamilyCare.Help', '#1d4ed8')}
  `);
}

// ============================================
// MEDICATION REFILL REMINDER
// ============================================

export interface MedicationRefillReminderParams {
  recipientName: string;
  careRecipientName: string;
  medicationName: string;
  dosage?: string;
  refillsRemaining: number;
}

export function medicationRefillReminderHtml(
  params: MedicationRefillReminderParams
): string {
  const {
    recipientName,
    careRecipientName,
    medicationName,
    dosage,
    refillsRemaining,
  } = params;

  const isUrgent = refillsRemaining === 0;
  const color = isUrgent ? '#dc2626' : '#d97706';
  const bg = isUrgent ? '#fef2f2' : '#fffbeb';
  const bannerText = isUrgent
    ? `No refills remaining — ${medicationName} needs to be refilled`
    : `Only 1 refill remaining for ${medicationName}`;

  return emailLayout(`
    ${banner(bannerText, color, bg)}
    ${p(`Hi ${recipientName},`)}
    ${p(`<strong>${careRecipientName}</strong>'s medication supply is running low and needs attention.`)}
    <table style="width:100%;border-collapse:collapse;margin:16px 0;">
      ${detailRow('Medication', `<strong>${medicationName}</strong>`)}
      ${dosage ? detailRow('Dosage', dosage) : ''}
      ${detailRow('Refills Left', `<strong style="color:${color};">${refillsRemaining}</strong>`)}
    </table>
    ${actionBtn(DASHBOARD_URL, 'Manage Medications', color)}
  `);
}
