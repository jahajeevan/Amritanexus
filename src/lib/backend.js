// Client-side backend bridge.
// Public catalog (events / announcements / departments) is read straight from
// Supabase with the publishable key. Everything privileged — creating a
// registration, reading PII, admin writes — goes through the /api serverless
// functions (which hold the service-role key). Every call fails soft (returns
// null) so DataContext can fall back to its local state and never break.
import { supabase, isSupabaseReady } from './supabaseClient.js';

const mapEvent = (e) => ({
  id: e.id, title: e.title, category: e.category, department: e.department,
  venue: e.venue, mapsLink: e.maps_link, date: e.date, time: e.time,
  maxSeats: e.max_seats, seatsFilled: e.seats_filled, status: e.status,
  coordinator: e.coordinator, description: e.description, rules: e.rules,
  prizes: e.prizes, points: e.points,
  volunteers: e.volunteers || [], announcements: e.announcements || [], gallery: e.gallery || [],
});
const mapDept = (d) => ({ dept: d.dept, registrations: d.registrations, checkins: d.checkins, points: d.points });
const mapAnn = (a) => ({ id: a.id, title: a.title, content: a.content, eventId: a.event_id, date: a.date, time: a.time });

// Load the public catalog. Returns null when Supabase isn't configured/reachable
// or the tables are empty (so callers keep their local seed).
export async function loadCatalog() {
  if (!isSupabaseReady) return null;
  try {
    const [ev, an, dp] = await Promise.all([
      supabase.from('events').select('*'),
      supabase.from('announcements').select('*').order('created_at', { ascending: false }),
      supabase.from('departments').select('*').order('points', { ascending: false }),
    ]);
    if (ev.error || !ev.data || ev.data.length === 0) return null;
    return {
      events: ev.data.map(mapEvent).sort((a, b) => new Date(a.date) - new Date(b.date)),
      announcements: (an.data || []).map(mapAnn),
      leaderboard: (dp.data || []).map(mapDept),
    };
  } catch {
    return null;
  }
}

async function post(path, body) {
  try {
    const r = await fetch(path, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    const ct = r.headers.get('content-type') || '';
    if (!ct.includes('application/json')) return null; // e.g. vite dev returned index.html
    return await r.json();
  } catch {
    return null;
  }
}

export const fetchRegistrations = (opts) => post('/api/registrations', opts);   // { email } | { token }
export const apiRegister = (studentInfo, eventId) => post('/api/register', { studentInfo, eventId });
export const apiAdmin = (action, payload, token) => post('/api/admin', { action, payload, token });

// Student accounts (server-side, service role). Return null when the /api
// runtime isn't reachable (e.g. `vite dev`) so callers fall back to local.
export const apiStudentSignup = (fields) => post('/api/students', { action: 'signup', ...fields });
export const apiStudentLogin = (email, password) => post('/api/students', { action: 'login', email, password });
export const apiStudentExists = (email) => post('/api/students', { action: 'exists', email });

export const backendReady = isSupabaseReady;
