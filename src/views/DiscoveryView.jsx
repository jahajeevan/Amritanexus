import React, { useState, useMemo } from 'react';
import { useData } from '../context/DataContext';
import { EventCard } from './LandingView';
import Input from '../components/Input';
import { Filter, Search, SlidersHorizontal, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const CATEGORIES = ['All', 'Technical', 'Hackathon', 'Workshop', 'Sports', 'Cultural', 'Music', 'Arts', 'Startup', 'Seminar', 'Gaming'];
const DEPARTMENTS = ['All Departments', 'Computer Science', 'Electronics', 'Mechanical', 'Civil', 'Chemical', 'Management', 'Arts & Science'];
const STATUSES = ['All Status', 'Open', 'Almost Full', 'Upcoming', 'Closed', 'Completed'];

export default function DiscoveryView({ setView }) {
  const { events } = useData();
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('All');
  const [dept, setDept] = useState('All Departments');
  const [status, setStatus] = useState('All Status');
  const [onlyAvailable, setOnlyAvailable] = useState(false);
  const [sort, setSort] = useState('date-asc');
  const [showFilters, setShowFilters] = useState(false);

  const filtered = useMemo(() => {
    let list = [...events];
    
    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter(e =>
        e.title?.toLowerCase().includes(q) ||
        e.department?.toLowerCase().includes(q) ||
        e.venue?.toLowerCase().includes(q) ||
        e.description?.toLowerCase().includes(q) ||
        e.category?.toLowerCase().includes(q)
      );
    }
    
    if (category !== 'All') list = list.filter(e => e.category === category);
    if (dept !== 'All Departments') list = list.filter(e => e.department === dept);
    if (status !== 'All Status') list = list.filter(e => e.status === status);
    
    if (onlyAvailable) {
      list = list.filter(e => {
        const seatsLeft = e.maxSeats - e.seatsFilled;
        return seatsLeft > 0 && e.status !== 'Closed';
      });
    }

    list.sort((a, b) => {
      if (sort === 'date-asc') return new Date(a.date) - new Date(b.date);
      if (sort === 'date-desc') return new Date(b.date) - new Date(a.date);
      if (sort === 'seats') return (b.maxSeats - b.seatsFilled) - (a.maxSeats - a.seatsFilled);
      if (sort === 'name') return a.title?.localeCompare(b.title);
      return 0;
    });

    return list;
  }, [events, query, category, dept, status, onlyAvailable, sort]);

  const clearFilters = () => {
    setQuery('');
    setCategory('All');
    setDept('All Departments');
    setStatus('All Status');
    setOnlyAvailable(false);
    setSort('date-asc');
  };

  const activeFilterCount = [
    category !== 'All',
    dept !== 'All Departments',
    status !== 'All Status',
    onlyAvailable === true,
    sort !== 'date-asc',
    query.trim() !== '',
  ].filter(Boolean).length;

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen bg-[#FAF9F6] relative overflow-hidden"
    >
      {/* Background blobs */}
      <div className="bg-blob bg-blob-gold top-0 right-0 w-[400px] h-[400px]" />
      <div className="bg-blob bg-blob-champagne bottom-1/3 left-0 w-[450px] h-[450px]" />

      {/* Header Banner */}
      <section className="bg-white border-b border-ignite-champagne/80 py-16 relative overflow-hidden">
        <div className="mx-auto max-w-7xl px-5 lg:px-8 relative z-10">
          <div className="mb-10 text-center md:text-left">
            <span className="text-[10px] font-bold uppercase tracking-widest text-ignite-crimson bg-ignite-crimson/[0.06] border border-ignite-crimson/20 px-3.5 py-1.5 rounded-full inline-block">
              Amrita Vishwa Vidyapeetham · Events
            </span>
            <h1 className="mt-4 text-4xl md:text-5xl font-display font-bold text-ignite-text leading-tight tracking-tight">
              Discover Programs
            </h1>
            <p className="text-xs text-ignite-muted mt-2 font-medium">
              Explore and register for <span className="text-ignite-text font-bold">{events.length}</span> active co-curricular experiences
            </p>
          </div>

          {/* Search controls */}
          <div className="flex flex-col sm:flex-row gap-4.5 items-stretch sm:items-center">
            <div className="flex-1 relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-ignite-muted pointer-events-none" />
              <Input
                placeholder="Search events, venues, department tracks..."
                value={query}
                onChange={e => setQuery(e.target.value)}
                className="pl-10 h-11 w-full"
              />
            </div>
            
            <div className="flex gap-3 shrink-0">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`h-11 px-6 border rounded-xl text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 transition-all duration-300 ${
                  showFilters || activeFilterCount > 0
                    ? 'bg-crimson-royal text-white border-ignite-crimson shadow-glowCrimson'
                    : 'border-ignite-champagne text-ignite-muted bg-white hover:border-ignite-accent hover:text-ignite-primary'
                }`}
              >
                <SlidersHorizontal className="h-4 w-4" />
                Filters
                {activeFilterCount > 0 && (
                  <span className="ml-1 bg-ignite-crimson text-white text-[8px] font-black h-4.5 w-4.5 rounded-full flex items-center justify-center border border-white/10">
                    {activeFilterCount}
                  </span>
                )}
              </button>

              {activeFilterCount > 0 && (
                <button
                  onClick={clearFilters}
                  className="h-11 px-5 flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-red-650 border border-red-200 rounded-xl bg-red-50 hover:bg-red-100/60 transition-all"
                >
                  <X className="h-4 w-4" />
                  Clear
                </button>
              )}
            </div>
          </div>

          {/* Collapsible Advanced Filters Drawer */}
          <AnimatePresence>
            {showFilters && (
              <motion.div 
                initial={{ opacity: 0, height: 0, marginTop: 0 }}
                animate={{ opacity: 1, height: 'auto', marginTop: 24 }}
                exit={{ opacity: 0, height: 0, marginTop: 0 }}
                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                className="p-6 rounded-2xl bg-white border border-ignite-champagne grid md:grid-cols-4 gap-5 overflow-hidden shadow-soft"
              >
                <div>
                  <label className="block text-[9px] font-bold uppercase tracking-widest text-ignite-muted mb-2 font-sans">Department</label>
                  <select
                    value={dept}
                    onChange={e => setDept(e.target.value)}
                    className="w-full h-11 border border-ignite-champagne rounded-xl text-xs font-bold text-ignite-text px-3 bg-[#FAF9F6] focus:border-ignite-accent outline-none transition-all"
                  >
                    {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-[9px] font-bold uppercase tracking-widest text-ignite-muted mb-2 font-sans">Registration Status</label>
                  <select
                    value={status}
                    onChange={e => setStatus(e.target.value)}
                    className="w-full h-11 border border-ignite-champagne rounded-xl text-xs font-bold text-ignite-text px-3 bg-[#FAF9F6] focus:border-ignite-accent outline-none transition-all"
                  >
                    {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-[9px] font-bold uppercase tracking-widest text-ignite-muted mb-2 font-sans">Sort Catalogue</label>
                  <select
                    value={sort}
                    onChange={e => setSort(e.target.value)}
                    className="w-full h-11 border border-ignite-champagne rounded-xl text-xs font-bold text-ignite-text px-3 bg-[#FAF9F6] focus:border-ignite-accent outline-none transition-all"
                  >
                    <option value="date-asc">Date: Earliest First</option>
                    <option value="date-desc">Date: Latest First</option>
                    <option value="seats">Seats Available</option>
                    <option value="name">Title: A to Z</option>
                  </select>
                </div>

                <div className="flex flex-col justify-end">
                  <label className="flex items-center gap-3.5 cursor-pointer py-2 text-xs font-bold text-ignite-text select-none">
                    <input
                      type="checkbox"
                      checked={onlyAvailable}
                      onChange={e => setOnlyAvailable(e.target.checked)}
                      className="h-5 w-5 rounded border-ignite-champagne text-ignite-accent focus:ring-ignite-accent/25 accent-ignite-accent bg-[#FAF9F6]"
                    />
                    <span className="text-[11px] uppercase tracking-wider font-bold">Hide Full / Closed</span>
                  </label>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Category selector capsules */}
          <div className="mt-8 flex flex-wrap gap-2">
            {CATEGORIES.map(c => (
              <button
                key={c}
                onClick={() => setCategory(c)}
                className={`px-5 py-2.5 rounded-full text-[9px] font-bold uppercase tracking-widest border transition-all duration-300 ${
                  category === c
                    ? 'bg-crimson-royal text-white border-ignite-crimson shadow-glowCrimson'
                    : 'bg-white border-ignite-champagne text-ignite-muted hover:border-ignite-accent hover:text-ignite-primary'
                }`}
              >
                {c}
              </button>
            ))}
          </div>

        </div>
      </section>

      {/* Directory Grid */}
      <section className="mx-auto max-w-7xl px-5 lg:px-8 py-16 relative z-10">
        {filtered.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-20 bg-white border border-ignite-champagne rounded-3xl p-8 shadow-soft"
          >
            <Filter className="h-10 w-10 text-ignite-accent/25 mx-auto" />
            <p className="mt-4 font-bold text-ignite-text text-base">No Matching Programs</p>
            <p className="text-xs text-ignite-muted mt-1 leading-normal">
              Adjust your search keywords or filter drawers and try again.
            </p>
            <button onClick={clearFilters} className="mt-5 text-xs font-bold uppercase tracking-wider text-ignite-accent hover:underline">
              Reset Catalogue Filters
            </button>
          </motion.div>
        ) : (
          <>
            <p className="text-[10px] text-ignite-muted font-bold mb-8 uppercase tracking-widest">
              Showing <span className="text-ignite-text font-black">{filtered.length}</span> of {events.length} programs
            </p>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {filtered.map(event => (
                <EventCard
                  key={event.id}
                  event={event}
                  onView={() => setView(`eventDetail:${event.id}`)}
                />
              ))}
            </div>
          </>
        )}
      </section>
    </motion.div>
  );
}
