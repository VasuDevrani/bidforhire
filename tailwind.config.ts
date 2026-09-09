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
        background:  '#FFFDF5',
        foreground:  '#1E293B',
        muted: {
          DEFAULT:    '#F1F5F9',
          foreground: '#64748B',
        },
        accent: {
          DEFAULT:    '#8B5CF6',
          foreground: '#FFFFFF',
          light:      '#EDE9FE',
        },
        secondary:   '#F472B6',
        tertiary:    '#FBBF24',
        quaternary:  '#34D399',
        border:      '#E2E8F0',
        card:        '#FFFFFF',
        input:       '#FFFFFF',
        ring:        '#8B5CF6',
        // legacy aliases kept so other pages don't break
        bg: {
          DEFAULT:      '#FFFDF5',
          card:         '#FFFFFF',
          'card-hover': '#F8FAFC',
        },
      },
      fontFamily: {
        sans:    ['"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
        display: ['"Outfit"', 'system-ui', 'sans-serif'],
        mono:    ['JetBrains Mono', 'monospace'],
      },
      borderRadius: {
        sm: '8px',
        md: '16px',
        lg: '24px',
      },
      boxShadow: {
        pop:          '4px 4px 0px 0px #1E293B',
        'pop-sm':     '3px 3px 0px 0px #1E293B',
        'pop-hover':  '6px 6px 0px 0px #1E293B',
        'pop-active': '2px 2px 0px 0px #1E293B',
        'pop-pink':   '6px 6px 0px 0px #F472B6',
        'pop-violet': '6px 6px 0px 0px #8B5CF6',
        'pop-amber':  '6px 6px 0px 0px #FBBF24',
        'pop-emerald':'6px 6px 0px 0px #34D399',
      },
      transitionTimingFunction: {
        bounce: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
      },
      animation: {
        wiggle:      'wiggle 0.4s ease-in-out',
        'pop-in':    'popIn 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) both',
        float:       'float 4s ease-in-out infinite',
        'float-slow':'float 7s ease-in-out infinite',
        'float-rev': 'floatRev 5s ease-in-out infinite',
        marquee:     'marquee 25s linear infinite',
        'spin-slow': 'spin 10s linear infinite',
      },
      keyframes: {
        wiggle: {
          '0%, 100%': { transform: 'rotate(0deg)' },
          '33%':       { transform: 'rotate(3deg)' },
          '66%':       { transform: 'rotate(-3deg)' },
        },
        popIn: {
          '0%':   { transform: 'scale(0.4)', opacity: '0' },
          '100%': { transform: 'scale(1)',   opacity: '1' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%':       { transform: 'translateY(-14px)' },
        },
        floatRev: {
          '0%, 100%': { transform: 'translateY(0px) rotate(0deg)' },
          '50%':       { transform: 'translateY(-10px) rotate(5deg)' },
        },
        marquee: {
          '0%':   { transform: 'translateX(0%)' },
          '100%': { transform: 'translateX(-50%)' },
        },
      },
    },
  },
  plugins: [],
}
export default config
