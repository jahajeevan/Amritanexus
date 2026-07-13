// POST /api/verify-otp  { email, otp, token }  ->  { ok } | { ok:false, error }
import { verifyToken, applyCors, readJson } from './_otp.js';

export default async function handler(req, res) {
  applyCors(req, res);
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return res.status(405).json({ ok: false, error: 'Method not allowed' });

  try {
    const { email, otp, token, purpose } = await readJson(req);
    const result = verifyToken({ token, email, otp: String(otp || '').trim(), purpose: purpose || 'signup' });
    return res.status(result.ok ? 200 : 400).json(result);
  } catch (err) {
    console.error('[verify-otp]', err);
    return res.status(500).json({ ok: false, error: 'Verification failed. Please try again.' });
  }
}
