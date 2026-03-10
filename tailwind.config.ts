import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          acid:    '#d4f000',
          black:   '#080808',
          mid:     '#1a1a1a',
          border:  '#2a2a2a',
          cream:   '#f5f0e8',
          red:     '#ff2d2d',
        },
      },
      fontFamily: {
        bebas:  ['var(--font-bebas)', 'sans-serif'],
        mono:   ['var(--font-space-mono)', 'monospace'],
        sans:   ['var(--font-dm-sans)', 'sans-serif'],
      },
      animation: {
        'pulse-slow': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float':      'float 4s ease-in-out infinite',
        'slide-in':   'slideIn 0.4s ease forwards',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px) rotate(-2deg)' },
          '50%':      { transform: 'translateY(-20px) rotate(-2deg)' },
        },
        slideIn: {
          from: { opacity: '0', transform: 'translateX(20px)' },
          to:   { opacity: '1', transform: 'translateX(0)' },
        },
      },
    },
  },
  plugins: [],
}

export default config
