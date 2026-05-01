/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        surface: '#fafaf9', // stone-50
        'surface-dim': '#f5f5f4', // stone-100
        'surface-bright': '#ffffff',
        'surface-container-lowest': '#ffffff',
        'surface-container-low': '#fafaf9',
        'surface-container': '#f5f5f4',
        'surface-container-high': '#e7e5e4', // stone-200
        'surface-container-highest': '#d6d3d1', // stone-300
        'on-surface': '#1c1917', // stone-900
        'on-surface-variant': '#78716c', // stone-500
        'inverse-surface': '#1c1917',
        'inverse-on-surface': '#fafaf9',
        outline: '#e7e5e4', // stone-200
        'outline-variant': '#d6d3d1', // stone-300
        'surface-tint': '#d97706', // amber-600
        primary: '#f59e0b', // saffron-500
        'on-primary': '#ffffff',
        'primary-container': '#fef3c7',
        'on-primary-container': '#92400e',
        'inverse-primary': '#fcd34d',
        saffron: {
          50: '#fffbeb',
          100: '#fef3c7',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706',
          700: '#b45309',
          800: '#92400e',
          900: '#78350f',
          950: '#451a03',
        },
        secondary: '#78716c', // stone-500
        'on-secondary': '#ffffff',
        'secondary-container': '#e7e5e4', // stone-200
        'on-secondary-container': '#1c1917', // stone-900
        tertiary: '#ea580c', // orange-600
        'on-tertiary': '#ffffff',
        'tertiary-container': '#ffedd5', // orange-100
        'on-tertiary-container': '#9a3412', // orange-800
        error: '#dc2626',
        'on-error': '#ffffff',
        'error-container': '#fee2e2',
        'on-error-container': '#991b1b',
        background: '#f5f5f4', // stone-100
        'on-background': '#1c1917', // stone-900
        'surface-variant': '#f5f5f4',
      },
      fontFamily: { sans: ['Inter', 'system-ui', 'sans-serif'] },
      animation: {
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'ken-burns': 'ken-burns 20s ease-in-out infinite alternate',
      },
      keyframes: {
        'ken-burns': {
          '0%': { transform: 'scale(1.1) translate(0, 0)' },
          '100%': { transform: 'scale(1.2) translate(-2%, -2%)' },
        }
      }
    },
  },
  plugins: [],
};
