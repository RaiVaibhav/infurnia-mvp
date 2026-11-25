/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cad: {
          bg: '#181a1f',
          surface: '#21252b',
          border: '#2c313a',
          accent: '#3b82f6',
          active: '#2563eb',
          text: '#abb2bf',
          textBright: '#e5e9f0',
        }
      }
    },
  },
  plugins: [],
}
