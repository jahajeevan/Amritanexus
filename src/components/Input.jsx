import React from 'react';

export default function Input({
  label,
  placeholder,
  type = 'text',
  value,
  onChange,
  required = false,
  className = '',
  options = [],
  name,
  icon: Icon,
  disabled = false
}) {
  const inputClass = `h-10 w-full rounded-xl border border-ignite-border bg-white text-xs text-ignite-text placeholder:text-ignite-muted outline-none transition-all duration-200 focus:border-ignite-accent focus:ring-2 focus:ring-ignite-accent/10 shadow-sm disabled:bg-slate-50 disabled:text-ignite-muted ${Icon ? 'pl-9 pr-3' : 'px-3'}`;

  const renderInput = () => {
    if (type === 'select') {
      return (
        <select
          name={name}
          value={value}
          onChange={onChange}
          required={required}
          disabled={disabled}
          className="h-10 w-full rounded-xl border border-ignite-border bg-white px-3 text-xs text-ignite-text placeholder:text-ignite-muted outline-none transition-all duration-200 focus:border-ignite-accent focus:ring-2 focus:ring-ignite-accent/10 shadow-sm disabled:bg-slate-50 disabled:text-ignite-muted"
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      );
    }

    if (type === 'textarea') {
      return (
        <textarea
          name={name}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          required={required}
          disabled={disabled}
          className="min-h-[90px] w-full resize-none rounded-xl border border-ignite-border bg-white px-3 py-2 text-xs text-ignite-text placeholder:text-ignite-muted outline-none transition-all duration-200 focus:border-ignite-accent focus:ring-2 focus:ring-ignite-accent/10 shadow-sm disabled:bg-slate-50 disabled:text-ignite-muted"
        />
      );
    }

    return (
      <div className="relative">
        {Icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center justify-center text-ignite-muted pointer-events-none">
            <Icon className="h-3.5 w-3.5" />
          </div>
        )}
        <input
          name={name}
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          required={required}
          disabled={disabled}
          className={inputClass}
        />
      </div>
    );
  };

  return (
    <label className={`block ${className}`}>
      {label && (
        <span className="block text-[11px] font-semibold text-ignite-muted uppercase tracking-wider mb-1.5">
          {label}{required && ' *'}
        </span>
      )}
      {renderInput()}
    </label>
  );
}

