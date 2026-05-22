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
        // Apple Notes-inspired warm palette
        note: {
          bg: '#fafaf7',
          sidebar: '#f0efe8',
          border: '#e2e0d6',
          active: '#fff4c2',
          'active-border': '#f0c040',
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
