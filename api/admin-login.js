// POST /api/admin-login  { email, password }  ->  { ok } | { ok:false }
// Server-side admin verification so the plaintext password lives only in
// Vercel env vars, never in the browser bundle. The frontend falls back to a
// hashed client check if this endpoint isn't deployed (e.g. static preview).
import crypto from 'node:crypto';
import { applyCors, readJson } from './_otp.js';
import { signAdminToken, signRoleToken, supabaseAdmin, hashPw } from './_supabase.js';

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

  const { email, password } = await readJson(req);
  const em = String(email || '').trim().toLowerCase();

  // 1) The single faculty admin (credentials in server env).
  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD;
  if (adminEmail && adminPassword) {
    const emailOk = safeEqual(em, adminEmail.trim().toLowerCase());
    const passOk = safeEqual(String(password || ''), adminPassword);
    if (emailOk && passOk) {
      // Issue the signed session token replayed on every privileged call.
      return res.status(200).json({ ok: true, name: 'Faculty Coordinator', email: adminEmail, role: 'admin', token: signAdminToken() });
    }
  }

  // 2) A venue coordinator the admin created (limited role).
  if (em && password) {
    try {
      const { data: coord } = await supabaseAdmin.from('coordinators').select('*').eq('email', em).maybeSingle();
      if (coord && hashPw(password, coord.salt) === coord.password_hash) {
        return res.status(200).json({ ok: true, name: coord.name, email: coord.email, role: 'coordinator', token: signRoleToken('coordinator') });
      }
    } catch (e) {
      console.error('[admin-login] coordinator check', e);
    }
  }

  if (!adminEmail || !adminPassword) {
    return res.status(501).json({ ok: false, error: 'Admin auth not configured on server.' });
  }
  return res.status(401).json({ ok: false, error: 'Invalid administrative credentials.' });
}
