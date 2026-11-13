import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: ['class'],
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Paleta institucional sobria — sin colores de marca inventados
        primary: {
          DEFAULT: '#1e3a5f',
          foreground: '#ffffff',
          50: '#e8f0fb',
          100: '#c5d8f5',
          500: '#1e3a5f',
          600: '#17304f',
          700: '#102540',
        },
        secondary: {
          DEFAULT: '#2d7dd2',
          foreground: '#ffffff',
        },
        destructive: {
          DEFAULT: '#dc2626',
          foreground: '#ffffff',
        },
        muted: {
          DEFAULT: '#f4f6f9',
          foreground: '#6b7280',
        },
        accent: {
          DEFAULT: '#e8f0fb',
          foreground: '#1e3a5f',
        },
        border: '#e2e8f0',
        input: '#e2e8f0',
        ring: '#2d7dd2',
        background: '#f8fafc',
        foreground: '#1e293b',
        card: {
          DEFAULT: '#ffffff',
          foreground: '#1e293b',
        },
      },
      borderRadius: {
        lg: '0.5rem',
        md: '0.375rem',
        sm: '0.25rem',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
};

export default config;
