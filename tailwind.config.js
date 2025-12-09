/** @type {import('tailwindcss').Config} */
module.exports = {
  // Importante: aponta para a pasta app e components
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        border: "hsl(var(--border))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        // Replicando seu tema Gold/Deep do globals.css
        gold: {
          400: '#D4AF37', // Ajuste conforme seu hex exato
          500: '#C5A028',
        },
        deep: {
          800: '#1A1A1A', // Ajuste conforme seu hex exato
          900: '#0F0F0F',
        }
      },
      fontFamily: {
        sans: ['Geist-Regular'],
        serif: ['Geist-Bold'], // Ou sua fonte serifada
        display: ['Geist-Bold'],
      }
    },
  },
  plugins: [],
}