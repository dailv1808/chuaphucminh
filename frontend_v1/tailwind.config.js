module.exports = {
  darkMode: 'class',
  content: [
    "./index.html",
    "./pending.html",
    "./approved.html",
    "./partials/**/*.html",
    "./src/**/*.{js,css}"
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      transitionProperty: {
        'height': 'height',
        'spacing': 'margin, padding',
      },
      keyframes: {
        'collapse': {
          '0%': { height: 'var(--radix-collapsible-content-height)' },
          '100%': { height: '0' },
        },
        'expand': {
          '0%': { height: '0' },
          '100%': { height: 'var(--radix-collapsible-content-height)' },
        }
      },
      animation: {
        'collapse': 'collapse 0.2s ease-out',
        'expand': 'expand 0.2s ease-out',
      }
    },
  },
  plugins: [],
}
