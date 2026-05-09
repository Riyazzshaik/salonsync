/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#0F172A',
        secondary: '#1E293B',
        accent: '#10B981',
        background: '#F8FAFC',
        text: '#111827',
        muted: '#64748B',
      },
      fontFamily: {
        sans: ['Inter', 'Satoshi', 'Poppins', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
