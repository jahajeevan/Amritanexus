import React, { useState, useEffect, useRef } from 'react';
import { useData } from '../context/DataContext';
import Button from '../components/Button';
import {
  Calendar, MapPin, Users, ChevronRight, Zap, Trophy, Search,
  ArrowRight, GraduationCap, BookOpen, Ticket, Bell, Star, Hash, Award, CheckCircle, Flame, Activity, ShieldCheck, Cpu, Database
} from 'lucide-react';
import { motion, AnimatePresence, useInView } from 'framer-motion';

// Animated Counter utility for Section 4
function AnimatedCounter({ value, duration = 1.5 }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });

  useEffect(() => {
    if (!inView) return;
    let start = 0;
    const end = parseInt(value.replace(/,/g, ''));
    if (start === end) return;

    let totalMiliseconds = duration * 1000;
    let incrementTime = Math.max(Math.floor(totalMiliseconds / end), 20);
    
    const timer = setInterval(() => {
      start += Math.ceil(end / (totalMiliseconds / incrementTime));
      if (start >= end) {
        clearInterval(timer);
        setCount(end);
      } else {
        setCount(start);
      }
    }, incrementTime);

    return () => clearInterval(timer);
  }, [value, duration, inView]);

  return (
    <span ref={ref} className="font-display font-bold tabular-nums">
      {count.toLocaleString()}
      {value.includes('+') ? '+' : ''}
    </span>
  );
}

function CountdownTimer({ targetDate, targetTime }) {
  const [timeLeft, setTimeLeft] = useState({});

  useEffect(() => {
    const calculate = () => {
      const target = new Date(`${targetDate}T${targetTime}:00`);
      const now = new Date();
      const diff = target - now;
      if (diff <= 0) return setTimeLeft({ over: true });
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);
      setTimeLeft({ days, hours, minutes, seconds });
    };
    calculate();
    const id = setInterval(calculate, 1000);
    return () => clearInterval(id);
  }, [targetDate, targetTime]);

  if (timeLeft.over) return null;

  return (
    <div className="flex items-center gap-1.5 mt-3 bg-ignite-secondary/80 px-3 py-1.5 rounded-xl border border-ignite-border w-max shadow-sm">
      <div className="h-1.5 w-1.5 bg-ignite-accent rounded-full animate-pulse mr-1"></div>
      {['days', 'hours', 'minutes', 'seconds'].map((unit) => (
        <div key={unit} className="flex items-center gap-0.5">
          <span className="font-mono text-xs font-bold text-ignite-text tabular-nums">
            {String(timeLeft[unit] ?? 0).padStart(2, '0')}
          </span>
          <span className="text-[8px] font-bold text-ignite-muted uppercase tracking-wider">{unit.slice(0, 1)}</span>
          {unit !== 'seconds' && <span className="text-ignite-border text-[9px] font-bold">:</span>}
        </div>
      ))}
    </div>
  );
}

function EventCard({ event, onView }) {
  const cardRef = useRef(null);
  const seatsLeft = event.maxSeats - event.seatsFilled;
  const pct = Math.round((event.seatsFilled / event.maxSeats) * 100);

  const [rotate, setRotate] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left - width / 2;
    const mouseY = e.clientY - rect.top - height / 2;
    const rX = -(mouseY / height) * 6; // Subtle 6 degree tilt
    const rY = (mouseX / width) * 6;
    setRotate({ x: rX, y: rY });
    
    cardRef.current.style.setProperty('--mouse-x', `${e.clientX - rect.left}px`);
    cardRef.current.style.setProperty('--mouse-y', `${e.clientY - rect.top}px`);
  };

  const handleMouseLeave = () => {
    setRotate({ x: 0, y: 0 });
  };

  const statusConfig = {
    'Open': { text: 'Open', color: 'bg-emerald-500', class: 'text-emerald-700 bg-emerald-50/60 border-emerald-100' },
    'Almost Full': { text: 'Almost Full', color: 'bg-amber-500', class: 'text-amber-700 bg-amber-50/60 border-amber-100' },
    'Closed': { text: 'Closed', color: 'bg-red-500', class: 'text-red-650 bg-red-50/60 border-red-100' },
    'Upcoming': { text: 'Upcoming', color: 'bg-ignite-accent', class: 'text-ignite-secondaryAccent bg-[#FAF9F6]/85 border-ignite-border' },
    'Completed': { text: 'Completed', color: 'bg-slate-400', class: 'text-slate-500 bg-slate-50 border-slate-200' },
  };

  const catColors = {
    'Hackathon': 'bg-ignite-accent/15 text-ignite-secondaryAccent border-ignite-border',
    'Cultural': 'bg-amber-500/10 text-amber-700 border-amber-200/30',
    'Startup': 'bg-slate-900 text-white border-slate-900',
    'Sports': 'bg-emerald-500/10 text-[#10B981] border-[#10B981]/20',
    'Technical': 'bg-slate-900 text-white border-slate-900',
    'Workshop': 'bg-[#F6F3EE] text-ignite-text border-ignite-border',
    'Gaming': 'bg-ignite-accent/15 text-ignite-secondaryAccent border-ignite-border',
    'Seminar': 'bg-slate-100 text-slate-600 border-slate-200',
  };

  const currentStatus = statusConfig[event.status] || statusConfig['Open'];

  return (
    <motion.article 
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      animate={{ rotateX: rotate.x, rotateY: rotate.y }}
      transition={{ type: 'spring', damping: 25, stiffness: 300 }}
      className="bg-white border border-ignite-border rounded-2xl overflow-hidden shadow-soft hover:shadow-lift transition-all duration-300 flex flex-col spotlight-card perspective-[1000px] h-full"
    >
      <div className="h-44 bg-ignite-secondary relative overflow-hidden flex items-center justify-center border-b border-ignite-border/40">
        {event.gallery && event.gallery[0] ? (
          <img src={event.gallery[0].url} alt={event.title} className="w-full h-full object-cover transition-transform duration-500 hover:scale-105" />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-tr from-ignite-secondary to-white">
            <GraduationCap className="h-10 w-10 text-ignite-accent/35" />
            <span className="text-[9px] text-ignite-secondaryAccent font-black uppercase mt-1.5 tracking-wider">{event.category}</span>
          </div>
        )}
        
        <span className={`absolute top-3 right-3 text-[10px] font-bold px-2.5 py-1 rounded-full border flex items-center gap-1.5 backdrop-blur-md ${currentStatus.class}`}>
          <span className={`h-1.5 w-1.5 rounded-full ${currentStatus.color} ${event.status === 'Open' || event.status === 'Almost Full' ? 'animate-pulse' : ''}`} />
          {currentStatus.text}
        </span>
        
        <span className={`absolute top-3 left-3 text-[9px] font-bold px-2.5 py-1 rounded-full border ${catColors[event.category] || 'bg-slate-100 text-slate-600 border-slate-200'}`}>
          {event.category}
        </span>
      </div>

      <div className="p-5 flex flex-col flex-1">
        <span className="text-[9px] font-bold text-ignite-accent uppercase tracking-widest mb-1">{event.department} Department</span>
        <h3 className="text-base font-bold text-ignite-text leading-snug line-clamp-2 hover:text-ignite-accent transition-colors duration-200 cursor-pointer">{event.title}</h3>

        <div className="mt-4 grid grid-cols-2 gap-y-2.5 gap-x-2 text-[10px] text-ignite-muted font-medium">
          <div className="flex items-center gap-1.5">
            <Calendar className="h-3.5 w-3.5 text-ignite-accent shrink-0" />
            <span>{event.date}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <MapPin className="h-3.5 w-3.5 text-ignite-accent shrink-0" />
            <span className="truncate">{event.venue}</span>
          </div>
          <div className="flex items-center gap-1.5 col-span-2">
            <Users className="h-3.5 w-3.5 text-ignite-accent shrink-0" />
            <span>{seatsLeft > 0 ? `${seatsLeft} seats left of ${event.maxSeats}` : 'Passes fully booked'}</span>
          </div>
        </div>

        <div className="mt-4">
          <div className="h-1 rounded-full bg-ignite-secondary overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-ignite-accent to-ignite-secondaryAccent"
              style={{ width: `${pct}%` }}
            />
          </div>
          <div className="flex justify-between items-center text-[9px] font-bold text-ignite-muted mt-1.5">
            <span>{pct}% Secured</span>
            <span>{seatsLeft} left</span>
          </div>
        </div>

        {event.status !== 'Closed' && event.status !== 'Completed' && (
          <CountdownTimer targetDate={event.date} targetTime={event.time} />
        )}

        <div className="mt-5 pt-4 border-t border-ignite-border/40">
          <Button
            onClick={onView}
            variant={event.status === 'Closed' || event.status === 'Completed' ? 'secondary' : 'crimson'}
            className="w-full h-9 text-[11px]"
            icon={ChevronRight}
          >
            {event.status === 'Closed' || event.status === 'Completed' ? 'View Details' : 'Claim Pass'}
          </Button>
        </div>
      </div>
    </motion.article>
  );
}

// Interactive gold particle canvas visualization for the Hero section
function NodeNetworkCanvas() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    
    let animationFrameId;
    let width = canvas.offsetWidth;
    let height = canvas.offsetHeight;
    
    const dpr = window.devicePixelRatio || 1;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);

    const particles = [];
    const particleCount = 42;
    const goldTones = [
      { name: 'CSE', color: '#A3133F', accent: '#7D0F30' },
      { name: 'AI', color: '#D4AF37', accent: '#B8860B' },
      { name: 'ECE', color: '#7D0F30', accent: '#A3133F' },
      { name: 'ME', color: '#B8860B', accent: '#D4AF37' },
      { name: 'MBA', color: '#5C0A24', accent: '#A3133F' }
    ];

    class Particle {
      constructor() {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        this.vx = (Math.random() - 0.5) * 0.65;
        this.vy = (Math.random() - 0.5) * 0.65;
        this.radius = Math.random() * 2 + 2.2;
        this.dept = goldTones[Math.floor(Math.random() * goldTones.length)];
        this.pulse = Math.random() * Math.PI;
      }

      update(mouseX, mouseY) {
        this.x += this.vx;
        this.y += this.vy;

        if (this.x < 0 || this.x > width) this.vx *= -1;
        if (this.y < 0 || this.y > height) this.vy *= -1;

        if (mouseX !== null && mouseY !== null) {
          const dx = mouseX - this.x;
          const dy = mouseY - this.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 130) {
            this.x += (dx / dist) * 0.35;
            this.y += (dy / dist) * 0.35;
          }
        }
        this.pulse += 0.02;
      }

      draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius + Math.sin(this.pulse) * 0.5, 0, Math.PI * 2);
        ctx.fillStyle = this.dept.color;
        ctx.shadowBlur = 6;
        ctx.shadowColor = this.dept.color;
        ctx.fill();
        ctx.shadowBlur = 0;
      }
    }

    for (let i = 0; i < particleCount; i++) {
      particles.push(new Particle());
    }

    let mouseX = null;
    let mouseY = null;

    const handleMouseMove = (e) => {
      const rect = canvas.getBoundingClientRect();
      mouseX = e.clientX - rect.left;
      mouseY = e.clientY - rect.top;
    };

    const handleMouseLeave = () => {
      mouseX = null;
      mouseY = null;
    };

    const pulses = [];
    const handleCanvasClick = (e) => {
      const rect = canvas.getBoundingClientRect();
      pulses.push({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
        radius: 0,
        maxRadius: 120,
        alpha: 0.8
      });
    };

    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseleave', handleMouseLeave);
    canvas.addEventListener('click', handleCanvasClick);

    const resizeObserver = new ResizeObserver(entries => {
      for (let entry of entries) {
        width = entry.contentRect.width;
        height = entry.contentRect.height;
        canvas.width = width * dpr;
        canvas.height = height * dpr;
        ctx.scale(dpr, dpr);
      }
    });
    resizeObserver.observe(canvas);

    const animate = () => {
      ctx.clearRect(0, 0, width, height);

      // Draw golden connections
      for (let i = 0; i < particles.length; i++) {
        const p1 = particles[i];
        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const dx = p1.x - p2.x;
          const dy = p1.y - p2.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 95) {
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            const grad = ctx.createLinearGradient(p1.x, p1.y, p2.x, p2.y);
            grad.addColorStop(0, p1.dept.color);
            grad.addColorStop(1, p2.dept.color);
            ctx.strokeStyle = grad;
            ctx.globalAlpha = (1 - dist / 95) * 0.22;
            ctx.lineWidth = 0.8;
            ctx.stroke();
            ctx.globalAlpha = 1.0;
          }
        }
      }

      particles.forEach(p => {
        p.update(mouseX, mouseY);
        p.draw();
      });

      // Render gold ripples
      for (let i = pulses.length - 1; i >= 0; i--) {
        const pulse = pulses[i];
        pulse.radius += 2.4;
        pulse.alpha -= 0.02;

        if (pulse.alpha <= 0) {
          pulses.splice(i, 1);
        } else {
          ctx.beginPath();
          ctx.arc(pulse.x, pulse.y, pulse.radius, 0, Math.PI * 2);
          ctx.strokeStyle = `rgba(163, 19, 63, ${pulse.alpha})`;
          ctx.lineWidth = 1.2;
          ctx.stroke();
        }
      }

      // Draw floating nodes labels
      ctx.font = '8px monospace';
      ctx.fillStyle = 'rgba(184, 134, 11, 0.4)';
      goldTones.forEach((g, idx) => {
        const node = particles[idx * 7];
        if (node) {
          ctx.fillText(`*${g.name}_HUB`, node.x + 8, node.y - 4);
        }
      });

      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('mouseleave', handleMouseLeave);
      canvas.removeEventListener('click', handleCanvasClick);
      resizeObserver.disconnect();
    };
  }, []);

  return (
    <canvas 
      ref={canvasRef} 
      className="absolute inset-0 w-full h-full cursor-pointer z-10" 
    />
  );
}

export default function LandingView({ setView }) {
  const { events, leaderboard } = useData();

  const sortedLeaderboard = [...leaderboard].sort((a, b) => b.points - a.points);

  return (
    <div className="bg-ignite-bg overflow-hidden relative">
      
      {/* Background blobs */}
      <div className="bg-blob bg-blob-gold w-[600px] h-[600px] -top-60 -right-40" />
      <div className="bg-blob bg-blob-champagne w-[500px] h-[500px] top-1/2 -left-40" />

      {/* SECTION 1: IMMERSIVE HERO */}
      <section className="relative min-h-[calc(100vh-5rem)] flex items-center border-b border-ignite-border/70 bg-white/40 backdrop-blur-3xl py-12 lg:py-0">
        <div className="relative z-10 mx-auto max-w-7xl px-5 lg:px-8 w-full grid lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Column */}
          <div className="lg:col-span-7 space-y-8 text-left">
            <motion.div 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="inline-flex items-center gap-2 border border-ignite-crimson/25 bg-ignite-crimson/[0.06] rounded-full px-4 py-1.5 text-[9px] font-bold text-ignite-crimson shadow-sm uppercase tracking-widest"
            >
              <Cpu className="h-3.5 w-3.5 text-ignite-crimson" />
              Amrita Vishwa Vidyapeetham · NIRF Rank 7
            </motion.div>

            <div className="space-y-4">
              <motion.h1 
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.08, ease: [0.16, 1, 0.3, 1] }}
                className="font-display text-5xl md:text-7xl lg:text-8xl font-extrabold text-ignite-text leading-none tracking-tight"
              >
                IGNITE 2026
                <br />
                <span className="text-gradient-gold font-normal italic">Discover. Participate. Achieve.</span>
              </motion.h1>

              <motion.p 
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.16, ease: [0.16, 1, 0.3, 1] }}
                className="max-w-xl text-base md:text-lg text-ignite-muted font-medium leading-relaxed"
              >
                A next-generation digital ecosystem that transforms university events, achievements, participation, certificates, rankings and student engagement into one seamless platform.
              </motion.p>
            </div>

            <motion.div 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.24, ease: [0.16, 1, 0.3, 1] }}
              className="flex flex-wrap gap-4 pt-2"
            >
              <Button
                onClick={() => setView('events')}
                variant="crimson"
                className="h-11 px-8 text-xs font-bold uppercase tracking-wider"
                icon={ArrowRight}
              >
                Explore Experiences
              </Button>
              <Button
                onClick={() => setView('dashboard')}
                variant="primary"
                className="h-11 px-8 text-xs font-bold uppercase tracking-wider"
                icon={BookOpen}
              >
                Enter Platform
              </Button>
            </motion.div>
          </div>

          {/* Right Column (Cinematic gold node networks canvas) */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.12, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-5 relative w-full h-[450px] lg:h-[480px] rounded-3xl border border-ignite-border bg-white shadow-soft overflow-hidden"
          >
            <div className="absolute top-4 left-4 z-20 flex items-center gap-1.5 bg-[#F6F3EE] px-3 py-1 rounded-full border border-ignite-border/70 text-[8px] font-mono font-bold text-slate-500 uppercase tracking-wider shadow-sm">
              <span className="h-1.5 w-1.5 rounded-full bg-ignite-crimson animate-pulse" /> connected streams
            </div>
            
            <NodeNetworkCanvas />
          </motion.div>

        </div>
      </section>

      {/* SECTION 2: WHY IGNITE EXISTS */}
      <section className="py-24 bg-white border-b border-ignite-border relative z-10">
        <div className="mx-auto max-w-7xl px-5 lg:px-8 grid md:grid-cols-12 gap-10">
          <div className="md:col-span-5 text-left">
            <span className="text-[10px] font-bold uppercase tracking-widest text-ignite-crimson">// Editorial Statement</span>
            <h2 className="mt-2 text-3xl md:text-4xl font-display font-extrabold text-ignite-text leading-tight">
              The fragmentation of the university experience.
            </h2>
          </div>
          <div className="md:col-span-7 text-left space-y-4 text-xs md:text-sm text-ignite-muted font-medium leading-relaxed">
            <p>
              Students miss out on life-defining opportunities. Events feel disconnected, records are scattered across printouts, and key achievements get lost in forgotten mailboxes.
            </p>
            <p className="font-bold text-ignite-text">
              IGNITE unifies everything. We integrate hackathons, startup pitches, cultural flagships, and stands rankings into a singular operating ecosystem.
            </p>
          </div>
        </div>
      </section>

      {/* SECTION 3: THE DIGITAL CAMPUS ECOSYSTEM */}
      <section className="py-24 bg-[#F6F3EE]/40 border-b border-ignite-border relative z-10">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-[10px] font-bold uppercase tracking-widest text-ignite-crimson">// Connected Infrastructure</span>
            <h2 className="mt-1.5 text-3xl font-display font-extrabold text-ignite-text">One Ecosystem. Everything Connected.</h2>
          </div>

          <div className="grid md:grid-cols-4 gap-6">
            {[
              { title: 'Departments', desc: 'Active networks (CSE, AI, ECE, Mech, Management) sync scores per validation check.' },
              { title: 'Registrations', desc: 'Secure entrance pass claims locked immediately with digital verification stamps.' },
              { title: 'Achievements', desc: 'Earned participation credentials verified live at event checkpoints.' },
              { title: 'Standings Board', desc: 'Check-ins accrue points, updating stands ranks live.' }
            ].map(({ title, desc }, idx) => (
              <div key={title} className="bg-white border border-ignite-border rounded-2xl p-6.5 shadow-soft hover-lift transition-all">
                <span className="font-display font-bold text-2xl text-ignite-accent/40 block mb-3">0{idx + 1}</span>
                <h3 className="font-bold text-xs uppercase tracking-wider text-ignite-text">{title}</h3>
                <p className="mt-2 text-xs text-ignite-muted leading-relaxed font-semibold">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 4: LIVE CAMPUS IMPACT */}
      <section className="py-24 bg-white border-b border-ignite-border relative z-10">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-[10px] font-bold uppercase tracking-widest text-ignite-crimson">// Platform telemetry</span>
            <h2 className="mt-1 text-3xl font-display font-extrabold text-ignite-text">Live impact stats</h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-6 text-center">
            {[
              { value: '1,240+', label: 'Registrations' },
              { value: '950+', label: 'Certificates Generated' },
              { value: '9,400+', label: 'Credits Accrued' },
              { value: '24', label: 'Events Completed' },
              { value: '8', label: 'Departments Active' }
            ].map(({ value, label }) => (
              <div key={label} className="bg-[#F6F3EE]/30 border border-ignite-border p-6 rounded-2xl shadow-soft">
                <p className="text-3xl md:text-4xl font-display font-extrabold text-ignite-accent leading-none">
                  <AnimatedCounter value={value} />
                </p>
                <p className="text-[9.5px] font-bold text-ignite-muted uppercase tracking-widest mt-2">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 5: FEATURED EXPERIENCES */}
      <section className="py-24 bg-[#F6F3EE]/40 border-b border-ignite-border relative z-10">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-5 mb-14 border-b border-ignite-border pb-6">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-ignite-crimson">// Curated Schedules</span>
              <h2 className="mt-1 text-3xl font-display font-extrabold text-ignite-text">Featured Experiences</h2>
            </div>
            <Button onClick={() => setView('events')} variant="outline" className="h-9 text-[11px]" icon={ChevronRight}>
              Catalogue
            </Button>
          </div>

          {/* Alternating Showcase Panels */}
          <div className="space-y-12">
            {[
              { title: 'CodeStorm Hackathon', cat: 'Hackathon', desc: 'A 24-hour intense hackathon focusing on solving municipal and campus sustainability issues.', img: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=800&q=80', side: 'left' },
              { title: 'Innovation Summit', cat: 'Startup', desc: 'Connect with startup founders, venture capitalists, and business alumni. Seed funding pitches.', img: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=800&q=80', side: 'right' }
            ].map((track, idx) => (
              <div key={track.title} className={`grid md:grid-cols-12 gap-8 items-center ${idx % 2 === 1 ? 'md:flex-row-reverse' : ''}`}>
                <div className={`md:col-span-6 overflow-hidden rounded-2xl border border-ignite-border shadow-soft aspect-video ${idx % 2 === 1 ? 'md:order-last' : ''}`}>
                  <img src={track.img} alt={track.title} className="w-full h-full object-cover transition-transform duration-500 hover:scale-103" />
                </div>
                <div className="md:col-span-6 space-y-4 text-left">
                  <span className="text-[9px] font-bold text-ignite-accent uppercase tracking-widest">{track.cat}</span>
                  <h3 className="text-2xl font-display font-bold text-ignite-text">{track.title}</h3>
                  <p className="text-xs text-ignite-muted leading-relaxed font-semibold">{track.desc}</p>
                  <Button onClick={() => setView('events')} variant="primary" className="h-9.5 text-[10px]" icon={ChevronRight}>
                    Secure Ticket Pass
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 6: STUDENT ACHIEVEMENTS */}
      <section className="py-24 bg-white border-b border-ignite-border relative z-10">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-[10px] font-bold uppercase tracking-widest text-ignite-crimson">// Credentials Wall</span>
            <h2 className="mt-1 text-3xl font-display font-extrabold text-ignite-text">Verified Achievements Wall</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              { name: 'Rohan Sharma', title: 'Top Code Award', desc: 'CSE CodeStorm Hackathon winner pass verified by gate checkpoints.' },
              { name: 'Arjun Nair', title: 'Innovation pitch certificate', desc: 'Securely recorded at Main Auditorium gate scan.' },
              { name: 'Siddharth V', title: 'Technical core volunteer', desc: 'Awarded volunteer certificate for ECE track coordination.' }
            ].map(({ name, title, desc }) => (
              <div key={name} className="border border-ignite-border rounded-2xl p-6.5 bg-[#F6F3EE]/30 shadow-soft text-left space-y-4">
                <div className="flex justify-between items-center pb-2 border-b border-ignite-border/60">
                  <span className="text-[9px] font-bold text-ignite-accent uppercase tracking-widest">{title}</span>
                  <Award className="h-4 w-4 text-ignite-accent" />
                </div>
                <p className="text-xs text-ignite-muted leading-relaxed font-semibold">
                  "{desc}"
                </p>
                <div className="pt-2">
                  <p className="text-[8px] font-mono text-slate-400">Recipient</p>
                  <p className="text-xs font-bold text-ignite-text">{name}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 7: DEPARTMENT STANDINGS */}
      <section className="py-24 bg-[#F6F3EE]/40 border-b border-ignite-border relative z-10">
        <div className="mx-auto max-w-7xl px-5 lg:px-8 grid lg:grid-cols-12 gap-12 items-center">
          
          <div className="lg:col-span-5 space-y-6 text-left">
            <span className="text-[10px] font-bold uppercase tracking-widest text-ignite-crimson">// standings leaderboard</span>
            <h2 className="text-3xl font-display font-extrabold text-ignite-text leading-tight">Visual Standings Leaderboard</h2>
            <p className="text-xs md:text-sm text-ignite-muted font-semibold leading-relaxed">
              Every checked-in pass adds credit toward department records. Explore standing gauges below.
            </p>
          </div>

          <div className="lg:col-span-7 bg-white border border-ignite-border rounded-3xl p-6 shadow-soft">
            <div className="space-y-4">
              {sortedLeaderboard.slice(0, 4).map((dep, index) => (
                <div key={dep.dept} className="flex items-center gap-4 py-2 border-b border-ignite-border last:border-0 last:pb-0">
                  <div className={`h-8 w-8 rounded-full flex items-center justify-center font-black text-xs ${
                    index === 0 ? 'bg-amber-400 text-white' :
                    index === 1 ? 'bg-slate-300 text-slate-700' :
                    index === 2 ? 'bg-orange-400 text-white' :
                    'bg-slate-100 text-slate-500'
                  }`}>
                    {index + 1}
                  </div>
                  <div className="flex-1 text-left">
                    <span className="font-bold text-xs text-ignite-text uppercase tracking-wider">{dep.dept} Department</span>
                    <div className="h-1.5 rounded-full bg-slate-100 overflow-hidden w-full max-w-xs mt-1.5">
                      <div className="h-full bg-ignite-accent" style={{ width: `${Math.round((dep.points / (sortedLeaderboard[0]?.points || 1)) * 100)}%` }} />
                    </div>
                  </div>
                  <span className="font-black text-xs text-ignite-accent">{dep.points} pts</span>
                </div>
              ))}
            </div>
          </div>

        </div>
      </section>

      {/* SECTION 8: PLATFORM CAPABILITIES */}
      <section className="py-24 bg-white border-b border-ignite-border relative z-10">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-[10px] font-bold uppercase tracking-widest text-ignite-crimson">// launch features</span>
            <h2 className="mt-1 text-3xl font-display font-extrabold text-ignite-text">Engineered for absolute scale</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: Database, title: 'Local Registry Cache', desc: 'Secure pass transactions are buffered locally using state adapters to assure gate validators load instantly under load.' },
              { icon: ShieldCheck, title: 'Signatures Verification', desc: 'Access validations log cryptographic tokens to prevent pass duplications at event gates.' },
              { icon: Award, title: 'PDF Certificates builder', desc: 'Print components construct digital certificates dynamically, reading validated gate check-in logs.' }
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="border border-ignite-border rounded-2xl p-6.5 bg-[#F6F3EE]/30 shadow-soft text-left space-y-4">
                <div className="h-9 w-9 rounded-lg bg-ignite-accent/5 border border-ignite-accent/15 flex items-center justify-center text-ignite-accent shadow-sm">
                  <Icon className="h-4.5 w-4.5" />
                </div>
                <h3 className="font-bold text-xs uppercase tracking-wider text-ignite-text">{title}</h3>
                <p className="text-[11px] text-ignite-muted leading-relaxed font-semibold">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 9: FINAL CTA */}
      <section className="py-28 bg-crimson-night text-white relative z-10 text-center border-t border-ignite-accent/15 overflow-hidden">
        <img src="/amrita-emblem.svg" alt="" aria-hidden className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[420px] h-[420px] opacity-[0.05] pointer-events-none" style={{ filter: 'brightness(0) invert(1)' }} />
        <div className="absolute inset-0 opacity-40 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 50% 0%, rgba(212,175,55,0.14), transparent 55%)' }} />
        <div className="max-w-3xl mx-auto px-5 space-y-7 relative">
          <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-ignite-accent">Amrita Vishwa Vidyapeetham · IGNITE 2026</p>
          <h2 className="text-3xl md:text-5xl font-display font-extrabold leading-tight tracking-tight">
            Ready to Shape Your Campus Journey?
          </h2>
          <p className="text-xs md:text-sm text-white/60 font-semibold max-w-xl mx-auto leading-relaxed">
            Claim your digital pass, verify credentials, and log co-curricular achievements in one cohesive system.
          </p>
          <div className="pt-4 flex justify-center gap-4">
            <Button onClick={() => setView('signin')} variant="accent" className="h-11 px-8 text-xs font-bold uppercase tracking-wider shadow-glow">
              Get Entry Pass
            </Button>
            <Button onClick={() => setView('events')} variant="outline" className="h-11 px-8 text-xs font-bold uppercase tracking-wider border-white/25 text-white/80 hover:bg-white/10">
              Browse Tracks
            </Button>
          </div>
        </div>
      </section>

    </div>
  );
}

export { EventCard, CountdownTimer };
