/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        gold: {
          50: '#fdfbf7',
          100: '#f9f4ea',
          200: '#f2e5cb',
          300: '#e8d1a3',
          400: '#dcba75',
          500: '#cfa44c',
          600: '#b88938',
          700: '#946a2c',
          800: '#795427',
          900: '#654524',
        },
        slate: {
          850: '#151d2e',
          950: '#090d16',
        }
      },
      fontFamily: {
        serif: ['Cinzel', 'Playfair Display', 'Georgia', 'serif'],
        sans: ['Plus Jakarta Sans', 'Inter', 'sans-serif'],
      }
    },
  },
  plugins: [],
};
