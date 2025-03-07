/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {

      keyframes: {
        flash: {
          '0%, 100%': { "background-color" : "#feb2b2", "color":"black" },
          '50%': { "background-color" : "#e53e3e;", "color":"white" },
        },
        hide: {
          '0%': {
            'opacity': '1',
            'height': '100%',
          },
          '50%': {
            'opacity': '0',
            'height': '100%',
          },
          '100%': {
            'opacity': '0',
            'max-height': '0',
            'display': 'none',
          }
      }
      },
      animation: {
        flash: 'flash 1s step-end infinite',
        hide: 'hide ease-in-out 2s forwards'
      }

    },
  },
  plugins: [],
}