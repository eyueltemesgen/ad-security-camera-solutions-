/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        night: '#0b0e14',
        panel: '#0f131c',
        deep: '#080b10',
        card: '#141b28',
        brand: {
          300: '#7aa9ff',
          400: '#3b7bff',
          500: '#1a5bff',
          700: '#0a3bb5',
        },
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        glow: '0 0 30px rgba(26, 91, 255, 0.2)',
        card: '0 20px 40px -12px rgba(0, 0, 0, 0.6)',
      },
    },
  },
  plugins: [],
};
