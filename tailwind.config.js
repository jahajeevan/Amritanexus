export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ignite: {
          bg: '#FAF9F6',
          secondary: '#F6F3EE',
          card: '#FFFFFF',
          primary: '#1E1E1E',
          accent: '#D4AF37',
          secondaryAccent: '#B8860B',
          champagne: '#E8D8B5',
          beige: '#F6F3EE',
          success: '#10B981',
          warning: '#F59E0B',
          error: '#EF4444',
          text: '#1E1E1E',
          muted: '#6B7280',
          border: '#E8D8B5',
          // Official Amrita Vishwa Vidyapeetham brand crimson
          crimson: '#A3133F',
          crimsonDark: '#7D0F30',
          crimsonDeep: '#5C0A24',
          crimsonNight: '#3A0A18',
        },
        amrita: {
          crimson: '#A3133F',
          crimsonDark: '#7D0F30',
          crimsonDeep: '#5C0A24',
          crimsonNight: '#3A0A18',
          gold: '#D4AF37',
          goldDark: '#B8860B',
          ivory: '#FAF9F6',
        },
      },
      boxShadow: {
        lift: '0 20px 40px rgba(30, 30, 30, 0.05)',
        soft: '0 8px 30px rgba(30, 30, 30, 0.02)',
        glow: '0 12px 32px rgba(212, 175, 55, 0.12)',
        glowCrimson: '0 14px 36px rgba(163, 19, 63, 0.20)',
        crimsonLift: '0 24px 50px rgba(92, 10, 36, 0.28)',
      },
      backgroundImage: {
        'crimson-royal': 'linear-gradient(155deg, #7D0F30 0%, #A3133F 45%, #5C0A24 100%)',
        'crimson-night': 'linear-gradient(160deg, #3A0A18 0%, #5C0A24 55%, #2a0712 100%)',
      },
      fontFamily: {
        sans: ['Inter', 'SF Pro Display', 'system-ui', 'sans-serif'],
        display: ['Playfair Display', 'Bodoni Moda', 'serif'],
      },
      keyframes: {
        floatPanel: {
          '0%, 100%': { transform: 'translateY(0) rotateX(0deg) rotateY(0deg)' },
          '50%': { transform: 'translateY(-14px) rotateX(4deg) rotateY(-5deg)' },
        },
        shine: {
          '0%': { transform: 'translateX(-120%) skewX(-18deg)' },
          '100%': { transform: 'translateX(180%) skewX(-18deg)' },
        },
        riseIn: {
          '0%': { opacity: '0', transform: 'translateY(22px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        floatPanel: 'floatPanel 6s ease-in-out infinite',
        shine: 'shine 2.8s ease-in-out infinite',
        riseIn: 'riseIn 0.7s ease-out both',
      },
    },
  },
  plugins: [],
};

