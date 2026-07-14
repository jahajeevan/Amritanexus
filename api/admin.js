// POST /api/admin  { action, token, payload }  ->  { success, ... }
// Admin-gated write dispatcher. Every action requires a valid admin token
// (issued by /api/admin-login). Runs with the service role.
import { supabaseAdmin, mapEvent, mapRegistration, mapAnnouncement, verifyAdminToken, bumpDepartment } from './_supabase.js';
import { applyCors, readJson } from './_otp.js';

const eventRow = (p = {}) => ({
  title: p.title,
  category: p.category,
  department: p.department,
  venue: p.venue,
  maps_link: p.mapsLink || null,
  date: p.date || null,
  time: p.time || null,
  max_seats: parseInt(p.maxSeats) || 100,
  status: p.status || 'Open',
  coordinator: p.coordinator || null,
  description: p.description || '',
  rules: p.rules || '',
  prizes: p.prizes || '',
  points: parseInt(p.points) || 50,
});

export default async function handler(req, res) {
  applyCors(req, res);
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return res.status(405).json({ success: false, message: 'Method not allowed' });

  const { action, token, payload = {} } = await readJson(req);
  const v = verifyAdminToken(token);
  if (!v.ok) return res.status(401).json({ success: false, message: v.error });

  try {
    switch (action) {
      case 'listRegistrations': {
        const { data } = await supabaseAdmin.from('registrations').select('*').order('created_at', { ascending: false });
        return res.json({ success: true, registrations: (data || []).map(mapRegistration) });
      }
      case 'createEvent': {
        const row = { id: `evt-${Date.now()}`, seats_filled: 0, volunteers: [], announcements: [], gallery: [], ...eventRow(payload) };
        const { data, error } = await supabaseAdmin.from('events').insert(row).select().single();
        if (error) throw error;
        return res.json({ success: true, event: mapEvent(data) });
      }
      case 'updateEvent': {
        if (!payload.id) return res.status(400).json({ success: false, message: 'Missing event id.' });
        const { data, error } = await supabaseAdmin.from('events').update(eventRow(payload)).eq('id', payload.id).select().single();
        if (error) throw error;
        return res.json({ success: true, event: mapEvent(data) });
      }
      case 'deleteEvent': {
        const { error } = await supabaseAdmin.from('events').delete().eq('id', payload.id);
        if (error) throw error;
        return res.json({ success: true });
      }
      case 'addAnnouncement': {
        const row = {
          id: `gann-${Date.now()}`,
          title: payload.title,
          content: payload.content,
          event_id: payload.eventId || null,
          date: payload.date || new Date().toLocaleDateString('en-IN'),
          time: payload.time || new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
        };
        const { data, error } = await supabaseAdmin.from('announcements').insert(row).select().single();
        if (error) throw error;
        return res.json({ success: true, announcement: mapAnnouncement(data) });
      }
      case 'deleteAnnouncement': {
        const { error } = await supabaseAdmin.from('announcements').delete().eq('id', payload.id);
        if (error) throw error;
        return res.json({ success: true });
      }
      case 'markAttendance': {
        const key = String(payload.id || payload.ticketId || '');
        const { data: reg } = await supabaseAdmin.from('registrations').select('*')
          .or(`id.eq.${key},ticket_id.eq.${key.toUpperCase()}`).maybeSingle();
        if (!reg) return res.status(404).json({ success: false, message: 'Pass not found.' });
        if (reg.attended) return res.json({ success: true, already: true, registration: mapRegistration(reg) });
        const { data: updated, error } = await supabaseAdmin.from('registrations').update({ attended: true }).eq('id', reg.id).select().single();
        if (error) throw error;
        // Award the EVENT'S custom credits (set by the admin when creating the
        // event) to the student's department — not a flat amount.
        const { data: ev } = await supabaseAdmin.from('events').select('points').eq('id', reg.event_id).maybeSingle();
        const credits = Number.isFinite(Number(ev?.points)) ? Number(ev.points) : 50;
        await bumpDepartment(reg.department, { checkins: 1, points: credits });
        return res.json({ success: true, registration: mapRegistration(updated), credits });
      }
      case 'updateRegistration': {
        // Admin override of a student's class details (year / section) on a
        // registration — and mirror it onto the student record for next time.
        if (!payload.id) return res.status(400).json({ success: false, message: 'Missing registration id.' });
        const patch = {};
        if (payload.year !== undefined) patch.year = payload.year || null;
        if (payload.section !== undefined) patch.section = payload.section || null;
        if (!Object.keys(patch).length) return res.status(400).json({ success: false, message: 'Nothing to update.' });
        const { data: updated, error } = await supabaseAdmin.from('registrations').update(patch).eq('id', payload.id).select().single();
        if (error) throw error;
        if (updated?.email) {
          await supabaseAdmin.from('students').update(patch).eq('email', String(updated.email).toLowerCase());
        }
        return res.json({ success: true, registration: mapRegistration(updated) });
      }
      default:
        return res.status(400).json({ success: false, message: `Unknown action: ${action}` });
    }
  } catch (e) {
    console.error('[admin]', action, e);
    return res.status(500).json({ success: false, message: 'Operation failed. Please try again.' });
  }
}
