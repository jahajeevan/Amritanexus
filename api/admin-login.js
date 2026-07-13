// POST /api/admin-login  { email, password }  ->  { ok } | { ok:false }
// Server-side admin verification so the plaintext password lives only in
// Vercel env vars, never in the browser bundle. The frontend falls back to a
// hashed client check if this endpoint isn't deployed (e.g. static preview).
import crypto from 'node:crypto';
import { applyCors, readJson } from './_otp.js';

const safeEqual = (a, b) => {
  const ba = Buffer.from(String(a));
  const bb = Buffer.from(String(b));
  if (ba.length !== bb.length) return false;
  return crypto.timingSafeEqual(ba, bb);
};

export default async function handler(req, res) {
  applyCors(req, res);
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return res.status(405).json({ ok: false, error: 'Method not allowed' });

  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD;
  if (!adminEmail || !adminPassword) {
    return res.status(501).json({ ok: false, error: 'Admin auth not configured on server.' });
  }

  const { email, password } = await readJson(req);
  const emailOk = safeEqual(String(email || '').trim().toLowerCase(), adminEmail.trim().toLowerCase());
  const passOk = safeEqual(String(password || ''), adminPassword);

  if (emailOk && passOk) {
    return res.status(200).json({ ok: true, name: 'Faculty Coordinator', email: adminEmail });
  }
  return res.status(401).json({ ok: false, error: 'Invalid administrative credentials.' });
}
