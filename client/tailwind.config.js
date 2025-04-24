/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {

    extend: {
      screens: {
        print: { raw: 'print' },
        screen: { raw: 'screen' },
      },  

      keyframes: {
        flash: {
          '0%, 100%': { "background-color" : "#feb2b2", "color":"black" },
          '50%': { "background-color" : "#e53e3e;", "color":"white" },
        },
        load: {
          '0%': { "clip-path": "inset(0% 83% 0% 0%)" },
          '20%': { "clip-path": "inset(0% 65% 0% 0%)" },
          '40%': { "clip-path": "inset(0% 43% 0% 0%)" },
          '60%': { "clip-path": "inset(0% 26% 0% 0%)" },
          '80%': { "clip-path": "inset(0% 0% 0% 0%)" },
          '100%': { "clip-path": "inset(0% 0% 0% 0%)" },
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
            'max-height': '0%',
            'display': 'none',
            'line-height': '0'
          }
        },
        confirmHide: {
          '0%': {
            'opacity': '1',
            'height': '100%',
          },
          '50%': {
            'opacity': '0',
            'max-height': '0%',
            'display': 'none',
            'line-height': '0'
          },
          '100%': {
            'opacity': '0',
            'max-height': '0%',
            'display': 'none',
            'line-height': '0'
          },
        },
        confirmShow: {
          '0%': {
            'height': '0%',
          },
          '100%': {
            'height': '100%',
          },
        },
        horizontalShow: {
          '0%': {
            'opacity': '0',
            'width': '0%',
            'display': 'none',
            'line-width': '0',
            'padding-inline': '0px',
          },
          '100%': {
            'opacity': '1',
            'width': '50%',
            'padding-inline': '4px',
          }       
        },
        horizontalHide: {
          '0%': {
            'background-color': 'rgb(74,222,128)',
          },
          '100%': {
            'background-color': 'rgb(165, 214, 167)',
          }       
        },
      },
      animation: {
        flash: 'flash 1s step-end infinite',
        hide: 'hide ease-in-out 1s forwards',
        load: 'load step-end 3s infinite',
        confirmHide: 'confirmHide ease-in-out 1s forwards',
        confirmShow: 'confirmShow ease-in-out 1s forwards',
        horizontalShow: 'horizontalShow ease-in-out 0.5s forwards',
        horizontalHide: 'horizontalHide ease-in-out 0.5s forwards',
      }

    },
  },
  plugins: [],
}