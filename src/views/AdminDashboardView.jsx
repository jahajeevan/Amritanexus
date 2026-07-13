import React, { useState, useMemo } from 'react';
import { useData } from '../context/DataContext';
import Input from '../components/Input';
import { StatCard, Panel, Badge, EmptyState, NavItem } from '../components/ui';
import {
  LayoutDashboard, CalendarDays, Users, ScanLine, Megaphone, Plus, Edit3, Trash2, Save, X,
  FileSpreadsheet, CheckCircle2, XCircle, Search, ShieldCheck, LogOut, Loader2, AlertCircle,
  ChevronRight, Trophy, Bell, ArrowRight,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const CATEGORIES = ['Hackathon', 'Workshop', 'Technical', 'Sports', 'Cultural', 'Arts', 'Music', 'Startup', 'Seminar', 'Gaming'];
const DEPARTMENTS = ['Computer Science', 'Electronics', 'Mechanical', 'Civil', 'Chemical', 'Management', 'Arts & Science'];
const EMPTY = { title: '', category: 'Technical', department: 'Computer Science', date: '', time: '', venue: '', description: '', maxSeats: 100, status: 'Open', prizes: '', rules: '', points: 50, mapsLink: '' };

const selectCls = 'h-10 w-full rounded-xl border border-amrita-line bg-white px-3 text-[13px] font-medium text-amrita-ink outline-none transition focus:border-amrita-maroon focus:ring-2 focus:ring-amrita-maroon/10';
const statusTone = { Open: 'success', 'Almost Full': 'warning', Closed: 'danger', Upcoming: 'maroon', Completed: 'neutral' };

/* ── Event create/edit form ── */
function EventForm({ initial, onSave, onCancel }) {
  const [form, setForm] = useState({ ...EMPTY, ...initial });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const submit = async (e) => {
    e.preventDefault();
    if (!form.title || !form.date || !form.venue) return setError('Title, date and venue are required.');
    setLoading(true);
    await new Promise((r) => setTimeout(r, 300));
    onSave(form);
    setLoading(false);
  };

  return (
    <motion.form initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} onSubmit={submit}
      className="overflow-hidden rounded-2xl border border-amrita-line bg-white shadow-xs">
      <div className="border-b border-amrita-lineSoft px-5 py-4">
        <h3 className="text-[13px] font-bold text-amrita-ink">{initial?.id ? 'Edit event' : 'New event'}</h3>
      </div>
      <div className="grid gap-4 p-5 md:grid-cols-2">
        <div className="md:col-span-2"><Input label="Event title" placeholder="e.g. CodeStorm Hackathon" value={form.title} onChange={(e) => set('title', e.target.value)} required /></div>
        <Field label="Category"><select value={form.category} onChange={(e) => set('category', e.target.value)} className={selectCls}>{CATEGORIES.map((c) => <option key={c}>{c}</option>)}</select></Field>
        <Field label="Department"><select value={form.department} onChange={(e) => set('department', e.target.value)} className={selectCls}>{DEPARTMENTS.map((d) => <option key={d}>{d}</option>)}</select></Field>
        <Input label="Date" type="date" value={form.date} onChange={(e) => set('date', e.target.value)} required />
        <Input label="Time" type="time" value={form.time} onChange={(e) => set('time', e.target.value)} />
        <div className="md:col-span-2"><Input label="Venue" placeholder="e.g. Tech Arena Gate 1" value={form.venue} onChange={(e) => set('venue', e.target.value)} required /></div>
        <div className="md:col-span-2"><Input label="Google Maps link" placeholder="Share URL" value={form.mapsLink} onChange={(e) => set('mapsLink', e.target.value)} /></div>
        <Input label="Max seats" type="number" value={form.maxSeats} onChange={(e) => set('maxSeats', parseInt(e.target.value) || 1)} />
        <Input label="Credits awarded" type="number" value={form.points} onChange={(e) => set('points', parseInt(e.target.value) || 0)} />
        <Field label="Status"><select value={form.status} onChange={(e) => set('status', e.target.value)} className={selectCls}>{['Open', 'Almost Full', 'Upcoming', 'Closed', 'Completed'].map((s) => <option key={s}>{s}</option>)}</select></Field>
        <div className="md:col-span-2">
          <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wide text-amrita-muted">Description</label>
          <textarea rows={3} value={form.description} onChange={(e) => set('description', e.target.value)} className="w-full rounded-xl border border-amrita-line bg-white p-3 text-[13px] text-amrita-ink outline-none transition focus:border-amrita-maroon focus:ring-2 focus:ring-amrita-maroon/10" />
        </div>
        <div className="md:col-span-2">
          <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wide text-amrita-muted">Rules (one per line)</label>
          <textarea rows={3} value={form.rules} onChange={(e) => set('rules', e.target.value)} className="w-full rounded-xl border border-amrita-line bg-white p-3 text-[13px] text-amrita-ink outline-none transition focus:border-amrita-maroon focus:ring-2 focus:ring-amrita-maroon/10" />
        </div>
      </div>
      {error && <div className="mx-5 mb-4 flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-3.5 py-2.5 text-[12px] font-semibold text-red-700"><AlertCircle className="h-4 w-4 shrink-0" />{error}</div>}
      <div className="flex gap-2.5 border-t border-amrita-lineSoft px-5 py-4">
        <button type="submit" disabled={loading} className="inline-flex items-center gap-2 rounded-xl bg-amrita-maroon px-5 py-2.5 text-[12px] font-semibold text-white hover:bg-amrita-maroonDark disabled:opacity-60">
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} {initial?.id ? 'Update event' : 'Create event'}
        </button>
        <button type="button" onClick={onCancel} className="inline-flex items-center gap-2 rounded-xl border border-amrita-line px-5 py-2.5 text-[12px] font-semibold text-amrita-slate hover:bg-amrita-panel"><X className="h-4 w-4" /> Cancel</button>
      </div>
    </motion.form>
  );
}
function Field({ label, children }) {
  return <label className="block"><span className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wide text-amrita-muted">{label}</span>{children}</label>;
}

/* ── Verification (clean panel replacing the fake terminal) ── */
function Verification() {
  const { registrations, markAttendance, events } = useData();
  const [code, setCode] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const checkedToday = registrations.filter((r) => r.attended || r.attendance === 'present');

  const verify = async (e) => {
    e.preventDefault();
    if (!code.trim()) return;
    setLoading(true);
    await new Promise((r) => setTimeout(r, 400));
    const reg = registrations.find((r) => r.ticketId === code.trim().toUpperCase());
    const ev = reg && events.find((e) => e.id === reg.eventId);
    if (!reg) setResult({ state: 'invalid', msg: 'No pass matches this ID.' });
    else if (reg.attended || reg.attendance === 'present') setResult({ state: 'duplicate', reg, ev, msg: 'Already checked in.' });
    else { markAttendance(reg.id); setResult({ state: 'valid', reg, ev, msg: 'Attendance recorded · credits awarded.' }); }
    setLoading(false);
    setCode('');
  };

  const tone = { valid: 'success', duplicate: 'warning', invalid: 'danger' };
  const ResIcon = result?.state === 'valid' ? CheckCircle2 : result?.state === 'duplicate' ? AlertCircle : XCircle;

  return (
    <div className="space-y-6">
      <SectionHead title="Attendance verification" sub="Enter a student's pass ID to verify entry and award credits" />
      <div className="grid gap-6 lg:grid-cols-2">
        <Panel title="Verify a pass" subtitle="Webcam QR scanning is coming next">
          <form onSubmit={verify} className="space-y-4 p-5">
            <div className="relative">
              <ScanLine className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-amrita-muted" />
              <input value={code} onChange={(e) => setCode(e.target.value)} autoFocus placeholder="Scan or type pass ID (TKT-…)"
                className="h-11 w-full rounded-xl border border-amrita-line bg-white pl-10 pr-3 font-mono text-[13px] text-amrita-ink outline-none transition focus:border-amrita-maroon focus:ring-2 focus:ring-amrita-maroon/10" />
            </div>
            <button type="submit" disabled={loading} className="flex w-full items-center justify-center gap-2 rounded-xl bg-amrita-maroon py-3 text-[12px] font-semibold text-white hover:bg-amrita-maroonDark disabled:opacity-60">
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />} Verify pass
            </button>

            {result && (
              <div className={`rounded-xl border p-4 ${result.state === 'valid' ? 'border-emerald-200 bg-emerald-50' : result.state === 'duplicate' ? 'border-amber-200 bg-amber-50' : 'border-red-200 bg-red-50'}`}>
                <div className="flex items-center gap-2">
                  <ResIcon className={`h-5 w-5 ${result.state === 'valid' ? 'text-emerald-600' : result.state === 'duplicate' ? 'text-amber-600' : 'text-red-600'}`} />
                  <p className={`text-[13px] font-bold ${result.state === 'valid' ? 'text-emerald-800' : result.state === 'duplicate' ? 'text-amber-800' : 'text-red-800'}`}>
                    {result.state === 'valid' ? 'Access granted' : result.state === 'duplicate' ? 'Already scanned' : 'Rejected'}
                  </p>
                </div>
                {result.reg && (
                  <div className="mt-3 border-t border-black/5 pt-3 text-[12px] text-amrita-slate">
                    <p className="font-semibold text-amrita-ink">{result.reg.studentName || result.reg.name}</p>
                    <p className="font-mono text-[11px]">{result.reg.registerNum} · {result.ev?.title}</p>
                  </div>
                )}
                <p className="mt-2 text-[11.5px] text-amrita-muted">{result.msg}</p>
              </div>
            )}
          </form>
        </Panel>

        <Panel title="Checked in today" subtitle={`${checkedToday.length} verified`}>
          {checkedToday.length === 0 ? (
            <EmptyState icon={ScanLine} title="No check-ins yet" hint="Verified passes will appear here." />
          ) : (
            <ul className="max-h-[420px] divide-y divide-amrita-lineSoft overflow-y-auto">
              {checkedToday.map((r) => {
                const ev = events.find((e) => e.id === r.eventId);
                return (
                  <li key={r.id} className="flex items-center gap-3 px-5 py-3.5">
                    <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-emerald-50 text-emerald-600"><CheckCircle2 className="h-4 w-4" /></span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[13px] font-semibold text-amrita-ink">{r.name || r.studentName}</p>
                      <p className="truncate font-mono text-[11px] text-amrita-muted">{r.ticketId} · {ev?.title}</p>
                    </div>
                    <Badge tone="success">Present</Badge>
                  </li>
                );
              })}
            </ul>
          )}
        </Panel>
      </div>
    </div>
  );
}

/* ── Announcements ── */
function Announcements() {
  const { announcements, addAnnouncement, deleteAnnouncement } = useData();
  const [form, setForm] = useState({ title: '', content: '' });
  const [saving, setSaving] = useState(false);
  const submit = async (e) => {
    e.preventDefault();
    if (!form.title || !form.content) return;
    setSaving(true);
    await new Promise((r) => setTimeout(r, 300));
    addAnnouncement({ ...form, date: new Date().toLocaleDateString('en-IN'), time: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) });
    setForm({ title: '', content: '' });
    setSaving(false);
  };
  return (
    <div className="space-y-6">
      <SectionHead title="Announcements" sub="Publish notices to every student dashboard" />
      <Panel title="Publish a notice">
        <form onSubmit={submit} className="space-y-4 p-5">
          <Input label="Title" placeholder="e.g. Schedule update" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
          <div>
            <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wide text-amrita-muted">Details</label>
            <textarea rows={3} value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} required className="w-full rounded-xl border border-amrita-line bg-white p-3 text-[13px] text-amrita-ink outline-none transition focus:border-amrita-maroon focus:ring-2 focus:ring-amrita-maroon/10" />
          </div>
          <button type="submit" disabled={saving} className="inline-flex items-center gap-2 rounded-xl bg-amrita-maroon px-5 py-2.5 text-[12px] font-semibold text-white hover:bg-amrita-maroonDark disabled:opacity-60">
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Megaphone className="h-4 w-4" />} Publish
          </button>
        </form>
      </Panel>
      {announcements.length === 0 ? (
        <Panel><EmptyState icon={Bell} title="No notices published" /></Panel>
      ) : (
        <div className="space-y-3">
          {announcements.map((a) => (
            <div key={a.id} className="flex items-start justify-between gap-4 rounded-2xl border border-amrita-line bg-white p-5 shadow-xs">
              <div className="flex gap-3">
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-amrita-maroonSoft text-amrita-maroon"><Bell className="h-4 w-4" /></span>
                <div>
                  <p className="text-[13px] font-bold text-amrita-ink">{a.title}</p>
                  <p className="mt-1 text-[12.5px] leading-relaxed text-amrita-slate">{a.content}</p>
                  <p className="mt-2 font-mono text-[10.5px] text-amrita-faint">{a.date} · {a.time}</p>
                </div>
              </div>
              <button onClick={() => deleteAnnouncement(a.id)} className="grid h-8 w-8 shrink-0 place-items-center rounded-lg border border-amrita-line text-red-500 hover:bg-red-50"><Trash2 className="h-4 w-4" /></button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function AdminDashboardView({ setView }) {
  const { user, events, registrations, leaderboard, addEvent, updateEvent, deleteEvent, logout } = useData();
  const [tab, setTab] = useState('overview');
  const [showForm, setShowForm] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [confirmDel, setConfirmDel] = useState(null);
  const [q, setQ] = useState('');

  if (!user || user.role !== 'admin') {
    return (
      <div className="grid min-h-[70vh] place-items-center bg-amrita-canvas px-5">
        <div className="text-center">
          <span className="mx-auto grid h-12 w-12 place-items-center rounded-xl bg-amrita-maroonSoft text-amrita-maroon"><ShieldCheck className="h-6 w-6" /></span>
          <h2 className="mt-4 text-xl font-bold text-amrita-ink">Faculty access required</h2>
          <button onClick={() => setView('signin')} className="mt-5 inline-flex items-center gap-2 rounded-xl bg-amrita-maroon px-5 py-2.5 text-[13px] font-semibold text-white hover:bg-amrita-maroonDark">Sign in <ArrowRight className="h-4 w-4" /></button>
        </div>
      </div>
    );
  }

  const totalAttended = registrations.filter((r) => r.attended || r.attendance === 'present').length;
  const openEvents = events.filter((e) => e.status === 'Open').length;
  const board = [...leaderboard].sort((a, b) => b.points - a.points);
  const filteredRegs = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return registrations;
    return registrations.filter((r) => [r.studentName, r.registerNum, r.eventTitle, r.email].some((x) => String(x || '').toLowerCase().includes(s)));
  }, [registrations, q]);

  const saveEvent = (data) => { editTarget ? updateEvent(editTarget.id, data) : addEvent(data); setShowForm(false); setEditTarget(null); };
  const startEdit = (ev) => { setEditTarget(ev); setShowForm(true); setTab('events'); };

  const exportCSV = () => {
    const headers = ['Student', 'Register No', 'Department', 'Year', 'Email', 'Phone', 'Event', 'Registered', 'Attendance'];
    const rows = registrations.map((r) => [r.studentName, r.registerNum, r.department, r.year, r.email, r.phone, r.eventTitle, r.registrationDate, (r.attended || r.attendance === 'present') ? 'Present' : 'Absent']);
    const csv = 'data:text/csv;charset=utf-8,' + [headers, ...rows].map((row) => row.map((v) => `"${v ?? ''}"`).join(',')).join('\n');
    const a = document.createElement('a');
    a.href = encodeURI(csv);
    a.download = `ignite2026_registrations.csv`;
    document.body.appendChild(a); a.click(); a.remove();
  };

  const nav = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'events', label: 'Events', icon: CalendarDays, badge: events.length },
    { id: 'registrations', label: 'Registrations', icon: Users, badge: registrations.length || undefined },
    { id: 'verify', label: 'Verification', icon: ScanLine },
    { id: 'announcements', label: 'Announcements', icon: Megaphone },
  ];

  return (
    <div className="min-h-screen bg-amrita-canvas">
      <div className="mx-auto grid max-w-7xl gap-6 px-5 py-8 lg:grid-cols-12 lg:px-8">
        {/* Sidebar */}
        <aside className="lg:col-span-3">
          <div className="lg:sticky lg:top-24 space-y-4">
            <div className="relative overflow-hidden rounded-2xl bg-crimson-night p-5 text-white shadow-xs">
              <img src="/amrita-emblem.svg" alt="" aria-hidden className="pointer-events-none absolute -right-6 -top-6 h-24 w-24 opacity-[0.08]" style={{ filter: 'brightness(0) invert(1)' }} />
              <div className="relative flex items-center gap-2.5">
                <img src="/amrita-emblem.svg" alt="" className="h-8 w-8" style={{ filter: 'brightness(0) invert(1)' }} />
                <div>
                  <p className="text-[9px] font-semibold uppercase tracking-[0.2em] text-white/55">Operations Console</p>
                  <p className="text-[13px] font-bold">IGNITE 2026</p>
                </div>
              </div>
              <p className="relative mt-4 text-[11.5px] text-white/70">{user.name}</p>
            </div>

            <nav className="rounded-2xl border border-amrita-line bg-white p-2 shadow-xs">
              {nav.map((n) => <NavItem key={n.id} {...n} active={tab === n.id} onClick={() => { setTab(n.id); setShowForm(false); setEditTarget(null); }} />)}
            </nav>

            <button onClick={() => { logout(); setView('home'); }} className="flex w-full items-center justify-center gap-2 rounded-xl border border-amrita-line bg-white py-2.5 text-[12.5px] font-semibold text-red-600 hover:bg-red-50">
              <LogOut className="h-4 w-4" /> Exit console
            </button>
          </div>
        </aside>

        {/* Main */}
        <main className="lg:col-span-9">
          <AnimatePresence mode="wait">
            <motion.div key={tab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.25 }} className="space-y-6">

              {tab === 'overview' && (
                <>
                  <SectionHead title="Operations overview" sub="Live registry across all IGNITE 2026 events" />
                  <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                    <StatCard icon={CalendarDays} label="Total events" value={events.length} />
                    <StatCard icon={Users} label="Registrations" value={registrations.length} />
                    <StatCard icon={CheckCircle2} label="Checked in" value={totalAttended} />
                    <StatCard icon={CalendarDays} label="Open events" value={openEvents} />
                  </div>

                  <div className="grid gap-4 sm:grid-cols-3">
                    <QuickAction icon={Plus} title="Create event" hint="Publish a new program" onClick={() => { setEditTarget(null); setShowForm(true); setTab('events'); }} />
                    <QuickAction icon={ScanLine} title="Verify entry" hint="Scan attendance passes" onClick={() => setTab('verify')} />
                    <QuickAction icon={Megaphone} title="Broadcast" hint="Publish a notice" onClick={() => setTab('announcements')} />
                  </div>

                  <Panel title="Department standings" action={<Trophy className="h-4 w-4 text-amrita-maroon" />} bodyClass="divide-y divide-amrita-lineSoft">
                    {board.slice(0, 5).map((d, i) => (
                      <div key={d.dept} className="flex items-center gap-4 px-5 py-3.5">
                        <span className="w-6 text-[13px] font-bold text-amrita-muted">#{i + 1}</span>
                        <p className="flex-1 text-[13px] font-semibold text-amrita-ink">{d.dept}</p>
                        <span className="text-[13px] font-bold text-amrita-maroon">{d.points.toLocaleString('en-IN')} <span className="text-[11px] font-medium text-amrita-muted">pts</span></span>
                      </div>
                    ))}
                  </Panel>
                </>
              )}

              {tab === 'events' && (
                <>
                  <div className="flex items-center justify-between">
                    <SectionHead title="Events" sub={`${events.length} programs`} />
                    {!showForm && <button onClick={() => { setEditTarget(null); setShowForm(true); }} className="inline-flex items-center gap-2 rounded-xl bg-amrita-maroon px-4 py-2.5 text-[12px] font-semibold text-white hover:bg-amrita-maroonDark"><Plus className="h-4 w-4" /> Add event</button>}
                  </div>
                  <AnimatePresence>{showForm && <EventForm initial={editTarget || {}} onSave={saveEvent} onCancel={() => { setShowForm(false); setEditTarget(null); }} />}</AnimatePresence>
                  <div className="space-y-3">
                    {events.map((ev) => (
                      <div key={ev.id} className="flex items-center justify-between gap-4 rounded-2xl border border-amrita-line bg-white px-5 py-4 shadow-xs">
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="text-[14px] font-bold text-amrita-ink">{ev.title}</p>
                            <Badge tone={statusTone[ev.status] || 'neutral'}>{ev.status}</Badge>
                          </div>
                          <p className="mt-1 font-mono text-[11px] text-amrita-muted">{ev.date} · {ev.venue} · {ev.category} · {ev.seatsFilled}/{ev.maxSeats} filled</p>
                        </div>
                        <div className="flex shrink-0 items-center gap-2">
                          <button onClick={() => startEdit(ev)} className="grid h-9 w-9 place-items-center rounded-lg border border-amrita-line text-amrita-slate hover:border-amrita-maroon hover:text-amrita-maroon"><Edit3 className="h-4 w-4" /></button>
                          {confirmDel === ev.id ? (
                            <div className="flex items-center gap-1.5">
                              <button onClick={() => { deleteEvent(ev.id); setConfirmDel(null); }} className="rounded-lg bg-red-600 px-3 py-2 text-[11px] font-semibold text-white hover:bg-red-700">Delete</button>
                              <button onClick={() => setConfirmDel(null)} className="rounded-lg bg-amrita-panel px-3 py-2 text-[11px] font-semibold text-amrita-slate">Keep</button>
                            </div>
                          ) : (
                            <button onClick={() => setConfirmDel(ev.id)} className="grid h-9 w-9 place-items-center rounded-lg border border-amrita-line text-red-500 hover:bg-red-50"><Trash2 className="h-4 w-4" /></button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}

              {tab === 'registrations' && (
                <>
                  <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                    <SectionHead title="Registrations" sub={`${registrations.length} total`} />
                    <button onClick={exportCSV} className="inline-flex items-center gap-2 rounded-xl border border-amrita-line bg-white px-4 py-2.5 text-[12px] font-semibold text-amrita-ink hover:border-amrita-maroon hover:text-amrita-maroon"><FileSpreadsheet className="h-4 w-4" /> Export CSV</button>
                  </div>
                  <div className="relative max-w-sm">
                    <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-amrita-muted" />
                    <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search students, events…" className="h-10 w-full rounded-xl border border-amrita-line bg-white pl-10 pr-3 text-[13px] text-amrita-ink outline-none transition focus:border-amrita-maroon focus:ring-2 focus:ring-amrita-maroon/10" />
                  </div>
                  <Panel bodyClass="overflow-x-auto">
                    {filteredRegs.length === 0 ? (
                      <EmptyState icon={Users} title="No registrations" hint={q ? 'No results for this search.' : 'Student registrations will appear here.'} />
                    ) : (
                      <table className="w-full text-left text-[12.5px]">
                        <thead>
                          <tr className="border-b border-amrita-lineSoft text-[10.5px] font-semibold uppercase tracking-wide text-amrita-muted">
                            <th className="px-5 py-3">Student</th><th className="px-5 py-3">Register No</th><th className="px-5 py-3">Dept / Year</th><th className="px-5 py-3">Event</th><th className="px-5 py-3">Pass ID</th><th className="px-5 py-3 text-center">Attendance</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-amrita-lineSoft">
                          {filteredRegs.map((r) => {
                            const present = r.attended || r.attendance === 'present';
                            return (
                              <tr key={r.id} className="hover:bg-amrita-canvas">
                                <td className="px-5 py-3 font-semibold text-amrita-ink">{r.studentName}</td>
                                <td className="px-5 py-3 font-mono text-amrita-slate">{r.registerNum}</td>
                                <td className="px-5 py-3 text-amrita-slate">{r.department} · Y{r.year}</td>
                                <td className="px-5 py-3 text-amrita-slate">{r.eventTitle}</td>
                                <td className="px-5 py-3 font-mono text-amrita-faint">{r.ticketId}</td>
                                <td className="px-5 py-3 text-center"><Badge tone={present ? 'success' : 'neutral'}>{present ? 'Present' : 'Absent'}</Badge></td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    )}
                  </Panel>
                </>
              )}

              {tab === 'verify' && <Verification />}
              {tab === 'announcements' && <Announcements />}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}

function QuickAction({ icon: Icon, title, hint, onClick }) {
  return (
    <button onClick={onClick} className="group flex items-start gap-3 rounded-2xl border border-amrita-line bg-white p-5 text-left shadow-xs hover-lift-sm">
      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-amrita-maroonSoft text-amrita-maroon"><Icon className="h-4 w-4" /></span>
      <div>
        <p className="text-[13px] font-bold text-amrita-ink">{title}</p>
        <p className="mt-0.5 text-[11.5px] text-amrita-muted">{hint}</p>
      </div>
      <ChevronRight className="ml-auto h-4 w-4 self-center text-amrita-faint transition-transform group-hover:translate-x-0.5" />
    </button>
  );
}

function SectionHead({ title, sub }) {
  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight text-amrita-ink">{title}</h1>
      {sub && <p className="mt-1 text-[13px] text-amrita-muted">{sub}</p>}
    </div>
  );
}
