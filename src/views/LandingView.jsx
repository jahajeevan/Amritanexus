import React, { useState, useEffect, useRef } from 'react';
import { useData } from '../context/DataContext';
import Button from '../components/Button';
import {
  Calendar, MapPin, Users, ArrowRight, ChevronRight, QrCode, Award, ShieldCheck,
  Trophy, LayoutDashboard, ScanLine, CheckCircle2, Clock, GraduationCap, UserPlus,
  Code2, FlaskConical, Music4, Rocket, Lightbulb, Users2, CalendarCheck,
} from 'lucide-react';
import { motion, useInView } from 'framer-motion';

/* ─────────────────────────── shared utilities ─────────────────────────── */

function AnimatedCounter({ value, duration = 1400 }) {
  const [n, setN] = useState(0);
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-40px' });
  const target = parseInt(String(value).replace(/[^\d]/g, '')) || 0;
  const suffix = String(value).replace(/[\d,]/g, '');

  useEffect(() => {
    if (!inView) return;
    let raf;
    const start = performance.now();
    const tick = (now) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      setN(Math.round(target * eased));
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, target, duration]);

  return (
    <span ref={ref} className="tabular-nums">
      {n.toLocaleString('en-IN')}{suffix}
    </span>
  );
}

export function CountdownTimer({ targetDate, targetTime }) {
  const [t, setT] = useState({});
  useEffect(() => {
    const calc = () => {
      const target = new Date(`${targetDate}T${targetTime || '00:00'}:00`);
      const diff = target - new Date();
      if (diff <= 0) return setT({ over: true });
      setT({
        d: Math.floor(diff / 86400000),
        h: Math.floor((diff % 86400000) / 3600000),
        m: Math.floor((diff % 3600000) / 60000),
      });
    };
    calc();
    const id = setInterval(calc, 30000);
    return () => clearInterval(id);
  }, [targetDate, targetTime]);

  if (t.over) return null;
  return (
    <div className="inline-flex items-center gap-2 rounded-lg bg-amrita-panel border border-amrita-line px-2.5 py-1">
      <Clock className="h-3 w-3 text-amrita-maroon" />
      <span className="text-[11px] font-semibold text-amrita-slate tabular-nums">
        {t.d}d {t.h}h {t.m}m to go
      </span>
    </div>
  );
}

const statusStyle = {
  Open: 'text-emerald-700 bg-emerald-50 border-emerald-200',
  'Almost Full': 'text-amber-700 bg-amber-50 border-amber-200',
  Closed: 'text-red-700 bg-red-50 border-red-200',
  Upcoming: 'text-amrita-maroon bg-amrita-maroonSoft border-amrita-maroon/20',
  Completed: 'text-slate-600 bg-slate-50 border-slate-200',
};

export function EventCard({ event, onView }) {
  const seatsLeft = Math.max(0, event.maxSeats - event.seatsFilled);
  const pct = Math.min(100, Math.round((event.seatsFilled / event.maxSeats) * 100));
  const open = event.status !== 'Closed' && event.status !== 'Completed';

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-2xl border border-amrita-line bg-white shadow-xs hover-lift-sm">
      <div className="relative h-40 overflow-hidden border-b border-amrita-lineSoft bg-amrita-panel">
        {event.gallery?.[0] ? (
          <img src={event.gallery[0].url} alt="" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
        ) : (
          <div className="dot-grid flex h-full w-full items-center justify-center">
            <GraduationCap className="h-9 w-9 text-amrita-maroon/25" />
          </div>
        )}
        <span className={`absolute right-3 top-3 rounded-md border px-2 py-0.5 text-[10px] font-semibold ${statusStyle[event.status] || statusStyle.Open}`}>
          {event.status}
        </span>
      </div>

      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-center gap-2 text-[11px] font-semibold">
          <span className="text-amrita-maroon">{event.category}</span>
          <span className="text-amrita-faint">·</span>
          <span className="text-amrita-muted">{event.department}</span>
        </div>
        <h3 className="mt-1.5 text-[15px] font-bold leading-snug tracking-tight text-amrita-ink line-clamp-2">
          {event.title}
        </h3>

        <div className="mt-4 grid grid-cols-2 gap-2 text-[12px] text-amrita-slate">
          <span className="flex items-center gap-1.5"><Calendar className="h-3.5 w-3.5 text-amrita-faint" />{event.date}</span>
          <span className="flex items-center gap-1.5 truncate"><MapPin className="h-3.5 w-3.5 text-amrita-faint" />{event.venue}</span>
        </div>

        <div className="mt-4">
          <div className="h-1.5 overflow-hidden rounded-full bg-amrita-panel">
            <div className="h-full rounded-full bg-amrita-maroon transition-all" style={{ width: `${pct}%` }} />
          </div>
          <div className="mt-1.5 flex items-center justify-between text-[11px] font-medium text-amrita-muted">
            <span className="flex items-center gap-1"><Users className="h-3 w-3" />{seatsLeft} seats left</span>
            <span>{pct}% full</span>
          </div>
        </div>

        <div className="mt-auto flex items-center justify-between gap-3 pt-5">
          {open ? <CountdownTimer targetDate={event.date} targetTime={event.time} /> : <span />}
          <button
            onClick={onView}
            className="inline-flex items-center gap-1 text-[12px] font-semibold text-amrita-maroon transition-colors hover:text-amrita-maroonDark"
          >
            {open ? 'Register' : 'Details'} <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </article>
  );
}

/* ─────────────────────────── section primitives ─────────────────────────── */

function Eyebrow({ children }) {
  return (
    <span className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-amrita-maroon">
      <span className="h-1 w-1 rounded-full bg-amrita-maroon" />
      {children}
    </span>
  );
}

function Reveal({ children, delay = 0, className = '' }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.5, delay, ease: [0.16, 1, 0.3, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* Hero product preview — a clean digital entry pass (communicates the product). */
function EntryPassPreview() {
  return (
    <div className="relative">
      <div className="absolute -inset-6 dot-grid opacity-70" aria-hidden />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1], delay: 0.15 }}
        className="relative mx-auto w-full max-w-sm overflow-hidden rounded-2xl border border-amrita-line bg-white shadow-lg"
      >
        <div className="flex items-center justify-between bg-crimson-night px-5 py-4 text-white">
          <div className="flex items-center gap-2.5">
            <img src="/amrita-emblem.svg" alt="" className="h-7 w-7" style={{ filter: 'brightness(0) invert(1)' }} />
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-white/60">Entry Pass</p>
              <p className="text-[12px] font-bold">IGNITE 2026</p>
            </div>
          </div>
          <span className="rounded-md bg-emerald-500/20 px-2 py-0.5 text-[10px] font-semibold text-emerald-300 ring-1 ring-emerald-400/30">Verified</span>
        </div>

        <div className="flex gap-4 p-5">
          <div className="grid h-24 w-24 shrink-0 grid-cols-6 grid-rows-6 gap-[3px] rounded-lg border border-amrita-line bg-white p-2">
            {Array.from({ length: 36 }).map((_, i) => (
              <span key={i} className="rounded-[1px]" style={{ background: [0, 1, 5, 6, 7, 11, 12, 14, 18, 21, 22, 24, 27, 29, 30, 33, 35, 8, 16, 19, 25].includes(i) ? '#16181D' : 'transparent' }} />
            ))}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-[14px] font-bold text-amrita-ink">Jaha Jeevan</p>
            <p className="text-[11px] font-medium text-amrita-muted">CB.EN.U4CSE23045</p>
            <div className="mt-3 space-y-1.5 text-[11px]">
              <p className="flex items-center gap-1.5 text-amrita-slate"><CalendarCheck className="h-3.5 w-3.5 text-amrita-maroon" />CodeStorm Hackathon</p>
              <p className="flex items-center gap-1.5 text-amrita-slate"><MapPin className="h-3.5 w-3.5 text-amrita-maroon" />Tech Arena · Gate 1</p>
            </div>
          </div>
        </div>
        <div className="flex items-center justify-between border-t border-amrita-lineSoft px-5 py-3">
          <span className="font-mono text-[10px] text-amrita-faint">TKT-284613-902</span>
          <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-600"><CheckCircle2 className="h-3.5 w-3.5" />Attendance marked</span>
        </div>
      </motion.div>
    </div>
  );
}

/* ─────────────────────────── the homepage ─────────────────────────── */

export default function LandingView({ setView }) {
  const { events, leaderboard, user } = useData();
  const board = [...leaderboard].sort((a, b) => b.points - a.points);
  const upcoming = [...events].sort((a, b) => new Date(a.date) - new Date(b.date)).slice(0, 3);

  const capabilities = [
    { icon: CalendarCheck, label: 'Event Registration' },
    { icon: QrCode, label: 'QR Entry Passes' },
    { icon: Award, label: 'Digital Certificates' },
    { icon: LayoutDashboard, label: 'Student Dashboard' },
    { icon: ScanLine, label: 'Faculty Verification' },
    { icon: Trophy, label: 'Department Leaderboards' },
  ];

  const stats = [
    { value: `${events.length}`, label: 'Active Events' },
    { value: '1,240+', label: 'Registered Students' },
    { value: `${leaderboard.length}`, label: 'Departments' },
    { value: '950+', label: 'Certificates Issued' },
    { value: '2,100+', label: 'QR Passes Generated' },
    { value: '48', label: 'Faculty Coordinators' },
  ];

  const flow = [
    { icon: Calendar, t: 'Discover', d: 'Browse events' },
    { icon: UserPlus, t: 'Sign in', d: 'Verified account' },
    { icon: CalendarCheck, t: 'Register', d: 'Claim a seat' },
    { icon: QrCode, t: 'QR Pass', d: 'Wallet ready' },
    { icon: ScanLine, t: 'Verify', d: 'Faculty scan' },
    { icon: Trophy, t: 'Leaderboard', d: 'Credits added' },
    { icon: Award, t: 'Certificate', d: 'Auto-unlocked' },
  ];

  const why = [
    { icon: CalendarCheck, t: 'Centralized event management', d: 'Every hackathon, workshop and cultural night lives in one directory — no scattered forms or lost mailers.' },
    { icon: ShieldCheck, t: 'Verified participation', d: 'Email-verified accounts and cryptographic passes ensure every registration and check-in is genuine.' },
    { icon: QrCode, t: 'QR-based entry', d: 'Students carry a wallet pass; coordinators scan at the gate. Entry takes seconds, records are exact.' },
    { icon: Award, t: 'Automated certificates', d: 'Attendance verified at the gate unlocks an official, printable credential on the student dashboard.' },
    { icon: ScanLine, t: 'Faculty operations', d: 'Coordinators manage events, publish notices, scan attendance and export registries from one console.' },
    { icon: Trophy, t: 'Department competitions', d: 'Check-ins accrue credits that update live department standings — recognition students can see.' },
  ];

  const campus = [
    { icon: Code2, t: 'Hackathons' },
    { icon: FlaskConical, t: 'Research Symposiums' },
    { icon: Rocket, t: 'Entrepreneurship' },
    { icon: Lightbulb, t: 'Innovation Challenges' },
    { icon: Music4, t: 'Cultural Events' },
    { icon: GraduationCap, t: 'Technical Workshops' },
    { icon: Users2, t: 'Student Clubs' },
  ];

  return (
    <div className="bg-amrita-canvas">
      {/* ── HERO ─────────────────────────────────────────── */}
      <section className="relative overflow-hidden border-b border-amrita-line bg-white">
        <div className="absolute inset-0 line-grid opacity-60" aria-hidden />
        <div className="absolute inset-x-0 top-0 h-px bg-amrita-maroon/40" aria-hidden />
        <div className="relative mx-auto grid max-w-7xl items-center gap-14 px-5 py-20 lg:grid-cols-2 lg:px-8 lg:py-28">
          <div>
            <Reveal>
              <Eyebrow>Amrita Vishwa Vidyapeetham · IGNITE 2026</Eyebrow>
            </Reveal>
            <Reveal delay={0.05}>
              <h1 className="mt-5 text-[2.6rem] font-extrabold leading-[1.05] tracking-tightest text-amrita-ink sm:text-6xl">
                The official event<br />ecosystem of Amrita.
              </h1>
            </Reveal>
            <Reveal delay={0.1}>
              <p className="mt-6 max-w-xl text-[15px] leading-relaxed text-amrita-slate">
                One platform for the entire campus — discover and register for events, carry a QR
                entry pass, verify attendance, climb department leaderboards and earn official
                certificates. Built for the students, faculty and organisers of Amrita University.
              </p>
            </Reveal>

            <Reveal delay={0.15}>
              <div className="mt-8 flex flex-wrap gap-3">
                <Button onClick={() => setView('events')} variant="primary" className="h-11 px-6 text-[13px]" icon={ArrowRight}>
                  Explore Events
                </Button>
                <Button onClick={() => setView(user ? 'dashboard' : 'signin')} variant="secondary" className="h-11 px-6 text-[13px]">
                  {user ? 'My Dashboard' : 'Student Login'}
                </Button>
              </div>
            </Reveal>

            <Reveal delay={0.2}>
              <div className="mt-10 grid grid-cols-2 gap-x-6 gap-y-3 sm:grid-cols-3">
                {capabilities.map(({ icon: Icon, label }) => (
                  <div key={label} className="flex items-center gap-2.5 text-[12.5px] font-medium text-amrita-slate">
                    <span className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-amrita-maroonSoft text-amrita-maroon">
                      <Icon className="h-3.5 w-3.5" />
                    </span>
                    {label}
                  </div>
                ))}
              </div>
            </Reveal>
          </div>

          <div className="lg:pl-6">
            <EntryPassPreview />
          </div>
        </div>
      </section>

      {/* ── LIVE STATS ────────────────────────────────────── */}
      <section className="border-b border-amrita-line bg-white">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-px overflow-hidden px-5 md:grid-cols-3 lg:grid-cols-6 lg:px-8">
          {stats.map((s, i) => (
            <div key={s.label} className={`py-8 ${i !== 0 ? 'lg:border-l lg:border-amrita-lineSoft lg:pl-6' : 'lg:pl-0'}`}>
              <p className="text-[28px] font-extrabold tracking-tight text-amrita-ink">
                <AnimatedCounter value={s.value} />
              </p>
              <p className="mt-1 text-[11.5px] font-medium text-amrita-muted">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── ECOSYSTEM FLOW ────────────────────────────────── */}
      <section className="border-b border-amrita-line bg-amrita-canvas py-20 lg:py-24">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <Reveal className="max-w-2xl">
            <Eyebrow>How it works</Eyebrow>
            <h2 className="mt-4 text-3xl font-bold tracking-tight text-amrita-ink sm:text-4xl">
              One connected journey, end to end.
            </h2>
            <p className="mt-4 text-[15px] leading-relaxed text-amrita-slate">
              Amrita Nexus links every step of campus participation into a single verified pipeline —
              from discovering an event to unlocking a certificate.
            </p>
          </Reveal>

          <div className="mt-12 grid gap-3 sm:grid-cols-2 lg:grid-cols-7">
            {flow.map((s, i) => (
              <Reveal key={s.t} delay={i * 0.04}>
                <div className="relative flex h-full flex-col rounded-2xl border border-amrita-line bg-white p-5 shadow-xs">
                  <div className="flex items-center justify-between">
                    <span className="grid h-9 w-9 place-items-center rounded-lg bg-amrita-maroonSoft text-amrita-maroon">
                      <s.icon className="h-4 w-4" />
                    </span>
                    <span className="text-[11px] font-bold text-amrita-faint">0{i + 1}</span>
                  </div>
                  <p className="mt-4 text-[13px] font-bold text-amrita-ink">{s.t}</p>
                  <p className="mt-1 text-[11.5px] text-amrita-muted">{s.d}</p>
                  {i < flow.length - 1 && (
                    <ChevronRight className="absolute -right-2.5 top-1/2 hidden h-4 w-4 -translate-y-1/2 text-amrita-line lg:block" />
                  )}
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── UPCOMING EVENTS ───────────────────────────────── */}
      <section className="border-b border-amrita-line bg-white py-20 lg:py-24">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <Reveal>
              <Eyebrow>Upcoming</Eyebrow>
              <h2 className="mt-4 text-3xl font-bold tracking-tight text-amrita-ink sm:text-4xl">Events open for registration</h2>
            </Reveal>
            <Reveal>
              <button onClick={() => setView('events')} className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-amrita-maroon hover:text-amrita-maroonDark">
                View all events <ArrowRight className="h-4 w-4" />
              </button>
            </Reveal>
          </div>

          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {upcoming.map((event, i) => (
              <Reveal key={event.id} delay={i * 0.06}>
                <EventCard event={event} onView={() => setView(`eventDetail:${event.id}`)} />
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── WHY ───────────────────────────────────────────── */}
      <section className="border-b border-amrita-line bg-amrita-canvas py-20 lg:py-24">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <Reveal className="max-w-2xl">
            <Eyebrow>Why Amrita Nexus</Eyebrow>
            <h2 className="mt-4 text-3xl font-bold tracking-tight text-amrita-ink sm:text-4xl">
              Built for how a university actually runs events.
            </h2>
          </Reveal>

          <div className="mt-12 grid gap-px overflow-hidden rounded-2xl border border-amrita-line bg-amrita-line md:grid-cols-2 lg:grid-cols-3">
            {why.map((f, i) => (
              <Reveal key={f.t} delay={(i % 3) * 0.05} className="h-full">
                <div className="flex h-full flex-col bg-white p-7">
                  <span className="grid h-10 w-10 place-items-center rounded-xl bg-amrita-maroonSoft text-amrita-maroon">
                    <f.icon className="h-5 w-5" />
                  </span>
                  <h3 className="mt-5 text-[15px] font-bold tracking-tight text-amrita-ink">{f.t}</h3>
                  <p className="mt-2 text-[13px] leading-relaxed text-amrita-slate">{f.d}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── LEADERBOARD ───────────────────────────────────── */}
      <section className="border-b border-amrita-line bg-white py-20 lg:py-24">
        <div className="mx-auto grid max-w-7xl gap-12 px-5 lg:grid-cols-12 lg:px-8">
          <Reveal className="lg:col-span-4">
            <Eyebrow>Department standings</Eyebrow>
            <h2 className="mt-4 text-3xl font-bold tracking-tight text-amrita-ink sm:text-4xl">
              Live leaderboard.
            </h2>
            <p className="mt-4 text-[15px] leading-relaxed text-amrita-slate">
              Every verified check-in earns credits for a department. Standings update the moment a
              pass is scanned at the gate.
            </p>
            <Button onClick={() => setView('events')} variant="outline" className="mt-6 h-10 px-5 text-[13px]" icon={ArrowRight}>
              Join an event
            </Button>
          </Reveal>

          <div className="lg:col-span-8">
            <div className="divide-y divide-amrita-lineSoft overflow-hidden rounded-2xl border border-amrita-line bg-white">
              {board.slice(0, 5).map((d, i) => (
                <div key={d.dept} className="flex items-center gap-4 px-5 py-4">
                  <span className={`grid h-8 w-8 shrink-0 place-items-center rounded-lg text-[13px] font-bold ${i === 0 ? 'bg-amrita-maroon text-white' : 'bg-amrita-panel text-amrita-slate'}`}>
                    {i + 1}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-3">
                      <p className="truncate text-[13.5px] font-semibold text-amrita-ink">{d.dept}</p>
                      <p className="text-[13px] font-bold text-amrita-maroon">{d.points.toLocaleString('en-IN')} <span className="text-[11px] font-medium text-amrita-muted">credits</span></p>
                    </div>
                    <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-amrita-panel">
                      <motion.div
                        initial={{ width: 0 }}
                        whileInView={{ width: `${Math.round((d.points / (board[0]?.points || 1)) * 100)}%` }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.9, delay: i * 0.08, ease: [0.16, 1, 0.3, 1] }}
                        className="h-full rounded-full bg-amrita-maroon"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── CAMPUS LIFE ───────────────────────────────────── */}
      <section className="border-b border-amrita-line bg-amrita-canvas py-20 lg:py-24">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <Reveal className="max-w-2xl">
            <Eyebrow>Campus life · IGNITE 2026</Eyebrow>
            <h2 className="mt-4 text-3xl font-bold tracking-tight text-amrita-ink sm:text-4xl">
              Every corner of campus, in one calendar.
            </h2>
          </Reveal>

          <div className="mt-12 flex flex-wrap gap-3">
            {campus.map((c, i) => (
              <Reveal key={c.t} delay={i * 0.03}>
                <div className="flex items-center gap-2.5 rounded-xl border border-amrita-line bg-white px-4 py-3 shadow-xs hover-lift-sm">
                  <span className="grid h-8 w-8 place-items-center rounded-lg bg-amrita-maroonSoft text-amrita-maroon">
                    <c.icon className="h-4 w-4" />
                  </span>
                  <span className="text-[13px] font-semibold text-amrita-ink">{c.t}</span>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ─────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-crimson-night py-20 text-white lg:py-24">
        <div className="absolute inset-0 line-grid opacity-[0.08]" aria-hidden />
        <img src="/amrita-emblem.svg" alt="" aria-hidden className="pointer-events-none absolute -right-16 -top-10 h-72 w-72 opacity-[0.06]" style={{ filter: 'brightness(0) invert(1)' }} />
        <div className="relative mx-auto max-w-3xl px-5 text-center">
          <img src="/amrita-emblem.svg" alt="" className="mx-auto h-12 w-12" style={{ filter: 'brightness(0) invert(1)' }} />
          <h2 className="mt-6 text-3xl font-bold tracking-tight sm:text-4xl">Ready for IGNITE 2026?</h2>
          <p className="mx-auto mt-4 max-w-xl text-[15px] leading-relaxed text-white/65">
            Sign in with your Amrita student email, claim your first entry pass and start building your
            verified co-curricular record.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Button onClick={() => setView('signin')} variant="primary" className="h-11 bg-white px-6 text-[13px] text-amrita-ink hover:bg-white/90" icon={ArrowRight}>
              Get your entry pass
            </Button>
            <Button onClick={() => setView('events')} variant="outline" className="h-11 border-white/25 px-6 text-[13px] text-white hover:border-white hover:text-white hover:bg-white/10">
              Browse events
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
