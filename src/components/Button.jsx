import React from 'react';

export default function Button({
  children,
  variant = 'primary',
  className = '',
  href,
  onClick,
  type = 'button',
  icon: Icon,
  disabled = false,
}) {
  const styles = {
    // Primary institutional action — Amrita maroon, flat.
    primary:
      'bg-amrita-maroon text-white hover:bg-amrita-maroonDark active:translate-y-px shadow-sm transition-all duration-200',
    crimson:
      'bg-amrita-maroon text-white hover:bg-amrita-maroonDark active:translate-y-px shadow-sm transition-all duration-200',
    accent:
      'bg-amrita-maroon text-white hover:bg-amrita-maroonDark active:translate-y-px shadow-sm transition-all duration-200',
    secondary:
      'bg-white text-amrita-ink border border-amrita-line hover:bg-amrita-panel hover:border-amrita-slate/30 active:translate-y-px transition-all duration-200',
    outline:
      'bg-transparent text-amrita-ink border border-amrita-line hover:border-amrita-maroon hover:text-amrita-maroon active:translate-y-px transition-all duration-200',
    ghost:
      'bg-transparent text-amrita-slate hover:text-amrita-ink hover:bg-amrita-panel active:translate-y-px transition-all duration-200',
    success:
      'bg-amrita-success text-white hover:brightness-105 active:translate-y-px transition-all duration-200',
    danger:
      'bg-amrita-error text-white hover:brightness-105 active:translate-y-px transition-all duration-200',
  };

  const commonClass = `inline-flex h-10 min-w-[110px] items-center justify-center gap-2 rounded-xl px-5 text-xs font-semibold tracking-wide transition-all duration-200 select-none cursor-pointer focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amrita-maroon disabled:opacity-45 disabled:pointer-events-none ${styles[variant] || styles.primary} ${className}`;

  const inner = (
    <>
      {children}
      {Icon ? <Icon className="h-4 w-4" /> : null}
    </>
  );

  if (href) {
    return (
      <a href={href} className={commonClass}>
        {inner}
      </a>
    );
  }

  return (
    <button type={type} onClick={onClick} className={commonClass} disabled={disabled}>
      {inner}
    </button>
  );
}
