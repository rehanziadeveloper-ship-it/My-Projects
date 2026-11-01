/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        cream: '#F6F8F3',
        dark: '#10201A',
        forest: {
          900: '#10201A',
          800: '#123524',
          700: '#1B6B3A',
          600: '#238647',
          500: '#2FA458',
          200: '#CFEBD6',
          100: '#E6F4EA',
          50: '#F4F9F5',
        },
        clinic: {
          bg: '#F6F8F3',
          text: '#123524',
          primary: '#1B6B3A',
          primaryHover: '#14532D',
          lightGreen: '#CFEBD6',
          dark: '#10201A',
          muted: '#526A5C',
          border: '#DCE6DD',
          card: '#FFFFFF',
        }
      },
      fontFamily: {
        sans: ['Outfit', 'sans-serif'],
        serif: ['Cormorant Garamond', 'serif'],
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
        '4xl': '2rem',
      },
      boxShadow: {
        'soft': '0 8px 30px -4px rgba(18, 53, 36, 0.06)',
        'soft-lg': '0 16px 40px -6px rgba(18, 53, 36, 0.1)',
        'glow': '0 0 25px rgba(27, 107, 58, 0.15)',
      }
    },
  },
  plugins: [],
}
