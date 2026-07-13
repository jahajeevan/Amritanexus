import React, { useState, useEffect, useMemo } from 'react';
import { createRoot } from 'react-dom/client';
import { DataProvider, useData } from './context/DataContext';

import LandingView from './views/LandingView';
import DiscoveryView from './views/DiscoveryView';
import EventDetailsView from './views/EventDetailsView';
import StudentDashboardView from './views/StudentDashboardView';
import AdminDashboardView from './views/AdminDashboardView';
import SignInView from './views/SignInView';
import ContactView from './views/ContactView';
import Logo from './components/Logo';

import {
  GraduationCap, Calendar, User, Shield, Menu, X, ArrowRight, BookOpen, MapPin, Mail, Phone, Ticket
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import './styles.css';

const viewPaths = {
  home: '/',
  events: '/events',
  dashboard: '/dashboard',
  contact: '/contact',
  signin: '/signin',
  admin: '/admin',
};

function viewFromPath(pathname) {
  const clean = pathname.replace(/\.html$/, '').replace(/\/$/, '') || '/';
  if (clean === '/') return 'home';
  const match = Object.keys(viewPaths).find(key => viewPaths[key] === clean);
  return match || 'home';
}

function Shell({ activeView, setView }) {
  const { user, logout } = useData();
  const [menuOpen, setMenuOpen] = useState(false);

  const goto = (view) => {
    setView(view);
    setMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navItems = [
    { label: 'Events Directory', view: 'events' },
    { label: 'Contact Help', view: 'contact' },
    ...(user ? [{ label: 'My Dashboard', view: 'dashboard' }] : []),
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-ignite-border bg-[#FAFBFC]/80 backdrop-blur-md shadow-soft">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-5 lg:px-8">
        
        {/* Logo */}
        <button onClick={() => goto('home')} className="flex items-center text-left group">
          <Logo size={44} wordmark className="transition-transform duration-300 group-hover:scale-[1.02]" />
        </button>

        {/* Navigation Items (Desktop) */}
        <nav className="hidden items-center gap-2 lg:flex">
          {navItems.map((item) => (
            <button
              key={item.label}
              onClick={() => goto(item.view)}
              className={`rounded-xl px-4 py-2 text-xs font-bold uppercase tracking-wider transition-all duration-300 ${
                activeView === item.view || (item.view === 'events' && activeView.startsWith('eventDetail:'))
                  ? 'bg-ignite-crimson/10 text-ignite-crimson border border-ignite-crimson/20'
                  : 'text-ignite-muted hover:text-ignite-text hover:bg-ignite-secondary/50'
              }`}
            >
              {item.label}
            </button>
          ))}
        </nav>

        {/* Auth status buttons (Desktop) */}
        <div className="hidden items-center gap-3 md:flex">
          {user ? (
            <div className="flex items-center gap-3">
              <button
                onClick={() => goto('dashboard')}
                className="flex items-center gap-2 border border-ignite-border rounded-xl px-4 py-2 hover:border-ignite-accent hover:text-ignite-accent transition-all bg-white shadow-soft"
              >
                {user.role === 'admin' ? (
                  <Shield className="h-3.5 w-3.5 text-ignite-accent animate-pulse" />
                ) : (
                  <User className="h-3.5 w-3.5 text-ignite-accent" />
                )}
                <span className="text-xs font-bold text-ignite-text max-w-[120px] truncate">{user.name}</span>
              </button>
              <button
                onClick={() => { logout(); goto('home'); }}
                className="text-xs font-bold uppercase tracking-wider text-red-500 hover:text-red-600 hover:bg-red-50 px-4 py-2 rounded-xl transition-all"
              >
                Sign Out
              </button>
            </div>
          ) : (
            <>
              <button
                onClick={() => goto('signin')}
                className="text-xs font-bold uppercase tracking-wider text-ignite-text hover:text-ignite-accent px-4 py-2 rounded-xl transition-all"
              >
                Sign In
              </button>
              <button
                onClick={() => goto('signin')}
                className="h-10 bg-crimson-royal text-white hover:brightness-110 active:scale-[0.98] rounded-xl px-5 text-xs font-bold uppercase tracking-wider transition-all shadow-glowCrimson flex items-center gap-1.5"
              >
                Get Entry Pass
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </>
          )}
        </div>

        {/* Mobile Toggle Button */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-ignite-border bg-white text-ignite-text lg:hidden hover:bg-ignite-secondary transition-all shadow-soft"
          aria-label="Toggle menu"
        >
          {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile Nav Drawer */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="border-t border-ignite-border bg-[#FAFBFC] px-5 py-5 lg:hidden space-y-4 shadow-soft"
          >
            <div className="grid gap-1.5">
              <button
                onClick={() => goto('home')}
                className={`rounded-xl px-4 py-2.5 text-left text-xs font-bold uppercase tracking-wider ${activeView === 'home' ? 'bg-ignite-champagne text-ignite-accent' : 'text-ignite-muted'}`}
              >
                Home Page
              </button>
              {navItems.map((item) => (
                <button
                  key={item.label}
                  onClick={() => goto(item.view)}
                  className={`rounded-xl px-4 py-2.5 text-left text-xs font-bold uppercase tracking-wider ${activeView === item.view ? 'bg-ignite-champagne text-ignite-accent' : 'text-ignite-muted'}`}
                >
                  {item.label}
                </button>
              ))}
            </div>

            <div className="border-t border-ignite-border pt-4 flex flex-col gap-2">
              {user ? (
                <>
                  <div className="flex items-center gap-2 px-4 py-2.5 bg-white border border-ignite-border rounded-xl">
                    {user.role === 'admin' ? <Shield className="h-4 w-4 text-ignite-accent" /> : <User className="h-4 w-4 text-ignite-accent" />}
                    <span className="text-xs font-bold text-ignite-text">{user.name}</span>
                  </div>
                  <button
                    onClick={() => { logout(); goto('home'); }}
                    className="w-full text-center text-xs font-bold uppercase tracking-wider text-red-500 bg-red-50 border border-red-100 hover:bg-red-100 py-2.5 rounded-xl transition-all"
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => goto('signin')}
                    className="w-full text-center text-xs font-bold uppercase tracking-wider text-ignite-text border border-ignite-border hover:bg-ignite-secondary py-2.5 rounded-xl transition-all"
                  >
                    Sign In
                  </button>
                  <button
                    onClick={() => goto('signin')}
                    className="w-full text-center text-xs font-bold uppercase tracking-wider text-white bg-crimson-royal hover:brightness-110 py-2.5 rounded-xl transition-all flex items-center justify-center gap-1.5 shadow-glowCrimson"
                  >
                    Get Entry Pass
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

function Footer({ setView }) {
  const goto = (view) => {
    setView(view);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="border-t border-ignite-border bg-white py-12 relative z-10">
      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6 pb-8 border-b border-ignite-border">
          
          {/* Brand Logo info */}
          <div className="flex items-center gap-3 text-left">
            <img src="/amrita-emblem.svg" alt="Amrita" width={38} height={38} className="shrink-0 select-none" draggable={false} />
            <div>
              <p className="font-display text-sm font-extrabold text-ignite-text leading-tight">Amrita Nexus</p>
              <p className="text-[9px] font-bold text-ignite-crimson uppercase tracking-widest mt-0.5">Amrita Vishwa Vidyapeetham · IGNITE 2026</p>
            </div>
          </div>

          {/* Links */}
          <div className="flex flex-wrap gap-1">
            {[
              { label: 'Home Page', view: 'home' },
              { label: 'Events Catalogue', view: 'events' },
              { label: 'Dashboard Portal', view: 'dashboard' },
              { label: 'Contact Help', view: 'contact' },
            ].map((item) => (
              <button
                key={item.label}
                onClick={() => goto(item.view)}
                className="rounded-xl px-4 py-2 text-xs font-bold uppercase tracking-wider text-ignite-muted transition hover:bg-ignite-secondary hover:text-ignite-accent select-none"
              >
                {item.label}
              </button>
            ))}
          </div>

        </div>

        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-8 text-[10px] text-ignite-muted font-bold">
          <p>© 2026 Amrita Vishwa Vidyapeetham, Coimbatore Campus. All rights reserved.</p>
          <div className="flex gap-4">
            <a href="#privacy" className="hover:text-ignite-accent transition-colors">Privacy Guidelines</a>
            <a href="#terms" className="hover:text-ignite-accent transition-colors">Terms of Operations</a>
          </div>
        </div>
      </div>
    </footer>
  );
}

function App() {
  const { user } = useData();
  const [activeView, setActiveView] = useState(() => viewFromPath(window.location.pathname));

  const setView = (view) => {
    setActiveView(view);
    const nextPath = viewPaths[view] || '/';
    if (window.location.pathname !== nextPath && !view.includes(':')) {
      window.history.pushState({}, '', nextPath);
    }
  };

  useEffect(() => {
    const onPopState = () => setActiveView(viewFromPath(window.location.pathname));
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  const page = useMemo(() => {
    switch (true) {
      case activeView === 'events':
        return <DiscoveryView setView={setView} />;
      case activeView.startsWith('eventDetail:'):
        return <EventDetailsView eventId={activeView.split(':')[1]} setView={setView} />;
      case activeView === 'dashboard':
        if (!user) return <SignInView setView={setView} />;
        if (user.role === 'admin') return <AdminDashboardView setView={setView} />;
        return <StudentDashboardView setView={setView} />;
      case activeView === 'admin':
        if (!user || user.role !== 'admin') return <SignInView setView={setView} />;
        return <AdminDashboardView setView={setView} />;
      case activeView === 'signin':
        return <SignInView setView={setView} />;
      case activeView === 'contact':
        return <ContactView />;
      default:
        return <LandingView setView={setView} />;
    }
  }, [activeView, user]);

  return (
    <div className="min-h-screen bg-ignite-bg flex flex-col font-sans antialiased text-ignite-text">
      <Shell activeView={activeView} setView={setView} />
      
      <main className="flex-1 relative">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeView}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          >
            {page}
          </motion.div>
        </AnimatePresence>
      </main>

      <Footer setView={setView} />
    </div>
  );
}

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <DataProvider>
      <App />
    </DataProvider>
  </React.StrictMode>,
);
