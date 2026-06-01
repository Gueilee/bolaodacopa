/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          gray:   '#414042',
          purple: '#422c76',
          pink:   '#ff2f69',
          cream:  '#faf9f5',
          neon:   '#01E18E',
        },
      },
      backgroundImage: {
        'sidebar-gradient': 'linear-gradient(180deg, #422c76 0%, #2a1a4e 100%)',
        'card-gradient':    'linear-gradient(135deg, #1e1a2e 0%, #16131f 100%)',
        'neon-glow':        'radial-gradient(circle, rgba(1,225,142,0.15) 0%, transparent 70%)',
      },
      boxShadow: {
        neon:   '0 0 20px rgba(1, 225, 142, 0.3)',
        purple: '0 0 20px rgba(66, 44, 118, 0.5)',
        pink:   '0 0 20px rgba(255, 47, 105, 0.4)',
        card:   '0 4px 24px rgba(0, 0, 0, 0.4)',
      },
      animation: {
        'fade-in':    'fadeIn 0.3s ease-out',
        'slide-up':   'slideUp 0.4s ease-out',
        'pulse-neon': 'pulseNeon 2s ease-in-out infinite',
      },
      keyframes: {
        fadeIn:    { from: { opacity: '0' }, to: { opacity: '1' } },
        slideUp:   { from: { opacity: '0', transform: 'translateY(16px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
        pulseNeon: {
          '0%, 100%': { boxShadow: '0 0 10px rgba(1,225,142,0.3)' },
          '50%':      { boxShadow: '0 0 30px rgba(1,225,142,0.7)' },
        },
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
