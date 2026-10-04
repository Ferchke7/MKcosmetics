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
          DEFAULT: '#191A15',
          light: '#2E2F29',
          deep: '#12130F',
        },
        muted: '#7E7A72',
        line: '#E7E0D5',
        kraft: {
          DEFAULT: '#C88A58',
          hover: '#B5743D',
          light: '#E8A86C',
          soft: '#F5EFEB',
          deep: '#8E582C',
        },
        sand: {
          DEFAULT: '#F4EFEA',
          soft: '#FAF7F2',
          deep: '#ECE4DA',
        },
        cream: {
          DEFAULT: '#F7F3EC',
          soft: '#FAF7F2',
          deep: '#EFE7DC',
        },
        paper: '#FFFFFF',
        gold: {
          DEFAULT: '#C88A58',
          hover: '#B5743D',
          dark: '#9B6130',
          soft: '#F5EFEB',
          accent: '#D49B6A',
        },
        sale: '#C25745',
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
