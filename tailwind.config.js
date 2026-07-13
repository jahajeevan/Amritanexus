export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // ── Amrita Nexus design system ──────────────────────────────
        // Single institutional accent (Amrita maroon) on a clean neutral base.
        amrita: {
          maroon: '#9E1B32',      // primary institutional accent
          maroonDark: '#7C1327',
          maroonDeep: '#5A0E1D',
          maroonNight: '#2E0810',
          maroonSoft: '#FBEEF1',  // tinted surface / hover
          ink: '#16181D',         // primary text
          slate: '#4B5563',       // secondary text
          muted: '#6B7280',       // tertiary text
          faint: '#9AA1AC',       // captions / disabled
          line: '#E7E8EB',        // default border
          lineSoft: '#EFF0F2',    // subtle divider
          surface: '#FFFFFF',
          canvas: '#FAFAFB',      // page background
          panel: '#F6F6F8',       // grouped surface
        },
        // Back-compat aliases so untouched pages lose gold automatically.
        ignite: {
          bg: '#FAFAFB',
          secondary: '#F6F6F8',
          card: '#FFFFFF',
          primary: '#16181D',
          accent: '#9E1B32',
          secondaryAccent: '#7C1327',
          champagne: '#E7E8EB',
          beige: '#F6F6F8',
          success: '#0E9F6E',
          warning: '#B45309',
          error: '#DC2626',
          text: '#16181D',
          muted: '#6B7280',
          border: '#E7E8EB',
          crimson: '#9E1B32',
          crimsonDark: '#7C1327',
          crimsonDeep: '#5A0E1D',
          crimsonNight: '#2E0810',
        },
      },
      boxShadow: {
        // Minimal, soft elevation — nothing heavy.
        xs: '0 1px 2px rgba(16, 18, 24, 0.04)',
        sm: '0 1px 3px rgba(16, 18, 24, 0.06), 0 1px 2px rgba(16,18,24,0.04)',
        md: '0 4px 12px rgba(16, 18, 24, 0.06)',
        lg: '0 10px 30px rgba(16, 18, 24, 0.08)',
        // legacy names remapped to the restrained system
        lift: '0 10px 30px rgba(16, 18, 24, 0.08)',
        soft: '0 1px 3px rgba(16, 18, 24, 0.05)',
        glow: '0 1px 3px rgba(16, 18, 24, 0.06)',
        glowCrimson: '0 6px 20px rgba(158, 27, 50, 0.18)',
        crimsonLift: '0 12px 32px rgba(90, 14, 29, 0.22)',
      },
      borderRadius: {
        xl: '0.75rem',
        '2xl': '1rem',
        '3xl': '1.25rem',
      },
      backgroundImage: {
        // Subtle, near-flat maroon panels (no flashy gradients).
        'crimson-royal': 'linear-gradient(180deg, #9E1B32 0%, #7C1327 100%)',
        'crimson-night': 'linear-gradient(165deg, #2E0810 0%, #5A0E1D 60%, #3d0a16 100%)',
      },
      fontFamily: {
        sans: ['Inter', 'SF Pro Text', 'system-ui', 'sans-serif'],
        display: ['Inter', 'SF Pro Display', 'system-ui', 'sans-serif'],
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
      },
      letterSpacing: {
        tightest: '-0.03em',
      },
      keyframes: {
        riseIn: {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },
      animation: {
        riseIn: 'riseIn 0.6s cubic-bezier(0.16,1,0.3,1) both',
        fadeIn: 'fadeIn 0.5s ease-out both',
      },
    },
  },
  plugins: [],
};
