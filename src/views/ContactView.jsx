import React, { useState } from 'react';
import Button from '../components/Button';
import Input from '../components/Input';
import MapsEmbed from '../components/MapsEmbed';
import { MapPin, Mail, Phone, Clock, Send, CheckCircle, ChevronDown, ChevronUp, HelpCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const FAQS = [
  {
    q: 'How do I claim my Event Pass ticket?',
    a: 'Browse the Events Catalogue page, choose your desired event, and fill in the registration form (official email and register number are required). Your pass and unique QR code will reflect instantly in your student dashboard wallet.'
  },
  {
    q: 'What are Department credits points?',
    a: 'Participation in events contributes points to your department standings. Attendance checked at the event gates multiplies these credentials, updating the live standings leaderboard.'
  },
  {
    q: 'How do I print my participation certificate?',
    a: 'Once your attendance pass is verified at the event gate, a certificate credential unlocks in your dashboard. You can click "Certificate Preview" and print/download the official certificate directly.'
  },
  {
    q: 'Can I cancel an event pass registration?',
    a: 'Yes, if you are unable to attend, you can cancel your claimed pass in your Student Dashboard. This restores seat capacity for other students.'
  }
];

function AccordionFAQ({ q, a, active, onToggle }) {
  return (
    <div className="border border-ignite-champagne rounded-2xl bg-white overflow-hidden shadow-soft transition-all duration-300 hover:border-ignite-accent/40">
      <button 
        onClick={onToggle}
        className="w-full px-6 py-5 flex justify-between items-center text-[10px] font-bold text-ignite-text uppercase tracking-widest text-left transition-colors"
      >
        <span className="flex items-center gap-3">
          <HelpCircle className="h-4.5 w-4.5 text-ignite-accent shrink-0" />
          {q}
        </span>
        {active ? <ChevronUp className="h-4.5 w-4.5 text-ignite-accent" /> : <ChevronDown className="h-4.5 w-4.5 text-ignite-muted" />}
      </button>

      <AnimatePresence initial={false}>
        {active && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="px-6 pb-6 pt-1.5 text-xs text-ignite-muted font-medium leading-relaxed border-t border-ignite-champagne/40 bg-ignite-secondary/30">
              {a}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function ContactView() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [status, setStatus] = useState('idle'); // idle | loading | success
  const [openFaq, setOpenFaq] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) return;
    setStatus('loading');
    await new Promise(r => setTimeout(r, 800));
    setStatus('success');
    setForm({ name: '', email: '', subject: '', message: '' });
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-[#FAF9F6] py-16 relative overflow-hidden"
    >
      {/* Background radial blobs */}
      <div className="bg-blob bg-blob-gold top-1/4 right-0 w-[450px] h-[450px]" />
      <div className="bg-blob bg-blob-champagne bottom-1/4 left-0 w-[450px] h-[450px]" />

      <div className="mx-auto max-w-7xl px-5 lg:px-8 relative z-10">
        
        {/* Header */}
        <div className="mb-16 text-center max-w-2xl mx-auto">
          <span className="text-[10px] font-bold uppercase tracking-widest text-[#B8860B] bg-ignite-secondary border border-ignite-champagne px-3.5 py-1.5 rounded-full inline-block">
            Campus Support
          </span>
          <h1 className="mt-4 text-4xl md:text-5xl font-display font-bold text-ignite-text leading-tight tracking-tight">
            Coordination Desk
          </h1>
          <p className="text-xs text-ignite-muted mt-2 font-medium">
            Need support regarding registration limits, gate scans, or coordinator assignments? Contact us below.
          </p>
        </div>

        <div className="grid lg:grid-cols-5 gap-8 items-start mb-20">
          
          {/* Left: Help Details */}
          <div className="lg:col-span-2 space-y-4">
            {[
              {
                icon: MapPin,
                title: 'Campus Coordinates',
                value: 'Amrita Vishwa Vidyapeetham, Ettimadai, Coimbatore, Tamil Nadu 641112',
                link: 'https://maps.google.com/?q=Amrita+Vishwa+Vidyapeetham+Coimbatore'
              },
              {
                icon: Mail,
                title: 'Official Helpline Desk',
                value: 'ignite2026@cb.amrita.edu',
                link: 'mailto:ignite2026@cb.amrita.edu'
              },
              {
                icon: Phone,
                title: 'Desk Numbers',
                value: '+91 (422) 2685000',
                link: 'tel:+914222685000'
              },
              {
                icon: Clock,
                title: 'Office Hours',
                value: 'Monday – Saturday: 09:00 AM – 05:00 PM',
              }
            ].map(({ icon: Icon, title, value, link }) => {
              const inner = (
                <div className="flex gap-4.5 p-6 bg-white border border-ignite-champagne rounded-2xl hover-lift transition-all duration-300 shadow-soft">
                  <div className="h-10 w-10 bg-ignite-accent/5 rounded-xl border border-ignite-accent/20 flex items-center justify-center text-ignite-accent shrink-0 shadow-sm">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-[10px] font-bold text-ignite-text uppercase tracking-widest">{title}</h3>
                    <p className="text-xs text-ignite-muted mt-2 leading-relaxed font-semibold">{value}</p>
                  </div>
                </div>
              );

              return link ? (
                <a key={title} href={link} target="_blank" rel="noopener noreferrer" className="block focus:outline-none">
                  {inner}
                </a>
              ) : (
                <div key={title}>{inner}</div>
              );
            })}
          </div>

          {/* Right: Message Form */}
          <div className="lg:col-span-3 bg-white border border-ignite-champagne rounded-3xl p-6 md:p-10 shadow-soft">
            <h2 className="text-[10px] font-bold uppercase tracking-widest text-ignite-text mb-6">Send an Inquiry</h2>

            {status === 'success' && (
              <div className="mb-6 p-4 rounded-xl border border-emerald-100 bg-emerald-50 text-emerald-800 text-xs flex items-center gap-3">
                <CheckCircle className="h-5 w-5 text-emerald-600 shrink-0" />
                <div>
                  <p className="font-bold">Inquiry Sent Successfully</p>
                  <p className="text-emerald-650 mt-0.5 font-semibold">The Event Coordination Cell will contact you shortly.</p>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid md:grid-cols-2 gap-4">
                <Input
                  label="Your Full Name"
                  placeholder="Full Name"
                  value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                  required
                  disabled={status === 'loading'}
                />
                <Input
                  label="University Email"
                  type="email"
                  placeholder="name@cb.amrita.edu"
                  value={form.email}
                  onChange={e => setForm({ ...form, email: e.target.value })}
                  required
                  disabled={status === 'loading'}
                />
              </div>

              <Input
                label="Subject"
                placeholder="e.g. Registration seat issue"
                value={form.subject}
                onChange={e => setForm({ ...form, subject: e.target.value })}
                disabled={status === 'loading'}
              />

              <div>
                <label className="block text-[11px] font-bold text-ignite-muted uppercase tracking-wider mb-2">Message Content</label>
                <textarea
                  placeholder="Describe your issue here..."
                  value={form.message}
                  onChange={e => setForm({ ...form, message: e.target.value })}
                  required
                  rows={4}
                  disabled={status === 'loading'}
                  className="w-full border border-ignite-champagne rounded-xl text-xs font-medium text-ignite-text p-4 bg-white focus:border-ignite-accent outline-none resize-none transition-all disabled:bg-slate-50 disabled:text-ignite-muted"
                />
              </div>

              <Button
                type="submit"
                variant="accent"
                className="w-full h-12 text-[10px] uppercase tracking-widest font-bold rounded-xl"
                icon={Send}
                disabled={status === 'loading'}
              >
                {status === 'loading' ? 'Sending Message...' : 'Submit Inquiry'}
              </Button>
            </form>
          </div>

        </div>

        {/* Embedded Map & FAQ Grid */}
        <div className="grid md:grid-cols-2 gap-8 items-start border-t border-ignite-champagne/80 pt-16">
          
          {/* FAQ Accordion */}
          <div className="space-y-4">
            <h2 className="text-lg font-bold font-display text-ignite-text uppercase tracking-widest mb-6">Frequently Asked Questions</h2>
            {FAQS.map((faq, index) => (
              <AccordionFAQ
                key={index}
                q={faq.q}
                a={faq.a}
                active={openFaq === index}
                onToggle={() => setOpenFaq(openFaq === index ? null : index)}
              />
            ))}
          </div>

          {/* Map */}
          <div className="space-y-4">
            <h2 className="text-lg font-bold font-display text-ignite-text uppercase tracking-widest mb-6">Campus Location</h2>
            <MapsEmbed venueName="Amrita Vishwa Vidyapeetham, Ettimadai, Coimbatore" className="rounded-3xl border border-ignite-champagne shadow-soft h-[340px] overflow-hidden" />
          </div>

        </div>

      </div>
    </motion.div>
  );
}
