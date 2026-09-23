/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        tag: {
          bg: '#FDF7EC',
          card: '#FFFDF8',
          border: '#EADFCB',
          'border-light': '#F0E3CE',
          brown: '#2E1B10',
          'brown-deep': '#1B0F06',
          'brown-muted': '#5C452F',
          'brown-light': '#8A5A2B',
          'brown-subtle': '#A88B64',
          amber: '#F5B21F',
          'amber-hover': '#FFC943',
          'amber-deep': '#C4881F',
          pill: '#F4EADA',
          espresso: '#3A2318',
        }
      },
      fontFamily: {
        baloo: ['"Baloo 2"', 'cursive', 'sans-serif'],
        manrope: ['Manrope', 'system-ui', 'sans-serif'],
        mono: ['"Space Mono"', 'monospace'],
      },
      boxShadow: {
        'warm-sm': '0 4px 12px -4px rgba(46, 27, 16, 0.15)',
        'warm-md': '0 12px 28px -10px rgba(46, 27, 16, 0.25)',
        'warm-lg': '0 26px 54px -28px rgba(46, 27, 16, 0.45)',
        'amber-glow': '0 12px 26px -8px rgba(245, 178, 31, 0.75)',
      },
      backgroundImage: {
        'dot-pattern': 'radial-gradient(#E4D6BE 1.1px, transparent 1.1px)',
        'dot-pattern-dark': 'radial-gradient(rgba(253, 247, 236, 0.15) 1.1px, transparent 1.1px)',
      }
    },
  },
  plugins: [],
}
