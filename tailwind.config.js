/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: {
          DEFAULT: '#1C1B19',
          light: '#2E2C28',
          deep: '#121110',
        },
        muted: '#8A8680',
        line: '#E9E4DC',
        cream: {
          DEFAULT: '#F8F5F0',
          soft: '#FAF8F5',
          deep: '#F1EBE1',
        },
        paper: '#FFFFFF',
        gold: {
          DEFAULT: '#A8834A',
          hover: '#94723D',
          dark: '#7D5F31',
          soft: '#F4ECE1',
          accent: '#C5A059',
        },
        sale: '#B4483C',
      },
      fontFamily: {
        serif: ['"Cormorant Garamond"', 'Georgia', 'serif'],
        sans: ['Manrope', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
      },
      borderRadius: {
        card: '14px',
        pill: '9999px',
      },
      boxShadow: {
        'soft': '0 2px 12px -2px rgba(28, 27, 25, 0.06), 0 1px 3px rgba(28, 27, 25, 0.04)',
        'soft-lg': '0 12px 36px -4px rgba(28, 27, 25, 0.1), 0 4px 12px rgba(28, 27, 25, 0.04)',
        'gold-glow': '0 0 25px rgba(168, 131, 74, 0.25)',
      },
    },
  },
  plugins: [],
}
