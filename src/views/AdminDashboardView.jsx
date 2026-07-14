import React, { useState, useMemo, useRef, useEffect } from 'react';
import jsQR from 'jsqr';
import { useData } from '../context/DataContext';
import Input from '../components/Input';
import { StatCard, Panel, Badge, EmptyState, NavItem } from '../components/ui';
import {
  LayoutDashboard, CalendarDays, Users, ScanLine, Megaphone, Plus, Edit3, Trash2, Save, X,
  FileSpreadsheet, CheckCircle2, XCircle, Search, ShieldCheck, LogOut, Loader2, AlertCircle,
  ChevronRight, Trophy, Bell, ArrowRight, Camera, CameraOff, Keyboard, ClipboardList, Printer, Download, GraduationCap, Award, Medal,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { DEPARTMENTS, SECTIONS, YEARS, normalizeDept, deptLabel } from '../lib/departments';

const CATEGORIES = ['Hackathon', 'Workshop', 'Technical', 'Sports', 'Cultural', 'Arts', 'Music', 'Startup', 'Seminar', 'Gaming'];
const EMPTY = { title: '', category: 'Technical', department: 'CSE', date: '', time: '', deadline: '', venue: '', description: '', maxSeats: 100, status: 'Open', prizes: '', rules: '', points: 50, mapsLink: '', image: '' };

const selectCls = 'h-10 w-full rounded-xl border border-amrita-line bg-white px-3 text-[13px] font-medium text-amrita-ink outline-none transition focus:border-amrita-maroon focus:ring-2 focus:ring-amrita-maroon/10';
const statusTone = { Open: 'success', 'Almost Full': 'warning', Closed: 'danger', Upcoming: 'maroon', Completed: 'neutral' };

/* ── Event create/edit form ── */
function EventForm({ initial, onSave, onCancel }) {
  const [form, setForm] = useState({ ...EMPTY, ...initial, deadline: initial?.deadline || '', image: initial?.image || initial?.gallery?.[0]?.url || '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const submit = async (e) => {
    e.preventDefault();
    if (!form.title || !form.date || !form.venue) return setError('Title, event date and venue are required.');
    if (!form.deadline) return setError('Set the registration deadline (last day students can register).');
    if (form.deadline && form.date && form.deadline > form.date) return setError('Registration deadline must be on or before the event date.');
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
        <Field label="Department"><select value={form.department} onChange={(e) => set('department', e.target.value)} className={selectCls}>{DEPARTMENTS.map((d) => <option key={d.code} value={d.code}>{d.label}</option>)}</select></Field>
        <Input label="Event date" type="date" value={form.date} onChange={(e) => set('date', e.target.value)} required />
        <Input label="Time" type="time" value={form.time} onChange={(e) => set('time', e.target.value)} />
        <div className="md:col-span-2">
          <Input label="Registration deadline (last day to register)" type="date" value={form.deadline} onChange={(e) => set('deadline', e.target.value)} required />
          <p className="mt-1 text-[11px] text-amrita-muted">After this date registration closes automatically and the event stops showing on the public site.</p>
        </div>
        <div className="md:col-span-2"><Input label="Venue" placeholder="e.g. Tech Arena Gate 1" value={form.venue} onChange={(e) => set('venue', e.target.value)} required /></div>
        <div className="md:col-span-2"><Input label="Cover image URL (optional)" placeholder="https://images.unsplash.com/…" value={form.image} onChange={(e) => set('image', e.target.value)} /></div>
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

/* ── Verification — live webcam QR scanning + manual fallback ── */
function Verification() {
  const { registrations, markAttendance, events } = useData();
  const [code, setCode] = useState('');
  const [result, setResult] = useState(null);
  const [camOn, setCamOn] = useState(false);
  const [camError, setCamError] = useState('');
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const rafRef = useRef(0);
  const lastHitRef = useRef(0);
  const checkedToday = registrations.filter((r) => r.attended || r.attendance === 'present');

  // Server-first: mark attendance straight against the database (the source of
  // truth) so a valid pass is never wrongly rejected because this device's local
  // registration list is stale/empty. Falls back to the local list only for the
  // display name when the server response omits it.
  const evaluate = async (raw) => {
    const code = String(raw).trim();
    const at = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    setResult({ state: 'checking', code, at, msg: 'Verifying pass…' });
    const res = await markAttendance(code);
    const reg = res?.registration || registrations.find((r) => (r.ticketId || '').toUpperCase() === code.toUpperCase() || (r.id || '').toUpperCase() === code.toUpperCase());
    const ev = reg && events.find((e) => e.id === reg.eventId);
    if (!res?.success) return setResult({ state: 'invalid', code, at, msg: res?.message || 'No pass matches this code.' });
    if (res.already) return setResult({ state: 'duplicate', reg, ev, at, msg: res.message || 'This pass is already checked in.' });
    setResult({ state: 'valid', reg, ev, at, msg: res.message || 'Attendance recorded · credits awarded.' });
  };
  // keep the scan loop calling the latest evaluate (avoids stale closure)
  const evalRef = useRef(evaluate);
  evalRef.current = evaluate;

  const verifyManual = (e) => { e.preventDefault(); if (!code.trim()) return; evaluate(code); setCode(''); };

  const stopCam = () => {
    cancelAnimationFrame(rafRef.current);
    if (streamRef.current) streamRef.current.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    setCamOn(false);
  };
  const startCam = async () => {
    setCamError('');
    if (!navigator.mediaDevices?.getUserMedia) return setCamError('Camera is not supported in this browser.');
    try {
      streamRef.current = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      setCamOn(true);
    } catch {
      setCamError('Camera access was blocked. Allow the camera in your browser, or use manual entry below.');
    }
  };

  useEffect(() => () => stopCam(), []);

  useEffect(() => {
    if (!camOn) return;
    const video = videoRef.current;
    if (!video || !streamRef.current) return;
    video.srcObject = streamRef.current;
    video.setAttribute('playsinline', 'true');
    video.play().catch(() => {});
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    const scan = () => {
      if (video.readyState >= 2 && video.videoWidth) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const img = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const qr = jsQR(img.data, img.width, img.height, { inversionAttempts: 'dontInvert' });
        if (qr?.data && Date.now() - lastHitRef.current > 2200) {
          lastHitRef.current = Date.now();
          evalRef.current(qr.data);
        }
      }
      rafRef.current = requestAnimationFrame(scan);
    };
    rafRef.current = requestAnimationFrame(scan);
    return () => cancelAnimationFrame(rafRef.current);
  }, [camOn]); // eslint-disable-line react-hooks/exhaustive-deps

  const rc = result?.state;
  const ResIcon = rc === 'valid' ? CheckCircle2 : rc === 'duplicate' ? AlertCircle : rc === 'checking' ? Loader2 : XCircle;
  const resBox = rc === 'valid' ? 'border-emerald-200 bg-emerald-50' : rc === 'duplicate' ? 'border-amber-200 bg-amber-50' : rc === 'checking' ? 'border-amrita-line bg-amrita-panel' : 'border-red-200 bg-red-50';
  const resText = rc === 'valid' ? 'text-emerald-800' : rc === 'duplicate' ? 'text-amber-800' : rc === 'checking' ? 'text-amrita-ink' : 'text-red-800';
  const resIcon = rc === 'valid' ? 'text-emerald-600' : rc === 'duplicate' ? 'text-amber-600' : rc === 'checking' ? 'text-amrita-maroon animate-spin' : 'text-red-600';

  return (
    <div className="space-y-6">
      <SectionHead title="Attendance verification" sub="Scan a student's wallet QR with the camera, or enter the pass ID manually" />

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Scanner column */}
        <div className="space-y-5">
          <Panel title="QR scanner" subtitle={camOn ? 'Hold the student’s pass up to the camera' : 'Use the camera to check students in'}>
            <div className="p-5">
              <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl border border-amrita-line bg-amrita-maroonNight">
                <video ref={videoRef} muted playsInline className={`h-full w-full object-cover ${camOn ? '' : 'hidden'}`} />
                {camOn ? (
                  <>
                    <div className="pointer-events-none absolute inset-0 grid place-items-center">
                      <div className="relative h-44 w-44">
                        {['left-0 top-0 border-l-2 border-t-2', 'right-0 top-0 border-r-2 border-t-2', 'left-0 bottom-0 border-l-2 border-b-2', 'right-0 bottom-0 border-r-2 border-b-2'].map((c) => (
                          <span key={c} className={`absolute h-6 w-6 border-white/90 ${c}`} />
                        ))}
                        <span className="absolute inset-x-0 top-0 h-0.5 animate-scan-line bg-white/80" />
                      </div>
                    </div>
                    <span className="absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-md bg-black/45 px-2 py-1 text-[10px] font-semibold text-white">
                      <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" /> Scanning
                    </span>
                  </>
                ) : (
                  <div className="grid h-full w-full place-items-center text-center">
                    <div>
                      <span className="mx-auto grid h-12 w-12 place-items-center rounded-xl bg-white/10 text-white/80"><Camera className="h-6 w-6" /></span>
                      <p className="mt-3 text-[12px] font-medium text-white/70">Camera is off</p>
                    </div>
                  </div>
                )}
              </div>

              {camError && (
                <div className="mt-3 flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2.5 text-[12px] font-medium text-amber-800">
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" /> {camError}
                </div>
              )}

              <button onClick={camOn ? stopCam : startCam}
                className={`mt-4 flex w-full items-center justify-center gap-2 rounded-xl py-3 text-[12px] font-semibold transition-colors ${camOn ? 'border border-amrita-line bg-white text-amrita-ink hover:bg-amrita-panel' : 'bg-amrita-maroon text-white hover:bg-amrita-maroonDark'}`}>
                {camOn ? <><CameraOff className="h-4 w-4" /> Stop camera</> : <><Camera className="h-4 w-4" /> Start camera</>}
              </button>

              <form onSubmit={verifyManual} className="mt-5 border-t border-amrita-lineSoft pt-5">
                <label className="mb-2 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-amrita-muted"><Keyboard className="h-3.5 w-3.5" /> Manual entry</label>
                <div className="flex gap-2.5">
                  <input value={code} onChange={(e) => setCode(e.target.value)} placeholder="TKT-…"
                    className="h-10 flex-1 rounded-xl border border-amrita-line bg-white px-3 font-mono text-[13px] text-amrita-ink outline-none transition focus:border-amrita-maroon focus:ring-2 focus:ring-amrita-maroon/10" />
                  <button type="submit" className="inline-flex items-center gap-1.5 rounded-xl border border-amrita-line px-4 text-[12px] font-semibold text-amrita-ink hover:border-amrita-maroon hover:text-amrita-maroon"><CheckCircle2 className="h-4 w-4" /> Verify</button>
                </div>
              </form>
            </div>
          </Panel>

          {result && (
            <div className={`rounded-2xl border p-5 ${resBox}`}>
              <div className="flex items-center gap-3">
                <ResIcon className={`h-6 w-6 shrink-0 ${resIcon}`} />
                <div>
                  <p className={`text-[14px] font-bold ${resText}`}>{rc === 'valid' ? 'Access granted' : rc === 'duplicate' ? 'Already checked in' : rc === 'checking' ? 'Verifying…' : 'Rejected'}</p>
                  <p className="text-[11px] text-amrita-muted">Verified at {result.at}</p>
                </div>
              </div>
              {result.reg ? (
                <div className="mt-4 grid grid-cols-2 gap-4 border-t border-black/5 pt-4">
                  <Meta k="Student" v={result.reg.studentName || result.reg.name} />
                  <Meta k="Register No" v={result.reg.registerNum} mono />
                  <Meta k="Department" v={result.reg.department} />
                  <Meta k="Event" v={result.ev?.title} />
                </div>
              ) : (
                <p className="mt-2 font-mono text-[11px] text-amrita-muted">Code: {result.code}</p>
              )}
              <p className="mt-3 text-[12px] text-amrita-slate">{result.msg}</p>
            </div>
          )}
        </div>

        {/* Checked-in log */}
        <Panel title="Checked in today" subtitle={`${checkedToday.length} verified`}>
          {checkedToday.length === 0 ? (
            <EmptyState icon={ScanLine} title="No check-ins yet" hint="Verified passes appear here as you scan them." />
          ) : (
            <ul className="max-h-[560px] divide-y divide-amrita-lineSoft overflow-y-auto">
              {checkedToday.map((r) => {
                const ev = events.find((e) => e.id === r.eventId);
                return (
                  <li key={r.id} className="flex items-center gap-3 px-5 py-4">
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
function Meta({ k, v, mono }) {
  return (
    <div>
      <p className="text-[10px] font-semibold uppercase tracking-wide text-amrita-muted">{k}</p>
      <p className={`mt-0.5 text-[12.5px] font-semibold text-amrita-ink ${mono ? 'font-mono text-[11px]' : ''}`}>{v || '—'}</p>
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

/* ── Class attendance forms — per section / year, CSV + printable ── */
const isPresent = (r) => r.attended || r.attendance === 'present';

function buildCsv(list) {
  const headers = ['S.No', 'Student', 'Register No', 'Department', 'Year', 'Section', 'Event', 'Registered On', 'Pass ID', 'Attendance'];
  const body = list.map((r, i) => [
    i + 1, r.studentName || r.name, r.registerNum, deptLabel(normalizeDept(r.department)),
    r.year || '', r.section || '', r.eventTitle, r.registrationDate || '', r.ticketId || '',
    isPresent(r) ? 'Present' : 'Absent',
  ]);
  return [headers, ...body].map((row) => row.map((v) => `"${String(v ?? '').replace(/"/g, '""')}"`).join(',')).join('\n');
}

function downloadCsv(list, filename) {
  const blob = new Blob([buildCsv(list)], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = filename;
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

// Group a flat list into per-class buckets (year → section).
function groupByClass(list) {
  const map = new Map();
  for (const r of list) {
    const key = `${r.year || '—'}|${r.section || '—'}`;
    if (!map.has(key)) map.set(key, { year: r.year || '—', section: r.section || '—', rows: [] });
    map.get(key).rows.push(r);
  }
  return [...map.values()].sort((a, b) => `${a.year}${a.section}`.localeCompare(`${b.year}${b.section}`));
}

// Open a print-ready window: one attendance sheet per class group.
function printClassForms(deptCode, eventLabel, groups) {
  const w = window.open('', '_blank', 'width=920,height=720');
  if (!w) { alert('Please allow pop-ups to print the attendance forms.'); return; }
  const esc = (s) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const today = new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });

  const sheets = groups.map((g) => {
    const present = g.rows.filter(isPresent).length;
    const body = g.rows
      .slice()
      .sort((a, b) => String(a.registerNum || '').localeCompare(String(b.registerNum || '')))
      .map((r, i) => `<tr>
        <td class="n">${i + 1}</td>
        <td>${esc(r.studentName || r.name)}</td>
        <td class="mono">${esc(r.registerNum)}</td>
        <td>${esc(r.eventTitle)}</td>
        <td class="c">${isPresent(r) ? '&#10003;' : ''}</td>
        <td class="sig"></td>
      </tr>`).join('');
    return `<section class="sheet">
      <div class="head">
        <div><div class="k">Amrita Vishwa Vidyapeetham · IGNITE 2026</div>
        <h1>${esc(deptLabel(deptCode))} — Year ${esc(g.year)} · Section ${esc(g.section)}</h1>
        <div class="sub">Event: ${esc(eventLabel)} &nbsp;·&nbsp; Generated: ${today}</div></div>
        <div class="tot"><span>${present}/${g.rows.length}</span><small>present</small></div>
      </div>
      <table><thead><tr><th class="n">#</th><th>Student</th><th>Register No</th><th>Event</th><th class="c">Present</th><th class="sig">Signature</th></tr></thead>
      <tbody>${body || '<tr><td colspan="6" class="empty">No students in this class.</td></tr>'}</tbody></table>
      <div class="foot"><span>Class Advisor signature: ____________________</span><span>Date: ____________</span></div>
    </section>`;
  }).join('');

  w.document.write(`<!doctype html><html><head><meta charset="utf-8"><title>Attendance Forms — ${esc(deptLabel(deptCode))}</title>
    <style>
      *{box-sizing:border-box} body{font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;color:#16181D;margin:0;padding:24px;background:#fff}
      .sheet{max-width:820px;margin:0 auto 28px;padding-bottom:14px}
      .head{display:flex;justify-content:space-between;align-items:flex-start;border-bottom:2px solid #A3133F;padding-bottom:12px;margin-bottom:14px}
      .k{font-size:10px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;color:#A3133F}
      h1{font-size:18px;margin:4px 0 2px} .sub{font-size:11px;color:#555}
      .tot{text-align:center} .tot span{display:block;font-size:22px;font-weight:800;color:#A3133F} .tot small{font-size:9px;text-transform:uppercase;letter-spacing:1px;color:#888}
      table{width:100%;border-collapse:collapse;font-size:12px} th,td{border:1px solid #d8d8d8;padding:7px 9px;text-align:left}
      th{background:#faf3f5;font-size:10px;text-transform:uppercase;letter-spacing:.5px;color:#7a2340} .n{width:34px;text-align:center} .c{width:64px;text-align:center;font-weight:700;color:#0a7d3a} .sig{width:150px} .mono{font-family:ui-monospace,Menlo,monospace;font-size:11px}
      .empty{text-align:center;color:#999;padding:18px}
      .foot{display:flex;justify-content:space-between;margin-top:12px;font-size:11px;color:#444}
      @media print{ body{padding:0} .sheet{page-break-after:always;margin:0;padding:18px 22px} .sheet:last-child{page-break-after:auto} }
    </style></head><body>${sheets}
    <script>window.onload=function(){setTimeout(function(){window.print()},350)}</script></body></html>`);
  w.document.close();
}

function ClassAttendance() {
  const { registrations, events, updateRegistration } = useData();
  const [dept, setDept] = useState(DEPARTMENTS[0].code);
  const [year, setYear] = useState('all');
  const [section, setSection] = useState('all');
  const [eventId, setEventId] = useState('all');
  const [savingId, setSavingId] = useState(null);

  const rows = useMemo(() => registrations
    .filter((r) => r.status !== 'Cancelled')
    .filter((r) => normalizeDept(r.department) === dept)
    .filter((r) => year === 'all' || String(r.year || '') === year)
    .filter((r) => section === 'all' || String(r.section || '') === section)
    .filter((r) => eventId === 'all' || r.eventId === eventId)
    .sort((a, b) => String(a.registerNum || '').localeCompare(String(b.registerNum || ''))),
  [registrations, dept, year, section, eventId]);

  const presentCount = rows.filter(isPresent).length;
  const pct = rows.length ? Math.round((presentCount / rows.length) * 100) : 0;
  const eventLabel = eventId === 'all' ? 'All events' : (events.find((e) => e.id === eventId)?.title || 'Event');
  const slug = (s) => String(s).replace(/[^a-z0-9]+/gi, '-').toLowerCase();
  const baseName = `attendance_${slug(dept)}${year !== 'all' ? `_y${year}` : ''}${section !== 'all' ? `_sec${section}` : ''}`;

  const groups = useMemo(() => groupByClass(rows), [rows]);

  const saveOverride = async (r, patch) => {
    setSavingId(r.id);
    await updateRegistration(r.id, patch);
    setSavingId(null);
  };

  const miniSel = 'h-8 rounded-lg border border-amrita-line bg-white px-2 text-[12px] font-medium text-amrita-ink outline-none focus:border-amrita-maroon';

  return (
    <div className="space-y-6">
      <SectionHead title="Class attendance forms" sub="Filter by class & section, then download or print the advisor's attendance sheet" />

      {/* filters */}
      <Panel>
        <div className="grid gap-3 p-5 sm:grid-cols-2 lg:grid-cols-4">
          <Field label="Department"><select value={dept} onChange={(e) => setDept(e.target.value)} className={selectCls}>{DEPARTMENTS.map((d) => <option key={d.code} value={d.code}>{d.label}</option>)}</select></Field>
          <Field label="Year"><select value={year} onChange={(e) => setYear(e.target.value)} className={selectCls}><option value="all">All years</option>{YEARS.map((y) => <option key={y} value={y}>Year {y}</option>)}</select></Field>
          <Field label="Section"><select value={section} onChange={(e) => setSection(e.target.value)} className={selectCls}><option value="all">All sections</option>{SECTIONS.map((s) => <option key={s} value={s}>Section {s}</option>)}</select></Field>
          <Field label="Event"><select value={eventId} onChange={(e) => setEventId(e.target.value)} className={selectCls}><option value="all">All events</option>{events.map((e) => <option key={e.id} value={e.id}>{e.title}</option>)}</select></Field>
        </div>
      </Panel>

      {/* summary + actions */}
      <div className="grid gap-4 sm:grid-cols-4">
        <StatCard icon={Users} label="Students" value={rows.length} />
        <StatCard icon={CheckCircle2} label="Present" value={presentCount} />
        <StatCard icon={XCircle} label="Absent" value={rows.length - presentCount} />
        <StatCard icon={Trophy} label="Attendance" value={`${pct}%`} />
      </div>

      <div className="flex flex-wrap gap-2.5">
        <button onClick={() => downloadCsv(rows, `${baseName}.csv`)} disabled={!rows.length}
          className="inline-flex items-center gap-2 rounded-xl bg-amrita-maroon px-4 py-2.5 text-[12px] font-semibold text-white hover:bg-amrita-maroonDark disabled:opacity-50">
          <Download className="h-4 w-4" /> Download CSV
        </button>
        <button onClick={() => printClassForms(dept, eventLabel, section === 'all' ? groups : [{ year: year === 'all' ? '—' : year, section, rows }])} disabled={!rows.length}
          className="inline-flex items-center gap-2 rounded-xl border border-amrita-line bg-white px-4 py-2.5 text-[12px] font-semibold text-amrita-ink hover:border-amrita-maroon hover:text-amrita-maroon disabled:opacity-50">
          <Printer className="h-4 w-4" /> Print sheet{section === 'all' && groups.length > 1 ? ` (${groups.length} classes)` : ''}
        </button>
        <button onClick={() => printClassForms(dept, eventLabel, groups)} disabled={!rows.length}
          className="inline-flex items-center gap-2 rounded-xl border border-amrita-line bg-white px-4 py-2.5 text-[12px] font-semibold text-amrita-slate hover:border-amrita-maroon hover:text-amrita-maroon disabled:opacity-50">
          <ClipboardList className="h-4 w-4" /> Print all class forms
        </button>
      </div>

      {/* roster */}
      <Panel title={`${deptLabel(dept)} · roster`} subtitle={`${rows.length} student${rows.length === 1 ? '' : 's'} · ${eventLabel}`} bodyClass="overflow-x-auto">
        {rows.length === 0 ? (
          <EmptyState icon={GraduationCap} title="No registrations for this class" hint="Adjust the filters, or students haven't registered yet." />
        ) : (
          <table className="w-full text-left text-[12.5px]">
            <thead>
              <tr className="border-b border-amrita-lineSoft text-[10.5px] font-semibold uppercase tracking-wide text-amrita-muted">
                <th className="px-5 py-3">Student</th><th className="px-5 py-3">Register No</th><th className="px-5 py-3">Year</th><th className="px-5 py-3">Section</th><th className="px-5 py-3">Event</th><th className="px-5 py-3 text-center">Attendance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-amrita-lineSoft">
              {rows.map((r) => (
                <tr key={r.id} className="hover:bg-amrita-canvas">
                  <td className="px-5 py-3 font-semibold text-amrita-ink">{r.studentName || r.name}</td>
                  <td className="px-5 py-3 font-mono text-amrita-slate">{r.registerNum}</td>
                  <td className="px-5 py-3">
                    <select value={r.year || ''} disabled={savingId === r.id} onChange={(e) => saveOverride(r, { year: e.target.value })} className={miniSel}>
                      <option value="">—</option>{YEARS.map((y) => <option key={y} value={y}>{y}</option>)}
                    </select>
                  </td>
                  <td className="px-5 py-3">
                    <select value={r.section || ''} disabled={savingId === r.id} onChange={(e) => saveOverride(r, { section: e.target.value })} className={miniSel}>
                      <option value="">—</option>{SECTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </td>
                  <td className="px-5 py-3 text-amrita-slate">{r.eventTitle}</td>
                  <td className="px-5 py-3 text-center"><Badge tone={isPresent(r) ? 'success' : 'neutral'}>{isPresent(r) ? 'Present' : 'Absent'}</Badge></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Panel>
      <p className="flex items-center gap-1.5 text-[11.5px] text-amrita-muted"><AlertCircle className="h-3.5 w-3.5" /> Tip: change a student's Year or Section inline to correct their class — it updates their record instantly.</p>
    </div>
  );
}

/* ── Rewards — rank students by earned credits, filterable by department ── */
function TopStudents() {
  const { registrations, events } = useData();
  const [dept, setDept] = useState('all');
  const [year, setYear] = useState('all');

  const pointsOf = (eventId) => {
    const ev = events.find((e) => e.id === eventId);
    return Number.isFinite(Number(ev?.points)) ? Number(ev.points) : 50;
  };

  // Aggregate credits per student (only verified check-ins earn credits).
  const students = useMemo(() => {
    const map = new Map();
    for (const r of registrations) {
      if (r.status === 'Cancelled') continue;
      const key = String(r.registerNum || r.email || r.id).toUpperCase();
      if (!map.has(key)) {
        map.set(key, {
          key, name: r.studentName || r.name, registerNum: r.registerNum,
          deptCode: normalizeDept(r.department), department: r.department,
          year: r.year, section: r.section, credits: 0, attended: 0, registered: 0,
        });
      }
      const s = map.get(key);
      s.registered += 1;
      if (r.attended || r.attendance === 'present') { s.attended += 1; s.credits += pointsOf(r.eventId); }
    }
    return [...map.values()]
      .filter((s) => dept === 'all' || s.deptCode === dept)
      .filter((s) => year === 'all' || String(s.year || '') === year)
      .sort((a, b) => b.credits - a.credits || b.attended - a.attended);
  }, [registrations, events, dept, year]);

  const exportRanking = () => {
    const headers = ['Rank', 'Student', 'Register No', 'Department', 'Year', 'Section', 'Events attended', 'Credits'];
    const rows = students.map((s, i) => [i + 1, s.name, s.registerNum, deptLabel(s.deptCode) || s.department, s.year || '', s.section || '', s.attended, s.credits]);
    const csv = [headers, ...rows].map((row) => row.map((v) => `"${String(v ?? '').replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `rewards_${dept === 'all' ? 'all-departments' : dept.replace(/\s+/g, '-').toLowerCase()}.csv`;
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  const medal = ['text-amber-500', 'text-slate-400', 'text-amber-700'];

  return (
    <div className="space-y-6">
      <SectionHead title="Rewards & top performers" sub="Students ranked by credits earned from verified attendance — pick the winners to reward per department" />

      <Panel>
        <div className="grid gap-3 p-5 sm:grid-cols-3">
          <Field label="Department"><select value={dept} onChange={(e) => setDept(e.target.value)} className={selectCls}><option value="all">All departments</option>{DEPARTMENTS.map((d) => <option key={d.code} value={d.code}>{d.label}</option>)}</select></Field>
          <Field label="Year"><select value={year} onChange={(e) => setYear(e.target.value)} className={selectCls}><option value="all">All years</option>{YEARS.map((y) => <option key={y} value={y}>Year {y}</option>)}</select></Field>
          <div className="flex items-end">
            <button onClick={exportRanking} disabled={!students.length} className="inline-flex items-center gap-2 rounded-xl border border-amrita-line bg-white px-4 py-2.5 text-[12px] font-semibold text-amrita-ink hover:border-amrita-maroon hover:text-amrita-maroon disabled:opacity-50">
              <Download className="h-4 w-4" /> Export ranking
            </button>
          </div>
        </div>
      </Panel>

      <Panel title={dept === 'all' ? 'All departments' : deptLabel(dept)} subtitle={`${students.length} student${students.length === 1 ? '' : 's'} · ranked by credits`} bodyClass="overflow-x-auto">
        {students.length === 0 ? (
          <EmptyState icon={Award} title="No credits earned yet" hint="Students appear here once their passes are scanned and attendance is verified." />
        ) : (
          <table className="w-full text-left text-[12.5px]">
            <thead>
              <tr className="border-b border-amrita-lineSoft text-[10.5px] font-semibold uppercase tracking-wide text-amrita-muted">
                <th className="px-5 py-3">Rank</th><th className="px-5 py-3">Student</th><th className="px-5 py-3">Register No</th><th className="px-5 py-3">Dept</th><th className="px-5 py-3">Yr/Sec</th><th className="px-5 py-3 text-center">Events</th><th className="px-5 py-3 text-right">Credits</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-amrita-lineSoft">
              {students.map((s, i) => (
                <tr key={s.key} className={`hover:bg-amrita-canvas ${i < 3 ? 'bg-amrita-maroonSoft/30' : ''}`}>
                  <td className="px-5 py-3">
                    <span className="inline-flex items-center gap-1.5 font-bold text-amrita-ink">
                      {i < 3 ? <Medal className={`h-4 w-4 ${medal[i]}`} /> : <span className="w-4 text-center text-amrita-muted">{i + 1}</span>}
                      {i < 3 ? i + 1 : ''}
                    </span>
                  </td>
                  <td className="px-5 py-3 font-semibold text-amrita-ink">{s.name}</td>
                  <td className="px-5 py-3 font-mono text-amrita-slate">{s.registerNum}</td>
                  <td className="px-5 py-3 text-amrita-slate">{s.deptCode || s.department || '—'}</td>
                  <td className="px-5 py-3 text-amrita-slate">{s.year || '—'}{s.section ? ` · ${s.section}` : ''}</td>
                  <td className="px-5 py-3 text-center text-amrita-slate">{s.attended}<span className="text-amrita-faint">/{s.registered}</span></td>
                  <td className="px-5 py-3 text-right font-bold text-amrita-maroon">{s.credits.toLocaleString('en-IN')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Panel>
    </div>
  );
}

/* ── Staff coordinators — admin creates limited-access venue logins ── */
function StaffCoordinators() {
  const { createCoordinator, listCoordinators, deleteCoordinator } = useData();
  const [list, setList] = useState([]);
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [msg, setMsg] = useState(null);
  const [saving, setSaving] = useState(false);
  const [confirmDel, setConfirmDel] = useState(null);

  const refresh = async () => setList((await listCoordinators()) || []);
  useEffect(() => { refresh(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const submit = async (e) => {
    e.preventDefault();
    setMsg(null);
    if (form.name.trim().length < 2 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email) || form.password.length < 6) {
      return setMsg({ t: 'err', m: 'Enter a name, a valid email and a password of at least 6 characters.' });
    }
    setSaving(true);
    const r = await createCoordinator({ name: form.name.trim(), email: form.email.trim().toLowerCase(), password: form.password });
    setSaving(false);
    if (r?.success) {
      setMsg({ t: 'ok', m: `Coordinator "${form.name.trim()}" created. Share the email + password with them — they sign in from the Admin tab.` });
      setForm({ name: '', email: '', password: '' });
      refresh();
    } else setMsg({ t: 'err', m: r?.message || 'Could not create coordinator.' });
  };

  const remove = async (id) => { await deleteCoordinator(id); setConfirmDel(null); refresh(); };

  return (
    <div className="space-y-6">
      <SectionHead title="Staff coordinators" sub="Create limited logins for venue staff — they can view registrations and scan attendance, but cannot create or edit anything" />

      <Panel title="Add a coordinator">
        <form onSubmit={submit} className="grid gap-4 p-5 sm:grid-cols-3">
          <Input label="Full name" placeholder="e.g. Priya K" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <Input label="Login email" type="email" placeholder="coordinator@amrita.edu" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          <Input label="Password" placeholder="min 6 characters" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
          <div className="sm:col-span-3 flex items-center gap-3">
            <button type="submit" disabled={saving} className="inline-flex items-center gap-2 rounded-xl bg-amrita-maroon px-5 py-2.5 text-[12px] font-semibold text-white hover:bg-amrita-maroonDark disabled:opacity-60">
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />} Create coordinator
            </button>
            {msg && <span className={`text-[12px] font-semibold ${msg.t === 'ok' ? 'text-emerald-700' : 'text-red-600'}`}>{msg.m}</span>}
          </div>
        </form>
      </Panel>

      <Panel title="Coordinators" subtitle={`${list.length} active`}>
        {list.length === 0 ? (
          <EmptyState icon={ShieldCheck} title="No coordinators yet" hint="Create one above so venue staff can scan passes without full admin access." />
        ) : (
          <ul className="divide-y divide-amrita-lineSoft">
            {list.map((c) => (
              <li key={c.id} className="flex items-center gap-3 px-5 py-4">
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-amrita-maroonSoft text-amrita-maroon"><ShieldCheck className="h-4 w-4" /></span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[13px] font-semibold text-amrita-ink">{c.name}</p>
                  <p className="truncate font-mono text-[11px] text-amrita-muted">{c.email}</p>
                </div>
                {confirmDel === c.id ? (
                  <div className="flex items-center gap-1.5">
                    <button onClick={() => remove(c.id)} className="rounded-lg bg-red-600 px-3 py-2 text-[11px] font-semibold text-white hover:bg-red-700">Remove</button>
                    <button onClick={() => setConfirmDel(null)} className="rounded-lg bg-amrita-panel px-3 py-2 text-[11px] font-semibold text-amrita-slate">Keep</button>
                  </div>
                ) : (
                  <button onClick={() => setConfirmDel(c.id)} className="grid h-9 w-9 place-items-center rounded-lg border border-amrita-line text-red-500 hover:bg-red-50"><Trash2 className="h-4 w-4" /></button>
                )}
              </li>
            ))}
          </ul>
        )}
      </Panel>
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

  // NOTE: all hooks must run before any early return — otherwise signing out
  // (user → null) changes the hook count and crashes the tree to a blank page.
  const filteredRegs = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return registrations;
    return registrations.filter((r) => [r.studentName, r.registerNum, r.eventTitle, r.email].some((x) => String(x || '').toLowerCase().includes(s)));
  }, [registrations, q]);

  if (!user || (user.role !== 'admin' && user.role !== 'coordinator')) {
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

  const isCoordinator = user.role === 'coordinator';
  const totalAttended = registrations.filter((r) => r.attended || r.attendance === 'present').length;
  const openEvents = events.filter((e) => e.status === 'Open').length;
  const board = [...leaderboard].sort((a, b) => b.points - a.points);

  const saveEvent = (data) => { editTarget ? updateEvent(editTarget.id, data) : addEvent(data); setShowForm(false); setEditTarget(null); };
  const startEdit = (ev) => { setEditTarget(ev); setShowForm(true); setTab('events'); };

  const exportCSV = () => {
    const headers = ['Student', 'Register No', 'Department', 'Year', 'Section', 'Email', 'Phone', 'Event', 'Registered', 'Attendance'];
    const rows = registrations.map((r) => [r.studentName, r.registerNum, r.department, r.year, r.section || '', r.email, r.phone, r.eventTitle, r.registrationDate, (r.attended || r.attendance === 'present') ? 'Present' : 'Absent']);
    const csv = 'data:text/csv;charset=utf-8,' + [headers, ...rows].map((row) => row.map((v) => `"${v ?? ''}"`).join(',')).join('\n');
    const a = document.createElement('a');
    a.href = encodeURI(csv);
    a.download = `ignite2026_registrations.csv`;
    document.body.appendChild(a); a.click(); a.remove();
  };

  // Venue coordinators get a restricted console: view registrations + scan
  // attendance only. No create/edit/delete of any kind.
  const nav = isCoordinator
    ? [
        { id: 'overview', label: 'Overview', icon: LayoutDashboard },
        { id: 'registrations', label: 'Registrations', icon: Users, badge: registrations.length || undefined },
        { id: 'verify', label: 'Verification', icon: ScanLine },
      ]
    : [
        { id: 'overview', label: 'Overview', icon: LayoutDashboard },
        { id: 'events', label: 'Events', icon: CalendarDays, badge: events.length },
        { id: 'registrations', label: 'Registrations', icon: Users, badge: registrations.length || undefined },
        { id: 'verify', label: 'Verification', icon: ScanLine },
        { id: 'classes', label: 'Class Forms', icon: ClipboardList },
        { id: 'rewards', label: 'Rewards', icon: Award },
        { id: 'staff', label: 'Staff Coordinators', icon: ShieldCheck },
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
                  <p className="text-[9px] font-semibold uppercase tracking-[0.2em] text-white/55">{isCoordinator ? 'Attendance Desk' : 'Operations Console'}</p>
                  <p className="text-[13px] font-bold">IGNITE 2026</p>
                </div>
              </div>
              <p className="relative mt-4 text-[11.5px] text-white/70">{user.name}{isCoordinator ? ' · Venue Coordinator' : ''}</p>
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
                    {!isCoordinator && <QuickAction icon={Plus} title="Create event" hint="Publish a new program" onClick={() => { setEditTarget(null); setShowForm(true); setTab('events'); }} />}
                    <QuickAction icon={ScanLine} title="Verify entry" hint="Scan attendance passes" onClick={() => setTab('verify')} />
                    {!isCoordinator && <QuickAction icon={Megaphone} title="Broadcast" hint="Publish a notice" onClick={() => setTab('announcements')} />}
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
              {tab === 'classes' && <ClassAttendance />}
              {tab === 'rewards' && <TopStudents />}
              {tab === 'staff' && <StaffCoordinators />}
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
