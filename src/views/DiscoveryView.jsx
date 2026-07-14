import React, { useState, useMemo } from 'react';
import { useData } from '../context/DataContext';
import { EventCard } from './LandingView';
import { EmptyState } from '../components/ui';
import { seatInfo, isEventVisible } from '../components/eventUi';
import { Search, X, ChevronDown, SlidersHorizontal, CalendarSearch } from 'lucide-react';
import { motion } from 'framer-motion';

const SORTS = [
  { value: 'date-asc', label: 'Date · Earliest first' },
  { value: 'date-desc', label: 'Date · Latest first' },
  { value: 'seats', label: 'Most seats available' },
  { value: 'name', label: 'Title · A to Z' },
];

/* Preferred display order for status chips (only the ones present are shown). */
const STATUS_ORDER = ['Open', 'Almost Full', 'Upcoming', 'Closed', 'Completed'];

/* A compact native <select> styled to the Amrita system. */
function Select({ label, value, onChange, options }) {
  return (
    <div className="relative">
      <span className="sr-only">{label}</span>
      <select
        aria-label={label}
        value={value}
        onChange={onChange}
        className="h-10 w-full cursor-pointer appearance-none rounded-xl border border-amrita-line bg-white pl-3.5 pr-9 text-[12.5px] font-semibold text-amrita-ink shadow-xs outline-none transition-colors hover:border-amrita-slate/40 focus-visible:border-amrita-maroon focus-visible:ring-2 focus-visible:ring-amrita-maroon/15"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-amrita-faint" aria-hidden />
    </div>
  );
}

function Chip({ active, children, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`rounded-full border px-3.5 py-1.5 text-[12px] font-semibold transition-colors ${
        active
          ? 'border-amrita-maroon bg-amrita-maroon text-white shadow-xs'
          : 'border-amrita-line bg-white text-amrita-slate hover:border-amrita-maroon/40 hover:text-amrita-ink'
      }`}
    >
      {children}
    </button>
  );
}

export default function DiscoveryView({ setView }) {
  const { events: allEvents } = useData();
  // Public directory shows only events still open for registration (deadline
  // not passed). Past-deadline events drop off automatically.
  const events = useMemo(() => allEvents.filter(isEventVisible), [allEvents]);

  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('All');
  const [dept, setDept] = useState('All');
  const [status, setStatus] = useState('All');
  const [onlyAvailable, setOnlyAvailable] = useState(false);
  const [sort, setSort] = useState('date-asc');

  // Derive filter options from the live data so they always match reality.
  const categories = useMemo(
    () => ['All', ...Array.from(new Set(events.map((e) => e.category).filter(Boolean))).sort()],
    [events],
  );
  const departments = useMemo(
    () => ['All', ...Array.from(new Set(events.map((e) => e.department).filter(Boolean))).sort()],
    [events],
  );
  const statuses = useMemo(() => {
    const present = new Set(events.map((e) => e.status).filter(Boolean));
    return ['All', ...STATUS_ORDER.filter((s) => present.has(s))];
  }, [events]);

  const filtered = useMemo(() => {
    let list = [...events];

    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter((e) =>
        [e.title, e.department, e.venue, e.description, e.category, e.coordinator]
          .filter(Boolean)
          .some((f) => String(f).toLowerCase().includes(q)),
      );
    }

    if (category !== 'All') list = list.filter((e) => e.category === category);
    if (dept !== 'All') list = list.filter((e) => e.department === dept);
    if (status !== 'All') list = list.filter((e) => e.status === status);
    if (onlyAvailable) list = list.filter((e) => seatInfo(e).isOpen);

    list.sort((a, b) => {
      if (sort === 'date-asc') return new Date(a.date) - new Date(b.date);
      if (sort === 'date-desc') return new Date(b.date) - new Date(a.date);
      if (sort === 'seats') return seatInfo(b).seatsLeft - seatInfo(a).seatsLeft;
      if (sort === 'name') return (a.title || '').localeCompare(b.title || '');
      return 0;
    });

    return list;
  }, [events, query, category, dept, status, onlyAvailable, sort]);

  const activeFilters = [
    query.trim() !== '',
    category !== 'All',
    dept !== 'All',
    status !== 'All',
    onlyAvailable,
  ].filter(Boolean).length;

  const clearFilters = () => {
    setQuery('');
    setCategory('All');
    setDept('All');
    setStatus('All');
    setOnlyAvailable(false);
    setSort('date-asc');
  };

  return (
    <div className="min-h-screen bg-amrita-canvas">
      {/* ── Header / controls ─────────────────────────────── */}
      <section className="relative overflow-hidden border-b border-amrita-line bg-white">
        <div className="absolute inset-0 line-grid opacity-50" aria-hidden />
        <div className="absolute inset-x-0 top-0 h-px bg-amrita-maroon/40" aria-hidden />
        <div className="relative mx-auto max-w-7xl px-5 py-14 lg:px-8 lg:py-16">
          <span className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-amrita-maroon">
            <span className="h-1 w-1 rounded-full bg-amrita-maroon" />
            Amrita Vishwa Vidyapeetham · Events
          </span>
          <h1 className="mt-4 text-[2.1rem] font-extrabold leading-[1.05] tracking-tight text-amrita-ink sm:text-5xl">
            Discover programs
          </h1>
          <p className="mt-3 max-w-xl text-[14px] leading-relaxed text-amrita-slate">
            Browse and register for hackathons, workshops, cultural nights and more —
            every co-curricular experience across campus, in one directory.
          </p>

          {/* Search + sort */}
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-amrita-faint" aria-hidden />
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search events, venues, departments…"
                aria-label="Search events"
                className="h-11 w-full rounded-xl border border-amrita-line bg-white pl-10 pr-3.5 text-[13px] text-amrita-ink shadow-xs outline-none transition-colors placeholder:text-amrita-faint hover:border-amrita-slate/40 focus-visible:border-amrita-maroon focus-visible:ring-2 focus-visible:ring-amrita-maroon/15"
              />
            </div>
            <div className="sm:w-60">
              <Select
                label="Sort events"
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                options={SORTS}
              />
            </div>
          </div>

          {/* Category chips */}
          <div className="mt-5 flex flex-wrap gap-2">
            {categories.map((c) => (
              <Chip key={c} active={category === c} onClick={() => setCategory(c)}>
                {c === 'All' ? 'All categories' : c}
              </Chip>
            ))}
          </div>

          {/* Secondary controls */}
          <div className="mt-4 flex flex-wrap items-center gap-2.5 border-t border-amrita-lineSoft pt-4">
            <span className="hidden items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-amrita-faint sm:inline-flex">
              <SlidersHorizontal className="h-3.5 w-3.5" aria-hidden /> Refine
            </span>
            <div className="w-full sm:w-48">
              <Select
                label="Filter by department"
                value={dept}
                onChange={(e) => setDept(e.target.value)}
                options={departments.map((d) => ({ value: d, label: d === 'All' ? 'All departments' : d }))}
              />
            </div>
            <div className="w-full sm:w-44">
              <Select
                label="Filter by status"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                options={statuses.map((s) => ({ value: s, label: s === 'All' ? 'Any status' : s }))}
              />
            </div>
            <button
              type="button"
              onClick={() => setOnlyAvailable((v) => !v)}
              aria-pressed={onlyAvailable}
              className={`inline-flex h-10 items-center gap-2 rounded-xl border px-4 text-[12.5px] font-semibold transition-colors ${
                onlyAvailable
                  ? 'border-amrita-maroon bg-amrita-maroonSoft text-amrita-maroon'
                  : 'border-amrita-line bg-white text-amrita-slate hover:border-amrita-maroon/40 hover:text-amrita-ink'
              }`}
            >
              <span className={`grid h-4 w-4 place-items-center rounded-full border ${onlyAvailable ? 'border-amrita-maroon bg-amrita-maroon text-white' : 'border-amrita-line'}`}>
                {onlyAvailable && <span className="h-1.5 w-1.5 rounded-full bg-white" />}
              </span>
              Available only
            </button>

            {activeFilters > 0 && (
              <button
                type="button"
                onClick={clearFilters}
                className="inline-flex h-10 items-center gap-1.5 rounded-xl px-3 text-[12.5px] font-semibold text-amrita-muted transition-colors hover:text-amrita-maroon"
              >
                <X className="h-4 w-4" aria-hidden /> Clear ({activeFilters})
              </button>
            )}
          </div>
        </div>
      </section>

      {/* ── Results ───────────────────────────────────────── */}
      <section className="mx-auto max-w-7xl px-5 py-12 lg:px-8 lg:py-14">
        <p className="mb-6 text-[12px] font-semibold uppercase tracking-wider text-amrita-muted">
          Showing <span className="text-amrita-ink">{filtered.length}</span> of {events.length} {events.length === 1 ? 'program' : 'programs'}
        </p>

        {filtered.length === 0 ? (
          <div className="rounded-2xl border border-amrita-line bg-white shadow-xs">
            <EmptyState
              icon={CalendarSearch}
              title="No matching programs"
              hint="Try a different search term, or reset the filters to see the full catalogue."
              action={
                <button
                  onClick={clearFilters}
                  className="inline-flex items-center gap-2 rounded-xl bg-amrita-maroon px-4 py-2 text-[12px] font-semibold text-white transition-colors hover:bg-amrita-maroonDark"
                >
                  Reset filters
                </button>
              }
            />
          </div>
        ) : (
          <motion.div
            layout
            className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
          >
            {filtered.map((event, i) => (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: Math.min(i * 0.04, 0.3), ease: [0.16, 1, 0.3, 1] }}
              >
                <EventCard event={event} onView={() => setView(`eventDetail:${event.id}`)} />
              </motion.div>
            ))}
          </motion.div>
        )}
      </section>
    </div>
  );
}
