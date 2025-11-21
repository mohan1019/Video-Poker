import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        poker: {
          green: '#0B5B3E',
          'green-light': '#0F7A52',
          'green-dark': '#073D29',
          gold: '#FFD700',
          'gold-light': '#FFE55C',
          'gold-dark': '#CCa800',
          red: '#DC143C',
          blue: '#1E3A8A',
        },
      },
      boxShadow: {
        'card': '0 4px 6px -1px rgba(0, 0, 0, 0.3), 0 2px 4px -1px rgba(0, 0, 0, 0.2)',
        'card-held': '0 8px 16px -2px rgba(255, 215, 0, 0.5), 0 4px 8px -2px rgba(255, 215, 0, 0.3)',
        'neon': '0 0 10px rgba(255, 215, 0, 0.8), 0 0 20px rgba(255, 215, 0, 0.6)',
      },
      animation: {
        'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
        'slide-up': 'slideUp 0.5s ease-out',
      },
      keyframes: {
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 10px rgba(255, 215, 0, 0.5)' },
          '50%': { boxShadow: '0 0 20px rgba(255, 215, 0, 0.9)' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}
export default config
