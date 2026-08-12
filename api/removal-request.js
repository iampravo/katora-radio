// Vercel serverless function (Node runtime, zero dependencies — uses Resend's
// REST API directly via fetch instead of the resend npm package, matching
// this site's no-build-step philosophy). Auto-detected from /api by Vercel,
// no config needed.

const MAX_MESSAGE_LENGTH = 2000;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    res.status(405).json({ success: false, error: 'Method not allowed' });
    return;
  }

  const { message, fromEmail } = req.body || {};
  const trimmedMessage = typeof message === 'string' ? message.trim() : '';
  if (!trimmedMessage) {
    res.status(400).json({ success: false, error: 'Please describe which song and why.' });
    return;
  }
  if (trimmedMessage.length > MAX_MESSAGE_LENGTH) {
    res.status(400).json({ success: false, error: `Message is too long (max ${MAX_MESSAGE_LENGTH} characters).` });
    return;
  }

  const trimmedEmail = typeof fromEmail === 'string' ? fromEmail.trim() : '';
  if (trimmedEmail && !EMAIL_PATTERN.test(trimmedEmail)) {
    res.status(400).json({ success: false, error: 'That email address doesn\'t look right.' });
    return;
  }

  const apiKey = process.env.RESEND_API_KEY;
  const recipient = process.env.REMOVAL_RECIPIENT_EMAIL;
  if (!apiKey || !recipient) {
    res.status(500).json({ success: false, error: 'Email is not configured on the server.' });
    return;
  }

  try {
    const resendRes = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'mera radio <onboarding@resend.dev>',
        to: recipient,
        reply_to: trimmedEmail || undefined,
        subject: 'mera radio — song removal request',
        text: `${trimmedMessage}\n\n—\nRequester email: ${trimmedEmail || '(not provided)'}`,
      }),
    });

    if (!resendRes.ok) {
      const errText = await resendRes.text();
      res.status(502).json({ success: false, error: `Resend error: ${errText}` });
      return;
    }

    res.status(200).json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to send email.' });
  }
};
