/**
 * Team announcement email template.
 * Separated from email-templates.ts to keep file sizes manageable.
 */
import { emailLayout } from './email-templates.ts';

const BRAND = '#0d9488';
const URL = 'https://dashboard.familycare.help';

/** Team announcement email. */
export function announcementEmailHtml(
  title: string,
  content: string,
  priority: string,
  authorName: string
): string {
  const colors: Record<string, { bg: string; border: string; badge: string; badgeText: string }> = {
    urgent:    { bg: '#fef2f2', border: '#ef4444', badge: '#fee2e2', badgeText: '#991b1b' },
    important: { bg: '#fff7ed', border: '#f97316', badge: '#ffedd5', badgeText: '#9a3412' },
    normal:    { bg: '#eff6ff', border: '#3b82f6', badge: '#dbeafe', badgeText: '#1e40af' },
  };
  const c = colors[priority] || colors.normal;

  return emailLayout(`
    <div style="background:${c.bg};padding:12px 16px;border-radius:6px;margin-bottom:16px;border-left:4px solid ${c.border};">
      <strong style="font-size:16px;">${title}</strong>
      <span style="display:inline-block;margin-left:8px;padding:2px 8px;border-radius:12px;font-size:11px;font-weight:600;background:${c.badge};color:${c.badgeText};">${priority}</span>
    </div>
    <p style="color:#334155;line-height:1.6;margin:0 0 16px;">${content}</p>
    <p style="color:#64748b;font-size:13px;margin:0;">Posted by <strong>${authorName}</strong></p>
    <div style="margin-top:16px;">
      <a href="${URL}/Collaboration" style="color:${BRAND};text-decoration:none;font-size:13px;">View in FamilyCare.Help</a>
      &nbsp;|&nbsp;
      <a href="${URL}/CommunicationHub" style="color:${BRAND};text-decoration:none;font-size:13px;">Communication Hub</a>
    </div>`);
}
