import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import Button from '../components/Button';
import Input from '../components/Input';
import QRCodePass from '../components/QRCodePass';
import MapsEmbed from '../components/MapsEmbed';
import { CountdownTimer } from './LandingView';
import {
  Calendar, MapPin, Clock, Users, ChevronLeft, Tag, Award,
  CheckCircle, AlertCircle, Loader2, User, Mail, Phone,
  Info, ArrowUpRight, GraduationCap
} from 'lucide-react';
import { motion } from 'framer-motion';

const statusColors = {
  'Open': 'bg-emerald-50 text-emerald-700 border-emerald-200',
  'Almost Full': 'bg-amber-50 text-amber-700 border-amber-200',
  'Closed': 'bg-red-50 text-red-650 border-red-200',
  'Upcoming': 'bg-[#E8D8B5]/20 text-[#B8860B] border-ignite-champagne',
  'Completed': 'bg-[#F6F3EE] text-ignite-muted border-ignite-champagne',
};

function Tab({ id, label, active, onClick }) {
  return (
    <button
      onClick={() => onClick(id)}
      className={`text-[9px] font-bold uppercase tracking-widest py-4.5 px-3 border-b-2 transition-all whitespace-nowrap ${
        active
          ? 'border-ignite-crimson text-ignite-crimson font-black'
          : 'border-transparent text-ignite-muted hover:text-ignite-text'
      }`}
    >
      {label}
    </button>
  );
}

function RegistrationForm({ event }) {
  const { user, registerForEvent, registrations } = useData();
  const [form, setForm] = useState({ name: user?.name || '', email: user?.email || '', phone: user?.phone || '', rollNo: user?.rollNo || '', year: user?.year || 'III' });
  const [status, setStatus] = useState('idle'); // idle | success | error | loading
  const [message, setMessage] = useState('');
  const [ticket, setTicket] = useState(null);

  const existingReg = registrations.find(
    r => r.eventId === event.id && (r.email === form.email || (user && r.rollNo === user.rollNo))
  );

  const seatsLeft = event.maxSeats - event.seatsFilled;
  const isClosed = event.status === 'Closed' || seatsLeft <= 0;

  if (existingReg) {
    return (
      <div className="rounded-3xl border border-emerald-100 bg-emerald-50/20 p-6 flex flex-col items-center shadow-soft">
        <div className="flex items-center gap-2.5 mb-5 text-center">
          <CheckCircle className="h-5 w-5 text-emerald-600 shrink-0" />
          <div className="text-left">
            <p className="font-bold text-emerald-800 text-sm">Pass Claimed Successfully</p>
            <p className="text-[10px] text-emerald-650 font-mono mt-0.5">ID: {existingReg.ticketId}</p>
          </div>
        </div>
        <QRCodePass registration={existingReg} />
      </div>
    );
  }

  if (status === 'success' && ticket) {
    return (
      <div className="rounded-3xl border border-emerald-100 bg-emerald-50/20 p-6 flex flex-col items-center shadow-soft">
        <div className="flex items-center gap-2.5 mb-5 text-center">
          <CheckCircle className="h-5 w-5 text-emerald-600 shrink-0" />
          <div className="text-left">
            <p className="font-bold text-emerald-800 text-sm">Pass Claimed Successfully</p>
            <p className="text-[10px] text-emerald-650 font-mono mt-0.5">ID: {ticket.ticketId}</p>
          </div>
        </div>
        <QRCodePass registration={ticket} />
      </div>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    if (isClosed) return;
    
    if (!form.name || !form.email || !form.rollNo) {
      setStatus('error');
      setMessage('Please fill out all required fields.');
      return;
    }

    setStatus('loading');
    await new Promise(r => setTimeout(r, 600));

    const result = registerForEvent({
      studentName: form.name,
      registerNum: form.rollNo,
      department: user?.department || 'Computer Science',
      year: form.year,
      email: form.email,
      phone: form.phone,
    }, event.id);

    if (result.success) {
      setTicket(result.registration);
      setStatus('success');
    } else {
      setStatus('error');
      setMessage(result.message || 'Registration failed.');
    }
  };

  return (
    <div className="border border-ignite-champagne rounded-3xl p-6 bg-white shadow-soft">
      <h3 className="font-display font-bold text-ignite-text text-[10px] mb-5 uppercase tracking-widest">Registration Portal</h3>

      {isClosed ? (
        <div className="p-5 rounded-2xl bg-red-50 border border-red-100 text-center space-y-2.5">
          <AlertCircle className="h-5 w-5 text-red-500 mx-auto" />
          <p className="font-bold text-red-800 text-xs uppercase tracking-wider">Registration Closed</p>
          <p className="text-[10px] text-red-650 leading-normal font-bold">No additional seats available for this event.</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label="Student Name" placeholder="Rohan Sharma" icon={User} value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
          <Input label="University Email Address" type="email" placeholder="you@cb.students.amrita.edu" icon={Mail} value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required />
          
          <div className="grid grid-cols-2 gap-3">
            <Input label="Register Number" placeholder="CB.EN.U4CSE23001" value={form.rollNo} onChange={e => setForm({ ...form, rollNo: e.target.value })} required />
            <div>
              <label className="block text-[11px] font-bold text-ignite-muted uppercase tracking-wider mb-2">Academic Year</label>
              <select
                value={form.year}
                onChange={e => setForm({ ...form, year: e.target.value })}
                className="w-full h-11 border border-ignite-champagne rounded-xl text-xs font-bold text-ignite-text px-3 bg-[#FAF9F6] focus:border-ignite-accent outline-none transition-all"
              >
                {['I', 'II', 'III', 'IV'].map(yr => <option key={yr} value={yr}>{yr} Year</option>)}
              </select>
            </div>
          </div>

          <Input label="Contact Number" type="tel" placeholder="+91 XXXXX XXXXX" icon={Phone} value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />

          {status === 'error' && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-100 text-xs font-semibold text-red-700 flex items-center gap-2">
              <AlertCircle className="h-4.5 w-4.5 text-red-500 shrink-0" />
              <span>{message}</span>
            </div>
          )}

          <Button
            type="submit"
            variant="crimson"
            className="w-full h-12 text-[10px] font-bold uppercase tracking-widest mt-6 rounded-xl"
            disabled={status === 'loading'}
            icon={status === 'loading' ? Loader2 : CheckCircle}
          >
            {status === 'loading' ? 'Securing Seat...' : 'Claim Digital Pass'}
          </Button>
        </form>
      )}
    </div>
  );
}

export default function EventDetailsView({ eventId, setView }) {
  const { events } = useData();
  const event = events.find(e => e.id === eventId);
  const [tab, setTab] = useState('details');

  if (!event) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-[#FAF9F6]">
        <AlertCircle className="h-10 w-10 text-ignite-accent" />
        <p className="text-ignite-text font-bold">Event credentials not found</p>
        <Button onClick={() => setView('events')} variant="outline" icon={ChevronLeft}>Back to Events</Button>
      </div>
    );
  }

  const seatsLeft = event.maxSeats - event.seatsFilled;
  const pct = Math.round((event.seatsFilled / event.maxSeats) * 100);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="min-h-screen bg-[#FAF9F6] py-12 relative overflow-hidden"
    >
      {/* Background blobs */}
      <div className="bg-blob bg-blob-gold top-1/4 right-0 w-[450px] h-[450px]" />
      <div className="bg-blob bg-blob-champagne bottom-1/4 left-0 w-[450px] h-[450px]" />

      <div className="mx-auto max-w-7xl px-5 lg:px-8 relative z-10">
        
        {/* Navigation Breadcrumb */}
        <button 
          onClick={() => setView('events')} 
          className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-ignite-muted hover:text-ignite-accent mb-8 transition-all"
        >
          <ChevronLeft className="h-4 w-4" />
          Back to Events Directory
        </button>

        <div className="grid lg:grid-cols-3 gap-8">
          
          {/* Main Column */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Header info */}
            <div className="bg-white border border-ignite-champagne rounded-3xl overflow-hidden shadow-soft">
              <div className="h-64 bg-gradient-to-br from-[#FAF9F6] via-ignite-champagne to-white relative overflow-hidden flex items-center justify-center border-b border-ignite-champagne/40">
                {event.gallery && event.gallery[0] ? (
                  <img src={event.gallery[0].url} alt={event.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="flex flex-col items-center justify-center">
                    <GraduationCap className="h-16 w-16 text-ignite-accent/25" />
                    <span className="text-[10px] text-ignite-accent/50 font-bold uppercase tracking-wider mt-2.5">{event.category}</span>
                  </div>
                )}
                <span className={`absolute top-4 right-4 text-[10px] font-bold uppercase tracking-wider px-3.5 py-1 rounded border backdrop-blur-md ${statusColors[event.status] || statusColors['Open']}`}>
                  {event.status}
                </span>
              </div>

              <div className="p-6 md:p-8">
                <span className="text-[9px] font-bold uppercase tracking-widest text-ignite-crimson bg-ignite-crimson/[0.06] border border-ignite-crimson/20 px-3 py-1 rounded inline-block">
                  {event.category} · {event.department} Department
                </span>
                <h1 className="mt-4 text-3xl md:text-4xl font-display font-bold text-ignite-text leading-tight">{event.title}</h1>
                
                {event.status !== 'Closed' && event.status !== 'Completed' && (
                  <div className="mt-5">
                    <CountdownTimer targetDate={event.date} targetTime={event.time} />
                  </div>
                )}

                <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-5 border-t border-ignite-champagne/60 pt-8">
                  {[
                    { icon: Calendar, label: 'Event Date', value: event.date },
                    { icon: Clock, label: 'Start Time', value: event.time },
                    { icon: MapPin, label: 'Venue Location', value: event.venue },
                    { icon: Users, label: 'Max Seating', value: `${event.maxSeats} capacity` },
                  ].map(({ icon: Icon, label, value }) => (
                    <div key={label} className="text-left">
                      <div className="h-9 w-9 bg-white border border-ignite-champagne rounded-xl flex items-center justify-center mb-3.5 text-ignite-accent shadow-sm">
                        <Icon className="h-4.5 w-4.5" />
                      </div>
                      <p className="text-[8px] font-bold uppercase tracking-widest text-ignite-muted">{label}</p>
                      <p className="text-xs font-bold text-ignite-text mt-1">{value}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Layout tabs details */}
            <div className="bg-white border border-ignite-champagne rounded-3xl overflow-hidden shadow-soft">
              <div className="border-b border-ignite-champagne px-6 flex gap-6 overflow-x-auto bg-[#F6F3EE]/40">
                {[
                  { id: 'details', label: 'Program Details' },
                  { id: 'schedule', label: 'Timeline Timeline' },
                  { id: 'gallery', label: 'Event Gallery' },
                  { id: 'map', label: 'Directions & Map' },
                ].map(t => <Tab key={t.id} {...t} active={tab === t.id} onClick={setTab} />)}
              </div>

              <div className="p-6 md:p-8">
                {tab === 'details' && (
                  <div className="space-y-8">
                    <div>
                      <h2 className="text-[10px] font-bold uppercase tracking-widest text-ignite-text mb-3">About the Event</h2>
                      <p className="text-xs leading-relaxed text-ignite-muted font-semibold">{event.description || 'No description provided.'}</p>
                    </div>

                    {event.rules && (
                      <div>
                        <h2 className="text-[10px] font-bold uppercase tracking-widest text-ignite-text mb-4">Rules & Guidelines</h2>
                        <ul className="space-y-3.5 text-xs text-ignite-muted font-semibold">
                          {event.rules.split('\n').map((rule, idx) => (
                            <li key={idx} className="flex gap-3 items-start">
                              <span className="h-5 w-5 rounded bg-ignite-accent/10 text-[#B8860B] text-[9px] font-black flex items-center justify-center shrink-0 mt-0.5 border border-ignite-accent/20">{idx + 1}</span>
                              <span className="leading-relaxed pt-0.5">{rule}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {event.prizes && (
                      <div className="border border-ignite-champagne bg-ignite-secondary/40 rounded-2xl p-6 shadow-sm">
                        <div className="flex items-center gap-2.5 mb-3 text-ignite-accent">
                          <Award className="h-5 w-5" />
                          <h2 className="text-[10px] font-bold uppercase tracking-widest text-ignite-text">Prizes & Recognition</h2>
                        </div>
                        <p className="text-xs text-ignite-muted leading-relaxed font-semibold">{event.prizes}</p>
                      </div>
                    )}

                    {(event.coordinator || (event.coordinators && event.coordinators.length > 0)) && (
                      <div>
                        <h2 className="text-[10px] font-bold uppercase tracking-widest text-ignite-text mb-4">Coordinators Desk</h2>
                        <div className="grid md:grid-cols-2 gap-4">
                          {event.coordinators && event.coordinators.length > 0 ? (
                            event.coordinators.map((c, i) => (
                              <div key={i} className="p-5 border border-ignite-champagne rounded-2xl bg-[#FAF9F6] shadow-sm">
                                <p className="font-bold text-xs text-ignite-text uppercase tracking-wider">{c.name}</p>
                                {c.email && <p className="text-[10px] text-ignite-muted mt-2.5 flex items-center gap-2 font-semibold"><Mail className="h-4 w-4 text-ignite-accent" /> {c.email}</p>}
                                {c.phone && <p className="text-[10px] text-ignite-muted mt-1.5 flex items-center gap-2 font-semibold"><Phone className="h-4 w-4 text-ignite-accent" /> {c.phone}</p>}
                              </div>
                            ))
                          ) : (
                            <div className="p-5 border border-ignite-champagne rounded-2xl bg-[#FAF9F6] shadow-sm">
                              <p className="font-bold text-xs text-ignite-text uppercase tracking-wider">{event.coordinator}</p>
                              <p className="text-[10px] text-ignite-muted mt-1.5 font-semibold">Faculty Coordinator</p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {tab === 'schedule' && (
                  <div className="py-2">
                    {event.schedule && event.schedule.length > 0 ? (
                      <div className="relative pl-6 border-l border-ignite-accent/20 ml-2.5 space-y-6">
                        {event.schedule.map((sch, i) => (
                          <div key={i} className="relative">
                            <div className="absolute -left-[31px] top-1.5 h-3 w-3 rounded-full bg-white border-2 border-ignite-accent flex items-center justify-center shadow-soft">
                              <div className="h-1 w-1 rounded-full bg-ignite-accent" />
                            </div>
                            <span className="text-[9px] font-mono font-bold text-ignite-accent">{sch.time}</span>
                            <h4 className="text-xs font-bold text-ignite-text mt-1 uppercase tracking-wider">{sch.title}</h4>
                            {sch.description && <p className="text-xs text-ignite-muted leading-relaxed font-semibold mt-1">{sch.description}</p>}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <Info className="h-8 w-8 text-ignite-accent/20 mx-auto" />
                        <p className="text-xs text-ignite-muted font-bold mt-3">Timeline Under Verification</p>
                      </div>
                    )}
                  </div>
                )}

                {tab === 'gallery' && (
                  <div>
                    {event.gallery && event.gallery.length > 0 ? (
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {event.gallery.map((img, i) => (
                          <div key={i} className="group relative rounded-2xl overflow-hidden shadow-soft h-32 md:h-40 bg-[#FAF9F6] border border-ignite-champagne">
                            <img src={img.url} alt={img.caption || 'Gallery'} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                            {img.caption && (
                              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-3 text-white">
                                <span className="text-[10px] font-bold truncate">{img.caption}</span>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <Info className="h-8 w-8 text-ignite-accent/20 mx-auto" />
                        <p className="text-xs text-ignite-muted font-bold mt-3">No images posted in gallery yet</p>
                      </div>
                    )}
                  </div>
                )}

                {tab === 'map' && (
                  <div className="space-y-5">
                    <MapsEmbed venueName={`${event.venue}, Amrita Vishwa Vidyapeetham, Ettimadai, Coimbatore`} className="rounded-2xl overflow-hidden border border-ignite-champagne h-64 shadow-inner" />
                    {event.mapsLink && (
                      <a 
                        href={event.mapsLink} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-[9px] font-bold text-ignite-primary hover:text-white border border-ignite-champagne bg-[#F6F3EE] hover:bg-ignite-primary rounded-xl px-5 py-3 transition-all uppercase tracking-widest shadow-soft"
                      >
                        Navigate on Google Maps
                        <ArrowUpRight className="h-4 w-4 text-ignite-accent" />
                      </a>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar (Register Card) */}
          <div className="space-y-6">
            
            {/* Live Seating Metrics */}
            <div className="bg-white border border-ignite-champagne rounded-3xl p-6 shadow-soft">
              <div className="flex justify-between items-center mb-3">
                <span className="text-[9px] font-bold text-ignite-text uppercase tracking-widest">Seats Availability</span>
                <span className="text-xs font-black text-ignite-accent">{seatsLeft} / {event.maxSeats}</span>
              </div>
              
              <div className="h-1.5 rounded-full bg-ignite-secondary border border-ignite-champagne/20 overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-[#B8860B] to-[#D4AF37] transition-all duration-700"
                  style={{ width: `${pct}%` }}
                />
              </div>

              <p className="text-[9px] font-bold text-ignite-muted mt-2 text-right">{pct}% Booked</p>
            </div>

            {/* Registration widget panel */}
            <RegistrationForm event={event} />

            {/* Points multiplier */}
            {event.points && (
              <div className="bg-gradient-to-br from-white to-[#FAF9F6] border border-ignite-champagne rounded-3xl p-6 shadow-soft">
                <div className="flex items-center gap-2 mb-2 text-ignite-accent">
                  <Tag className="h-4.5 w-4.5" />
                  <span className="text-[9px] font-bold uppercase tracking-widest">Participation Points</span>
                </div>
                <p className="text-3xl font-black text-ignite-text">+{event.points} <span className="text-xs font-bold text-ignite-muted">Credits</span></p>
                <p className="text-[9px] font-bold text-ignite-muted mt-2 leading-normal">
                  Points are credited to department score sheets upon gate scan verification.
                </p>
              </div>
            )}
          </div>
          
        </div>

      </div>
    </motion.div>
  );
}
