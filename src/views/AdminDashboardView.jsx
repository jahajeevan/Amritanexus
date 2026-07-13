import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import Button from '../components/Button';
import Input from '../components/Input';
import {
  Plus, Trash2, Edit3, Save, X, Users, Bell,
  Calendar, CheckCircle, AlertCircle, Loader2, ScanLine, Trophy,
  Shield, FileSpreadsheet
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const CATEGORIES = ['Hackathon', 'Workshop', 'Technical', 'Sports', 'Cultural', 'Arts', 'Music', 'Startup', 'Seminar', 'Gaming'];
const DEPARTMENTS = ['Computer Science', 'Electronics', 'Mechanical', 'Civil', 'Chemical', 'Management', 'Arts & Science'];

const EMPTY_EVENT = {
  title: '', category: 'Technical', department: 'Computer Science',
  date: '', time: '', venue: '', description: '', maxSeats: 100,
  status: 'Open', prizes: '', rules: '', points: 50,
  coordinators: [], schedule: [], gallery: [], mapsLink: ''
};

function SectionHeader({ title, sub }) {
  return (
    <div className="mb-8">
      <h2 className="text-xl font-bold font-display text-ignite-text uppercase tracking-widest">{title}</h2>
      {sub && <p className="text-xs text-ignite-muted mt-2 font-medium">{sub}</p>}
    </div>
  );
}

function EventForm({ initial, onSave, onCancel }) {
  const [form, setForm] = useState({ ...EMPTY_EVENT, ...initial });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const set = (field, value) => setForm(prev => ({ ...prev, [field]: value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title || !form.date || !form.venue) {
      setError('Title, Date, and Venue are required.');
      return;
    }
    setLoading(true);
    await new Promise(r => setTimeout(r, 400));
    onSave(form);
    setLoading(false);
  };

  return (
    <motion.form 
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      onSubmit={handleSubmit} 
      className="bg-white border border-ignite-champagne rounded-3xl p-6 md:p-8 space-y-6 shadow-soft overflow-hidden mb-8"
    >
      <div className="grid md:grid-cols-2 gap-5">
        <div className="md:col-span-2">
          <Input label="Event Title" placeholder="e.g. Code Storm Hackathon" value={form.title} onChange={e => set('title', e.target.value)} required />
        </div>
        <div>
          <label className="block text-[10px] font-bold text-ignite-muted uppercase tracking-widest mb-2 font-sans">Category</label>
          <select value={form.category} onChange={e => set('category', e.target.value)} className="w-full h-11 border border-ignite-champagne rounded-xl text-xs font-bold text-ignite-text px-3 bg-[#FAF9F6] focus:border-ignite-accent outline-none transition-all">
            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-[10px] font-bold text-ignite-muted uppercase tracking-widest mb-2 font-sans">Department</label>
          <select value={form.department} onChange={e => set('department', e.target.value)} className="w-full h-11 border border-ignite-champagne rounded-xl text-xs font-bold text-ignite-text px-3 bg-[#FAF9F6] focus:border-ignite-accent outline-none transition-all">
            {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
        </div>
        <Input label="Date" type="date" value={form.date} onChange={e => set('date', e.target.value)} required />
        <Input label="Time" type="time" value={form.time} onChange={e => set('time', e.target.value)} />
        <div className="md:col-span-2">
          <Input label="Venue" placeholder="e.g. Tech Arena Gate 1" value={form.venue} onChange={e => set('venue', e.target.value)} required />
        </div>
        <div className="md:col-span-2">
          <Input label="Google Maps Link" placeholder="Paste map iframe share link or URL" value={form.mapsLink} onChange={e => set('mapsLink', e.target.value)} />
        </div>
        <Input label="Max Seating Capacity" type="number" min="1" value={form.maxSeats} onChange={e => set('maxSeats', parseInt(e.target.value) || 1)} />
        <Input label="Credits Awarded" type="number" min="0" value={form.points} onChange={e => set('points', parseInt(e.target.value) || 0)} />
        
        <div>
          <label className="block text-[10px] font-bold text-ignite-muted uppercase tracking-widest mb-2 font-sans">Status</label>
          <select value={form.status} onChange={e => set('status', e.target.value)} className="w-full h-11 border border-ignite-champagne rounded-xl text-xs font-bold text-ignite-text px-3 bg-[#FAF9F6] focus:border-ignite-accent outline-none transition-all">
            {['Open', 'Almost Full', 'Upcoming', 'Closed', 'Completed'].map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>

        <div className="md:col-span-2">
          <label className="block text-[11px] font-bold text-ignite-muted uppercase tracking-wider mb-2">Description</label>
          <textarea value={form.description} onChange={e => set('description', e.target.value)} rows={3} placeholder="Provide details..." className="w-full border border-ignite-champagne rounded-xl text-xs font-medium text-ignite-text p-4 bg-[#FAF9F6] focus:border-ignite-accent outline-none resize-none transition-all" />
        </div>
        <div className="md:col-span-2">
          <Input label="Prizes & Rewards" placeholder="1st Place: Certificate..." value={form.prizes} onChange={e => set('prizes', e.target.value)} />
        </div>
        <div className="md:col-span-2">
          <label className="block text-[11px] font-bold text-ignite-muted uppercase tracking-wider mb-2">Rules (one per line)</label>
          <textarea value={form.rules} onChange={e => set('rules', e.target.value)} rows={3} placeholder="Rule 1&#10;Rule 2" className="w-full border border-ignite-champagne rounded-xl text-xs font-medium text-ignite-text p-4 bg-[#FAF9F6] focus:border-ignite-accent outline-none resize-none transition-all" />
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-100 flex items-center gap-2.5">
          <AlertCircle className="h-4.5 w-4.5 text-red-500 shrink-0" />
          <p className="text-xs text-red-600 font-semibold">{error}</p>
        </div>
      )}

      <div className="flex gap-3 pt-2">
        <Button type="submit" variant="accent" className="h-11 text-[10px] font-bold uppercase tracking-widest rounded-xl" icon={loading ? Loader2 : Save} disabled={loading}>
          {loading ? 'Saving...' : initial?.id ? 'Update Event' : 'Create Event'}
        </Button>
        <button 
          type="button" 
          onClick={onCancel} 
          className="h-11 px-6 rounded-xl border border-ignite-champagne hover:bg-ignite-secondary text-ignite-primary font-bold uppercase tracking-widest text-[10px] transition-all flex items-center gap-2"
        >
          <X className="h-4 w-4" />
          Cancel
        </button>
      </div>
    </motion.form>
  );
}

function ScannerTerminal() {
  const { registrations, markAttendance, events } = useData();
  const [ticketId, setTicketId] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleScan = async (e) => {
    e.preventDefault();
    if (!ticketId.trim()) return;
    setLoading(true);
    await new Promise(r => setTimeout(r, 600));
    
    const reg = registrations.find(r => r.ticketId === ticketId.trim().toUpperCase());
    if (!reg) {
      setResult({ ok: false, message: 'Invalid Pass: Ticket ID not found in database.' });
    } else if (reg.attended || reg.attendance === 'present') {
      const ev = events.find(e => e.id === reg.eventId);
      setResult({ ok: false, message: `Access Blocked: ${reg.studentName} is already checked in for ${ev?.title || 'Event'}.` });
    } else {
      markAttendance(reg.id);
      const ev = events.find(e => e.id === reg.eventId);
      setResult({ ok: true, message: `Access Granted: Verified ${reg.studentName} entry for ${ev?.title || 'Event'}.` });
    }
    
    setLoading(false);
    setTicketId('');
  };

  return (
    <div className="space-y-8">
      <SectionHeader title="Verification Terminal" sub="Scan and check-in campus event pass codes." />
      
      <div className="bg-[#121212] rounded-3xl p-6 md:p-8 font-mono text-xs text-[#9E1B32] border-2 border-ignite-champagne/40 shadow-glow relative overflow-hidden min-h-[260px] flex flex-col justify-between">
        {/* Laser line scanner animation */}
        <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-transparent via-[#9E1B32] to-transparent animate-scan-line z-10" />
        
        <div className="flex justify-between items-start border-b border-white/5 pb-4 mb-4">
          <div className="text-[8px] font-black text-slate-500 uppercase tracking-widest">IGNITE Operations Console</div>
          <span className="text-[8px] font-bold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 uppercase tracking-widest animate-pulse">
            Terminal Active
          </span>
        </div>

        <div className="space-y-2 mb-8">
          <p className="text-[#7C1327]/40 text-[9px]"># INITIALIZING AMRITA OPERATIONS SECURE GATEWAY...</p>
          <p className="text-[#7C1327]/60 text-[9px]"># READY FOR PASSING CREDENTIAL INPUT. WAITING FOR QR SCAN...</p>
        </div>

        <form onSubmit={handleScan} className="flex items-center gap-3 relative z-10 border-b border-[#9E1B32]/20 pb-2.5">
          <span className="text-ignite-accent font-black animate-pulse text-base">{'>'}</span>
          <input
            value={ticketId}
            onChange={e => setTicketId(e.target.value)}
            placeholder="Place cursor here & scan pass code..."
            className="flex-1 bg-transparent border-none outline-none text-[#9E1B32] placeholder-slate-700 text-xs font-mono font-bold"
            autoFocus
            id="scanner-input"
            autoComplete="off"
          />
          <button type="submit" className="text-white border border-[#9E1B32]/30 bg-[#9E1B32]/15 rounded-lg px-4 py-1.5 text-[9px] font-bold uppercase hover:bg-[#9E1B32]/25 transition-all">[ENTER]</button>
        </form>

        <div className="min-h-[40px] pt-4">
          {loading && <p className="text-amber-500 animate-pulse font-bold">Verifying database records...</p>}
          {result && (
            <p className={`font-bold text-xs ${result.ok ? 'text-emerald-400' : 'text-red-400'}`}>
              {result.message}
            </p>
          )}
        </div>

        <div className="text-[9px] text-slate-500 mt-6 border-t border-white/5 pt-4">Scanned passes today: {registrations.filter(r => r.attended || r.attendance === 'present').length} successful check-ins</div>
      </div>

      {/* Recents list */}
      <div className="bg-white border border-ignite-champagne rounded-3xl overflow-hidden shadow-soft">
        <div className="px-6 py-4.5 border-b border-ignite-champagne bg-ignite-secondary/40">
          <p className="text-[10px] font-bold text-ignite-text uppercase tracking-widest">Attendance Activity Registry</p>
        </div>
        <div className="divide-y divide-ignite-champagne/40 max-h-64 overflow-y-auto">
          {registrations.filter(r => r.attended || r.attendance === 'present').length === 0 ? (
            <p className="text-center py-10 text-xs text-ignite-muted font-bold">No access checks logged today</p>
          ) : (
            registrations.filter(r => r.attended || r.attendance === 'present').map(r => {
              const ev = events.find(e => e.id === r.eventId);
              return (
                <div key={r.id} className="px-6 py-4 flex items-center justify-between text-xs transition-colors hover:bg-[#FAF9F6]/50">
                  <div className="flex items-center gap-3.5">
                    <CheckCircle className="h-5 w-5 text-emerald-500 shrink-0" />
                    <div>
                      <p className="font-bold text-ignite-text uppercase tracking-wider">{r.name || r.studentName}</p>
                      <p className="text-[10px] text-ignite-muted font-mono mt-0.5">{r.ticketId} · {ev?.title}</p>
                    </div>
                  </div>
                  <span className="text-[9px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-100 px-3 py-0.5 rounded-full uppercase tracking-wider">Checked</span>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}

function AnnouncementManager() {
  const { announcements, addAnnouncement, deleteAnnouncement } = useData();
  const [form, setForm] = useState({ title: '', content: '' });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title || !form.content) return;
    setSaving(true);
    await new Promise(r => setTimeout(r, 400));
    addAnnouncement({
      ...form,
      date: new Date().toLocaleDateString('en-IN'),
      time: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
    });
    setForm({ title: '', content: '' });
    setSaving(false);
  };

  return (
    <div className="space-y-6">
      <SectionHeader title="Notice Publisher" sub="Post verified updates to the student tickers." />
      <form onSubmit={handleSubmit} className="bg-white border border-ignite-champagne rounded-3xl p-6 space-y-5 shadow-soft">
        <Input label="Notice Title" placeholder="e.g. Schedule Timing Adjustments" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required />
        <div>
          <label className="block text-[11px] font-bold text-ignite-muted uppercase tracking-wider mb-2">Notice details</label>
          <textarea value={form.content} onChange={e => setForm({ ...form, content: e.target.value })} rows={3} placeholder="Compose update..." required className="w-full border border-ignite-champagne rounded-xl text-xs font-medium text-ignite-text p-4 bg-[#FAF9F6] focus:border-ignite-accent outline-none resize-none transition-all" />
        </div>
        <Button type="submit" variant="accent" className="h-11 text-[10px] font-bold uppercase tracking-widest rounded-xl" icon={saving ? Loader2 : Bell} disabled={saving}>
          {saving ? 'Publishing Notice...' : 'Publish Update'}
        </Button>
      </form>

      <div className="space-y-4">
        {announcements.map(a => (
          <div key={a.id} className="bg-white border border-ignite-champagne rounded-2xl p-5 flex items-start justify-between gap-4 shadow-soft">
            <div className="flex gap-3">
              <Bell className="h-5 w-5 text-ignite-accent shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-bold text-ignite-text uppercase tracking-wider">{a.title}</h4>
                <p className="text-[11px] text-ignite-muted mt-2 leading-relaxed font-semibold">{a.content}</p>
                <p className="text-[9px] font-mono text-ignite-muted mt-2.5 font-bold">{a.date} · {a.time}</p>
              </div>
            </div>
            <button onClick={() => deleteAnnouncement(a.id)} className="h-8 w-8 border border-red-200 rounded-xl flex items-center justify-center text-red-400 hover:bg-red-50 transition-all shrink-0">
              <Trash2 className="h-4.5 w-4.5" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function AdminDashboardView({ setView }) {
  const { user, events, registrations, leaderboard, addEvent, updateEvent, deleteEvent, logout } = useData();
  const [tab, setTab] = useState('overview');
  const [showForm, setShowForm] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  if (!user || user.role !== 'admin') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#FAF9F6]">
        <div className="h-16 w-16 bg-white border border-ignite-champagne rounded-full flex items-center justify-center mb-4 shadow-soft">
          <Shield className="h-8 w-8 text-ignite-accent/45" />
        </div>
        <h2 className="text-2xl font-bold font-display text-ignite-text">Administrative Access Required</h2>
        <Button onClick={() => setView('signin')} variant="accent" className="mt-4">Login</Button>
      </div>
    );
  }

  const totalRegs = registrations.length;
  const totalAttended = registrations.filter(r => r.attended || r.attendance === 'present').length;
  const openEvents = events.filter(e => e.status === 'Open').length;
  const sortedLB = [...leaderboard].sort((a, b) => b.points - a.points);

  const handleSaveEvent = (formData) => {
    if (editTarget) {
      updateEvent(editTarget.id, formData);
    } else {
      addEvent(formData);
    }
    setShowForm(false);
    setEditTarget(null);
  };

  const handleEdit = (ev) => {
    setEditTarget(ev);
    setShowForm(true);
    setTab('events');
  };

  const handleDelete = (id) => {
    deleteEvent(id);
    setDeleteConfirm(null);
  };

  const handleExportCSV = () => {
    const headers = ['Student Name', 'Register Number', 'Department', 'Year', 'Email', 'Phone', 'Event', 'Registration Date', 'Attendance Status'];
    const rows = registrations.map(r => [
      r.studentName,
      r.registerNum,
      r.department,
      r.year,
      r.email,
      r.phone,
      r.eventTitle,
      r.registrationDate,
      r.attended || r.attendance === 'present' ? 'Present' : 'Absent'
    ]);
    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(','), ...rows.map(e => e.map(val => `"${val}"`).join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `ignite2026_registrations_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const TABS = [
    { id: 'overview', label: 'Dashboard' },
    { id: 'events', label: 'Events CRUD' },
    { id: 'registrations', label: 'Registries' },
    { id: 'scanner', label: 'Verification Gate' },
    { id: 'announcements', label: 'Notices' },
  ];

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-[#FAF9F6] relative overflow-hidden"
    >
      {/* Background blobs */}
      <div className="bg-blob bg-blob-gold top-1/4 right-0 w-[450px] h-[450px]" />
      <div className="bg-blob bg-blob-champagne bottom-1/4 left-0 w-[450px] h-[450px]" />

      {/* Top Banner Nav */}
      <section className="bg-crimson-night text-white py-6 border-b border-ignite-accent/15 shadow-crimsonLift relative z-10 overflow-hidden">
        <img src="/amrita-emblem.svg" alt="" aria-hidden className="absolute -right-10 -top-14 w-56 h-56 opacity-[0.06] pointer-events-none" style={{ filter: 'brightness(0) invert(1)' }} />
        <div className="mx-auto max-w-7xl px-5 lg:px-8 flex items-center justify-between flex-wrap gap-4 relative">
          <div className="flex items-center gap-3.5">
            <div className="h-12 w-12 rounded-xl bg-white/10 flex items-center justify-center border border-white/15 shadow-glowCrimson p-2">
              <img src="/amrita-emblem.svg" alt="Amrita" className="h-full w-full object-contain" style={{ filter: 'brightness(0) invert(1)' }} draggable={false} />
            </div>
            <div>
              <p className="text-[8px] font-bold uppercase tracking-widest text-white/60 font-sans">Amrita Vishwa Vidyapeetham · Command Center</p>
              <h1 className="text-sm font-bold text-white leading-tight uppercase font-display tracking-widest mt-0.5">IGNITE Operations</h1>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-xs text-slate-400 font-bold tracking-wider uppercase">{user.name}</span>
            <button 
              onClick={() => { logout(); setView('home'); }} 
              className="h-9.5 px-4.5 border border-slate-700 text-slate-300 hover:text-white hover:bg-slate-800 rounded-xl text-[9px] uppercase font-bold tracking-widest transition-all"
            >
              Exit Center
            </button>
          </div>
        </div>

        <div className="mx-auto max-w-7xl px-5 lg:px-8 mt-6 flex gap-6 overflow-x-auto border-t border-white/5 pt-5 scrollbar-thin">
          {TABS.map(t => (
            <button
              key={t.id}
              onClick={() => { setTab(t.id); setShowForm(false); setEditTarget(null); }}
              className={`text-[9px] font-bold uppercase tracking-widest py-2 px-1 border-b-2 transition-all shrink-0 ${
                tab === t.id ? 'border-white text-white font-black' : 'border-transparent text-white/50 hover:text-white/80'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </section>

      {/* Main Container */}
      <div className="mx-auto max-w-7xl px-5 lg:px-8 py-12 relative z-10">
        
        {/* OVERVIEW TAB */}
        {tab === 'overview' && (
          <div className="space-y-8">
            <SectionHeader title="Operations Overview" sub="Live credentials registry statistics." />
            
            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { icon: Calendar, label: 'Total Events', value: events.length, text: 'text-ignite-accent', bg: 'bg-[#9E1B32]/5' },
                { icon: Users, label: 'Registrations', value: totalRegs, text: 'text-ignite-primary', bg: 'bg-[#1E1E1E]/5' },
                { icon: CheckCircle, label: 'Checked In', value: totalAttended, text: 'text-emerald-600', bg: 'bg-emerald-50' },
                { icon: Calendar, label: 'Open Registers', value: openEvents, text: 'text-[#7C1327]', bg: 'bg-[#7C1327]/5' },
              ].map(({ icon: Icon, label, value, text, bg }) => (
                <div key={label} className="bg-white border border-ignite-champagne rounded-2xl p-5 shadow-soft hover-lift-sm transition-all duration-300">
                  <div className={`h-9 w-9 rounded-xl ${bg} border border-ignite-champagne/40 flex items-center justify-center mb-4 text-ignite-accent shrink-0`}>
                    <Icon className={`h-5 w-5 ${text}`} />
                  </div>
                  <p className="text-2xl font-black text-ignite-text leading-tight">{value}</p>
                  <p className="text-[9px] font-bold uppercase tracking-widest text-ignite-muted mt-1.5">{label}</p>
                </div>
              ))}
            </div>

            {/* Actions Quick grid */}
            <div className="grid md:grid-cols-3 gap-5">
              <button 
                onClick={() => { setTab('events'); setShowForm(true); }} 
                className="border border-dashed border-ignite-champagne bg-white rounded-3xl p-6.5 text-center hover:border-ignite-accent/80 hover:bg-[#FAF9F6] hover:shadow-soft transition-all group duration-300"
              >
                <Plus className="h-6.5 w-6.5 text-ignite-muted group-hover:text-ignite-accent mx-auto mb-2 transition-colors" />
                <p className="text-[10px] font-bold text-ignite-text uppercase tracking-widest">Create New Event</p>
                <p className="text-[9px] text-ignite-muted mt-1.5 leading-normal font-semibold">Publish new program details to directory</p>
              </button>
              
              <button 
                onClick={() => setTab('scanner')} 
                className="border border-ignite-champagne rounded-3xl p-6.5 text-center hover:border-ignite-accent/80 bg-white hover:shadow-soft transition-all duration-300"
              >
                <ScanLine className="h-6.5 w-6.5 text-ignite-accent mx-auto mb-2" />
                <p className="text-[10px] font-bold text-ignite-text uppercase tracking-widest">Access Scan Gate</p>
                <p className="text-[9px] text-ignite-muted mt-1.5 leading-normal font-semibold">Verify student entrance pass QR codes</p>
              </button>
              
              <button 
                onClick={() => setTab('announcements')} 
                className="border border-ignite-champagne rounded-3xl p-6.5 text-center hover:border-ignite-accent/80 bg-white hover:shadow-soft transition-all duration-300"
              >
                <Bell className="h-6.5 w-6.5 text-ignite-accent mx-auto mb-2" />
                <p className="text-[10px] font-bold text-ignite-text uppercase tracking-widest">Broadcast Notice</p>
                <p className="text-[9px] text-ignite-muted mt-1.5 leading-normal font-semibold">Post news updates directly to student dashboards</p>
              </button>
            </div>

            {/* Department standings summary */}
            <div className="bg-white border border-ignite-champagne rounded-3xl overflow-hidden shadow-soft">
              <div className="px-6 py-4.5 border-b border-ignite-champagne bg-[#FAF9F6]/60 flex justify-between items-center">
                <h3 className="font-display font-bold text-xs text-ignite-text uppercase tracking-widest">Standings Leaderboard</h3>
                <Trophy className="h-4.5 w-4.5 text-ignite-accent" />
              </div>
              <div className="divide-y divide-ignite-champagne/40">
                {sortedLB.slice(0, 5).map((dep, idx) => (
                  <div key={dep.dept} className="px-6 py-4 flex items-center justify-between text-xs font-semibold hover:bg-[#FAF9F6]/30 transition-colors">
                    <div className="flex items-center gap-3">
                      <span className="font-black text-ignite-muted w-5">#{idx + 1}</span>
                      <span className="text-ignite-text uppercase tracking-wider">{dep.dept} department</span>
                    </div>
                    <span className="font-black text-ignite-accent">{dep.points} pts</span>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

        {/* EVENTS CRUD TAB */}
        {tab === 'events' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <SectionHeader title="Catalogue Manager" sub={`${events.length} programs registered`} />
              {!showForm && (
                <Button onClick={() => { setEditTarget(null); setShowForm(true); }} variant="accent" icon={Plus} className="h-11 text-[9px] font-bold uppercase tracking-widest rounded-xl">
                  Add Event
                </Button>
              )}
            </div>

            <AnimatePresence>
              {showForm && (
                <EventForm
                  initial={editTarget || {}}
                  onSave={handleSaveEvent}
                  onCancel={() => { setShowForm(false); setEditTarget(null); }}
                />
              )}
            </AnimatePresence>

            <div className="space-y-4">
              {events.map(ev => (
                <div key={ev.id} className="bg-white border border-ignite-champagne rounded-2xl px-6 py-5 flex items-center justify-between gap-4 shadow-soft hover:border-ignite-accent/30 transition-all duration-300">
                  <div>
                    <div className="flex items-center gap-3 flex-wrap">
                      <h4 className="font-bold text-sm text-ignite-text leading-snug">{ev.title}</h4>
                      <span className={`text-[8px] font-bold px-2.5 py-0.5 rounded uppercase tracking-wider ${
                        ev.status === 'Open' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                        ev.status === 'Closed' ? 'bg-red-50 text-red-600 border-red-100' :
                        'bg-[#FAF9F6] text-ignite-muted border border-ignite-champagne'
                      }`}>{ev.status}</span>
                    </div>
                    <p className="text-[10px] text-ignite-muted font-bold font-mono mt-1.5">{ev.date} · {ev.venue} · {ev.category} · {ev.seatsFilled}/{ev.maxSeats} slots filled</p>
                  </div>
                  
                  <div className="flex gap-2 shrink-0">
                    <button
                      onClick={() => handleEdit(ev)}
                      className="h-9 w-9 border border-ignite-champagne rounded-xl flex items-center justify-center text-ignite-muted hover:text-ignite-accent hover:border-ignite-accent/40 transition-all bg-[#FAF9F6] shadow-sm"
                    >
                      <Edit3 className="h-4 w-4" />
                    </button>
                    {deleteConfirm === ev.id ? (
                      <div className="flex items-center gap-1.5">
                        <button onClick={() => handleDelete(ev.id)} className="h-8 px-3 bg-red-650 text-white rounded-lg text-[9px] font-bold uppercase tracking-widest hover:bg-red-700">Confirm</button>
                        <button onClick={() => setDeleteConfirm(null)} className="h-8 px-3 bg-slate-100 text-ignite-muted rounded-lg text-[9px] font-bold uppercase tracking-widest hover:bg-slate-200">Exit</button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setDeleteConfirm(ev.id)}
                        className="h-9 w-9 border border-red-200 rounded-xl flex items-center justify-center text-red-400 hover:bg-red-50 transition-all bg-[#FAF9F6] shadow-sm"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* REGISTRATIONS REGISTRY TAB */}
        {tab === 'registrations' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <SectionHeader title="Registries Database" sub={`${totalRegs} credentials secured.`} />
              <button 
                onClick={handleExportCSV} 
                className="h-10 px-5 border border-ignite-champagne hover:bg-ignite-secondary text-ignite-primary rounded-xl text-[9px] uppercase font-bold tracking-widest transition-all flex items-center gap-2"
              >
                <FileSpreadsheet className="h-4 w-4" />
                Export CSV
              </button>
            </div>

            <div className="bg-white border border-ignite-champagne rounded-3xl overflow-hidden shadow-soft">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-[#FAF9F6]/80 border-b border-ignite-champagne text-[9px] font-black uppercase text-ignite-muted tracking-widest">
                      <th className="px-6 py-4.5">Student Name</th>
                      <th className="px-6 py-4.5">Register Num</th>
                      <th className="px-6 py-4.5">Dept / Year</th>
                      <th className="px-6 py-4.5">Event Track</th>
                      <th className="px-6 py-4.5">Pass Ticket ID</th>
                      <th className="px-6 py-4.5 text-center">Attendance</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-ignite-champagne/40 font-semibold">
                    {registrations.map(reg => {
                      const isAttended = reg.attended || reg.attendance === 'present';
                      return (
                        <tr key={reg.id} className="hover:bg-[#FAF9F6]/40 transition-all">
                          <td className="px-6 py-4 font-bold text-ignite-text uppercase tracking-wider">{reg.studentName}</td>
                          <td className="px-6 py-4 font-mono font-bold">{reg.registerNum}</td>
                          <td className="px-6 py-4">{reg.department} · Year {reg.year}</td>
                          <td className="px-6 py-4">{reg.eventTitle}</td>
                          <td className="px-6 py-4 font-mono text-slate-500 font-bold">{reg.ticketId}</td>
                          <td className="px-6 py-4 text-center">
                            {isAttended ? (
                              <span className="text-[8px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded uppercase tracking-wider">Present</span>
                            ) : (
                              <span className="text-[8px] font-bold text-slate-400 bg-slate-50 border border-slate-200 px-2.5 py-0.5 rounded uppercase tracking-wider">Absent</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                    {registrations.length === 0 && (
                      <tr>
                        <td colSpan="6" className="text-center py-12 text-xs text-ignite-muted font-bold">No student registrations logged in registries database.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* SCANNER VERIFICATION TAB */}
        {tab === 'scanner' && <ScannerTerminal />}

        {/* NOTICES MANAGER TAB */}
        {tab === 'announcements' && <AnnouncementManager />}

      </div>
    </motion.div>
  );
}
