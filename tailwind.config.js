/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./resources//*.blade.php",
    "./resources//*.jsx",
    "./resources//*.js",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#0d9488',     // Teal
        'primary-dark': '#0f766e',
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}