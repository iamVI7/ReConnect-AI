/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        paper: '#FAF9F6',
        'paper-alt': '#F2F0EA',
        ink: '#1C2430',
        'ink-soft': '#545F68',
        'ink-faint': '#8A929A',
        trust: '#2B4C5C',
        'trust-deep': '#1E3843',
        signal: '#E0A458',
        'signal-soft': '#F3D9B1',
        verified: '#7A9B76',
        line: '#E4E1D8',
      },
      fontFamily: {
        display: ['"Fraunces"', 'ui-serif', 'Georgia', 'serif'],
        body: ['"Inter"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'ui-monospace', 'monospace'],
      },
      keyframes: {
        'pulse-ring': {
          '0%': { transform: 'scale(0.6)', opacity: '0.55' },
          '80%': { transform: 'scale(1.9)', opacity: '0' },
          '100%': { transform: 'scale(1.9)', opacity: '0' },
        },
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(14px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        'pulse-ring': 'pulse-ring 3s cubic-bezier(0.2,0.6,0.4,1) infinite',
        'fade-up': 'fade-up 0.6s ease-out both',
      },
      boxShadow: {
        soft: '0 1px 2px rgba(28,36,48,0.04), 0 8px 24px -12px rgba(28,36,48,0.10)',
      },
    },
  },
  plugins: [],
};
