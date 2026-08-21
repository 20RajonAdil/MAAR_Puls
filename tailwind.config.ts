import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class',
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    container: { center: true, padding: '1rem' },
    extend: {
      colors: {
        // Core surfaces
        base: 'rgb(var(--surface-base) / <alpha-value>)',
        raised: 'rgb(var(--surface-raised) / <alpha-value>)',
        overlay: 'rgb(var(--surface-overlay) / <alpha-value>)',
        border: 'rgb(var(--border) / <alpha-value>)',
        // Text
        ink: 'rgb(var(--text-ink) / <alpha-value>)',
        muted: 'rgb(var(--text-muted) / <alpha-value>)',
        faint: 'rgb(var(--text-faint) / <alpha-value>)',
        // Brand — the "pulse" duotone
        signal: {
          DEFAULT: 'rgb(var(--signal) / <alpha-value>)',
          soft: 'rgb(var(--signal-soft) / <alpha-value>)',
        },
        pulse: {
          DEFAULT: 'rgb(var(--pulse-violet) / <alpha-value>)',
          soft: 'rgb(var(--pulse-violet-soft) / <alpha-value>)',
        },
        danger: 'rgb(var(--danger) / <alpha-value>)',
      },
      fontFamily: {
        display: ['var(--font-display)', 'sans-serif'],
        body: ['var(--font-body)', 'sans-serif'],
        mono: ['var(--font-mono)', 'monospace'],
      },
      borderRadius: {
        xs: '6px',
        sm: '10px',
        md: '14px',
        lg: '20px',
        xl: '28px',
      },
      boxShadow: {
        soft: '0 1px 2px rgb(0 0 0 / 0.06), 0 8px 24px -12px rgb(0 0 0 / 0.35)',
        glow: '0 0 0 1px rgb(var(--signal) / 0.25), 0 0 32px -4px rgb(var(--signal) / 0.35)',
      },
      backdropBlur: { xs: '2px' },
      keyframes: {
        pulseBar: {
          '0%, 100%': { transform: 'scaleY(0.3)' },
          '50%': { transform: 'scaleY(1)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-400px 0' },
          '100%': { backgroundPosition: '400px 0' },
        },
        floatSlow: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-8px)' },
        },
      },
      animation: {
        pulseBar: 'pulseBar 1.1s ease-in-out infinite',
        shimmer: 'shimmer 1.6s linear infinite',
        floatSlow: 'floatSlow 6s ease-in-out infinite',
      },
      transitionTimingFunction: {
        spring: 'cubic-bezier(0.22, 1, 0.36, 1)',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
};

export default config;
