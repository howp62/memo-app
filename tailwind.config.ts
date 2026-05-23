import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: 'class',
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        // Noto Sans KR for Korean typography
        sans: ['var(--font-noto-sans-kr)', 'Noto Sans KR', 'sans-serif'],
      },
      colors: {
        note: {
          bg: '#F0F4FB',
          sidebar: '#E4ECF8',
          border: '#C2D3EE',
          active: '#D5E4F7',
          'active-border': '#244F9A',
        },
      },
      letterSpacing: {
        // Slightly tighter spacing works better for Korean
        korean: '-0.01em',
      },
      lineHeight: {
        // Korean text benefits from slightly more line height
        korean: '1.75',
      },
    },
  },
  plugins: [],
}

export default config
