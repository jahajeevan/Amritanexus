import React from 'react';

export default function Button({
  children,
  variant = 'primary',
  className = '',
  href,
  onClick,
  type = 'button',
  icon: Icon,
  disabled = false
}) {
  const styles = {
    primary:
      'bg-ignite-primary text-white hover:bg-ignite-secondaryAccent active:scale-[0.97] shadow-sm hover:shadow-glow transition-all duration-300',
    secondary:
      'border border-ignite-border bg-white text-ignite-text hover:bg-ignite-secondary active:scale-[0.97] transition-all duration-300',
    outline:
      'border border-ignite-border bg-transparent text-ignite-text hover:bg-ignite-secondary hover:border-ignite-accent active:scale-[0.97] transition-all duration-300',
    ghost:
      'text-ignite-muted hover:text-ignite-text hover:bg-ignite-secondary active:scale-[0.97] transition-all duration-300',
    accent:
      'bg-gradient-to-r from-ignite-accent to-ignite-secondaryAccent text-white hover:brightness-105 active:scale-[0.97] shadow-glow hover:shadow-lift transition-all duration-300',
    success:
      'bg-ignite-success text-white hover:brightness-105 active:scale-[0.97] transition-all duration-300',
    danger:
      'bg-ignite-error text-white hover:brightness-105 active:scale-[0.97] transition-all duration-300'
  };

  const commonClass = `inline-flex h-9.5 min-w-[110px] items-center justify-center gap-2 rounded-xl px-5 text-xs font-bold uppercase tracking-wider transition-all duration-300 select-none cursor-pointer focus:outline-none disabled:opacity-50 disabled:pointer-events-none ${styles[variant] || styles.primary} ${className}`;

  const inner = (
    <>
      {children}
      {Icon ? <Icon className="h-3.5 w-3.5" /> : null}
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
