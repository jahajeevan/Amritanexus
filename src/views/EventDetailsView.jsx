import React, { useState, useMemo } from 'react';
import { useData } from '../context/DataContext';
import Button from '../components/Button';
import QRCodePass from '../components/QRCodePass';
import MapsEmbed from '../components/MapsEmbed';
import { EventCard, CountdownTimer } from './LandingView';
import { Badge, EmptyState } from '../components/ui';
import { statusBadgeClass, STATUS_TONE, seatInfo, formatEventDate, formatTime } from '../components/eventUi';
import {
  Calendar, MapPin, Clock, Users, ChevronLeft, ChevronRight, ChevronDown, Award,
  CheckCircle2, AlertCircle, Loader2, User, Mail, Phone, IdCard, GraduationCap,
  Info, ArrowUpRight, ArrowRight, ShieldCheck, Lock, Sparkles, HelpCircle, ListChecks,
  CalendarClock, Images, Map as MapIcon, FileText,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

/* ── helpers ─────────────────────────────────────────────── */

function parseRules(rules) {
  if (!rules) return [];
  return String(rules)
    .split(/\r?\n|(?:^|\s)\d+[.)]\s+/)
    .map((s) => s.replace(/^\d+[.)]\s*/, '').trim())
    .filter(Boolean);
}

function normalizeCoordinators(event) {
  if (Array.isArray(event.coordinators) && event.coordinators.length) return event.coordinators;
  if (event.coordinator) return [{ name: event.coordinator, role: 'Faculty Coordinator' }];
  return [];
}

const DEFAULT_FAQS = [
  { q: 'What do I need to carry for entry?', a: 'Bring your Amrita student ID card and the QR entry pass from your dashboard. Gate coordinators scan the QR to mark your attendance.' },
  { q: 'How is my attendance recorded?', a: 'Your pass QR is scanned at the venue gate. A verified check-in unlocks your participation certificate and adds credits to your department standing.' },
  { q: 'Can I cancel my registration?', a: 'Yes. Open the pass from your student dashboard and cancel it to release your seat for another student.' },
];

function normalizeFaqs(event) {
  if (Array.isArray(event.faqs) && event.faqs.length) {
    return event.faqs.map((f) => ({ q: f.q || f.question, a: f.a || f.answer })).filter((f) => f.q && f.a);
  }
  return DEFAULT_FAQS;
}

function SectionTitle({ icon: Icon, children, hint }) {
  return (
    <div className="mb-4">
      <h2 className="flex items-center gap-2 text-[13px] font-bold uppercase tracking-wide text-amrita-ink">
        {Icon && <Icon className="h-4 w-4 text-amrita-maroon" aria-hidden />}
        {children}
      </h2>
      {hint && <p className="mt-1 text-[12px] text-amrita-muted">{hint}</p>}
    </div>
  );
}

/* ── registration card (auth-gated, confirmation-based) ──── */

function RegistrationCard({ event, setView }) {
  const { user, registrations, registerForEvent } = useData();
  const [status, setStatus] = useState('idle'); // idle | loading | success | error
  const [message, setMessage] = useState('');
  const [ticket, setTicket] = useState(null);

  const { seatsLeft, isClosed } = seatInfo(event);

  const myReg = useMemo(() => {
    if (!user) return null;
    const reg = (user.rollNo || user.registerNum || '').toUpperCase();
    return registrations.find(
      (r) =>
        r.eventId === event.id &&
        r.status !== 'Cancelled' &&
        ((r.email && user.email && r.email.toLowerCase() === user.email.toLowerCase()) ||
          (reg && (r.registerNum || '').toUpperCase() === reg)),
    );
  }, [user, registrations, event.id]);

  const shell =
    'rounded-2xl border border-amrita-line bg-white shadow-xs';

  // Already registered (or just registered) → show the pass.
  const claimed = ticket || myReg;
  if (claimed) {
    return (
      <div className={`${shell} overflow-hidden`}>
        <div className="flex items-center gap-2.5 border-b border-amrita-lineSoft bg-emerald-50/60 px-5 py-4">
          <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600" aria-hidden />
          <div>
            <p className="text-[13px] font-bold text-emerald-800">Pass confirmed</p>
            <p className="font-mono text-[11px] text-emerald-700">ID: {claimed.ticketId || claimed.id}</p>
          </div>
        </div>
        <div className="p-5">
          <QRCodePass registration={claimed} />
          <button
            onClick={() => setView('dashboard')}
            className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-amrita-line py-2.5 text-[12.5px] font-semibold text-amrita-ink transition-colors hover:border-amrita-maroon hover:text-amrita-maroon"
          >
            View in my dashboard <ArrowRight className="h-4 w-4" aria-hidden />
          </button>
        </div>
      </div>
    );
  }

  // Anonymous visitor → auth gate.
  if (!user) {
    return (
      <div className={`${shell} p-6`}>
        <span className="grid h-11 w-11 place-items-center rounded-xl bg-amrita-maroonSoft text-amrita-maroon">
          <Lock className="h-5 w-5" aria-hidden />
        </span>
        <h3 className="mt-4 text-[15px] font-bold text-amrita-ink">Sign in to register</h3>
        <p className="mt-1.5 text-[12.5px] leading-relaxed text-amrita-muted">
          You can browse every detail freely. To claim an entry pass, sign in with your Amrita
          student email.
        </p>
        <Button onClick={() => setView('signin')} variant="primary" className="mt-5 h-11 w-full text-[13px]" icon={ArrowRight}>
          Sign in to register
        </Button>
        <p className="mt-3 text-center text-[11px] text-amrita-faint">
          Only official <span className="font-semibold text-amrita-slate">@cb.students.amrita.edu</span> accounts can register.
        </p>
      </div>
    );
  }

  // Signed in but registration is closed / full.
  if (isClosed) {
    return (
      <div className={`${shell} p-6`}>
        <span className="grid h-11 w-11 place-items-center rounded-xl bg-red-50 text-red-600">
          <AlertCircle className="h-5 w-5" aria-hidden />
        </span>
        <h3 className="mt-4 text-[15px] font-bold text-amrita-ink">Registration closed</h3>
        <p className="mt-1.5 text-[12.5px] leading-relaxed text-amrita-muted">
          {seatsLeft <= 0
            ? 'Every seat for this event has been claimed. Explore other open events across campus.'
            : 'Registration for this event is no longer open.'}
        </p>
        <Button onClick={() => setView('events')} variant="outline" className="mt-5 h-11 w-full text-[13px]" icon={ArrowRight}>
          Browse other events
        </Button>
      </div>
    );
  }

  // Signed in + open → confirmation screen (read-only profile).
  const registerNum = user.rollNo || user.registerNum || '—';
  const rows = [
    { icon: User, label: 'Name', value: user.name },
    { icon: Mail, label: 'University email', value: user.email },
    { icon: IdCard, label: 'Register number', value: registerNum, mono: true },
    { icon: GraduationCap, label: 'Department', value: user.department },
    { icon: CalendarClock, label: 'Academic year', value: user.year ? `Year ${user.year}` : '—' },
    { icon: Phone, label: 'Phone', value: user.phone || '—' },
  ];

  const handleConfirm = async () => {
    setStatus('loading');
    setMessage('');
    const res = await registerForEvent(
      {
        studentName: user.name,
        registerNum: user.rollNo || user.registerNum,
        department: user.department,
        year: user.year,
        email: user.email,
        phone: user.phone,
      },
      event.id,
    );
    if (res?.success) {
      setTicket(res.registration);
      setStatus('success');
    } else {
      setStatus('error');
      setMessage(res?.message || 'Registration could not be completed. Please try again.');
    }
  };

  return (
    <div className={`${shell} overflow-hidden`}>
      <div className="border-b border-amrita-lineSoft px-5 py-4">
        <h3 className="text-[14px] font-bold text-amrita-ink">Confirm your registration</h3>
        <p className="mt-0.5 text-[12px] text-amrita-muted">Your profile is pre-filled — just confirm to claim your pass.</p>
      </div>

      <dl className="divide-y divide-amrita-lineSoft px-5">
        {rows.map((r) => (
          <div key={r.label} className="flex items-center gap-3 py-3">
            <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-amrita-panel text-amrita-muted">
              <r.icon className="h-4 w-4" aria-hidden />
            </span>
            <div className="min-w-0 flex-1">
              <dt className="text-[10.5px] font-medium uppercase tracking-wide text-amrita-muted">{r.label}</dt>
              <dd className={`truncate text-[13px] font-semibold text-amrita-ink ${r.mono ? 'font-mono' : ''}`}>{r.value || '—'}</dd>
            </div>
          </div>
        ))}
      </dl>

      <div className="space-y-3 px-5 pb-5 pt-1">
        {status === 'error' && (
          <div className="flex items-start gap-2 rounded-xl border border-red-100 bg-red-50 p-3 text-[12px] font-semibold text-red-700">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-500" aria-hidden />
            <span>{message}</span>
          </div>
        )}
        <Button
          onClick={handleConfirm}
          variant="primary"
          disabled={status === 'loading'}
          className="h-12 w-full text-[13px]"
          icon={status === 'loading' ? Loader2 : CheckCircle2}
        >
          {status === 'loading' ? 'Claiming pass…' : 'Confirm & claim pass'}
        </Button>
        <p className="flex items-center justify-center gap-1.5 text-[11px] text-amrita-faint">
          <ShieldCheck className="h-3.5 w-3.5 text-amrita-maroon" aria-hidden />
          A QR entry pass is issued instantly on confirmation.
        </p>
      </div>
    </div>
  );
}

/* ── FAQ accordion ───────────────────────────────────────── */

function Faq({ q, a }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="rounded-xl border border-amrita-line bg-white">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex w-full items-center justify-between gap-3 px-4 py-3.5 text-left"
      >
        <span className="text-[13px] font-semibold text-amrita-ink">{q}</span>
        <ChevronDown className={`h-4 w-4 shrink-0 text-amrita-muted transition-transform ${open ? 'rotate-180' : ''}`} aria-hidden />
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden"
          >
            <p className="px-4 pb-4 text-[12.5px] leading-relaxed text-amrita-slate">{a}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ── tab bar ─────────────────────────────────────────────── */

function TabBar({ tabs, active, onSelect }) {
  return (
    <div className="flex gap-1 overflow-x-auto border-b border-amrita-lineSoft px-2" role="tablist">
      {tabs.map((t) => (
        <button
          key={t.id}
          role="tab"
          aria-selected={active === t.id}
          onClick={() => onSelect(t.id)}
          className={`inline-flex items-center gap-2 whitespace-nowrap border-b-2 px-3.5 py-3.5 text-[12.5px] font-semibold transition-colors ${
            active === t.id
              ? 'border-amrita-maroon text-amrita-maroon'
              : 'border-transparent text-amrita-muted hover:text-amrita-ink'
          }`}
        >
          <t.icon className="h-4 w-4" aria-hidden />
          {t.label}
        </button>
      ))}
    </div>
  );
}

/* ── main view ───────────────────────────────────────────── */

export default function EventDetailsView({ eventId, setView }) {
  const { events } = useData();
  const event = events.find((e) => e.id === eventId);
  const [tab, setTab] = useState('overview');

  if (!event) {
    return (
      <div className="grid min-h-[70vh] place-items-center bg-amrita-canvas px-5">
        <div className="text-center">
          <span className="mx-auto grid h-12 w-12 place-items-center rounded-xl bg-amrita-maroonSoft text-amrita-maroon">
            <AlertCircle className="h-6 w-6" aria-hidden />
          </span>
          <h1 className="mt-4 text-xl font-bold text-amrita-ink">Event not found</h1>
          <p className="mt-1 text-[13px] text-amrita-muted">This event may have been removed or the link is out of date.</p>
          <Button onClick={() => setView('events')} variant="outline" className="mt-5 h-10 text-[13px]" icon={ArrowRight}>
            Back to events
          </Button>
        </div>
      </div>
    );
  }

  const { seatsLeft, pct, isOpen } = seatInfo(event);
  const rules = parseRules(event.rules);
  const coordinators = normalizeCoordinators(event);
  const faqs = normalizeFaqs(event);
  const schedule = Array.isArray(event.schedule) ? event.schedule : [];
  const gallery = Array.isArray(event.gallery) ? event.gallery : [];

  const related = events
    .filter((e) => e.id !== event.id)
    .sort((a, b) => {
      const score = (e) => (e.category === event.category ? 2 : 0) + (e.department === event.department ? 1 : 0);
      return score(b) - score(a) || new Date(a.date) - new Date(b.date);
    })
    .slice(0, 3);

  const facts = [
    { icon: Calendar, label: 'Date', value: formatEventDate(event.date, { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' }) },
    { icon: Clock, label: 'Start time', value: formatTime(event.time) },
    { icon: MapPin, label: 'Venue', value: event.venue },
    { icon: Users, label: 'Capacity', value: `${event.maxSeats} seats` },
  ];

  const tabs = [
    { id: 'overview', label: 'Overview', icon: FileText },
    { id: 'schedule', label: 'Schedule', icon: CalendarClock },
    { id: 'gallery', label: 'Gallery', icon: Images },
    { id: 'location', label: 'Location', icon: MapIcon },
  ];

  return (
    <div className="min-h-screen bg-amrita-canvas">
      <div className="mx-auto max-w-7xl px-5 py-8 lg:px-8">
        <button
          onClick={() => setView('events')}
          className="inline-flex items-center gap-1.5 text-[12.5px] font-semibold text-amrita-muted transition-colors hover:text-amrita-maroon"
        >
          <ChevronLeft className="h-4 w-4" aria-hidden /> Back to events
        </button>

        <div className="mt-6 grid gap-6 lg:grid-cols-3">
          {/* ── main column ─────────────────────────────── */}
          <div className="space-y-6 lg:col-span-2">
            {/* hero */}
            <div className="overflow-hidden rounded-2xl border border-amrita-line bg-white shadow-xs">
              <div className="relative h-52 overflow-hidden border-b border-amrita-lineSoft bg-amrita-panel sm:h-64">
                {gallery[0] ? (
                  <img src={gallery[0].url} alt="" className="h-full w-full object-cover" />
                ) : (
                  <div className="dot-grid flex h-full w-full flex-col items-center justify-center">
                    <GraduationCap className="h-12 w-12 text-amrita-maroon/25" aria-hidden />
                    <span className="mt-2 text-[11px] font-semibold uppercase tracking-wider text-amrita-maroon/60">{event.category}</span>
                  </div>
                )}
                <span className={`absolute right-4 top-4 rounded-md border px-2.5 py-1 text-[11px] font-semibold shadow-xs ${statusBadgeClass(event.status)}`}>
                  {event.status}
                </span>
              </div>

              <div className="p-6 sm:p-7">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge tone="maroon">{event.category}</Badge>
                  <Badge>{event.department}</Badge>
                  <Badge tone={STATUS_TONE[event.status] || 'neutral'}>{event.status}</Badge>
                </div>
                <h1 className="mt-4 text-[1.9rem] font-extrabold leading-[1.1] tracking-tight text-amrita-ink sm:text-4xl">
                  {event.title}
                </h1>

                {/* seat bar + countdown */}
                <div className="mt-6 space-y-3 rounded-xl border border-amrita-line bg-amrita-canvas p-4">
                  <div className="flex items-center justify-between text-[12px] font-semibold">
                    <span className="flex items-center gap-1.5 text-amrita-slate">
                      <Users className="h-4 w-4 text-amrita-maroon" aria-hidden />
                      {isOpen ? `${seatsLeft} of ${event.maxSeats} seats left` : 'Registration closed'}
                    </span>
                    <span className="tabular-nums text-amrita-muted">{pct}% full</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-amrita-panel">
                    <div className="h-full rounded-full bg-amrita-maroon transition-all" style={{ width: `${pct}%` }} />
                  </div>
                  {isOpen && (
                    <div className="pt-1">
                      <CountdownTimer targetDate={event.date} targetTime={event.time} variant="blocks" />
                    </div>
                  )}
                </div>

                {/* quick facts */}
                <div className="mt-6 grid grid-cols-2 gap-4 border-t border-amrita-lineSoft pt-6 sm:grid-cols-4">
                  {facts.map((f) => (
                    <div key={f.label}>
                      <span className="grid h-9 w-9 place-items-center rounded-lg bg-amrita-maroonSoft text-amrita-maroon">
                        <f.icon className="h-4 w-4" aria-hidden />
                      </span>
                      <p className="mt-3 text-[10px] font-semibold uppercase tracking-wide text-amrita-muted">{f.label}</p>
                      <p className="mt-0.5 text-[12.5px] font-semibold text-amrita-ink">{f.value}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* tabbed content */}
            <div className="overflow-hidden rounded-2xl border border-amrita-line bg-white shadow-xs">
              <TabBar tabs={tabs} active={tab} onSelect={setTab} />

              <div className="p-6 sm:p-7">
                {tab === 'overview' && (
                  <div className="space-y-8">
                    <section>
                      <SectionTitle icon={Info}>About this event</SectionTitle>
                      <p className="text-[13.5px] leading-relaxed text-amrita-slate">
                        {event.description || 'No description has been provided for this event yet.'}
                      </p>
                    </section>

                    {rules.length > 0 && (
                      <section>
                        <SectionTitle icon={ListChecks}>Rules &amp; guidelines</SectionTitle>
                        <ul className="space-y-2.5">
                          {rules.map((rule, i) => (
                            <li key={i} className="flex gap-3">
                              <span className="grid h-5 w-5 shrink-0 place-items-center rounded-md bg-amrita-maroonSoft text-[10px] font-bold text-amrita-maroon">{i + 1}</span>
                              <span className="text-[13px] leading-relaxed text-amrita-slate">{rule}</span>
                            </li>
                          ))}
                        </ul>
                      </section>
                    )}

                    {event.prizes && (
                      <section className="rounded-xl border border-amrita-line bg-amrita-canvas p-5">
                        <SectionTitle icon={Award}>Prizes &amp; recognition</SectionTitle>
                        <p className="text-[13px] leading-relaxed text-amrita-slate">{event.prizes}</p>
                      </section>
                    )}

                    {coordinators.length > 0 && (
                      <section>
                        <SectionTitle icon={User}>Coordinators</SectionTitle>
                        <div className="grid gap-3 sm:grid-cols-2">
                          {coordinators.map((c, i) => (
                            <div key={i} className="rounded-xl border border-amrita-line bg-white p-4">
                              <p className="text-[13px] font-bold text-amrita-ink">{c.name}</p>
                              <p className="text-[11.5px] font-medium text-amrita-muted">{c.role || 'Faculty Coordinator'}</p>
                              {c.email && (
                                <p className="mt-2 flex items-center gap-2 text-[12px] text-amrita-slate">
                                  <Mail className="h-3.5 w-3.5 text-amrita-maroon" aria-hidden /> {c.email}
                                </p>
                              )}
                              {c.phone && (
                                <p className="mt-1 flex items-center gap-2 text-[12px] text-amrita-slate">
                                  <Phone className="h-3.5 w-3.5 text-amrita-maroon" aria-hidden /> {c.phone}
                                </p>
                              )}
                            </div>
                          ))}
                        </div>
                      </section>
                    )}

                    <section>
                      <SectionTitle icon={HelpCircle}>Frequently asked</SectionTitle>
                      <div className="space-y-2.5">
                        {faqs.map((f, i) => (
                          <Faq key={i} q={f.q} a={f.a} />
                        ))}
                      </div>
                    </section>
                  </div>
                )}

                {tab === 'schedule' && (
                  <div>
                    <SectionTitle icon={CalendarClock} hint="How the day unfolds, session by session.">
                      Schedule &amp; timeline
                    </SectionTitle>
                    {schedule.length > 0 ? (
                      <ol className="relative ml-2 space-y-6 border-l border-amrita-line pl-6">
                        {schedule.map((s, i) => (
                          <li key={i} className="relative">
                            <span className="absolute -left-[30px] top-1 grid h-3.5 w-3.5 place-items-center rounded-full border-2 border-amrita-maroon bg-white">
                              <span className="h-1 w-1 rounded-full bg-amrita-maroon" />
                            </span>
                            <span className="font-mono text-[11px] font-bold text-amrita-maroon">{s.time}</span>
                            <h4 className="mt-1 text-[13.5px] font-bold text-amrita-ink">{s.title}</h4>
                            {s.description && <p className="mt-1 text-[12.5px] leading-relaxed text-amrita-slate">{s.description}</p>}
                          </li>
                        ))}
                      </ol>
                    ) : (
                      <EmptyState icon={CalendarClock} title="Timeline coming soon" hint="Coordinators will publish the session-by-session schedule closer to the event date." />
                    )}
                  </div>
                )}

                {tab === 'gallery' && (
                  <div>
                    <SectionTitle icon={Images} hint="Moments from this event and past editions.">Gallery</SectionTitle>
                    {gallery.length > 0 ? (
                      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                        {gallery.map((img, i) => (
                          <figure key={i} className="group relative h-32 overflow-hidden rounded-xl border border-amrita-line bg-amrita-panel sm:h-40">
                            <img src={img.url} alt={img.caption || 'Event gallery image'} loading="lazy" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                            {img.caption && (
                              <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-3 text-[11px] font-semibold text-white opacity-0 transition-opacity group-hover:opacity-100">
                                {img.caption}
                              </figcaption>
                            )}
                          </figure>
                        ))}
                      </div>
                    ) : (
                      <EmptyState icon={Images} title="No photos yet" hint="Gallery images will appear here once coordinators upload them." />
                    )}
                  </div>
                )}

                {tab === 'location' && (
                  <div>
                    <SectionTitle icon={MapIcon} hint={`${event.venue} · Amrita Vishwa Vidyapeetham, Ettimadai, Coimbatore`}>
                      Directions &amp; map
                    </SectionTitle>
                    <MapsEmbed
                      mapsLink={event.mapsLink}
                      venueName={`${event.venue}, Amrita Vishwa Vidyapeetham, Ettimadai, Coimbatore`}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* ── sidebar ─────────────────────────────────── */}
          <aside className="lg:col-span-1">
            <div className="space-y-5 lg:sticky lg:top-24">
              <RegistrationCard event={event} setView={setView} />

              {event.points != null && (
                <div className="rounded-2xl border border-amrita-line bg-white p-5 shadow-xs">
                  <div className="flex items-center gap-2 text-amrita-maroon">
                    <Sparkles className="h-4 w-4" aria-hidden />
                    <span className="text-[11px] font-semibold uppercase tracking-wide">Participation credits</span>
                  </div>
                  <p className="mt-2 text-[26px] font-extrabold tracking-tight text-amrita-ink">
                    +{event.points} <span className="text-[13px] font-semibold text-amrita-muted">credits</span>
                  </p>
                  <p className="mt-1 text-[11.5px] leading-relaxed text-amrita-muted">
                    Credited to your department standing once your pass is scanned at the gate.
                  </p>
                </div>
              )}

              <div className="rounded-2xl border border-amrita-line bg-white p-5 shadow-xs">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-amrita-muted">At a glance</p>
                <dl className="mt-3 space-y-3">
                  {facts.map((f) => (
                    <div key={f.label} className="flex items-center gap-3">
                      <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-amrita-panel text-amrita-muted">
                        <f.icon className="h-4 w-4" aria-hidden />
                      </span>
                      <div className="min-w-0">
                        <dt className="text-[10.5px] font-medium uppercase tracking-wide text-amrita-muted">{f.label}</dt>
                        <dd className="truncate text-[12.5px] font-semibold text-amrita-ink">{f.value}</dd>
                      </div>
                    </div>
                  ))}
                </dl>
              </div>
            </div>
          </aside>
        </div>

        {/* ── related events ───────────────────────────── */}
        {related.length > 0 && (
          <section className="mt-14">
            <div className="flex items-end justify-between gap-4">
              <div>
                <span className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-amrita-maroon">
                  <span className="h-1 w-1 rounded-full bg-amrita-maroon" /> More on campus
                </span>
                <h2 className="mt-3 text-2xl font-bold tracking-tight text-amrita-ink">Related events</h2>
              </div>
              <button
                onClick={() => setView('events')}
                className="inline-flex shrink-0 items-center gap-1.5 text-[12.5px] font-semibold text-amrita-maroon hover:text-amrita-maroonDark"
              >
                View all <ChevronRight className="h-4 w-4" aria-hidden />
              </button>
            </div>
            <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((e) => (
                <EventCard key={e.id} event={e} onView={() => setView(`eventDetail:${e.id}`)} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
