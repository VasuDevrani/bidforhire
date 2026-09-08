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
        bg: {
          DEFAULT: '#fafaf9',
          card: '#ffffff',
          'card-hover': '#fafaf9',
        },
        accent: {
          DEFAULT: '#e8714a',
          hover: '#d4613a',
        },
        border: '#e7e5e4',
        muted: '#78716c',
        rank: {
          gold: '#d97706',
          silver: '#64748b',
          bronze: '#b45309',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
    },
  },
  plugins: [],
}
export default config
