/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        night: '#f5f3eb',
        panel: '#ffffff',
        deep: '#eceade',
        card: '#ffffff',
        brand: {
          300: '#2e6b4f',
          400: '#1f5740',
          500: '#1b4d2e',
          700: '#123a21',
        },
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        glow: '0 0 30px rgba(26, 91, 255, 0.2)',
        card: '0 20px 40px -12px rgba(0, 0, 0, 0.6)',
        'card-light': '0 10px 30px -8px rgba(15, 23, 42, 0.08)',
      },
    },
  },
  plugins: [],
};
