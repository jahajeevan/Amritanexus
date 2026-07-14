// Shared server-only Supabase helpers (not routed — filename starts with "_").
//
// Uses the SERVICE ROLE key, which bypasses Row Level Security. This module must
// only ever be imported by serverless functions under /api — never by browser
// code. The service key lives in SUPABASE_SERVICE_ROLE_KEY (server env only,
// NOT prefixed with VITE_) so it is never shipped in the client bundle.
import crypto from 'node:crypto';
import { createClient } from '@supabase/supabase-js';

export const supabaseAdmin = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false } }
);

// ── Admin session token ──────────────────────────────────────────────
// A short, signed, self-verifying token returned on admin login and replayed
// on every admin write. Stateless (HMAC-SHA256 over a tiny JSON payload signed
// with OTP_SECRET) so it survives serverless cold starts. 12h expiry.
const ADMIN_TOKEN_TTL_MS = 12 * 60 * 60 * 1000;

const b64url = (buf) =>
  Buffer.from(buf).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

const fromB64url = (s) =>
  Buffer.from(String(s).replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString();

const hmac = (str, secret) => crypto.createHmac('sha256', secret).update(str).digest('hex');

export function signAdminToken() {
  const secret = process.env.OTP_SECRET;
  if (!secret) throw new Error('OTP_SECRET is not configured');
  const payload = { r: 'admin', x: Date.now() + ADMIN_TOKEN_TTL_MS };
  const body = b64url(JSON.stringify(payload));
  return `${body}.${hmac(body, secret)}`;
}

export function verifyAdminToken(token) {
  const secret = process.env.OTP_SECRET;
  if (!secret) return { ok: false, error: 'Server not configured.' };
  if (!token) return { ok: false, error: 'Missing admin token.' };

  const [body, sig] = String(token).split('.');
  if (!body || !sig) return { ok: false, error: 'Malformed admin token.' };

  const expected = hmac(body, secret);
  const sigBuf = Buffer.from(sig);
  const expBuf = Buffer.from(expected);
  if (sigBuf.length !== expBuf.length || !crypto.timingSafeEqual(sigBuf, expBuf)) {
    return { ok: false, error: 'Admin token signature is invalid.' };
  }

  let payload;
  try {
    payload = JSON.parse(fromB64url(body));
  } catch {
    return { ok: false, error: 'Malformed admin token.' };
  }
  if (payload.r !== 'admin') return { ok: false, error: 'Not an admin token.' };
  if (Date.now() > payload.x) return { ok: false, error: 'Admin session expired. Please sign in again.' };
  return { ok: true };
}

// ── Department code normalization ────────────────────────────────────
// The `departments` table keys on short codes (CSE, ECE, EEE, MBA, …) while
// student/profile department names arrive in longer forms (Computer Science,
// Electronics, Management, …). Map a free-form name to its leaderboard code,
// or null when there is no matching department row (then we skip the bump).
const DEPT_ALIASES = {
  cse: 'CSE', cs: 'CSE', 'computer science': 'CSE', computer: 'CSE',
  ai: 'AI', 'artificial intelligence': 'AI',
  'cyber security': 'Cyber Security', cybersecurity: 'Cyber Security', cys: 'Cyber Security', security: 'Cyber Security',
  ece: 'ECE', electronics: 'ECE',
  eee: 'EEE', electrical: 'EEE',
  mechanical: 'Mechanical', mech: 'Mechanical',
  civil: 'Civil',
  mba: 'MBA', management: 'MBA', business: 'MBA',
};

export function normalizeDept(name) {
  const n = String(name || '').trim().toLowerCase();
  if (!n) return null;
  if (DEPT_ALIASES[n]) return DEPT_ALIASES[n];
  for (const [k, v] of Object.entries(DEPT_ALIASES)) {
    if (n.includes(k)) return v;
  }
  return null;
}

// Read-modify-write increment of a department row's counters. Best-effort:
// silently no-ops when the department name can't be matched, so a failed bump
// never fails the parent write (registration / attendance).
export async function bumpDepartment(name, { registrations = 0, checkins = 0, points = 0 }) {
  const code = normalizeDept(name);
  if (!code) return;
  const { data: dept } = await supabaseAdmin
    .from('departments')
    .select('*')
    .eq('dept', code)
    .maybeSingle();
  if (!dept) return;
  await supabaseAdmin
    .from('departments')
    .update({
      registrations: (dept.registrations || 0) + registrations,
      checkins: (dept.checkins || 0) + checkins,
      points: (dept.points || 0) + points,
    })
    .eq('dept', code);
}

// ── Row → camelCase mappers (shapes the React views consume) ─────────
export function mapRegistration(r) {
  if (!r) return null;
  const attended = Boolean(r.attended);
  return {
    id: r.id,
    ticketId: r.ticket_id,
    studentName: r.name,
    name: r.name,
    registerNum: r.register_num,
    rollNo: r.register_num,
    department: r.department,
    year: r.year,
    section: r.section,
    email: r.email,
    phone: r.phone,
    eventId: r.event_id,
    eventTitle: r.event_title,
    eventCategory: r.event_category,
    eventDate: r.event_date,
    eventTime: r.event_time,
    venue: r.venue,
    registrationDate: r.registration_date,
    registrationTime: r.registration_time,
    status: r.status,
    attended,
    attendance: attended ? 'present' : 'absent',
  };
}

export function mapEvent(e) {
  if (!e) return null;
  return {
    id: e.id,
    title: e.title,
    category: e.category,
    department: e.department,
    venue: e.venue,
    mapsLink: e.maps_link,
    date: e.date,
    time: e.time,
    maxSeats: e.max_seats,
    seatsFilled: e.seats_filled,
    status: e.status,
    coordinator: e.coordinator,
    description: e.description,
    rules: e.rules,
    prizes: e.prizes,
    points: e.points,
    volunteers: e.volunteers || [],
    announcements: e.announcements || [],
    gallery: e.gallery || [],
  };
}

export function mapAnnouncement(a) {
  if (!a) return null;
  return {
    id: a.id,
    title: a.title,
    content: a.content,
    eventId: a.event_id,
    date: a.date,
    time: a.time,
  };
}
