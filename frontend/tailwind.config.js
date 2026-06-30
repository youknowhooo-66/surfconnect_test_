/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ocean: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e',
          950: '#082f49',
        },
        sand: {
          50: '#fafaf6',
          100: '#f5f4e8',
          200: '#ebe7c5',
          300: '#dbd498',
          400: '#c7b96c',
          500: '#b09e45',
          600: '#948133',
          700: '#756428',
          800: '#5a4d21',
          900: '#4c401d',
          950: '#2c240e',
        }
      },
      fontFamily: {
        sans: ['Outfit', 'Inter', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
