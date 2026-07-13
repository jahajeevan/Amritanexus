import React from 'react';

/* Shared dashboard design-system primitives — one consistent language
   across the student workspace and the faculty operations console. */

export function StatCard({ icon: Icon, label, value, sub }) {
  return (
    <div className="rounded-2xl border border-amrita-line bg-white p-5 shadow-xs">
      <span className="grid h-9 w-9 place-items-center rounded-lg bg-amrita-maroonSoft text-amrita-maroon">
        <Icon className="h-4 w-4" />
      </span>
      <p className="mt-4 text-[26px] font-extrabold leading-none tracking-tight text-amrita-ink">{value}</p>
      <p className="mt-1.5 text-[11.5px] font-medium text-amrita-muted">{label}</p>
      {sub && <p className="mt-0.5 text-[11px] text-amrita-faint">{sub}</p>}
    </div>
  );
}

export function Panel({ title, subtitle, action, children, className = '', bodyClass = '' }) {
  return (
    <section className={`overflow-hidden rounded-2xl border border-amrita-line bg-white shadow-xs ${className}`}>
      {(title || action) && (
        <header className="flex items-center justify-between gap-3 border-b border-amrita-lineSoft px-5 py-4">
          <div>
            <h3 className="text-[13px] font-bold tracking-tight text-amrita-ink">{title}</h3>
            {subtitle && <p className="mt-0.5 text-[11.5px] text-amrita-muted">{subtitle}</p>}
          </div>
          {action}
        </header>
      )}
      <div className={bodyClass}>{children}</div>
    </section>
  );
}

const TONES = {
  neutral: 'bg-amrita-panel text-amrita-slate border-amrita-line',
  maroon: 'bg-amrita-maroonSoft text-amrita-maroon border-amrita-maroon/20',
  success: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  warning: 'bg-amber-50 text-amber-700 border-amber-200',
  danger: 'bg-red-50 text-red-700 border-red-200',
};
export function Badge({ children, tone = 'neutral', className = '' }) {
  return (
    <span className={`inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-[10.5px] font-semibold ${TONES[tone]} ${className}`}>
      {children}
    </span>
  );
}

export function EmptyState({ icon: Icon, title, hint, action }) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
      <span className="grid h-12 w-12 place-items-center rounded-xl bg-amrita-panel text-amrita-faint">
        <Icon className="h-6 w-6" />
      </span>
      <p className="mt-4 text-[14px] font-semibold text-amrita-ink">{title}</p>
      {hint && <p className="mt-1 max-w-xs text-[12.5px] leading-relaxed text-amrita-muted">{hint}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

export function NavItem({ icon: Icon, label, active, onClick, badge }) {
  return (
    <button
      onClick={onClick}
      aria-current={active ? 'page' : undefined}
      className={`flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-left text-[13px] font-medium transition-colors ${
        active
          ? 'bg-amrita-maroon text-white'
          : 'text-amrita-slate hover:bg-amrita-panel hover:text-amrita-ink'
      }`}
    >
      <Icon className={`h-4 w-4 shrink-0 ${active ? 'text-white' : 'text-amrita-muted'}`} />
      <span className="flex-1">{label}</span>
      {badge != null && (
        <span className={`rounded-md px-1.5 py-0.5 text-[10px] font-bold ${active ? 'bg-white/20 text-white' : 'bg-amrita-panel text-amrita-muted'}`}>
          {badge}
        </span>
      )}
    </button>
  );
}

/* Loading skeleton block */
export function Skeleton({ className = '' }) {
  return <div className={`animate-pulse rounded-lg bg-amrita-panel ${className}`} />;
}
