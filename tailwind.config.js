const theme = require('tailwindcss')

module.exports = {
  ...require('@ellreka/configs/tailwind.config.js'),
  purge: ['./src/popup.tsx'],
  theme: {
    extend: {
      colors: {
        black: '#333'
      }
    }
  },
  variants: {
    extend: {}
  },
  plugins: [require('daisyui')],
  daisyui: {
    themes: ['night']
  }
}
