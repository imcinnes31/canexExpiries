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
          '0%, 100%': { "background-color" : "#feb2b2" },
          '50%': { "background-color" : "#e53e3e;" },
        }
      },
      animation: {
        flash: 'flash 1s step-end infinite',
      }

    },
  },
  plugins: [],
}