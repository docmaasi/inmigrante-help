/**
 * HTML email templates for FamilyCare.Help.
 * All templates share a consistent layout with teal branding.
 */

const BRAND = '#0d9488';
const URL = 'https://dashboard.familycare.help';

/** Wraps any content block in the shared email layout. */
export function emailLayout(content: string): string {
  return `<!DOCTYPE html>
<html><head><meta charset="utf-8" /></head>
<body style="margin:0;padding:0;background:#f1f5f9;font-family:Arial,sans-serif;">
<div style="max-width:600px;margin:0 auto;padding:20px;">
  <div style="background:${BRAND};color:#fff;padding:16px 24px;border-radius:8px 8px 0 0;">
    <h2 style="margin:0;font-size:18px;">FamilyCare.Help</h2>
  </div>
  <div style="background:#fff;border:1px solid #e2e8f0;border-top:none;padding:24px;border-radius:0 0 8px 8px;">
    ${content}
    <hr style="border:none;border-top:1px solid #e2e8f0;margin:24px 0 16px;" />
    <p style="color:#94a3b8;font-size:12px;margin:0;text-align:center;">
      <a href="${URL}" style="color:${BRAND};text-decoration:none;">Open FamilyCare.Help</a>
    </p>
  </div>
</div>
</body></html>`;
}

function btn(href: string, label: string, bg = BRAND): string {
  return `<div style="text-align:center;margin:24px 0;">
  <a href="${href}" style="background:${bg};color:#fff;padding:12px 28px;border-radius:6px;text-decoration:none;font-weight:600;display:inline-block;">${label}</a>
</div>`;
}

function p(text: string): string {
  return `<p style="color:#334155;line-height:1.6;">${text}</p>`;
}

function alert(text: string, color: string, bg: string): string {
  return `<div style="background:${bg};border-left:4px solid ${color};padding:12px 16px;border-radius:6px;margin-bottom:16px;"><strong style="color:#9a3412;">${text}</strong></div>`;
}

/** Welcome email sent after a new user signs up. */
export function welcomeEmailHtml(userName: string, trialEndDate: string): string {
  return emailLayout(`
    <h3 style="color:#1e293b;margin:0 0 12px;">Welcome to FamilyCare.Help!</h3>
    ${p(`Hi ${userName},`)}
    ${p(`Your account is set up and your <strong>free 10-day trial</strong> is active until <strong>${trialEndDate}</strong>.`)}
    ${p('During your trial you get full access to every feature: care coordination, medication tracking, team messaging, document storage, and more.')}
    ${btn(URL, 'Get Started')}
    <p style="color:#64748b;font-size:13px;">Questions? Just reply to this email &mdash; we're here to help.</p>`);
}

/** Trial reminder (sent at 3 days and 1 day before expiry). */
export function trialReminderHtml(userName: string, daysLeft: number, trialEndDate: string): string {
  const color = daysLeft <= 1 ? '#ef4444' : '#f97316';
  const label = daysLeft <= 1 ? 'tomorrow' : `in ${daysLeft} days`;
  return emailLayout(`
    ${alert(`Your trial ends ${label}`, color, '#fff7ed')}
    ${p(`Hi ${userName},`)}
    ${p(`Your free trial expires on <strong>${trialEndDate}</strong>. After that, your data will be kept for 10 more days, then permanently deleted if you haven't subscribed.`)}
    ${btn(`${URL}/Checkout`, 'Subscribe Now')}`);
}

/** Sent the day a trial expires. */
export function trialExpiredHtml(userName: string, deletionDate: string): string {
  return emailLayout(`
    ${alert('Your trial has expired', '#ef4444', '#fef2f2')}
    ${p(`Hi ${userName},`)}
    ${p(`Your 10-day free trial has ended. You can still subscribe to keep all your data. If you don't subscribe by <strong>${deletionDate}</strong>, your data will be permanently deleted.`)}
    ${btn(`${URL}/Checkout`, 'Subscribe to Keep Your Data', '#ef4444')}`);
}

/** Sent after a successful Stripe subscription. */
export function subscriptionConfirmedHtml(userName: string, planName: string): string {
  return emailLayout(`
    <h3 style="color:#1e293b;margin:0 0 12px;">You're subscribed!</h3>
    ${p(`Hi ${userName},`)}
    ${p(`Thank you for subscribing to <strong>${planName}</strong>. Your data is safe, and you have full access to every feature.`)}
    ${btn(URL, 'Go to Dashboard')}
    <p style="color:#64748b;font-size:13px;">Manage your subscription anytime from Settings.</p>`);
}

/** Sent when a subscription is canceled. */
export function subscriptionCanceledHtml(userName: string, deletionDate: string): string {
  return emailLayout(`
    ${alert('Your subscription has been canceled', '#f97316', '#fff7ed')}
    ${p(`Hi ${userName},`)}
    ${p(`We're sorry to see you go. Your data will remain available until <strong>${deletionDate}</strong>. After that date it will be permanently deleted.`)}
    ${p('Changed your mind? You can resubscribe any time before the deletion date to keep everything.')}
    ${btn(`${URL}/Checkout`, 'Resubscribe')}`);
}
