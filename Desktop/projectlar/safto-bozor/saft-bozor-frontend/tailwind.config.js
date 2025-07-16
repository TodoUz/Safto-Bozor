/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}", # React komponentlari va HTML fayllari
  ],
  theme: {
    extend: {
      colors: {
        'primary-blue': '#007bff',
        'light-bg': '#f8f9fa',
        'dark-bg': '#1a202c',
        'light-text': '#f8f9fa',
        'dark-text': '#1a202c',
        'card-bg-light': '#ffffff',
        'card-bg-dark': '#2d3748',
        'sidebar-dark-bg': '#20232a',
        'sidebar-dark-text': '#f8f9fa',
        'sidebar-dark-hover': '#007bff',
      },
      fontFamily: {
        inter: ['Inter', 'sans-serif'], # Google Fonts dan Inter shriftini qo'shish
      },
    },
  },
  plugins: [],
}
