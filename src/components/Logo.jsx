import React from 'react';

/**
 * Official Amrita Vishwa Vidyapeetham emblem + optional wordmark.
 * tone: 'brand' (crimson emblem) | 'white' (for dark surfaces)
 */
export default function Logo({
  size = 40,
  tone = 'brand',
  wordmark = false,
  subtitle = 'IGNITE 2026',
  className = '',
}) {
  const filter = tone === 'white' ? 'brightness(0) invert(1)' : 'none';

  return (
    <span className={`inline-flex items-center gap-3 ${className}`}>
      <img
        src="/amrita-emblem.svg"
        alt="Amrita Vishwa Vidyapeetham"
        width={size}
        height={size}
        style={{ width: size, height: size, filter, objectFit: 'contain' }}
        className="shrink-0 select-none"
        draggable={false}
      />
      {wordmark && (
        <span className="leading-none">
          <span
            className={`block font-display font-extrabold tracking-tight ${
              tone === 'white' ? 'text-white' : 'text-ignite-text'
            }`}
            style={{ fontSize: size * 0.42 }}
          >
            AMRITA NEXUS
          </span>
          {subtitle && (
            <span
              className="block font-bold uppercase tracking-[0.28em] text-ignite-crimson mt-1"
              style={{ fontSize: Math.max(7, size * 0.19) }}
            >
              {subtitle}
            </span>
          )}
        </span>
      )}
    </span>
  );
}
