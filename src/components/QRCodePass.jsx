import React from 'react';
import { Ticket, Calendar, MapPin, User, Hash } from 'lucide-react';

export default function QRCodePass({ ticket, registration }) {
  const activeTicket = ticket || registration;
  if (!activeTicket) return null;

  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&color=0f172a&data=${encodeURIComponent(activeTicket.ticketId || activeTicket.id)}`;

  return (
    <div className="border border-ignite-border bg-white rounded-2xl overflow-hidden shadow-soft max-w-sm mx-auto hover-lift transition-all duration-300">
      {/* Top Header Badge */}
      <div className="bg-gradient-to-r from-ignite-primary to-ignite-accent p-4 text-white flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Ticket className="h-4 w-4 text-white/90" />
          <span className="text-[10px] font-bold uppercase tracking-wider">Official Student Pass</span>
        </div>
        <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
          activeTicket.status === 'Confirmed' 
            ? 'bg-white/20 text-white' 
            : activeTicket.status === 'Pending' 
              ? 'bg-amber-400/20 text-amber-300' 
              : 'bg-red-500/20 text-red-300'
        }`}>
          {activeTicket.status}
        </span>
      </div>

      <div className="p-6 flex flex-col items-center">
        {/* Event Title */}
        <h4 className="text-base font-extrabold text-ignite-text text-center">{activeTicket.eventTitle}</h4>
        <p className="text-[10px] font-bold text-ignite-primary uppercase tracking-wider mt-1">{activeTicket.eventCategory}</p>

        {/* QR Code Container */}
        <div className="mt-5 border border-ignite-border bg-slate-50 rounded-xl p-4 flex flex-col items-center shadow-inner">
          <img
            src={qrUrl}
            alt="Ticket QR Code verification pass"
            className="w-36 h-36 border border-slate-200 bg-white p-1 rounded-lg"
            onError={(e) => {
              e.target.src = 'https://via.placeholder.com/150?text=QR+Code';
            }}
          />
          <div className="mt-3 flex items-center gap-1 text-[10px] font-mono font-bold text-ignite-muted">
            <Hash className="h-3 w-3 shrink-0" />
            <span>ID: {activeTicket.ticketId || activeTicket.id}</span>
          </div>
        </div>

        {/* Ticket Details Grid */}
        <div className="mt-6 w-full space-y-3.5 border-t border-ignite-border pt-5 text-xs text-ignite-text">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-2 text-ignite-muted font-medium">
              <User className="h-3.5 w-3.5 text-ignite-accent" />
              Student
            </span>
            <span className="font-bold text-right truncate pl-4 max-w-[200px]">
              {activeTicket.studentName}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="flex items-center gap-2 text-ignite-muted font-medium">
              <Hash className="h-3.5 w-3.5 text-ignite-accent" />
              Register Number
            </span>
            <span className="font-mono font-bold uppercase">{activeTicket.registerNum}</span>
          </div>

          <div className="flex items-center justify-between">
            <span className="flex items-center gap-2 text-ignite-muted font-medium">
              <Calendar className="h-3.5 w-3.5 text-ignite-accent" />
              Schedule
            </span>
            <span className="font-semibold">{activeTicket.eventDate} @ {activeTicket.eventTime}</span>
          </div>

          <div className="flex items-center justify-between">
            <span className="flex items-center gap-2 text-ignite-muted font-medium">
              <MapPin className="h-3.5 w-3.5 text-ignite-accent" />
              Venue
            </span>
            <span className="font-semibold text-right max-w-[160px] truncate">{activeTicket.venue || 'Tech Arena'}</span>
          </div>
        </div>

        {/* Attendance Status Banner */}
        <div className="mt-5 w-full">
          {activeTicket.attendance === 'present' ? (
            <div className="bg-emerald-50 border border-emerald-100 rounded-lg p-2.5 text-center text-xs font-bold text-emerald-800">
              ✓ Attendance Verified
            </div>
          ) : activeTicket.status === 'Cancelled' ? (
            <div className="bg-red-50 border border-red-100 rounded-lg p-2.5 text-center text-xs font-bold text-red-800">
              Registration Cancelled
            </div>
          ) : (
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-center text-xs font-semibold text-ignite-muted">
              Hold QR up at Gate checkin
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
