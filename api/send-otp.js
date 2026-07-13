// POST /api/send-otp  { email, name? }  ->  { ok, token }
// Generates a 6-digit OTP, emails it via Gmail, and returns a signed token
// that binds the code to the email (the code itself is never returned).
import { generateOtp, signToken, sendOtpEmail, applyCors, readJson } from './_otp.js';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const STUDENT_DOMAIN = '@cb.students.amrita.edu';

export default async function handler(req, res) {
  applyCors(req, res);
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return res.status(405).json({ ok: false, error: 'Method not allowed' });

  try {
    const { email, name, purpose } = await readJson(req);
    if (!email || !EMAIL_RE.test(String(email))) {
      return res.status(400).json({ ok: false, error: 'Please provide a valid email address.' });
    }
    // Student signups are restricted to official Amrita Coimbatore emails.
    if ((purpose || 'signup') === 'signup' && !String(email).trim().toLowerCase().endsWith(STUDENT_DOMAIN)) {
      return res.status(400).json({ ok: false, error: 'Only official @cb.students.amrita.edu student emails are accepted.' });
    }

    const otp = generateOtp();
    const token = signToken({ email, otp, purpose: purpose || 'signup' });

    await sendOtpEmail({ to: String(email).trim(), otp, name });

    return res.status(200).json({ ok: true, token, expiresInSec: 600 });
  } catch (err) {
    console.error('[send-otp]', err);
    const msg = /configured/i.test(err.message)
      ? 'Email service is not configured on the server.'
      : 'Could not send the verification email. Please try again.';
    return res.status(500).json({ ok: false, error: msg });
  }
}
