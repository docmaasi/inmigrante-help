/**
 * Shared email utility — sends emails via the Resend API.
 * All edge functions import this instead of calling Resend directly.
 */

interface SendEmailParams {
  to: string;
  subject: string;
  html: string;
  from?: string;
  replyTo?: string;
}

interface SendEmailResult {
  success: boolean;
  id?: string;
  error?: string;
}

export async function sendEmail(
  params: SendEmailParams
): Promise<SendEmailResult> {
  const apiKey = Deno.env.get('RESEND_API_KEY');

  if (!apiKey) {
    console.warn('RESEND_API_KEY not configured — skipping email');
    return { success: false, error: 'RESEND_API_KEY not configured' };
  }

  const {
    to,
    subject,
    html,
    from = 'FamilyCare.Help <admin@familycare.help>',
    replyTo,
  } = params;

  try {
    const body: Record<string, unknown> = {
      from,
      to: [to],
      subject,
      html,
    };

    if (replyTo) {
      body.reply_to = replyTo;
    }

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    const result = await response.json();

    if (!response.ok) {
      console.error('Resend API error:', result);
      return {
        success: false,
        error: result.message || 'Resend API error',
      };
    }

    return { success: true, id: result.id };
  } catch (err) {
    console.error('Email send failed:', err);
    return { success: false, error: err.message };
  }
}
