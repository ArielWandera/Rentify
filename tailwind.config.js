/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./resources/**/*.blade.php",
    "./resources/**/*.jsx",
    "./resources/**/*.js",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#FF385C',
        'primary-dark': '#E31C5F',
        'primary-light': '#FF5A5F',
        raisin: '#222222',
        'warm-gray': '#717171',
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        xl: '12px',
        '2xl': '16px',
        '3xl': '24px',
      },
      boxShadow: {
        card: '0 1px 2px rgba(0,0,0,0.08), 0 4px 12px rgba(0,0,0,0.05)',
        'card-hover': '0 2px 4px rgba(0,0,0,0.08), 0 8px 24px rgba(0,0,0,0.12)',
      },
    },
  },
  plugins: [],
}