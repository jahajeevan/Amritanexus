import React, { useState } from 'react';
import { jsPDF } from 'jspdf';
import { useData } from '../context/DataContext';
import QRCodePass from '../components/QRCodePass';
import { StatCard, Panel, Badge, EmptyState, NavItem } from '../components/ui';
import { normalizeDept, deptLabel } from '../lib/departments';
import {
  Ticket, Trophy, Award, User, LogOut, CheckCircle2, ChevronRight, Printer, Download,
  LayoutDashboard, IdCard, ArrowRight, Bell, X, QrCode, CalendarCheck, MapPin, Mail, Phone, ShieldCheck,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

/* ── Certificate modal (UI shell in the new system; printed cert stays formal serif) ── */
function CertificateModal({ registration, event, onClose }) {
  // Generate a real, one-click downloadable PDF certificate (A4 landscape).
  const downloadPdf = () => {
    const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
    const W = 297, cx = W / 2;
    const maroon = [158, 27, 50], ink = [22, 24, 29], muted = [107, 114, 128], line = [231, 232, 235];
    const center = (t, y) => doc.text(t, cx, y, { align: 'center' });
    const name = registration.studentName || registration.name || 'Student';

    doc.setDrawColor(maroon[0], maroon[1], maroon[2]); doc.setLineWidth(2.5); doc.rect(10, 10, W - 20, 190);
    doc.setDrawColor(line[0], line[1], line[2]); doc.setLineWidth(0.4); doc.rect(14, 14, W - 28, 182);

    doc.setFont('helvetica', 'bold'); doc.setFontSize(11); doc.setTextColor(ink[0], ink[1], ink[2]);
    center('AMRITA NEXUS   ·   IGNITE 2026', 38);
    doc.setFontSize(8.5); doc.setTextColor(maroon[0], maroon[1], maroon[2]);
    center('VERIFIED DIGITAL CREDENTIAL', 46);

    doc.setFont('times', 'italic'); doc.setFontSize(34); doc.setTextColor(ink[0], ink[1], ink[2]);
    center('Certificate of Participation', 72);
    doc.setFontSize(13); doc.setTextColor(muted[0], muted[1], muted[2]);
    center('This certifies that', 88);

    doc.setFont('times', 'bold'); doc.setFontSize(28); doc.setTextColor(maroon[0], maroon[1], maroon[2]);
    center(name, 104);
    const nameW = doc.getTextWidth(name);
    doc.setDrawColor(line[0], line[1], line[2]); doc.setLineWidth(0.4); doc.line(cx - nameW / 2 - 4, 108, cx + nameW / 2 + 4, 108);

    doc.setFont('helvetica', 'normal'); doc.setFontSize(12); doc.setTextColor(ink[0], ink[1], ink[2]);
    doc.text(doc.splitTextToSize('has registered, checked in and actively participated in the following event of IGNITE 2026.', 190), cx, 122, { align: 'center' });

    doc.setFont('times', 'bold'); doc.setFontSize(19); doc.setTextColor(ink[0], ink[1], ink[2]);
    center(event?.title || 'Campus Event', 142);
    doc.setFont('helvetica', 'normal'); doc.setFontSize(11); doc.setTextColor(muted[0], muted[1], muted[2]);
    center([event?.date, event?.venue].filter(Boolean).join('    ·    '), 151);

    const cat = String(event?.category || 'Academic').toUpperCase();
    doc.setFont('helvetica', 'bold'); doc.setFontSize(9);
    const cw = doc.getTextWidth(cat) + 14;
    doc.setFillColor(251, 238, 241); doc.setDrawColor(line[0], line[1], line[2]); doc.setLineWidth(0.3);
    doc.roundedRect(cx - cw / 2, 160, cw, 9, 2, 2, 'FD');
    doc.setTextColor(maroon[0], maroon[1], maroon[2]); center(cat, 166.2);

    doc.setFont('courier', 'normal'); doc.setFontSize(9); doc.setTextColor(muted[0], muted[1], muted[2]);
    center(`Verification ID: ${registration.ticketId || registration.id}`, 184);
    doc.setFont('helvetica', 'normal'); doc.setFontSize(9);
    center('Issued by the Amrita Campus Event Coordination Board · Coimbatore', 193);

    doc.save(`Certificate-${name.replace(/[^a-z0-9]+/gi, '-')}-IGNITE2026.pdf`);
  };

  const handlePrint = () => {
    const w = window.open('', '_blank');
    w.document.write(`
      <html><head><title>Certificate — ${event?.title || 'Amrita Nexus'}</title>
      <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,600;0,700;1,400&family=Inter:wght@400;600;700&display=swap" rel="stylesheet">
      <style>
        body{margin:0;background:#FAFAFB;font-family:Inter,sans-serif;-webkit-print-color-adjust:exact;padding:20px}
        .c{width:840px;margin:40px auto;border:10px solid #9E1B32;padding:60px;text-align:center;position:relative;background:#fff;box-shadow:0 20px 50px rgba(16,18,24,.06)}
        .c::before{content:'';position:absolute;inset:8px;border:1px solid rgba(158,27,50,.25);pointer-events:none}
        .k{font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:5px;color:#16181D;margin-bottom:14px}
        .s{color:#9E1B32;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:4px;margin-bottom:30px}
        h1{font-family:'Playfair Display',serif;font-size:44px;color:#16181D;margin:8px 0 4px;font-weight:600;font-style:italic}
        .t{color:#6B7280;font-size:14px;margin-top:22px;font-style:italic}
        .n{font-family:'Playfair Display',serif;font-size:34px;font-weight:700;color:#9E1B32;border-bottom:1px solid #E7E8EB;display:inline-block;padding-bottom:5px;margin:14px 0 24px}
        .r{color:#16181D;font-size:15px;line-height:1.6;max-width:540px;margin:0 auto 26px}
        .e{font-family:'Playfair Display',serif;font-size:20px;font-weight:700;color:#16181D}
        .m{color:#6B7280;font-size:12px;margin-top:8px;letter-spacing:1px}
        .b{display:inline-block;background:#FBEEF1;color:#9E1B32;border:1px solid #E7E8EB;padding:6px 18px;font-size:10px;font-weight:700;margin-top:22px;text-transform:uppercase;letter-spacing:2px}
        .id{font-family:monospace;font-size:10px;color:#9AA1AC;margin-top:42px;letter-spacing:1px}
        .f{color:#6B7280;font-size:10px;margin-top:50px;border-top:1px solid #E7E8EB;padding-top:18px;letter-spacing:1px}
      </style></head><body>
        <div class="c">
          <div class="k">Amrita Nexus · IGNITE 2026</div>
          <div class="s">Verified Digital Credential</div>
          <h1>Certificate of Participation</h1>
          <p class="t">This certifies that</p>
          <div class="n">${registration.studentName || registration.name}</div>
          <p class="r">registered, checked in and actively participated in the following event of IGNITE 2026.</p>
          <p class="e">${event?.title || 'Campus Event'}</p>
          <p class="m">${event?.date || ''} · ${event?.venue || ''}</p>
          <span class="b">${event?.category || 'Academic'}</span>
          <div class="id">Verification ID: ${registration.ticketId}</div>
          <div class="f">Issued by the Amrita Campus Event Coordination Board · Coimbatore</div>
        </div>
        <script>window.onload=()=>{window.print();window.close()}</script>
      </body></html>`);
    w.document.close();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-amrita-ink/50 p-4 backdrop-blur-sm" onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, y: 12, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, scale: 0.98 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md overflow-hidden rounded-2xl border border-amrita-line bg-white shadow-lg"
      >
        <div className="flex items-center justify-between border-b border-amrita-lineSoft px-5 py-4">
          <div className="flex items-center gap-2.5">
            <span className="grid h-9 w-9 place-items-center rounded-lg bg-amrita-maroonSoft text-amrita-maroon"><Award className="h-4 w-4" /></span>
            <div>
              <p className="text-[13px] font-bold text-amrita-ink">Certificate ready</p>
              <p className="text-[11px] text-amrita-muted">Verified credential</p>
            </div>
          </div>
          <button onClick={onClose} className="grid h-8 w-8 place-items-center rounded-lg text-amrita-muted hover:bg-amrita-panel"><X className="h-4 w-4" /></button>
        </div>
        <div className="space-y-3 p-5">
          <div className="rounded-xl border border-amrita-line bg-amrita-canvas p-4">
            <Row k="Recipient" v={registration.studentName || registration.name} />
            <Row k="Event" v={event?.title} />
            <Row k="Credits" v={`+${event?.points || 50}`} />
            <Row k="Verification ID" v={registration.ticketId} mono last />
          </div>
          <div className="flex gap-2.5">
            <button onClick={downloadPdf} className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-amrita-maroon py-3 text-[12px] font-semibold text-white hover:bg-amrita-maroonDark">
              <Download className="h-4 w-4" /> Download PDF
            </button>
            <button onClick={handlePrint} className="flex items-center justify-center gap-2 rounded-xl border border-amrita-line px-4 py-3 text-[12px] font-semibold text-amrita-ink hover:border-amrita-maroon hover:text-amrita-maroon">
              <Printer className="h-4 w-4" /> Print
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
function Row({ k, v, mono, last }) {
  return (
    <div className={`flex items-center justify-between gap-3 py-2 ${last ? '' : 'border-b border-amrita-lineSoft'}`}>
      <span className="text-[11px] font-medium text-amrita-muted">{k}</span>
      <span className={`text-[12px] font-semibold text-amrita-ink ${mono ? 'font-mono text-[11px]' : ''}`}>{v}</span>
    </div>
  );
}

const passTone = (r) => (r.attended || r.attendance === 'present') ? 'success' : r.status === 'Cancelled' ? 'danger' : 'maroon';
const passLabel = (r) => (r.attended || r.attendance === 'present') ? 'Checked in' : r.status === 'Cancelled' ? 'Cancelled' : 'Active';

export default function StudentDashboardView({ setView }) {
  const { user, logout, registrations, events, leaderboard, announcements } = useData();
  const [tab, setTab] = useState('overview');
  const [activePass, setActivePass] = useState(null);
  const [cert, setCert] = useState(null);

  if (!user) {
    return (
      <div className="grid min-h-[70vh] place-items-center bg-amrita-canvas px-5">
        <div className="text-center">
          <span className="mx-auto grid h-12 w-12 place-items-center rounded-xl bg-amrita-maroonSoft text-amrita-maroon"><ShieldCheck className="h-6 w-6" /></span>
          <h2 className="mt-4 text-xl font-bold text-amrita-ink">Sign in required</h2>
          <p className="mt-1 text-[13px] text-amrita-muted">Please sign in to open your workspace.</p>
          <button onClick={() => setView('signin')} className="mt-5 inline-flex items-center gap-2 rounded-xl bg-amrita-maroon px-5 py-2.5 text-[13px] font-semibold text-white hover:bg-amrita-maroonDark">Student Login <ArrowRight className="h-4 w-4" /></button>
        </div>
      </div>
    );
  }

  const myRegs = registrations.filter((r) => r.userId === user.id || r.email === user.email || r.rollNo === user.rollNo);
  const myAttended = myRegs.filter((r) => r.attended || r.attendance === 'present');
  const totalPoints = myRegs.reduce((s, r) => {
    if (r.status === 'Cancelled') return s;
    const ev = events.find((e) => e.id === r.eventId);
    return s + ((r.attended || r.attendance === 'present') ? (ev?.points || 50) : 0);
  }, 0);
  const board = [...leaderboard].sort((a, b) => b.points - a.points);
  const myDeptCode = normalizeDept(user.department);
  const myRankIdx = board.findIndex((l) => normalizeDept(l.dept) === myDeptCode);
  const myRank = myRankIdx !== -1 ? myRankIdx + 1 : '—';
  const initials = (user.name || 'S').split(' ').map((x) => x[0]).slice(0, 2).join('').toUpperCase();

  const nav = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'passes', label: 'My Passes', icon: Ticket, badge: myRegs.length || undefined },
    { id: 'certificates', label: 'Certificates', icon: Award, badge: myAttended.length || undefined },
    { id: 'standings', label: 'Standings', icon: Trophy },
    { id: 'profile', label: 'Profile', icon: IdCard },
  ];

  return (
    <div className="min-h-screen bg-amrita-canvas">
      <div className="mx-auto grid max-w-7xl gap-6 px-5 py-8 lg:grid-cols-12 lg:px-8">
        {/* Sidebar */}
        <aside className="lg:col-span-3">
          <div className="lg:sticky lg:top-24 space-y-4">
            <div className="rounded-2xl border border-amrita-line bg-white p-5 shadow-xs">
              <div className="flex items-center gap-3">
                <span className="grid h-11 w-11 place-items-center rounded-xl bg-amrita-maroon text-[14px] font-bold text-white">{initials}</span>
                <div className="min-w-0">
                  <p className="truncate text-[14px] font-bold text-amrita-ink">{user.name}</p>
                  <p className="truncate font-mono text-[11px] text-amrita-muted">{user.rollNo || user.registerNum}</p>
                </div>
              </div>
              <div className="mt-3 flex flex-wrap gap-1.5">
                <Badge tone="maroon">{deptLabel(user.department)}</Badge>
                <Badge>Year {user.year}</Badge>
                {user.section && <Badge>Sec {user.section}</Badge>}
              </div>
            </div>

            <nav className="rounded-2xl border border-amrita-line bg-white p-2 shadow-xs">
              {nav.map((n) => (
                <NavItem key={n.id} {...n} active={tab === n.id} onClick={() => { setTab(n.id); setActivePass(null); }} />
              ))}
            </nav>

            <button onClick={() => { logout(); setView('home'); }} className="flex w-full items-center justify-center gap-2 rounded-xl border border-amrita-line bg-white py-2.5 text-[12.5px] font-semibold text-red-600 transition-colors hover:bg-red-50">
              <LogOut className="h-4 w-4" /> Sign out
            </button>
          </div>
        </aside>

        {/* Main */}
        <main className="lg:col-span-9">
          <AnimatePresence mode="wait">
            <motion.div key={tab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.25 }} className="space-y-6">

              {tab === 'overview' && (
                <>
                  <div>
                    <h1 className="text-2xl font-bold tracking-tight text-amrita-ink">Welcome back, {user.name.split(' ')[0]}</h1>
                    <p className="mt-1 text-[13px] text-amrita-muted">Here's everything on your IGNITE 2026 record.</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                    <StatCard icon={Ticket} label="Passes claimed" value={myRegs.length} />
                    <StatCard icon={CheckCircle2} label="Check-ins" value={myAttended.length} />
                    <StatCard icon={Award} label="Credits earned" value={totalPoints} />
                    <StatCard icon={Trophy} label="Dept standing" value={`#${myRank}`} />
                  </div>

                  <div className="grid gap-6 lg:grid-cols-5">
                    <Panel title="Recent activity" className="lg:col-span-3"
                      action={myRegs.length > 0 && <button onClick={() => setTab('passes')} className="text-[12px] font-semibold text-amrita-maroon hover:text-amrita-maroonDark">View all</button>}>
                      {myRegs.length === 0 ? (
                        <EmptyState icon={Ticket} title="No passes yet" hint="Browse the events directory and claim your first entry pass."
                          action={<button onClick={() => setView('events')} className="inline-flex items-center gap-2 rounded-xl bg-amrita-maroon px-4 py-2 text-[12px] font-semibold text-white hover:bg-amrita-maroonDark">Explore events <ArrowRight className="h-3.5 w-3.5" /></button>} />
                      ) : (
                        <ul className="divide-y divide-amrita-lineSoft">
                          {myRegs.slice(0, 4).map((r) => {
                            const ev = events.find((e) => e.id === r.eventId);
                            return (
                              <li key={r.id}>
                                <button onClick={() => { setActivePass(r); setTab('passes'); }} className="flex w-full items-center gap-3 px-5 py-3.5 text-left hover:bg-amrita-canvas">
                                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-amrita-maroonSoft text-amrita-maroon"><CalendarCheck className="h-4 w-4" /></span>
                                  <div className="min-w-0 flex-1">
                                    <p className="truncate text-[13px] font-semibold text-amrita-ink">{ev?.title || r.eventTitle}</p>
                                    <p className="truncate text-[11.5px] text-amrita-muted">{ev?.date || r.eventDate} · {ev?.venue || r.venue}</p>
                                  </div>
                                  <Badge tone={passTone(r)}>{passLabel(r)}</Badge>
                                  <ChevronRight className="h-4 w-4 text-amrita-faint" />
                                </button>
                              </li>
                            );
                          })}
                        </ul>
                      )}
                    </Panel>

                    <Panel title="Announcements" className="lg:col-span-2">
                      {announcements.length === 0 ? (
                        <EmptyState icon={Bell} title="No notices" hint="Updates from coordinators will appear here." />
                      ) : (
                        <ul className="divide-y divide-amrita-lineSoft">
                          {announcements.slice(0, 3).map((a) => (
                            <li key={a.id} className="px-5 py-3.5">
                              <p className="text-[10px] font-semibold uppercase tracking-wider text-amrita-maroon">{a.date} · {a.time}</p>
                              <p className="mt-1 text-[12.5px] font-semibold text-amrita-ink">{a.title}</p>
                              <p className="mt-1 line-clamp-2 text-[11.5px] leading-relaxed text-amrita-muted">{a.content}</p>
                            </li>
                          ))}
                        </ul>
                      )}
                    </Panel>
                  </div>
                </>
              )}

              {tab === 'passes' && (
                <>
                  <SectionHead title="My passes" sub={`${myRegs.length} entry ${myRegs.length === 1 ? 'pass' : 'passes'}`} />
                  {activePass ? (
                    <div className="mx-auto max-w-md space-y-4">
                      <button onClick={() => setActivePass(null)} className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-amrita-maroon hover:text-amrita-maroonDark"><ChevronRight className="h-4 w-4 rotate-180" /> Back to passes</button>
                      <div className="rounded-2xl border border-amrita-line bg-white p-6 shadow-xs"><QRCodePass registration={activePass} /></div>
                    </div>
                  ) : myRegs.length === 0 ? (
                    <Panel><EmptyState icon={QrCode} title="Your passbook is empty" hint="Claim a pass from any open event to see it here."
                      action={<button onClick={() => setView('events')} className="inline-flex items-center gap-2 rounded-xl bg-amrita-maroon px-4 py-2 text-[12px] font-semibold text-white hover:bg-amrita-maroonDark">Explore events <ArrowRight className="h-3.5 w-3.5" /></button>} /></Panel>
                  ) : (
                    <div className="grid gap-5 sm:grid-cols-2">
                      {myRegs.map((r) => (
                        <button key={r.id} onClick={() => setActivePass(r)} className="group overflow-hidden rounded-2xl border border-amrita-line bg-white text-left shadow-xs hover-lift-sm">
                          <div className="flex items-center justify-between bg-crimson-night px-5 py-3.5 text-white">
                            <div className="flex items-center gap-2">
                              <QrCode className="h-4 w-4 text-white/70" />
                              <span className="text-[11px] font-semibold uppercase tracking-wider text-white/70">{r.eventCategory}</span>
                            </div>
                            <Badge tone={passTone(r)}>{passLabel(r)}</Badge>
                          </div>
                          <div className="p-5">
                            <p className="text-[14px] font-bold text-amrita-ink">{r.eventTitle}</p>
                            <div className="mt-3 flex items-center justify-between text-[11.5px] text-amrita-muted">
                              <span>{r.eventDate}</span>
                              <span className="font-mono">{r.ticketId}</span>
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </>
              )}

              {tab === 'certificates' && (
                <>
                  <SectionHead title="Certificates" sub="Unlocked after your attendance is verified at the gate" />
                  {myRegs.length === 0 ? (
                    <Panel><EmptyState icon={Award} title="No certificates yet" hint="Attend an event and get your pass scanned to unlock an official certificate." /></Panel>
                  ) : (
                    <div className="grid gap-5 sm:grid-cols-2">
                      {myRegs.map((r) => {
                        const ev = events.find((e) => e.id === r.eventId);
                        const verified = r.attended || r.attendance === 'present';
                        return (
                          <div key={r.id} className="flex flex-col rounded-2xl border border-amrita-line bg-white p-5 shadow-xs">
                            <div className="flex items-center justify-between">
                              <Badge tone="maroon">{r.eventCategory}</Badge>
                              <Badge tone={verified ? 'success' : 'neutral'}>{verified ? 'Verified' : 'Awaiting check-in'}</Badge>
                            </div>
                            <p className="mt-3 text-[14px] font-bold text-amrita-ink">{r.eventTitle}</p>
                            <p className="mt-1 font-mono text-[11px] text-amrita-muted">{r.ticketId}</p>
                            <button disabled={!verified} onClick={() => verified && setCert({ r, ev })}
                              className="mt-5 inline-flex items-center justify-center gap-2 rounded-xl border border-amrita-line py-2.5 text-[12px] font-semibold text-amrita-ink transition-colors enabled:hover:border-amrita-maroon enabled:hover:text-amrita-maroon disabled:opacity-45">
                              <Award className="h-4 w-4" /> {verified ? 'View certificate' : 'Locked'}
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </>
              )}

              {tab === 'standings' && (
                <>
                  <SectionHead title="Department standings" sub="Credits accrue from verified check-ins" />
                  <Panel bodyClass="divide-y divide-amrita-lineSoft">
                    {board.map((d, i) => {
                      const mine = i === myRankIdx;
                      return (
                        <div key={d.dept} className={`flex items-center gap-4 px-5 py-4 ${mine ? 'bg-amrita-maroonSoft/50' : ''}`}>
                          <span className={`grid h-8 w-8 shrink-0 place-items-center rounded-lg text-[13px] font-bold ${i === 0 ? 'bg-amrita-maroon text-white' : 'bg-amrita-panel text-amrita-slate'}`}>{i + 1}</span>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <p className="truncate text-[13.5px] font-semibold text-amrita-ink">{d.dept}</p>
                              {mine && <Badge tone="maroon">You</Badge>}
                            </div>
                            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-amrita-panel max-w-sm">
                              <div className="h-full rounded-full bg-amrita-maroon" style={{ width: `${Math.round((d.points / (board[0]?.points || 1)) * 100)}%` }} />
                            </div>
                          </div>
                          <span className="text-[13px] font-bold text-amrita-maroon">{d.points.toLocaleString('en-IN')}</span>
                        </div>
                      );
                    })}
                  </Panel>
                </>
              )}

              {tab === 'profile' && (
                <>
                  <SectionHead title="Profile" sub="Your permanent student record — used to auto-fill registrations" />
                  <Panel>
                    <dl className="divide-y divide-amrita-lineSoft">
                      {[
                        { icon: User, k: 'Full name', v: user.name },
                        { icon: Mail, k: 'University email', v: user.email },
                        { icon: IdCard, k: 'Register number', v: user.rollNo || user.registerNum },
                        { icon: LayoutDashboard, k: 'Department', v: deptLabel(user.department) },
                        { icon: CalendarCheck, k: 'Academic year', v: `Year ${user.year}${user.section ? ` · Section ${user.section}` : ''}` },
                        { icon: Phone, k: 'Phone', v: user.phone || '—' },
                      ].map((row) => (
                        <div key={row.k} className="flex items-center gap-3 px-5 py-4">
                          <span className="grid h-9 w-9 place-items-center rounded-lg bg-amrita-panel text-amrita-muted"><row.icon className="h-4 w-4" /></span>
                          <div className="flex-1">
                            <p className="text-[11px] font-medium uppercase tracking-wide text-amrita-muted">{row.k}</p>
                            <p className="text-[13.5px] font-semibold text-amrita-ink">{row.v}</p>
                          </div>
                        </div>
                      ))}
                    </dl>
                    <div className="flex items-center gap-2 border-t border-amrita-lineSoft bg-amrita-canvas px-5 py-3 text-[11.5px] text-amrita-muted">
                      <ShieldCheck className="h-4 w-4 text-amrita-maroon" /> These details are locked. Contact a faculty coordinator to make changes.
                    </div>
                  </Panel>
                </>
              )}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      <AnimatePresence>
        {cert && <CertificateModal registration={cert.r} event={cert.ev} onClose={() => setCert(null)} />}
      </AnimatePresence>
    </div>
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
