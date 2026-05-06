/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bianchi: {
          red: '#E11D2B',   // Rojo de tu logo
          blue: '#203476',  // Azul de tu logo
        }
      }
    },
  },
  plugins: [],
}