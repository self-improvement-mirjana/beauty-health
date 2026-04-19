/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        shell: {
          bg: '#0f172a',
          panel: '#1e293b',
          border: '#334155',
          accent: '#f59e0b',
        },
      },
    },
  },
  plugins: [],
};
