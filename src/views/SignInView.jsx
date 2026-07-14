import React, { useState, useRef, useMemo, useEffect } from 'react';
import { useData } from '../context/DataContext';
import { sendOtp, verifyOtp } from '../lib/api';
import { YEARS, SECTIONS } from '../lib/departments';
import Button from '../components/Button';
import Input from '../components/Input';
import Logo from '../components/Logo';
import {
  Lock, User, KeyRound, AlertCircle, GraduationCap, Mail, Phone, IdCard, Users, ChevronDown,
  Eye, EyeOff, ShieldCheck, Sparkles, ArrowLeft, ArrowRight, CheckCircle2, Loader2, MailCheck, Award,
} from 'lucide-react';
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from 'framer-motion';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
// Students must use their official Amrita Coimbatore student email.
const STUDENT_DOMAIN = '@cb.students.amrita.edu';
const isStudentEmail = (e) => String(e).trim().toLowerCase().endsWith(STUDENT_DOMAIN);

/* ── 6-digit OTP field ───────────────────────────────────────── */
function OtpField({ value, onChange, disabled }) {
  const refs = useRef([]);
  const digits = value.padEnd(6, ' ').slice(0, 6).split('');

  const setAt = (i, d) => {
    const arr = value.padEnd(6, ' ').slice(0, 6).split('');
    arr[i] = d;
    onChange(arr.join('').replace(/\s/g, ''));
  };

  const handleKey = (i, e) => {
    if (e.key === 'Backspace' && !digits[i].trim() && i > 0) refs.current[i - 1]?.focus();
  };
  const handleInput = (i, e) => {
    const digitsIn = e.target.value.replace(/\D/g, '');
    if (!digitsIn) { setAt(i, ' '); return; }
    if (digitsIn.length === 1) {
      setAt(i, digitsIn);
      if (i < 5) refs.current[i + 1]?.focus();
      return;
    }
    // burst input (SMS autofill / fast typing / paste into a box): spread out
    const arr = value.padEnd(6, ' ').slice(0, 6).split('');
    let j = i;
    for (const ch of digitsIn) { if (j > 5) break; arr[j++] = ch; }
    onChange(arr.join('').replace(/\s/g, ''));
    refs.current[Math.min(j, 5)]?.focus();
  };
  const handlePaste = (e) => {
    const txt = (e.clipboardData.getData('text') || '').replace(/\D/g, '').slice(0, 6);
    if (txt) { onChange(txt); refs.current[Math.min(txt.length, 5)]?.focus(); e.preventDefault(); }
  };

  return (
    <div className="flex justify-center gap-2 sm:gap-2.5" onPaste={handlePaste}>
      {digits.map((d, i) => (
        <input
          key={i}
          ref={(el) => (refs.current[i] = el)}
          inputMode="numeric"
          autoComplete={i === 0 ? 'one-time-code' : 'off'}
          maxLength={6}
          disabled={disabled}
          value={d.trim()}
          onChange={(e) => handleInput(i, e)}
          onKeyDown={(e) => handleKey(i, e)}
          className={`otp-box ${d.trim() ? 'filled' : ''}`}
        />
      ))}
    </div>
  );
}

/* ── password strength meter ─────────────────────────────────── */
function strengthOf(pw) {
  let s = 0;
  if (pw.length >= 8) s++;
  if (pw.length >= 12) s++;
  if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) s++;
  if (/\d/.test(pw)) s++;
  if (/[^A-Za-z0-9]/.test(pw)) s++;
  return Math.min(s, 4);
}
const STRENGTH = [
  { label: '', color: '' },
  { label: 'Weak', color: 'bg-red-500' },
  { label: 'Fair', color: 'bg-amber-500' },
  { label: 'Good', color: 'bg-yellow-500' },
  { label: 'Strong', color: 'bg-emerald-500' },
];

export default function SignInView({ setView }) {
  const { loginStudent, registerStudent, signInAdmin } = useData();

  const [mode, setMode] = useState('signin');      // 'signin' | 'signup' | 'admin'
  const [step, setStep] = useState('form');        // 'form' | 'otp' (signup only)
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [showPw, setShowPw] = useState(false);

  // fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [regNo, setRegNo] = useState('');
  const [phone, setPhone] = useState('');
  const [year, setYear] = useState('');
  const [section, setSection] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');

  // otp
  const [otp, setOtp] = useState('');
  const [otpToken, setOtpToken] = useState('');
  const [devCode, setDevCode] = useState('');
  const [resendIn, setResendIn] = useState(0);

  const pwStrength = useMemo(() => strengthOf(password), [password]);

  const resetMessages = () => { setError(''); setNotice(''); };
  const switchMode = (m) => {
    setMode(m); setStep('form'); resetMessages();
    setOtp(''); setOtpToken(''); setDevCode(''); setPassword(''); setConfirm(''); setYear(''); setSection('');
  };

  useEffect(() => {
    if (resendIn <= 0) return;
    const t = setTimeout(() => setResendIn((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [resendIn]);

  /* ── 3D tilt ── */
  const cardRef = useRef(null);
  const rx = useSpring(0, { stiffness: 140, damping: 16 });
  const ry = useSpring(0, { stiffness: 140, damping: 16 });
  const glareX = useMotionValue(50);
  const glareY = useMotionValue(0);
  const gx = useTransform(glareX, (v) => `${v}%`);
  const gy = useTransform(glareY, (v) => `${v}%`);

  const onMove = (e) => {
    const r = cardRef.current?.getBoundingClientRect();
    if (!r) return;
    const px = (e.clientX - r.left) / r.width;
    const py = (e.clientY - r.top) / r.height;
    ry.set((px - 0.5) * 12);
    rx.set(-(py - 0.5) * 12);
    glareX.set(px * 100);
    glareY.set(py * 100);
  };
  const onLeave = () => { rx.set(0); ry.set(0); glareX.set(50); glareY.set(0); };

  /* ── handlers ── */
  const handleSignIn = async (e) => {
    e.preventDefault(); resetMessages();
    if (!EMAIL_RE.test(email)) return setError('Enter a valid email address.');
    if (!isStudentEmail(email)) return setError('Sign in with your official @cb.students.amrita.edu student email.');
    if (!password) return setError('Enter your password.');
    setLoading(true);
    const res = await loginStudent(email, password);
    setLoading(false);
    if (res.success) setView('dashboard');
    else setError(res.message || 'Sign in failed.');
  };

  const handleAdmin = async (e) => {
    e.preventDefault(); resetMessages();
    if (!EMAIL_RE.test(email)) return setError('Enter a valid email address.');
    if (!password) return setError('Enter the admin password.');
    setLoading(true);
    const res = await signInAdmin(email, password);
    setLoading(false);
    if (res.success) setView('dashboard');
    else setError(res.message || 'Invalid administrative credentials.');
  };

  const handleSendOtp = async (e) => {
    e?.preventDefault(); resetMessages();
    if (name.trim().length < 2) return setError('Please enter your full name.');
    if (!EMAIL_RE.test(email)) return setError('Enter a valid email address.');
    if (!isStudentEmail(email)) return setError('Only official @cb.students.amrita.edu student emails are accepted.');
    if (regNo.trim().length < 5) return setError('Enter your university register number.');
    if (!year) return setError('Select your current year of study.');
    if (!section) return setError('Select your class section.');
    if (phone && !/^\d{10}$/.test(phone.trim())) return setError('Phone must be 10 digits (or leave it blank).');
    if (password.length < 8) return setError('Password must be at least 8 characters.');
    if (password !== confirm) return setError('Passwords do not match.');

    setLoading(true);
    const res = await sendOtp({ email, name });
    setLoading(false);
    if (!res.ok) return setError(res.error || 'Could not send verification code.');
    setOtpToken(res.token);
    setDevCode(res.devCode || '');
    setStep('otp');
    setResendIn(30);
    setNotice(`We emailed a 6-digit code to ${email}.`);
  };

  const handleResend = async () => {
    if (resendIn > 0) return;
    resetMessages();
    setLoading(true);
    const res = await sendOtp({ email, name });
    setLoading(false);
    if (!res.ok) return setError(res.error || 'Could not resend the code.');
    setOtpToken(res.token);
    setDevCode(res.devCode || '');
    setResendIn(30);
    setNotice('A fresh code is on its way.');
  };

  const handleVerify = async (e) => {
    e?.preventDefault(); resetMessages();
    if (otp.length !== 6) return setError('Enter the full 6-digit code.');
    setLoading(true);
    const v = await verifyOtp({ email, otp, token: otpToken });
    if (!v.ok) { setLoading(false); return setError(v.error || 'Incorrect code.'); }
    const res = await registerStudent({ name, email, registerNum: regNo, phone, password, year, section });
    setLoading(false);
    if (res.success) setView('dashboard');
    else { setError(res.message || 'Could not create account.'); setStep('form'); }
  };

  const isAdmin = mode === 'admin';

  return (
    <section
      className="auth-scene relative min-h-[calc(100vh-5rem)] flex items-center justify-center overflow-hidden px-4 py-10 sm:py-14"
    >
      {/* animated background */}
      <div className="aurora-orb aurora-crimson w-[520px] h-[520px] -top-32 -left-24" />
      <div className="aurora-orb aurora-gold w-[440px] h-[440px] top-24 -right-20" />
      <div className="aurora-orb aurora-crimson w-[500px] h-[500px] -bottom-40 left-1/3" />
      <div className="grid-floor" />

      {/* floating shards */}
      <div className="shard hidden lg:block left-[8%] top-[18%]">
        <div className="glassmorphism-gold rounded-2xl p-3 shadow-glow"><Sparkles className="h-5 w-5 text-ignite-accent" /></div>
      </div>
      <div className="shard shard-2 hidden lg:block right-[9%] top-[24%]">
        <div className="glassmorphism rounded-2xl p-3 shadow-lift"><ShieldCheck className="h-5 w-5 text-ignite-secondaryAccent" /></div>
      </div>
      <div className="shard shard-3 hidden lg:block right-[14%] bottom-[14%]">
        <div className="glassmorphism-gold rounded-2xl p-3 shadow-glow"><GraduationCap className="h-5 w-5 text-ignite-accent" /></div>
      </div>

      <div className="perspective-1000 relative z-10 w-full max-w-4xl">
        <motion.div
          ref={cardRef}
          onMouseMove={onMove}
          onMouseLeave={onLeave}
          initial={{ opacity: 0, y: 30, rotateX: 8 }}
          animate={{ opacity: 1, y: 0, rotateX: 0 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          style={{ rotateX: rx, rotateY: ry, '--gx': gx, '--gy': gy }}
          className="tilt-card gradient-ring relative grid md:grid-cols-[1.05fr_1.35fr] rounded-[28px] bg-white/90 backdrop-blur-xl shadow-lift overflow-hidden"
        >
          <div className="tilt-glare z-30" />

          {/* ── Left brand panel ── */}
          <div
            className="relative hidden md:flex flex-col justify-between p-9 lg:p-11 text-white overflow-hidden bg-crimson-night"
            style={{ transform: 'translateZ(24px)' }}
          >
            <div className="absolute inset-0 opacity-40" style={{ backgroundImage: 'radial-gradient(circle at 20% 15%, rgba(212,175,55,0.28), transparent 45%), radial-gradient(circle at 85% 90%, rgba(163,19,63,0.5), transparent 50%)' }} />
            <div className="relative">
              <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-white/10 border border-white/15 backdrop-blur-md shadow-glowCrimson p-2.5">
                <img src="/amrita-emblem.svg" alt="Amrita Vishwa Vidyapeetham" className="h-full w-full object-contain" style={{ filter: 'brightness(0) invert(1)' }} draggable={false} />
              </div>
              <p className="mt-6 text-[9px] font-bold uppercase tracking-[0.3em] text-white/60">Amrita Vishwa Vidyapeetham</p>
              <h1 className="mt-2 font-display text-4xl lg:text-5xl font-black leading-[1.05] tracking-tight">
                IGNITE<br /><span className="text-white/85">2026</span>
              </h1>
              <p className="mt-5 text-[12.5px] leading-relaxed text-white/70 max-w-xs">
                The official campus event ecosystem of India's NIRF Rank&nbsp;7 university. Claim passes, verify attendance, climb the leaderboard and collect verified credentials.
              </p>
            </div>

            <div className="relative space-y-3 mt-10">
              {[
                { icon: MailCheck, t: 'Email-verified passes', d: 'One-time codes keep entry secure' },
                { icon: ShieldCheck, t: 'Encrypted credentials', d: 'Salted + hashed, never plaintext' },
                { icon: Sparkles, t: 'Live event leaderboard', d: 'Track your department in real time' },
              ].map((f) => (
                <div key={f.t} className="flex items-center gap-3 rounded-xl bg-white/[0.06] border border-white/10 px-3.5 py-2.5 backdrop-blur-sm">
                  <f.icon className="h-4 w-4 text-white/75 shrink-0" />
                  <div>
                    <p className="text-[11px] font-bold leading-tight">{f.t}</p>
                    <p className="text-[10px] text-white/55 leading-tight mt-0.5">{f.d}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ── Right form panel ── */}
          <div className="relative p-7 sm:p-9 lg:p-11 flex flex-col justify-center bg-white/95" style={{ transform: 'translateZ(40px)' }}>
            {/* mode switch */}
            <div className="grid grid-cols-3 gap-1 p-1 bg-ignite-secondary border border-ignite-champagne rounded-2xl mb-6 relative">
              {[
                { k: 'signin', label: 'Sign In' },
                { k: 'signup', label: 'Sign Up' },
                { k: 'admin', label: 'Admin' },
              ].map((t) => (
                <button
                  key={t.k}
                  onClick={() => switchMode(t.k)}
                  className={`relative py-2.5 text-[10px] sm:text-[11px] font-bold uppercase tracking-wider rounded-xl transition-colors duration-300 ${
                    mode === t.k ? 'text-white' : 'text-ignite-muted hover:text-ignite-text'
                  }`}
                >
                  {mode === t.k && (
                    <motion.span
                      layoutId="mode-pill"
                      className="absolute inset-0 rounded-xl bg-crimson-royal shadow-glowCrimson"
                      transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                    />
                  )}
                  <span className="relative z-10">{t.label}</span>
                </button>
              ))}
            </div>

            {/* header */}
            <div className="mb-5">
              <h2 className="font-display text-2xl sm:text-[26px] font-bold tracking-tight">
                <span className="shimmer-text">
                  {isAdmin ? 'Faculty Control' : mode === 'signup' ? (step === 'otp' ? 'Verify your email' : 'Create your pass') : 'Welcome back'}
                </span>
              </h2>
              <p className="text-[11.5px] text-ignite-muted mt-1 font-medium">
                {isAdmin
                  ? 'Coordinator access to the event command center.'
                  : mode === 'signup'
                  ? step === 'otp' ? 'Enter the 6-digit code we emailed you.' : 'Sign up with your university details.'
                  : 'Sign in to your Amrita Nexus account.'}
              </p>
            </div>

            {/* alerts */}
            <AnimatePresence mode="wait">
              {error && (
                <motion.div key="err" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                  className="mb-4 p-3.5 rounded-xl border border-red-100 bg-red-50 text-[11.5px] font-semibold text-red-800 flex items-start gap-2.5 overflow-hidden">
                  <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-red-600" /><span>{error}</span>
                </motion.div>
              )}
              {notice && !error && (
                <motion.div key="note" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                  className="mb-4 p-3.5 rounded-xl border border-emerald-100 bg-emerald-50 text-[11.5px] font-semibold text-emerald-800 flex items-start gap-2.5 overflow-hidden">
                  <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5 text-emerald-600" /><span>{notice}</span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* ── FORMS ── */}
            <AnimatePresence mode="wait">
              {/* SIGN IN */}
              {mode === 'signin' && (
                <motion.form key="signin" onSubmit={handleSignIn} className="space-y-4"
                  initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 12 }} transition={{ duration: 0.25 }}>
                  <Input label="Email Address" type="email" placeholder="you@cb.students.amrita.edu" icon={Mail} value={email} onChange={(e) => setEmail(e.target.value)} required />
                  <PasswordInput label="Password" value={password} onChange={setPassword} show={showPw} setShow={setShowPw} placeholder="••••••••" />
                  <Submit loading={loading} icon={ArrowRight}>Sign In</Submit>
                  <p className="text-center text-[11px] text-ignite-muted pt-1">
                    New here?{' '}
                    <button type="button" onClick={() => switchMode('signup')} className="font-bold text-ignite-secondaryAccent hover:underline">Create an account</button>
                  </p>
                </motion.form>
              )}

              {/* SIGN UP - FORM */}
              {mode === 'signup' && step === 'form' && (
                <motion.form key="signup" onSubmit={handleSendOtp} className="space-y-3.5"
                  initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 12 }} transition={{ duration: 0.25 }}>
                  <Input label="Full Name" placeholder="Jaha Jeevan" icon={User} value={name} onChange={(e) => setName(e.target.value)} required />
                  <Input label="Email Address" type="email" placeholder="you@cb.students.amrita.edu" icon={Mail} value={email} onChange={(e) => setEmail(e.target.value)} required />
                  <div className="grid grid-cols-2 gap-3">
                    <Input label="Register No." placeholder="CB.EN.U4CSE23001" icon={IdCard} value={regNo} onChange={(e) => setRegNo(e.target.value)} required />
                    <Input label="Phone (optional)" placeholder="9446001234" icon={Phone} value={phone} onChange={(e) => setPhone(e.target.value)} />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <SelectField label="Year of Study" icon={GraduationCap} value={year} onChange={setYear} placeholder="Select year"
                      options={YEARS.map((y) => ({ value: y, label: `Year ${y}` }))} />
                    <SelectField label="Class Section" icon={Users} value={section} onChange={setSection} placeholder="Select section"
                      options={SECTIONS.map((s) => ({ value: s, label: `Section ${s}` }))} />
                  </div>
                  <PasswordInput label="Password" value={password} onChange={setPassword} show={showPw} setShow={setShowPw} placeholder="Min 8 characters" />
                  {password && (
                    <div className="flex items-center gap-2 -mt-1">
                      <div className="flex-1 grid grid-cols-4 gap-1">
                        {[1, 2, 3, 4].map((i) => (
                          <span key={i} className={`h-1.5 rounded-full transition-colors ${i <= pwStrength ? STRENGTH[pwStrength].color : 'bg-ignite-champagne/60'}`} />
                        ))}
                      </div>
                      <span className="text-[10px] font-bold text-ignite-muted w-10">{STRENGTH[pwStrength].label}</span>
                    </div>
                  )}
                  <PasswordInput label="Confirm Password" value={confirm} onChange={setConfirm} show={showPw} setShow={setShowPw} placeholder="Re-enter password" />
                  <Submit loading={loading} icon={MailCheck}>Send Verification Code</Submit>
                  <p className="text-center text-[11px] text-ignite-muted pt-0.5">
                    Already registered?{' '}
                    <button type="button" onClick={() => switchMode('signin')} className="font-bold text-ignite-secondaryAccent hover:underline">Sign in</button>
                  </p>
                </motion.form>
              )}

              {/* SIGN UP - OTP */}
              {mode === 'signup' && step === 'otp' && (
                <motion.form key="otp" onSubmit={handleVerify} className="space-y-5"
                  initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.96 }} transition={{ duration: 0.3 }}>
                  <div className="flex justify-center">
                    <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-ignite-accent/10 border border-ignite-accent/25 text-ignite-secondaryAccent animate-riseIn">
                      <MailCheck className="h-7 w-7" />
                    </div>
                  </div>
                  <OtpField value={otp} onChange={setOtp} disabled={loading} />
                  {devCode && (
                    <p className="text-center text-[10px] text-amber-600 bg-amber-50 border border-amber-100 rounded-lg py-1.5 font-mono font-bold">
                      DEV MODE — code: {devCode}
                    </p>
                  )}
                  <Submit loading={loading} icon={CheckCircle2}>Verify &amp; Create Account</Submit>
                  <div className="flex items-center justify-between text-[11px]">
                    <button type="button" onClick={() => { setStep('form'); resetMessages(); }} className="inline-flex items-center gap-1 font-bold text-ignite-muted hover:text-ignite-text">
                      <ArrowLeft className="h-3.5 w-3.5" /> Back
                    </button>
                    <button type="button" onClick={handleResend} disabled={resendIn > 0}
                      className={`font-bold ${resendIn > 0 ? 'text-ignite-muted/60' : 'text-ignite-secondaryAccent hover:underline'}`}>
                      {resendIn > 0 ? `Resend in ${resendIn}s` : 'Resend code'}
                    </button>
                  </div>
                </motion.form>
              )}

              {/* ADMIN */}
              {mode === 'admin' && (
                <motion.form key="admin" onSubmit={handleAdmin} className="space-y-4"
                  initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -12 }} transition={{ duration: 0.25 }}>
                  <div className="flex items-center gap-2.5 rounded-xl bg-ignite-primary/[0.03] border border-ignite-champagne px-3.5 py-2.5 mb-1">
                    <ShieldCheck className="h-4 w-4 text-ignite-secondaryAccent" />
                    <span className="text-[11px] font-semibold text-ignite-muted">Restricted — faculty coordinators only.</span>
                  </div>
                  <Input label="Coordinator Email" type="email" placeholder="you@gmail.com" icon={User} value={email} onChange={(e) => setEmail(e.target.value)} required />
                  <PasswordInput label="Access Password" value={password} onChange={setPassword} show={showPw} setShow={setShowPw} placeholder="••••••••" />
                  <Submit loading={loading} icon={KeyRound}>Enter Command Center</Submit>
                </motion.form>
              )}
            </AnimatePresence>
          </div>
        </motion.div>

        <p className="text-center text-[10px] text-ignite-muted mt-5 font-semibold tracking-wide">
          Protected by one-time email verification · © 2026 Amrita Vishwa Vidyapeetham
        </p>
      </div>
    </section>
  );
}

/* ── labelled select (matches the auth input styling) ── */
function SelectField({ label, icon: Icon, value, onChange, options, placeholder }) {
  return (
    <label className="block">
      <span className="block text-[11px] font-semibold text-ignite-muted uppercase tracking-wider mb-1.5">{label} *</span>
      <div className="relative">
        {Icon && <div className="absolute left-3 top-1/2 -translate-y-1/2 text-ignite-muted pointer-events-none"><Icon className="h-3.5 w-3.5" /></div>}
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          required
          className={`h-10 w-full appearance-none rounded-xl border border-ignite-border bg-white text-xs outline-none transition-all duration-200 focus:border-ignite-accent focus:ring-2 focus:ring-ignite-accent/10 shadow-sm pl-9 pr-8 ${value ? 'text-ignite-text' : 'text-ignite-muted'}`}
        >
          <option value="" disabled>{placeholder}</option>
          {options.map((o) => <option key={o.value} value={o.value} className="text-ignite-text">{o.label}</option>)}
        </select>
        <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-ignite-muted pointer-events-none" />
      </div>
    </label>
  );
}

/* ── password input with show/hide ── */
function PasswordInput({ label, value, onChange, show, setShow, placeholder }) {
  return (
    <label className="block">
      <span className="block text-[11px] font-semibold text-ignite-muted uppercase tracking-wider mb-1.5">{label} *</span>
      <div className="relative">
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-ignite-muted pointer-events-none"><Lock className="h-3.5 w-3.5" /></div>
        <input
          type={show ? 'text' : 'password'}
          value={value}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
          required
          className="h-10 w-full rounded-xl border border-ignite-border bg-white text-xs text-ignite-text placeholder:text-ignite-muted outline-none transition-all duration-200 focus:border-ignite-accent focus:ring-2 focus:ring-ignite-accent/10 shadow-sm pl-9 pr-10"
        />
        <button type="button" onClick={() => setShow((s) => !s)} tabIndex={-1}
          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-ignite-muted hover:text-ignite-text transition-colors">
          {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>
    </label>
  );
}

/* ── 3D submit button ── */
function Submit({ children, loading, icon: Icon }) {
  return (
    <button
      type="submit"
      disabled={loading}
      className="btn-3d w-full h-12 mt-1 rounded-xl bg-crimson-royal text-white text-[11px] font-bold uppercase tracking-widest inline-flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
    >
      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <>{children}{Icon && <Icon className="h-4 w-4" />}</>}
    </button>
  );
}
