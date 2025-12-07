import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        background: 'var(--background)',
        foreground: 'var(--foreground)',
        // LINE theme colors
        line: {
          green: '#06C755',
          dark: '#1E1E1E',
          light: '#F7F7F7',
        },
        // Reversi game colors
        reversi: {
          board: '#2D7A3E',
          black: '#1A1A1A',
          white: '#FAFAFA',
          valid: '#FFD700',
        },
      },
      // Mobile-first breakpoints
      screens: {
        xs: '375px',
        sm: '640px',
        md: '768px',
      },
    },
  },
  plugins: [],
};

export default config;
