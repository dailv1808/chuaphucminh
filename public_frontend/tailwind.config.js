module.exports = {
  content: [
    "./*.html",
    "./partials/**/*.html",
    "./src/**/*.{js,css}"
  ],
  theme: {
    extend: {
      colors: {
        amber: {
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706',
          700: '#b45309',
        }
      },
      fontFamily: {
        sans: ['Alegreya', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
