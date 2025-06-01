/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './constant/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#F97316',
        'primary-hover': '#EA580C',
        'primary-light': '#FD8733',
        secondary: '#FACC15',
        'text-main': '#0a0a0a',
        'text-light': '#ffffff',
        surface: '#F5F5F5',
        border: '#E2E8F0',
        error: '#DC2626',
        success: '#16A34A',
        info: '#0EA5E9',
      },
    },
  },
  plugins: [],
} 