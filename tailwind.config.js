/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Baloo 2"', 'system-ui', 'sans-serif'],
        body: ['Nunito', 'system-ui', 'sans-serif'],
        arabic: ['"Scheherazade New"', '"Amiri"', 'serif'],
      },
      colors: {
        sand: {
          50: '#fdfbf5',
          100: '#fbf5e6',
          200: '#f6e9c9',
        },
        emerald2: {
          DEFAULT: '#0f8a6e',
          dark: '#0a6e57',
        },
        teal2: '#11a6a6',
        amber2: '#f6a623',
        gold: '#e8b923',
        plum: '#6b4e8f',
        coral: '#ff7a59',
      },
      boxShadow: {
        soft: '0 10px 30px -12px rgba(15, 138, 110, 0.35)',
        card: '0 8px 24px -10px rgba(80, 60, 20, 0.25)',
        pop: '0 4px 0 0 rgba(0,0,0,0.12)',
      },
      keyframes: {
        pop: {
          '0%': { transform: 'scale(0.85)', opacity: '0' },
          '70%': { transform: 'scale(1.05)' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        floaty: {
          '0%,100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        slidein: {
          '0%': { transform: 'translateY(16px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        confettifall: {
          '0%': { transform: 'translateY(-10vh) rotate(0deg)', opacity: '1' },
          '100%': { transform: 'translateY(110vh) rotate(720deg)', opacity: '0' },
        },
      },
      animation: {
        pop: 'pop 0.4s cubic-bezier(0.34,1.56,0.64,1) both',
        floaty: 'floaty 3s ease-in-out infinite',
        slidein: 'slidein 0.4s ease-out both',
        shimmer: 'shimmer 2.5s linear infinite',
        confettifall: 'confettifall 2.5s ease-in forwards',
      },
    },
  },
  plugins: [],
}
