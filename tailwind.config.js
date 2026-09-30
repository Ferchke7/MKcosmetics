/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#FDF8F6',
          100: '#F7EDE8',
          200: '#EED9CF',
          300: '#E1BEAF',
          400: '#D09E88',
          500: '#C2836B',
          600: '#A96851',
          700: '#8A503C',
          800: '#6C3E2E',
          900: '#4D2C20',
          rose: '#E8A598',
          gold: '#C5A880',
          champagne: '#E5D3B3',
          sage: '#6B8E7D',
          dark: '#1C1917',
          surface: '#FDFBF9',
          card: '#FFFFFF',
          muted: '#8C827A'
        }
      },
      fontFamily: {
        serif: ['"Playfair Display"', 'Georgia', 'serif'],
        sans: ['"Plus Jakarta Sans"', 'Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'soft': '0 4px 20px -2px rgba(194, 131, 107, 0.08), 0 2px 6px -1px rgba(0, 0, 0, 0.04)',
        'soft-lg': '0 10px 30px -4px rgba(194, 131, 107, 0.12), 0 4px 12px -2px rgba(0, 0, 0, 0.06)',
        'gold-glow': '0 0 25px rgba(197, 168, 128, 0.25)',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out forwards',
        'slide-up': 'slideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'float': 'float 4s ease-in-out infinite',
        'pulse-subtle': 'pulseSubtle 3s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-6px)' },
        },
        pulseSubtle: {
          '0%, 100%': { transform: 'scale(1)', opacity: '1' },
          '50%': { transform: 'scale(1.03)', opacity: '0.9' },
        }
      }
    },
  },
  plugins: [],
}
