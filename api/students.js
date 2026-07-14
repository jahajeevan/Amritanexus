// POST /api/students  { action, ... }  ->  { success, profile } | { success:false, message }
// Student accounts, server-side. Runs with the service role so accounts live in
// Supabase (real cross-device sign-in) while password hashes are NEVER exposed
// to the browser. Mirrors the client SHA-256 salted hash in src/lib/crypto.js.
import crypto from 'node:crypto';
import { supabaseAdmin } from './_supabase.js';
import { applyCors, readJson } from './_otp.js';

const STUDENT_DOMAIN = '@cb.students.amrita.edu';
const normEmail = (e) => String(e || '').trim().toLowerCase();
const randomSalt = () => crypto.randomBytes(12).toString('hex');
const hashPassword = (password, salt) =>
  crypto.createHash('sha256').update(`${salt}:${password}`).digest('hex');

function guessDepartment(registerNum = '') {
  const r = String(registerNum).toUpperCase();
  if (r.includes('AIE') || r.includes('AID') || r.includes('AI')) return 'AI';
  if (r.includes('CYS') || r.includes('SEC')) return 'Cyber Security';
  if (r.includes('CSE') || r.includes('CS')) return 'Computer Science';
  if (r.includes('ECE')) return 'Electronics';
  if (r.includes('EEE')) return 'Electrical';
  if (r.includes('MEE') || r.includes('ME')) return 'Mechanical';
  if (r.includes('CVE') || r.includes('CE')) return 'Civil';
  if (r.includes('BA') || r.includes('MBA')) return 'Management';
  return 'Computer Science';
}

const toProfile = (a) => ({
  id: a.id,
  name: a.name,
  email: a.email,
  registerNum: a.register_num,
  rollNo: a.register_num,
  phone: a.phone,
  department: a.department,
  year: a.year || 'III',
  section: a.section || null,
  role: 'student',
});

export default async function handler(req, res) {
  applyCors(req, res);
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return res.status(405).json({ success: false, message: 'Method not allowed' });

  try {
    const body = await readJson(req);
    const action = body.action;
    const email = normEmail(body.email);

    if (action === 'exists') {
      const { data } = await supabaseAdmin.from('students').select('email').eq('email', email).maybeSingle();
      return res.json({ ok: true, exists: Boolean(data) });
    }

    if (action === 'signup') {
      const { name, registerNum, phone, password, department, year, section } = body;
      if (!email.endsWith(STUDENT_DOMAIN)) {
        return res.status(400).json({ success: false, message: 'Only official @cb.students.amrita.edu student emails are accepted.' });
      }
      if (!password || String(password).length < 8) {
        return res.status(400).json({ success: false, message: 'Password must be at least 8 characters.' });
      }
      const { data: existing } = await supabaseAdmin.from('students').select('id').eq('email', email).maybeSingle();
      if (existing) return res.status(409).json({ success: false, message: 'An account with this email already exists. Please sign in.' });

      const salt = randomSalt();
      const row = {
        id: `usr-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        name: String(name || '').trim() || 'Student',
        email,
        register_num: String(registerNum || '').toUpperCase().trim(),
        phone: String(phone || '').trim(),
        department: department || guessDepartment(registerNum), // student-selected takes precedence
        year: year || 'III',
        section: section || null,
        salt,
        password_hash: hashPassword(password, salt),
      };
      const { data: inserted, error } = await supabaseAdmin.from('students').insert(row).select().single();
      if (error) throw error;
      return res.json({ success: true, profile: toProfile(inserted) });
    }

    if (action === 'login') {
      const { password } = body;
      const { data: acc } = await supabaseAdmin.from('students').select('*').eq('email', email).maybeSingle();
      if (!acc) return res.status(404).json({ success: false, message: 'No account found for this email. Please sign up.' });
      const ok = hashPassword(password, acc.salt) === acc.password_hash;
      if (!ok) return res.status(401).json({ success: false, message: 'Incorrect password. Please try again.' });
      return res.json({ success: true, profile: toProfile(acc) });
    }

    return res.status(400).json({ success: false, message: `Unknown action: ${action}` });
  } catch (e) {
    console.error('[students]', e);
    return res.status(500).json({ success: false, message: 'Account service failed. Please try again.' });
  }
}
