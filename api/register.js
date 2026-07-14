// POST /api/register  { studentInfo, eventId }  ->  { success, registration } | { success:false, message }
// Student claims an event pass. Runs with the service role so it can write the
// registration, decrement seats and bump department credits atomically-ish.
import { supabaseAdmin, mapRegistration, bumpDepartment } from './_supabase.js';
import { applyCors, readJson } from './_otp.js';

export default async function handler(req, res) {
  applyCors(req, res);
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return res.status(405).json({ success: false, message: 'Method not allowed' });

  try {
    const { studentInfo = {}, eventId } = await readJson(req);
    if (!eventId || !studentInfo.email) return res.status(400).json({ success: false, message: 'Missing registration details.' });

    const email = String(studentInfo.email).toLowerCase().trim();
    const registerNum = String(studentInfo.registerNum || studentInfo.rollNo || '').toUpperCase().trim();

    const { data: ev } = await supabaseAdmin.from('events').select('*').eq('id', eventId).maybeSingle();
    if (!ev) return res.status(404).json({ success: false, message: 'Event not found.' });
    if (ev.status === 'Closed' || (ev.seats_filled || 0) >= ev.max_seats) {
      return res.status(409).json({ success: false, message: 'Registration has closed — no seats left.' });
    }

    const { data: dup } = await supabaseAdmin
      .from('registrations').select('id').eq('event_id', eventId).eq('email', email).limit(1);
    if (dup && dup.length) return res.status(409).json({ success: false, message: 'You have already claimed a pass for this event.' });

    const now = new Date();
    const row = {
      id: `reg-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      ticket_id: `TKT-${String(Date.now()).slice(-6)}-${Math.floor(100 + Math.random() * 900)}`,
      name: studentInfo.studentName || studentInfo.name || 'Student',
      register_num: registerNum,
      department: studentInfo.department || 'Computer Science',
      year: studentInfo.year || 'III',
      email,
      phone: studentInfo.phone || '',
      event_id: eventId,
      event_title: ev.title,
      event_category: ev.category,
      event_date: ev.date,
      event_time: ev.time,
      venue: ev.venue,
      registration_date: now.toISOString().slice(0, 10),
      registration_time: now.toTimeString().slice(0, 5),
      status: 'Confirmed',
      attended: false,
    };
    const { data: inserted, error: insErr } = await supabaseAdmin.from('registrations').insert(row).select().single();
    if (insErr) throw insErr;

    const filled = (ev.seats_filled || 0) + 1;
    let status = ev.status;
    if (filled >= ev.max_seats) status = 'Closed';
    else if (filled >= ev.max_seats * 0.9) status = 'Almost Full';
    await supabaseAdmin.from('events').update({ seats_filled: filled, status }).eq('id', eventId);

    await bumpDepartment(row.department, { registrations: 1, points: 10 });

    return res.status(200).json({ success: true, registration: mapRegistration(inserted) });
  } catch (e) {
    console.error('[register]', e);
    return res.status(500).json({ success: false, message: 'Could not complete registration. Please try again.' });
  }
}
