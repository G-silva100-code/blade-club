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
        gold: {
          DEFAULT: '#C9A84C',
          light:   '#D4B86A',
          dark:    '#A8873A',
        },
        blade: {
          bg:     '#0A0A0A',
          card:   '#141414',
          border: '#222222',
          muted:  '#888888',
          text:   '#F5F5F0',
        },
        // mantidos para compatibilidade com páginas internas
        brand: {
          50:  '#fdf8f0',
          100: '#faecd8',
          200: '#f4d5a8',
          300: '#ecb96e',
          400: '#e39a42',
          500: '#C9A84C',
          600: '#A8873A',
          700: '#a34c14',
          800: '#843d18',
          900: '#6c3316',
          950: '#3d1908',
        },
      },
      fontFamily: {
        display: ['var(--font-playfair)', 'Georgia', 'serif'],
        sans:    ['var(--font-inter)', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

export default config
