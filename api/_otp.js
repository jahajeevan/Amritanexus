// Shared helpers for OTP endpoints (not routed — filename starts with "_").
// Stateless design: the OTP is emailed to the user, and a *signed, hashed*
// token is returned to the browser. The server never has to remember anything,
// which makes it reliable on serverless cold starts.
import crypto from 'node:crypto';
import nodemailer from 'nodemailer';

const OTP_TTL_MS = 10 * 60 * 1000; // 10 minutes

const b64url = (buf) =>
  Buffer.from(buf).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

const sha256 = (str) => crypto.createHash('sha256').update(str).digest('hex');

const hmac = (str, secret) =>
  crypto.createHmac('sha256', secret).update(str).digest('hex');

const normEmail = (email) => String(email || '').trim().toLowerCase();

export function generateOtp() {
  // 6-digit numeric, cryptographically random
  return String(crypto.randomInt(0, 1_000_000)).padStart(6, '0');
}

// Build an opaque token binding {email, otp, purpose, expiry} without ever
// exposing the OTP. Client stores the token and sends it back on verify.
export function signToken({ email, otp, purpose = 'signup' }) {
  const secret = process.env.OTP_SECRET;
  if (!secret) throw new Error('OTP_SECRET is not configured');
  const e = normEmail(email);
  const payload = {
    e: sha256(e),
    o: sha256(`${otp}:${e}:${secret}`),
    x: Date.now() + OTP_TTL_MS,
    p: purpose,
  };
  const body = b64url(JSON.stringify(payload));
  return `${body}.${hmac(body, secret)}`;
}

export function verifyToken({ token, email, otp, purpose = 'signup' }) {
  const secret = process.env.OTP_SECRET;
  if (!secret) return { ok: false, error: 'Server not configured.' };
  if (!token || !otp) return { ok: false, error: 'Missing code.' };

  const [body, sig] = String(token).split('.');
  if (!body || !sig) return { ok: false, error: 'Malformed verification token.' };

  // Constant-time signature check
  const expectedSig = hmac(body, secret);
  if (!crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expectedSig))) {
    return { ok: false, error: 'Verification token has been tampered with.' };
  }

  let payload;
  try {
    payload = JSON.parse(Buffer.from(body.replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString());
  } catch {
    return { ok: false, error: 'Malformed verification token.' };
  }

  const e = normEmail(email);
  if (payload.p !== purpose) return { ok: false, error: 'Wrong verification context.' };
  if (payload.e !== sha256(e)) return { ok: false, error: 'Email does not match this code.' };
  if (Date.now() > payload.x) return { ok: false, error: 'This code has expired. Request a new one.' };
  if (payload.o !== sha256(`${otp}:${e}:${secret}`)) {
    return { ok: false, error: 'Incorrect code. Please try again.' };
  }
  return { ok: true };
}

let cachedTransport = null;
function getTransport() {
  if (cachedTransport) return cachedTransport;
  const user = process.env.GMAIL_USER;
  const pass = process.env.GMAIL_APP_PASSWORD;
  if (!user || !pass) throw new Error('GMAIL_USER / GMAIL_APP_PASSWORD not configured');
  cachedTransport = nodemailer.createTransport({
    service: 'gmail',
    auth: { user, pass: pass.replace(/\s+/g, '') }, // app passwords are shown with spaces
  });
  return cachedTransport;
}

export async function sendOtpEmail({ to, otp, name }) {
  const transport = getTransport();
  const from = `Amrita Nexus · IGNITE 2026 <${process.env.GMAIL_USER}>`;
  const hi = name ? `Hi ${name},` : 'Hello,';
  await transport.sendMail({
    from,
    to,
    subject: `${otp} is your Amrita Nexus verification code`,
    text: `${hi}\n\nYour Amrita Nexus verification code is ${otp}. It expires in 10 minutes.\nIf you didn't request this, you can ignore this email.`,
    html: otpEmailHtml({ otp, hi }),
  });
}

function otpEmailHtml({ otp, hi }) {
  const digits = otp.split('').map(
    (d) => `<td style="padding:0 4px;"><div style="width:44px;height:56px;line-height:56px;text-align:center;font-size:26px;font-weight:800;color:#1E1E1E;background:#FAF9F6;border:1px solid #E8D8B5;border-radius:12px;font-family:'Courier New',monospace;">${d}</div></td>`
  ).join('');
  return `
  <div style="margin:0;padding:32px 16px;background:#F6F3EE;font-family:Inter,Segoe UI,Helvetica,Arial,sans-serif;">
    <div style="max-width:480px;margin:0 auto;background:#ffffff;border:1px solid #E8D8B5;border-radius:20px;overflow:hidden;box-shadow:0 20px 40px rgba(30,30,30,0.06);">
      <div style="background:linear-gradient(135deg,#1E1E1E,#3a3320);padding:28px 32px;">
        <div style="color:#D4AF37;font-size:11px;font-weight:800;letter-spacing:3px;text-transform:uppercase;">Amrita Nexus</div>
        <div style="color:#ffffff;font-size:22px;font-weight:800;margin-top:4px;">IGNITE 2026 Verification</div>
      </div>
      <div style="padding:32px;">
        <p style="color:#1E1E1E;font-size:14px;margin:0 0 6px;">${hi}</p>
        <p style="color:#6B7280;font-size:13px;line-height:1.6;margin:0 0 24px;">Enter this one-time code to verify your email and activate your campus entry pass. It expires in <strong>10 minutes</strong>.</p>
        <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 auto 24px;"><tr>${digits}</tr></table>
        <p style="color:#9CA3AF;font-size:11px;line-height:1.6;margin:0;text-align:center;">Didn't request this? You can safely ignore this email — no account will be created.</p>
      </div>
      <div style="background:#FAF9F6;border-top:1px solid #E8D8B5;padding:16px 32px;text-align:center;">
        <span style="color:#B8860B;font-size:10px;font-weight:700;letter-spacing:1px;">© 2026 Amrita Vishwa Vidyapeetham · Coimbatore</span>
      </div>
    </div>
  </div>`;
}

export function applyCors(req, res) {
  const origin = req.headers.origin || '*';
  res.setHeader('Access-Control-Allow-Origin', origin);
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Vary', 'Origin');
}

export async function readJson(req) {
  if (req.body && typeof req.body === 'object') return req.body;
  return await new Promise((resolve) => {
    let data = '';
    req.on('data', (c) => (data += c));
    req.on('end', () => {
      try { resolve(JSON.parse(data || '{}')); } catch { resolve({}); }
    });
    req.on('error', () => resolve({}));
  });
}
