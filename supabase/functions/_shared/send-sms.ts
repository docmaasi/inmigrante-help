/**
 * Shared SMS utility — sends SMS messages via the Twilio REST API.
 * All edge functions import this instead of calling Twilio directly.
 */

interface SendSmsParams {
  to: string;   // E.164 format, e.g. "+12065551234"
  body: string; // Keep under 160 chars to stay within a single SMS segment
}

interface SendSmsResult {
  success: boolean;
  sid?: string;
  error?: string;
}

export async function sendSms(params: SendSmsParams): Promise<SendSmsResult> {
  const accountSid = Deno.env.get('TWILIO_ACCOUNT_SID');
  const authToken = Deno.env.get('TWILIO_AUTH_TOKEN');
  const fromNumber = Deno.env.get('TWILIO_PHONE_NUMBER');

  if (!accountSid || !authToken || !fromNumber) {
    console.warn('Twilio credentials not configured — skipping SMS');
    return { success: false, error: 'Twilio credentials not configured' };
  }

  const { to, body } = params;

  try {
    const credentials = btoa(`${accountSid}:${authToken}`);
    const url = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`;

    const formData = new URLSearchParams();
    formData.set('From', fromNumber);
    formData.set('To', to);
    formData.set('Body', body);

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Basic ${credentials}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData.toString(),
    });

    const result = await response.json();

    if (!response.ok) {
      console.error('Twilio API error:', result);
      return { success: false, error: result.message || 'Twilio API error' };
    }

    return { success: true, sid: result.sid };
  } catch (err) {
    console.error('SMS send failed:', err);
    return { success: false, error: err.message };
  }
}
