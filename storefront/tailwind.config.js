/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          bg: '#f5f5f5',
          panel: '#ffffff',
          border: '#e5e5e5',
          accent: '#111827',
          accentMuted: '#6b7280',
        },
      },
    },
  },
  plugins: [],
};
