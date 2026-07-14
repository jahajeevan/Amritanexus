import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { adminLogin } from '../lib/api.js';
import { createAccount, authenticate, accountExists } from '../lib/accounts.js';
import { loadCatalog, fetchRegistrations, apiRegister, apiAdmin } from '../lib/backend.js';
import { supabase, isSupabaseReady } from '../lib/supabaseClient.js';

const DataContext = createContext();

const initialEvents = [
  { id: 'evt-1', title: 'CodeStorm Hackathon', category: 'Hackathon', department: 'CSE', venue: 'Tech Arena Gate 1', mapsLink: 'https://maps.google.com/?q=Amrita+Coimbatore+Tech+Arena', date: '2026-05-15', time: '09:00', maxSeats: 100, seatsFilled: 94, status: 'Open', coordinator: 'Dr. Ramesh Kumar (CSE)', volunteers: ['Siddharth V', 'Priya K'], description: 'A 24-hour intense hackathon focusing on solving campus and municipal sustainability issues using web technologies and automated models. Bring your dev setup and team templates.', rules: '1. Teams of 2-4 members. 2. Strictly original code. 3. APIs must be disclosed in pitch slides. 4. Bring college ID.', announcements: [{ id: 'ann-e1-1', title: 'Developer Kits Released', content: 'You can now download the developer API starter kits from the dashboard resources tab.', date: '2026-05-10', time: '14:00' }], gallery: [{ id: 'gal-e1-1', url: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=600&q=80', caption: 'Teams coding in tech bay' }] },
  { id: 'evt-2', title: 'Innovation Summit', category: 'Startup', department: 'MBA', venue: 'Main Auditorium', mapsLink: 'https://maps.google.com/?q=Amrita+Coimbatore+Main+Auditorium', date: '2026-05-22', time: '10:30', maxSeats: 50, seatsFilled: 48, status: 'Almost Full', coordinator: 'Prof. Anitha Roy (MBA)', volunteers: ['Arjun Nair'], description: 'Connect with startup founders, venture capitalists, and university business alumni. Perfect for students seeking seed funding or startup internships.', rules: '1. Casual professional dress code. 2. Keep pitch decks under 5 slides. 3. Q&A round is mandatory.', announcements: [], gallery: [] },
  { id: 'evt-3', title: 'IGNITE Cultural Night', category: 'Cultural', department: 'ECE', venue: 'Open Stage Ground', mapsLink: 'https://maps.google.com/?q=Amrita+Coimbatore+Sports+Complex', date: '2026-05-18', time: '18:00', maxSeats: 250, seatsFilled: 250, status: 'Closed', coordinator: 'Dr. Saraswathi M (ECE)', volunteers: ['Gokul S', 'Nehal Jain', 'Kavitha P'], description: 'The flagship cultural celebration of IGNITE 2026. Featuring live music performances, dance face-offs, classical recitals, and campus visual arts galleries.', rules: '1. Gates close at 18:30. 2. QR ticket check-in is mandatory. 3. Outside food not permitted.', announcements: [{ id: 'ann-e3-1', title: 'Pass QR Required at Entrance', content: 'Make sure your student pass QR is saved offline. Cellular connectivity might be slow around the ground gate.', date: '2026-05-16', time: '10:00' }], gallery: [{ id: 'gal-e3-1', url: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=600&q=80', caption: 'Opening performance showcase' }] },
];

// Every branch starts at zero — department credits accrue only from real,
// verified attendance once the platform goes live on campus.
const initialLeaderboard = [
  { dept: 'CSE', registrations: 0, checkins: 0, points: 0 },
  { dept: 'AI', registrations: 0, checkins: 0, points: 0 },
  { dept: 'Cyber Security', registrations: 0, checkins: 0, points: 0 },
  { dept: 'ECE', registrations: 0, checkins: 0, points: 0 },
  { dept: 'EEE', registrations: 0, checkins: 0, points: 0 },
  { dept: 'Mechanical', registrations: 0, checkins: 0, points: 0 },
  { dept: 'Civil', registrations: 0, checkins: 0, points: 0 },
  { dept: 'MBA', registrations: 0, checkins: 0, points: 0 },
];

const initialAnnouncements = [
  { id: 'gann-1', title: 'IGNITE 2026 Registrations Open', content: 'Official portal launch! Students can browse events and claim passes immediately. Contact coordinators for doubts.', date: '2026-06-13', time: '10:00' },
  { id: 'gann-2', title: 'Technical Certificate Template Verified', content: 'Faculty committee has approved certificate designs. Digital credentials will reflect on dashboards post attendance check-in.', date: '2026-06-13', time: '11:15' },
];

const read = (k, fb) => { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : fb; } catch { return fb; } };

// Bump the local leaderboard for a department name (used only in the offline
// fallback). `pts` is the explicit credit delta — on check-in this is the
// event's custom credit value, mirroring the server's bumpDepartment.
const bumpLocal = (list, name, { reg = 0, chk = 0, pts = 0 }) => {
  const dn = String(name || 'Computer Science').toLowerCase();
  const match = (code) => code === dn ||
    (dn.includes('computer') && code === 'cse') || (dn.includes('electronic') && code === 'ece') ||
    (dn.includes('mechanical') && code === 'mechanical') || (dn.includes('civil') && code === 'civil') ||
    (dn.includes('management') && code === 'mba') || (dn.includes('ai') && code === 'ai') ||
    (dn.includes('cyber') && code === 'cyber security') || (dn.includes('electrical') && code === 'eee');
  return list.map((l) => {
    if (!match((l.dept || '').toLowerCase())) return l;
    return {
      ...l,
      registrations: Math.max(0, l.registrations + reg),
      checkins: Math.max(0, l.checkins + chk),
      points: Math.max(0, (l.points || 0) + pts),
    };
  });
};

export function DataProvider({ children }) {
  const [events, setEvents] = useState(() => read('ignite_events', initialEvents));
  const [registrations, setRegistrations] = useState(() => read('ignite_registrations', []));
  const [leaderboard, setLeaderboard] = useState(() => read('ignite_leaderboard', initialLeaderboard));
  const [announcements, setAnnouncements] = useState(() => read('ignite_announcements', initialAnnouncements));
  const [user, setUser] = useState(() => read('ignite_user', null));

  // Persist to localStorage as an offline cache.
  useEffect(() => { localStorage.setItem('ignite_events', JSON.stringify(events)); }, [events]);
  useEffect(() => { localStorage.setItem('ignite_registrations', JSON.stringify(registrations)); }, [registrations]);
  useEffect(() => { localStorage.setItem('ignite_leaderboard', JSON.stringify(leaderboard)); }, [leaderboard]);
  useEffect(() => { localStorage.setItem('ignite_announcements', JSON.stringify(announcements)); }, [announcements]);
  useEffect(() => {
    if (user) localStorage.setItem('ignite_user', JSON.stringify(user));
    else localStorage.removeItem('ignite_user');
  }, [user]);

  // ── Supabase sync ──────────────────────────────────────────────────
  const refreshCatalog = async () => {
    const c = await loadCatalog();
    if (c) { setEvents(c.events); setAnnouncements(c.announcements); setLeaderboard(c.leaderboard); }
    return c;
  };
  const refreshRegistrations = async (u) => {
    const who = u === undefined ? user : u;
    if (!who) { setRegistrations([]); return; }
    const opts = who.role === 'admin' ? { token: who.adminToken } : { email: who.email };
    const r = await fetchRegistrations(opts);
    if (r && r.ok && Array.isArray(r.registrations)) setRegistrations(r.registrations);
  };

  const booted = useRef(false);
  useEffect(() => { if (!booted.current) { booted.current = true; refreshCatalog(); } }, []);
  // Reload the right registrations whenever the signed-in identity changes.
  useEffect(() => { refreshRegistrations(user); /* eslint-disable-next-line */ }, [user?.email, user?.role, user?.adminToken]);

  // ── Live cross-device sync ─────────────────────────────────────────
  // `events` + `departments` + `announcements` are Realtime-published. A
  // registration or attendance scan on ANY device updates those public tables,
  // which pushes to every signed-in client here — each one then re-pulls the
  // (server-only, PII) registrations for its own user. So a student registering
  // on one phone shows up on every admin screen within a second, with no manual
  // refresh and without ever exposing registration data to the browser.
  // Window focus + a slow interval are backstops if the socket drops.
  useEffect(() => {
    let debounce;
    const sync = () => { clearTimeout(debounce); debounce = setTimeout(() => { refreshCatalog(); refreshRegistrations(user); }, 300); };

    let channel;
    if (isSupabaseReady && supabase) {
      channel = supabase
        .channel('nexus-live')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'events' }, sync)
        .on('postgres_changes', { event: '*', schema: 'public', table: 'departments' }, sync)
        .on('postgres_changes', { event: '*', schema: 'public', table: 'announcements' }, sync)
        .subscribe();
    }
    const onVisible = () => { if (!document.hidden) sync(); };
    window.addEventListener('focus', sync);
    document.addEventListener('visibilitychange', onVisible);
    const poll = user ? setInterval(sync, 20000) : null; // backstop while signed in

    return () => {
      clearTimeout(debounce);
      if (channel && supabase) supabase.removeChannel(channel);
      window.removeEventListener('focus', sync);
      document.removeEventListener('visibilitychange', onVisible);
      if (poll) clearInterval(poll);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.email, user?.role, user?.adminToken]);

  // ── Auth ───────────────────────────────────────────────────────────
  const signInStudent = (email, registerNum) => {
    const cleanEmail = email.toLowerCase().trim();
    const cleanReg = registerNum.toUpperCase().trim();
    const name = cleanEmail.split('@')[0].split('.').map((n) => n.charAt(0).toUpperCase() + n.slice(1)).join(' ');
    let dept = 'Computer Science';
    if (cleanReg.includes('AI')) dept = 'AI';
    else if (cleanReg.includes('CYS') || cleanReg.includes('SEC')) dept = 'Cyber Security';
    else if (cleanReg.includes('ECE')) dept = 'Electronics';
    else if (cleanReg.includes('EEE')) dept = 'Electrical';
    else if (cleanReg.includes('ME')) dept = 'Mechanical';
    else if (cleanReg.includes('CE')) dept = 'Civil';
    else if (cleanReg.includes('BA')) dept = 'Management';
    const profile = { id: `usr-${cleanReg}`, name: name || 'Student Guest', registerNum: cleanReg, rollNo: cleanReg, role: 'student', department: dept, year: 'III', section: null, email: cleanEmail, phone: '9446001234' };
    setUser(profile);
    return { success: true, profile };
  };

  const signInAdmin = async (email, password) => {
    const res = await adminLogin({ email, password });
    if (res.ok) {
      const adminProfile = { role: 'admin', email: res.email || email, name: res.name || 'Faculty Coordinator', adminToken: res.token };
      setUser(adminProfile);
      return { success: true, profile: adminProfile };
    }
    return { success: false, message: res.error || 'Invalid administrative credentials.' };
  };

  const STUDENT_DOMAIN = '@cb.students.amrita.edu';
  const registerStudent = async (fields) => {
    if (!String(fields.email).trim().toLowerCase().endsWith(STUDENT_DOMAIN)) {
      return { success: false, message: 'Only official @cb.students.amrita.edu student emails are accepted.' };
    }
    if (await accountExists(fields.email)) {
      return { success: false, message: 'An account with this email already exists. Please sign in.' };
    }
    const res = await createAccount(fields);
    if (res.success) setUser(res.profile);
    return res;
  };

  const loginStudent = async (email, password) => {
    const res = await authenticate(email, password);
    if (res.success) setUser(res.profile);
    return res;
  };

  const checkAccountExists = (email) => accountExists(email);
  const signOut = () => { setUser(null); setRegistrations([]); };
  const logout = signOut;

  // ── Registrations ──────────────────────────────────────────────────
  const registerLocal = (studentInfo, eventId) => {
    const event = events.find((e) => e.id === eventId);
    if (!event) return { success: false, message: 'Event not found.' };
    if (event.seatsFilled >= event.maxSeats || event.status === 'Closed') return { success: false, message: 'Registration has closed (maximum seats filled).' };
    const sName = studentInfo.studentName || studentInfo.name || 'Student Guest';
    const sReg = (studentInfo.registerNum || studentInfo.rollNo || '').toUpperCase();
    if (registrations.some((r) => r.eventId === eventId && (r.registerNum || '').toUpperCase() === sReg)) {
      return { success: false, message: 'You have already claimed a ticket for this event.' };
    }
    const now = new Date();
    const newReg = {
      id: `reg-${Date.now()}`, ticketId: `TKT-${Date.now().toString().slice(-6)}-${Math.floor(100 + Math.random() * 900)}`,
      name: sName, studentName: sName, registerNum: sReg, rollNo: sReg, department: studentInfo.department || 'Computer Science', year: studentInfo.year || 'III', section: studentInfo.section || null,
      email: studentInfo.email, phone: studentInfo.phone || '', eventId: event.id, eventTitle: event.title, eventCategory: event.category, eventDate: event.date, eventTime: event.time,
      venue: event.venue, registrationDate: now.toISOString().split('T')[0], registrationTime: now.toTimeString().split(' ')[0].slice(0, 5), status: 'Confirmed', attendance: 'absent', attended: false,
    };
    setRegistrations((prev) => [newReg, ...prev]);
    setEvents((prev) => prev.map((e) => {
      if (e.id !== eventId) return e;
      const filled = e.seatsFilled + 1;
      const status = filled >= e.maxSeats ? 'Closed' : filled >= e.maxSeats * 0.9 ? 'Almost Full' : e.status;
      return { ...e, seatsFilled: filled, status };
    }));
    setLeaderboard((prev) => bumpLocal(prev, studentInfo.department, { reg: 1 })); // credits awarded on check-in, not here
    return { success: true, registration: newReg };
  };

  const registerForEvent = async (arg1, arg2) => {
    const [studentInfo, eventId] = typeof arg1 === 'string' ? [arg2, arg1] : [arg1, arg2];
    const server = await apiRegister(studentInfo, eventId);
    if (server) {
      if (server.success) {
        await refreshCatalog();
        setRegistrations((prev) => [server.registration, ...prev.filter((r) => r.id !== server.registration.id)]);
        return { success: true, registration: server.registration };
      }
      return { success: false, message: server.message };
    }
    return registerLocal(studentInfo, eventId); // offline / dev fallback
  };

  const cancelRegistration = (regId) => {
    const reg = registrations.find((r) => r.id === regId);
    if (!reg) return { success: false, message: 'Ticket registration not found.' };
    setRegistrations((prev) => prev.map((r) => (r.id === regId ? { ...r, status: 'Cancelled' } : r)));
    setEvents((prev) => prev.map((e) => (e.id === reg.eventId ? { ...e, seatsFilled: Math.max(0, e.seatsFilled - 1), status: 'Open' } : e)));
    // If the student had already been marked present, claw back the event's credits too.
    const wasPresent = reg.attended || reg.attendance === 'present';
    const ev = events.find((e) => e.id === reg.eventId);
    const pts = wasPresent ? -(Number(ev?.points) || 50) : 0;
    setLeaderboard((prev) => bumpLocal(prev, reg.department, { reg: -1, chk: wasPresent ? -1 : 0, pts }));
    return { success: true };
  };

  // ── Attendance ─────────────────────────────────────────────────────
  const verifyAttendanceLocal = (regId) => {
    const reg = registrations.find((r) => r.id === regId || r.ticketId === regId);
    if (!reg) return { success: false, message: 'Ticket code does not match database.' };
    if (reg.status === 'Cancelled') return { success: false, message: 'This ticket registration is Cancelled.' };
    if (reg.attended || reg.attendance === 'present') return { success: true, already: true, message: 'Student is already checked in.', registration: reg };
    const ev = events.find((e) => e.id === reg.eventId);
    const credits = Number(ev?.points) || 50;
    setRegistrations((prev) => prev.map((r) => (r.id === reg.id ? { ...r, attendance: 'present', attended: true } : r)));
    setLeaderboard((prev) => bumpLocal(prev, reg.department, { chk: 1, pts: credits }));
    return { success: true, message: `Attendance recorded · +${credits} credits to ${reg.department}.`, registration: { ...reg, attendance: 'present', attended: true } };
  };

  const adminAction = async (action, payload) => {
    const token = user?.adminToken;
    if (!token) return null;
    return apiAdmin(action, payload, token); // {success,...} | null
  };

  const verifyAttendance = async (regId) => {
    const r = await adminAction('markAttendance', { id: regId, ticketId: regId });
    if (r) {
      if (r.success) {
        await refreshCatalog(); await refreshRegistrations();
        return { success: true, already: Boolean(r.already), message: r.already ? 'Student is already checked in.' : `Attendance recorded${r.credits != null ? ` · +${r.credits} credits` : ''}.`, registration: r.registration };
      }
      return { success: false, message: r.message };
    }
    return verifyAttendanceLocal(regId);
  };
  const markAttendance = verifyAttendance;

  // Admin override of a student's class details (year / section) on a registration.
  const updateRegistration = async (regId, patch) => {
    const r = await adminAction('updateRegistration', { id: regId, ...patch });
    if (r) {
      if (r.success) { await refreshRegistrations(); return { success: true, registration: r.registration }; }
      return { success: false, message: r.message };
    }
    // offline fallback
    setRegistrations((prev) => prev.map((x) => (x.id === regId ? { ...x, ...patch } : x)));
    return { success: true };
  };

  // ── Admin: events ──────────────────────────────────────────────────
  const addEventLocal = (info) => {
    const ev = { id: `evt-${Date.now()}`, title: info.title, category: info.category, department: info.department, venue: info.venue, mapsLink: info.mapsLink, date: info.date, time: info.time, maxSeats: parseInt(info.maxSeats) || 100, seatsFilled: 0, status: info.status || 'Open', coordinator: info.coordinator || 'Unassigned Faculty', volunteers: [], description: info.description || '', rules: info.rules || '', announcements: [], gallery: [], points: info.points || 50 };
    setEvents((prev) => [ev, ...prev]);
    return { success: true, event: ev };
  };
  const addEvent = async (info) => {
    const r = await adminAction('createEvent', info);
    if (r) { if (r.success) await refreshCatalog(); return r; }
    return addEventLocal(info);
  };

  const updateEvent = async (arg1, arg2) => {
    const [eventId, info] = typeof arg1 === 'string' ? [arg1, arg2] : [arg1.id, arg1];
    const r = await adminAction('updateEvent', { ...info, id: eventId });
    if (r) { if (r.success) await refreshCatalog(); return r; }
    setEvents((prev) => prev.map((e) => (e.id === eventId ? { ...e, ...info, maxSeats: parseInt(info.maxSeats) || e.maxSeats } : e)));
    return { success: true };
  };

  const deleteEvent = async (eventId) => {
    const r = await adminAction('deleteEvent', { id: eventId });
    if (r) { if (r.success) await refreshCatalog(); return r; }
    setEvents((prev) => prev.filter((e) => e.id !== eventId));
    setRegistrations((prev) => prev.map((r2) => (r2.eventId === eventId ? { ...r2, status: 'Cancelled' } : r2)));
    return { success: true };
  };

  const duplicateEvent = (eventId) => {
    const event = events.find((e) => e.id === eventId);
    if (!event) return { success: false };
    setEvents((prev) => [{ ...event, id: `evt-${Date.now()}`, title: `${event.title} (Copy)`, seatsFilled: 0, status: 'Open', volunteers: [], announcements: [], gallery: [] }, ...prev]);
    return { success: true };
  };

  const addGalleryPhoto = (eventId, url, caption) => {
    setEvents((prev) => prev.map((e) => (e.id === eventId ? { ...e, gallery: [{ id: `gal-${Date.now()}`, url, caption }, ...e.gallery] } : e)));
  };
  const recruitStudentVolunteer = (eventId, studentName) => {
    let ok = true;
    setEvents((prev) => prev.map((e) => {
      if (e.id !== eventId) return e;
      if (e.volunteers.includes(studentName)) { ok = false; return e; }
      return { ...e, volunteers: [...e.volunteers, studentName] };
    }));
    return ok;
  };

  // ── Admin: announcements ───────────────────────────────────────────
  const addAnnouncement = async (info) => {
    const r = await adminAction('addAnnouncement', info);
    if (r) { if (r.success) await refreshCatalog(); return r; }
    const ann = { id: `gann-${Date.now()}`, title: info.title, content: info.content, date: info.date || new Date().toLocaleDateString('en-IN'), time: info.time || new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) };
    setAnnouncements((prev) => [ann, ...prev]);
    return { success: true, announcement: ann };
  };
  const createAnnouncement = (title, content, eventId = null) => addAnnouncement({ title, content, eventId });

  const deleteAnnouncement = async (annId) => {
    const r = await adminAction('deleteAnnouncement', { id: annId });
    if (r) { if (r.success) await refreshCatalog(); return r; }
    setAnnouncements((prev) => prev.filter((a) => a.id !== annId));
    return { success: true };
  };

  return (
    <DataContext.Provider value={{
      events, registrations, leaderboard, announcements, user,
      signInStudent, signInAdmin, registerStudent, loginStudent, checkAccountExists, signOut, logout,
      registerForEvent, cancelRegistration, verifyAttendance, markAttendance, updateRegistration,
      addEvent, updateEvent, deleteEvent, duplicateEvent, addGalleryPhoto, recruitStudentVolunteer,
      createAnnouncement, addAnnouncement, deleteAnnouncement,
    }}>
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const context = useContext(DataContext);
  if (!context) throw new Error('useData must be used inside a DataProvider');
  return context;
}
