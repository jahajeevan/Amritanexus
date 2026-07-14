// POST /api/registrations  { email } | { token }  ->  { ok, registrations }
// Reads registrations (which hold PII, so no anon access). A student passes
// their email to fetch their own passes; an admin passes a valid token to fetch
// all of them (used by the operations console).
import { supabaseAdmin, mapRegistration, verifyAdminToken } from './_supabase.js';
import { applyCors, readJson } from './_otp.js';

export default async function handler(req, res) {
  applyCors(req, res);
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return res.status(405).json({ ok: false, registrations: [] });

  try {
    const { email, token } = await readJson(req);
    let q = supabaseAdmin.from('registrations').select('*').order('created_at', { ascending: false });

    if (token && verifyAdminToken(token).ok) {
      // admin: all registrations
    } else if (email) {
      q = q.eq('email', String(email).toLowerCase().trim());
    } else {
      return res.status(400).json({ ok: false, registrations: [] });
    }

    const { data, error } = await q;
    if (error) throw error;
    return res.status(200).json({ ok: true, registrations: (data || []).map(mapRegistration) });
  } catch (e) {
    console.error('[registrations]', e);
    return res.status(500).json({ ok: false, registrations: [] });
  }
}
