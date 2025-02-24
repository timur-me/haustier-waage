/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        dark: {
          primary: '#1a1a1a',
          secondary: '#2d2d2d',
          accent: '#3b82f6',
          text: '#e5e7eb',
          muted: '#9ca3af'
        }
      }
    },
  },
  plugins: [],
}

