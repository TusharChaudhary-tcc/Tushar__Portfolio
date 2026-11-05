/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        mono: ['"Fira Code"', 'monospace'],
      },
      colors: {
        void: '#07080B',
        surface: '#0E1017',
        borderLine: '#1E2333',
        accentCyan: '#00F0FF',
        accentAmber: '#FFB800',
        accentViolet: '#A855F7',
        accentGreen: '#10B981',
      },
      keyframes: {
        pulseGlow: {
          '0%, 100%': { opacity: '0.4', transform: 'scale(1)' },
          '50%': { opacity: '0.8', transform: 'scale(1.05)' },
        },
        scanline: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(1000%)' },
        },
      },
      animation: {
        'pulse-glow': 'pulseGlow 4s ease-in-out infinite',
        scanline: 'scanline 8s linear infinite',
      },
    },
  },
};
