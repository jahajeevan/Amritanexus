import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import Button from '../components/Button';
import QRCodePass from '../components/QRCodePass';
import {
  Ticket, Trophy, Bell, Award, User, LogOut, Calendar, CheckCircle,
  Clock, Star, ChevronRight, Printer, Shield, Eye, ShieldCheck, Mail, Sparkles, FolderLock, PlusCircle, Activity, Cpu
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

function CertificateModal({ registration, event, onClose }) {
  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html><head><title>Certificate - ${event?.title}</title>
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700&family=Playfair+Display:ital,wght@0,600;0,700;1,400&family=Bodoni+Moda:ital,wght@0,600;0,700;1,400&display=swap" rel="stylesheet">
      <style>
        body { margin: 0; background: #FAF9F6; font-family: 'Inter', sans-serif; -webkit-print-color-adjust: exact; padding: 20px; }
        .cert-container { 
          width: 840px; 
          margin: 40px auto; 
          border: 12px double #9E1B32; 
          border-radius: 4px; 
          padding: 60px; 
          text-align: center; 
          position: relative; 
          background: #FFFFFF; 
          box-shadow: 0 20px 50px rgba(30, 30, 30, 0.05);
        }
        .cert-container::before { 
          content: ''; 
          position: absolute; 
          inset: 8px; 
          border: 1px solid rgba(212, 175, 55, 0.3); 
          border-radius: 2px; 
          pointer-events: none; 
        }
        .header-logo {
          font-family: 'Playfair Display', serif;
          font-size: 14px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 5px;
          color: #1E1E1E;
          margin-bottom: 15px;
        }
        .divider {
          width: 80px;
          height: 1px;
          background: #E7E8EB;
          margin: 20px auto;
        }
        .sub { 
          color: #7C1327; 
          font-size: 10px; 
          font-weight: 700; 
          text-transform: uppercase; 
          letter-spacing: 4px; 
          margin-bottom: 35px; 
        }
        h1 { 
          font-family: 'Playfair Display', serif; 
          font-size: 44px; 
          color: #1E1E1E; 
          margin: 10px 0 5px; 
          font-weight: 600; 
          font-style: italic;
        }
        .to-certify {
          color: #6B7280;
          font-size: 14px;
          margin-top: 25px;
          font-style: italic;
        }
        .name { 
          font-family: 'Playfair Display', serif; 
          font-size: 36px; 
          font-weight: 700; 
          color: #7C1327; 
          border-bottom: 1px solid #E7E8EB; 
          display: inline-block; 
          padding-bottom: 5px; 
          margin: 15px 0 25px; 
          letter-spacing: -0.01em;
        }
        .reason {
          color: #1E1E1E;
          font-size: 15px;
          line-height: 1.6;
          max-width: 550px;
          margin: 0 auto 30px;
        }
        .event { 
          font-family: 'Playfair Display', serif;
          font-size: 20px; 
          font-weight: 700; 
          color: #1E1E1E; 
        }
        .meta { 
          color: #6B7280; 
          font-size: 12px; 
          margin-top: 8px; 
          letter-spacing: 1px;
        }
        .ticket { 
          font-family: monospace; 
          font-size: 10px; 
          color: #94A3B8; 
          margin-top: 45px; 
          letter-spacing: 1px;
        }
        .badge { 
          display: inline-block; 
          background: #F6F3EE; 
          color: #7C1327; 
          border: 1px solid #E7E8EB; 
          border-radius: 0px; 
          padding: 6px 18px; 
          font-size: 10px; 
          font-weight: 700; 
          margin-top: 25px; 
          text-transform: uppercase; 
          letter-spacing: 2px;
        }
        .footer { 
          color: #6B7280; 
          font-size: 10px; 
          margin-top: 55px; 
          border-top: 1px solid #E7E8EB; 
          padding-top: 20px; 
          letter-spacing: 1px;
        }
        .seal {
          position: absolute;
          bottom: 40px;
          right: 60px;
          width: 80px;
          height: 80px;
          opacity: 0.15;
        }
      </style></head>
      <body>
        <div class="cert-container">
          <div class="header-logo">IGNITE 2026</div>
          <div class="divider"></div>
          <div class="sub">Verified Digital Credential</div>
          <h1>Certificate of Achievement</h1>
          <p class="to-certify">This credential officially certifies that</p>
          <div class="name">${registration.studentName}</div>
          <p class="reason">has successfully registered, checked-in, and actively participated in the academic showcase event</p>
          <p class="event">${event?.title || 'Campus Event'}</p>
          <p class="meta">${event?.date || ''} · ${event?.venue || ''}</p>
          <span class="badge">Category: ${event?.category || 'Academic Showcase'}</span>
          <div class="ticket">Verifiable Security ID: ${registration.ticketId}</div>
          <div class="footer">Issued by the Amrita Campus Event Coordination Board · Coimbatore</div>
        </div>
        <script>window.onload = () => { window.print(); window.close(); }</script>
      </body></html>
    `);
    printWindow.document.close();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white border-2 border-ignite-champagne rounded-3xl p-6 md:p-10 max-w-lg w-full shadow-glow relative"
      >
        <button onClick={onClose} className="absolute top-5 right-5 text-ignite-muted hover:text-ignite-text transition-colors text-lg font-bold">✕</button>
        
        <div className="text-center py-4">
          <div className="h-16 w-16 bg-[#FAF9F6] border border-ignite-champagne rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
            <Award className="h-8 w-8 text-ignite-accent" />
          </div>
          
          <span className="text-[9px] font-bold text-ignite-accent uppercase tracking-widest bg-ignite-secondary border border-ignite-champagne/40 px-3 py-1 rounded-full">
            Verifiable Credential
          </span>
          
          <h3 className="text-2xl font-bold font-display text-ignite-text mt-3">Certificate Ready</h3>
          <p className="text-[11px] text-ignite-muted mt-2 px-6">
            Your attendance has been checked, cryptographically signed, and added to your co-curricular record.
          </p>

          <div className="my-6 border border-ignite-champagne/60 rounded-2xl p-5 bg-[#FAF9F6] text-left space-y-4 shadow-inner relative overflow-hidden">
            <div className="absolute right-3 top-3 opacity-5 pointer-events-none">
              <Award className="h-24 w-24 text-ignite-accent" />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-[9px] font-bold text-ignite-muted uppercase tracking-wider block">Recipient</span>
                <p className="text-xs font-bold text-ignite-text mt-0.5">{registration.studentName}</p>
              </div>
              <div>
                <span className="text-[9px] font-bold text-ignite-muted uppercase tracking-wider block">Security ID</span>
                <p className="text-xs font-mono font-bold text-ignite-text mt-0.5">{registration.ticketId.slice(0, 10)}...</p>
              </div>
            </div>
            
            <div className="border-t border-ignite-champagne/40 pt-3">
              <span className="text-[9px] font-bold text-ignite-muted uppercase tracking-wider block">Program Title</span>
              <p className="text-xs font-bold text-ignite-text mt-0.5 leading-snug">{event?.title}</p>
            </div>
            
            <div className="border-t border-ignite-champagne/40 pt-3 flex justify-between items-center">
              <div>
                <span className="text-[9px] font-bold text-ignite-muted uppercase tracking-wider block">Ecosystem Credits</span>
                <p className="text-sm font-bold text-ignite-secondaryAccent mt-0.5">+{event?.points || 50} credits</p>
              </div>
              <span className="text-[9px] font-mono text-emerald-600 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded uppercase font-bold">
                ✓ Verified
              </span>
            </div>
          </div>

          <div className="flex gap-3 justify-center pt-2">
            <Button onClick={handlePrint} variant="accent" icon={Printer} className="h-11 px-8 rounded-xl font-bold uppercase tracking-wider text-[11px]">
              Print Certificate
            </Button>
            <button 
              onClick={onClose} 
              className="h-11 px-6 rounded-xl border border-ignite-champagne hover:bg-ignite-secondary text-ignite-primary font-bold uppercase tracking-wider text-[11px] transition-all"
            >
              Close
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default function StudentDashboardView({ setView }) {
  const { user, logout, registrations, events, leaderboard, announcements } = useData();
  const [activeTab, setActiveTab] = useState('overview');
  const [activeTicket, setActiveTicket] = useState(null);
  const [selectedCert, setSelectedCert] = useState(null);

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#FAF9F6]">
        <div className="h-16 w-16 bg-white border border-ignite-champagne rounded-full flex items-center justify-center mb-4 shadow-soft">
          <User className="h-8 w-8 text-ignite-accent/40 animate-pulse" />
        </div>
        <h2 className="text-2xl font-bold font-display text-ignite-text">Secure Access Denied</h2>
        <p className="text-xs text-ignite-muted mt-1 mb-6">Please log in to retrieve your workstation.</p>
        <Button onClick={() => setView('signin')} variant="accent">Sign In</Button>
      </div>
    );
  }

  // Filter registrations for this student
  const myRegs = registrations.filter(r => r.userId === user.id || r.email === user.email || r.rollNo === user.rollNo);
  const myAttended = myRegs.filter(r => r.attended || r.attendance === 'present');
  const totalPoints = myRegs.reduce((sum, r) => {
    if (r.status === 'Cancelled') return sum;
    const ev = events.find(e => e.id === r.eventId);
    return sum + ((r.attended || r.attendance === 'present') ? (ev?.points || 50) : 0);
  }, 0);

  const sortedLeaderboard = [...leaderboard].sort((a, b) => b.points - a.points);
  const myDeptRankIdx = sortedLeaderboard.findIndex(l => l.dept.toLowerCase() === user.department?.toLowerCase() || l.dept.toLowerCase() === 'cse'); // fallback
  const myDeptRank = myDeptRankIdx !== -1 ? myDeptRankIdx + 1 : 4;

  // Render dock app indicators
  const dockApps = [
    { id: 'overview', label: 'Overview', icon: Cpu },
    { id: 'tickets', label: 'Wallet passes', icon: Ticket },
    { id: 'certificates', label: 'Credentials', icon: Award },
    { id: 'leaderboard', label: 'Standings', icon: Trophy },
  ];

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-[#FAF9F6] py-12 relative overflow-hidden"
    >
      {/* Background radial orbs */}
      <div className="bg-blob bg-blob-gold top-1/4 right-0 w-[450px] h-[450px]" />
      <div className="bg-blob bg-blob-champagne bottom-1/4 left-0 w-[500px] h-[500px]" />

      {/* Premium welcome hero */}
      <div className="mx-auto max-w-7xl px-5 lg:px-8 relative z-10 mb-8">
        <div className="relative overflow-hidden rounded-3xl bg-crimson-night text-white p-7 md:p-9 shadow-crimsonLift">
          <img src="/amrita-emblem.svg" alt="" aria-hidden className="absolute -right-8 -top-10 w-56 h-56 opacity-[0.07] pointer-events-none" style={{ filter: 'brightness(0) invert(1)' }} />
          <div className="absolute inset-0 opacity-40 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 12% 10%, rgba(212,175,55,0.22), transparent 42%)' }} />
          <div className="relative flex flex-col md:flex-row md:items-end md:justify-between gap-6">
            <div>
              <p className="text-[9px] font-bold uppercase tracking-[0.3em] text-white/60">Amrita Vishwa Vidyapeetham · Student Workspace</p>
              <h1 className="mt-2 font-display text-3xl md:text-4xl font-black tracking-tight">
                Welcome back, {(user.name || 'Student').split(' ')[0]}
              </h1>
              <p className="mt-2 text-[12px] text-white/65 font-medium">
                {user.department || 'Student'} · <span className="font-mono">{user.rollNo || user.registerNum}</span>
              </p>
            </div>
            <div className="flex gap-2.5 flex-wrap">
              {[
                { label: 'Passes', value: myRegs.length },
                { label: 'Check-ins', value: myAttended.length },
                { label: 'Credits', value: totalPoints },
                { label: 'Dept Rank', value: `#${myDeptRank}` },
              ].map((s) => (
                <div key={s.label} className="rounded-2xl bg-white/[0.08] border border-white/12 backdrop-blur-sm px-4 py-2.5 text-center min-w-[76px]">
                  <p className="text-xl font-black leading-none">{s.value}</p>
                  <p className="text-[8px] font-bold uppercase tracking-widest text-white/60 mt-1.5">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-5 lg:px-8 grid lg:grid-cols-12 gap-8 items-start relative z-10">
        
        {/* LEFT DOCK / APP SIDEBAR (Desktop Workstation Dock) */}
        <aside className="lg:col-span-3 bg-white/80 backdrop-blur-md border border-ignite-champagne rounded-3xl p-6 shadow-soft space-y-8">
          <div className="flex items-center gap-3.5 pb-4 border-b border-ignite-champagne/40">
            <div className="h-11 w-11 rounded-xl bg-ignite-crimson/8 border border-ignite-crimson/20 flex items-center justify-center text-ignite-crimson shrink-0 shadow-sm">
              <User className="h-6 w-6" />
            </div>
            <div className="truncate">
              <h2 className="text-xs font-bold text-ignite-text leading-tight truncate uppercase tracking-wider">{user.name}</h2>
              <p className="text-[9px] text-ignite-muted font-mono mt-1 font-bold">{user.rollNo || user.registerNum || 'STUDENT_ID'}</p>
            </div>
          </div>

          <div className="space-y-1.5">
            <span className="text-[8px] font-bold text-ignite-muted uppercase tracking-widest block mb-3 px-2">Workstation Dock</span>
            {dockApps.map(app => {
              const Icon = app.icon;
              const active = activeTab === app.id;
              return (
                <button
                  key={app.id}
                  onClick={() => { setActiveTab(app.id); setActiveTicket(null); }}
                  className={`w-full flex items-center gap-3 px-4.5 py-3 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all duration-300 ${
                    active
                      ? 'bg-crimson-royal text-white shadow-glowCrimson border border-ignite-crimson/20'
                      : 'text-ignite-muted hover:text-ignite-text hover:bg-ignite-secondary/50 border border-transparent'
                  }`}
                >
                  <Icon className="h-4.5 w-4.5 shrink-0" />
                  <span>{app.label}</span>
                </button>
              );
            })}
          </div>

          <div className="border-t border-ignite-champagne/40 pt-5">
            <button 
              onClick={() => { logout(); setView('home'); }} 
              className="w-full h-10 border border-red-200 hover:bg-red-50 text-red-600 rounded-xl text-[10px] uppercase font-bold tracking-wider transition-all flex items-center justify-center gap-2"
            >
              <LogOut className="h-4 w-4" />
              Exit Workspace
            </button>
          </div>
        </aside>

        {/* MAIN OS WORKSPACE */}
        <main className="lg:col-span-9 space-y-6">
          <AnimatePresence mode="wait">
            
            {/* OVERVIEW WORKSPACE */}
            {activeTab === 'overview' && (
              <motion.div
                key="overview"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                className="space-y-6"
              >
                {/* Stats Widgets */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { label: 'Claimed Passes', value: myRegs.length, icon: Ticket, bg: 'bg-[#1E1E1E]/5', text: 'text-ignite-primary' },
                    { label: 'Completions', value: myAttended.length, icon: CheckCircle, bg: 'bg-emerald-50', text: 'text-emerald-600' },
                    { label: 'Credits Earned', value: totalPoints, icon: Star, bg: 'bg-[#9E1B32]/5', text: 'text-ignite-accent' },
                    { label: 'Dept Standing', value: `#${myDeptRank}`, icon: Trophy, bg: 'bg-[#7C1327]/5', text: 'text-ignite-secondaryAccent' }
                  ].map(stat => {
                    const Icon = stat.icon;
                    return (
                      <div key={stat.label} className="bg-white border border-ignite-champagne/65 rounded-2xl p-5 shadow-soft hover-lift-sm transition-all duration-300">
                        <div className={`h-9 w-9 rounded-xl ${stat.bg} flex items-center justify-center mb-4 border border-ignite-champagne/40`}>
                          <Icon className={`h-5 w-5 ${stat.text}`} />
                        </div>
                        <p className="text-2xl font-black text-ignite-text leading-tight">{stat.value}</p>
                        <p className="text-[8px] font-bold text-ignite-muted uppercase tracking-widest mt-1.5">{stat.label}</p>
                      </div>
                    );
                  })}
                </div>

                {/* Grid panels */}
                <div className="grid md:grid-cols-5 gap-6">
                  
                  {/* Timeline passing logs (3 cols) */}
                  <div className="md:col-span-3 bg-white border border-ignite-champagne rounded-3xl p-6 shadow-soft space-y-5">
                    <div className="flex justify-between items-center pb-3 border-b border-ignite-champagne/40">
                      <h3 className="text-[10px] font-bold uppercase tracking-widest text-ignite-text flex items-center gap-2">
                        <Activity className="h-4.5 w-4.5 text-ignite-accent" /> Log Timeline
                      </h3>
                      <button onClick={() => setActiveTab('tickets')} className="text-[9px] font-black uppercase text-ignite-accent hover:underline tracking-widest">
                        Full Deck
                      </button>
                    </div>

                    {myRegs.length === 0 ? (
                      <div className="text-center py-12">
                        <FolderLock className="h-10 w-10 text-ignite-accent/20 mx-auto" />
                        <p className="text-xs text-ignite-muted font-bold mt-3">No credential pass logs</p>
                        <button 
                          onClick={() => setView('events')} 
                          className="mt-4 px-5 py-2.5 rounded-xl border border-ignite-champagne hover:bg-[#FAF9F6] text-[10px] uppercase font-bold tracking-widest text-ignite-primary transition-all"
                        >
                          Secure Passes
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-3.5">
                        {myRegs.slice(0, 3).map(reg => {
                          const ev = events.find(e => e.id === reg.eventId);
                          const attended = reg.attended || reg.attendance === 'present';
                          return (
                            <div 
                              key={reg.id}
                              onClick={() => { setActiveTicket(reg); setActiveTab('tickets'); }}
                              className="flex items-center justify-between p-4 bg-[#FAF9F6]/60 border border-ignite-champagne/40 rounded-2xl hover:border-ignite-accent/40 hover:bg-white hover-lift-sm transition-all duration-300 cursor-pointer"
                            >
                              <div className="flex items-center gap-3.5">
                                <span className={`h-2.5 w-2.5 rounded-full shrink-0 ${attended ? 'bg-emerald-500' : reg.status === 'Cancelled' ? 'bg-red-500' : 'bg-[#9E1B32] animate-pulse'}`} />
                                <div>
                                  <h4 className="text-xs font-bold text-ignite-text leading-snug">{ev?.title || reg.eventTitle}</h4>
                                  <p className="text-[9px] text-ignite-muted font-mono mt-1 font-bold">{ev?.date || reg.eventDate} · {ev?.venue || reg.venue}</p>
                                </div>
                              </div>
                              <ChevronRight className="h-4 w-4 text-ignite-muted" />
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Bulletins Bulletin (2 cols) */}
                  <div className="md:col-span-2 bg-white border border-ignite-champagne rounded-3xl p-6 shadow-soft space-y-5">
                    <div className="flex items-center gap-2 pb-3 border-b border-ignite-champagne/40">
                      <Bell className="h-4.5 w-4.5 text-ignite-accent" />
                      <h3 className="text-[10px] font-bold uppercase tracking-widest text-ignite-text">Live Updates</h3>
                    </div>
                    <div className="space-y-4">
                      {announcements.slice(0, 2).map(a => (
                        <div key={a.id} className="pb-3 border-b border-ignite-champagne/30 last:border-0 last:pb-0">
                          <span className="text-[7.5px] font-mono text-ignite-accent font-bold tracking-wider">{a.date} · {a.time}</span>
                          <h4 className="font-bold text-[11px] text-ignite-text mt-1 leading-snug">{a.title}</h4>
                          <p className="text-[9px] text-ignite-muted font-medium mt-1 leading-normal line-clamp-2">{a.content}</p>
                        </div>
                      ))}
                      {announcements.length === 0 && (
                        <p className="text-[10px] text-ignite-muted text-center py-6">No published notices</p>
                      )}
                    </div>
                  </div>

                </div>
              </motion.div>
            )}

            {/* WALLET TICKETS WORKSPACE */}
            {activeTab === 'tickets' && (
              <motion.div
                key="tickets"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                className="space-y-6"
              >
                {activeTicket ? (
                  <div className="bg-white border border-ignite-champagne rounded-3xl p-6 shadow-soft max-w-md mx-auto space-y-5">
                    <button 
                      onClick={() => setActiveTicket(null)} 
                      className="text-[10px] font-bold text-ignite-accent hover:underline flex items-center gap-1.5 uppercase tracking-wider mb-2"
                    >
                      ← Back to passbook deck
                    </button>
                    <QRCodePass registration={activeTicket} />
                  </div>
                ) : (
                  <div className="grid md:grid-cols-2 gap-6">
                    {myRegs.map((reg) => {
                      const isAttended = reg.attended || reg.attendance === 'present';
                      return (
                        <div 
                          key={reg.id}
                          onClick={() => setActiveTicket(reg)}
                          className="bg-crimson-night border border-ignite-accent/25 rounded-2xl p-6 shadow-crimsonLift cursor-pointer hover:scale-[1.01] transition-transform duration-300 pass-card flex flex-col justify-between text-white relative overflow-hidden group"
                        >
                          {/* Emblem watermark + glowing accent orb */}
                          <img src="/amrita-emblem.svg" alt="" aria-hidden className="absolute -right-6 -top-6 h-24 w-24 opacity-[0.08] pointer-events-none" style={{ filter: 'brightness(0) invert(1)' }} />
                          <div className="absolute -right-8 -bottom-8 h-28 w-28 bg-[#9E1B32]/12 rounded-full filter blur-2xl group-hover:bg-[#9E1B32]/18 transition-colors pointer-events-none" />
                          
                          <div className="flex justify-between items-start relative z-10">
                            <div>
                              <span className="text-[8px] font-bold text-white/60 uppercase tracking-widest">{reg.eventCategory}</span>
                              <h3 className="font-display font-bold text-sm text-[#FAF9F6] mt-1.5 leading-tight line-clamp-1 group-hover:text-ignite-accent transition-colors">
                                {reg.eventTitle}
                              </h3>
                            </div>
                            <span className={`text-[8px] font-bold px-2.5 py-0.5 rounded uppercase tracking-wider ${
                              isAttended ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20' :
                              reg.status === 'Cancelled' ? 'bg-red-500/15 text-red-400 border border-red-500/20' :
                              'bg-[#9E1B32]/15 text-[#9E1B32] border border-[#9E1B32]/20'
                            }`}>
                              {isAttended ? 'Checked' : reg.status === 'Cancelled' ? 'Cancelled' : 'Active'}
                            </span>
                          </div>

                          <div className="mt-8 flex justify-between items-end border-t border-white/10 pt-4 text-[9px] font-bold tracking-widest text-slate-400 relative z-10">
                            <div>
                              <p className="text-[7.5px] uppercase tracking-wider text-slate-500">Passholder</p>
                              <p className="text-[#FAF9F6] mt-0.5 font-bold">{reg.studentName}</p>
                            </div>
                            <div>
                              <p className="text-[7.5px] uppercase tracking-wider text-right text-slate-500">Gate Pass ID</p>
                              <p className="font-mono text-[#FAF9F6] mt-0.5 font-bold">{reg.ticketId.slice(0, 12)}</p>
                            </div>
                          </div>
                        </div>
                      );
                    })}

                    {myRegs.length === 0 && (
                      <div className="col-span-2 text-center py-20 bg-white border border-ignite-champagne rounded-3xl shadow-soft">
                        <Ticket className="h-12 w-12 text-ignite-accent/20 mx-auto" />
                        <p className="text-xs text-ignite-muted font-bold mt-2">Passbook deck is empty</p>
                      </div>
                    )}
                  </div>
                )}
              </motion.div>
            )}

            {/* CREDENTIALS WORKSPACE */}
            {activeTab === 'certificates' && (
              <motion.div
                key="certificates"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                className="space-y-6"
              >
                <div className="p-4 bg-white border border-ignite-champagne rounded-2xl flex items-start gap-3 shadow-soft">
                  <Award className="h-5 w-5 text-ignite-accent shrink-0 mt-0.5" />
                  <p className="text-[11px] text-ignite-muted leading-relaxed font-semibold">
                    Certificates are compiled post event gate scans. Select verified passes below to print your official credentials.
                  </p>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  {myRegs.map(reg => {
                    const ev = events.find(e => e.id === reg.eventId);
                    const isVerified = reg.attended || reg.attendance === 'present';
                    return (
                      <div key={reg.id} className="bg-white border border-ignite-champagne rounded-2xl p-6 shadow-soft flex flex-col justify-between hover-lift-sm transition-all duration-300">
                        <div>
                          <div className="flex justify-between items-start">
                            <span className="text-[9px] font-bold text-ignite-accent uppercase tracking-wider">{reg.eventCategory}</span>
                            <span className={`text-[8.5px] font-bold uppercase tracking-wider ${isVerified ? 'text-emerald-600' : 'text-slate-400'}`}>
                              {isVerified ? '✓ Verified' : 'Awaiting Check-in'}
                            </span>
                          </div>
                          <h4 className="font-bold text-xs text-ignite-text mt-3 leading-snug">{reg.eventTitle}</h4>
                          <p className="text-[9px] text-ignite-muted font-mono mt-1 font-bold">ID: {reg.ticketId.slice(0, 14)}...</p>
                        </div>

                        <div className="border-t border-ignite-champagne/40 pt-4 mt-6 flex justify-end">
                          <Button 
                            onClick={() => {
                              if (isVerified) setSelectedCert({ reg, ev });
                            }}
                            disabled={!isVerified} 
                            variant="outline" 
                            className="h-9 text-[9px] font-bold tracking-widest uppercase rounded-lg" 
                            icon={Eye}
                          >
                            Open Preview
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                  {myRegs.length === 0 && (
                    <div className="col-span-2 text-center py-20 bg-white border border-ignite-champagne rounded-3xl shadow-soft">
                      <Award className="h-12 w-12 text-ignite-accent/20 mx-auto" />
                      <p className="text-xs text-ignite-muted font-bold mt-2">No credentials issued</p>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {/* LEADERBOARD STANDINGS WORKSPACE */}
            {activeTab === 'leaderboard' && (
              <motion.div
                key="leaderboard"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                className="bg-white border border-ignite-champagne rounded-3xl overflow-hidden shadow-soft"
              >
                <div className="p-6 border-b border-ignite-champagne bg-ignite-secondary/50">
                  <h2 className="font-display font-bold text-xs text-ignite-text uppercase tracking-widest">Leaderboard Standings</h2>
                  <p className="text-xs text-ignite-muted mt-1">Accrued credit stands per checked-in student department.</p>
                </div>

                <div className="divide-y divide-ignite-champagne/50">
                  {sortedLeaderboard.map((dep, index) => {
                    const isMyDept = dep.dept.toLowerCase() === user.department?.toLowerCase() || (user.department?.toLowerCase().includes('computer') && dep.dept.toLowerCase() === 'cse');
                    return (
                      <div key={dep.dept} className={`flex items-center gap-5 px-6 py-4.5 transition-all ${isMyDept ? 'bg-ignite-champagne/15' : ''}`}>
                        <div className={`h-8 w-8 rounded-full flex items-center justify-center font-black text-[10px] ${
                          index === 0 ? 'bg-[#9E1B32] text-white shadow-sm' :
                          index === 1 ? 'bg-[#E7E8EB] text-ignite-primary shadow-sm' :
                          index === 2 ? 'bg-[#7C1327] text-white shadow-sm' :
                          'bg-[#FAF9F6] text-ignite-muted border border-ignite-champagne'
                        }`}>
                          {index + 1}
                        </div>

                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-xs text-ignite-text uppercase tracking-wider">{dep.dept} Department</span>
                            {isMyDept && (
                              <span className="text-[8px] font-black text-ignite-accent bg-white border border-ignite-accent/25 px-2.5 py-0.5 rounded uppercase tracking-wider">My Dept</span>
                            )}
                          </div>

                          <div className="h-1.5 rounded-full bg-[#FAF9F6] overflow-hidden w-full max-w-xs mt-2 border border-ignite-champagne/30">
                            <div
                              className="h-full rounded-full bg-gradient-to-r from-[#7C1327] via-[#9E1B32] to-[#E7E8EB]"
                              style={{ width: `${Math.round((dep.points / (sortedLeaderboard[0]?.points || 1)) * 100)}%` }}
                            />
                          </div>
                        </div>

                        <div className="text-right">
                          <span className="font-black text-xs text-ignite-accent">{dep.points}</span>
                          <p className="text-[8px] text-ignite-muted uppercase tracking-wider">Credits</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </main>

      </div>

      {/* Certificate modal */}
      <AnimatePresence>
        {selectedCert && (
          <CertificateModal 
            registration={selectedCert.reg} 
            event={selectedCert.ev} 
            onClose={() => setSelectedCert(null)} 
          />
        )}
      </AnimatePresence>

    </motion.div>
  );
}
