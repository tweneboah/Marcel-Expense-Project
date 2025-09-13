/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}", "./public/index.html"],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#FCA311",
          50: "#FFF5E6",
          100: "#FEEBCC",
          200: "#FED699",
          300: "#FDC266",
          400: "#FCAD33",
          500: "#FCA311",
          600: "#D88901",
          700: "#A66900",
          800: "#744900",
          900: "#422900",
        },
        secondary: {
          DEFAULT: "#14213D",
          50: "#E6EBF2",
          100: "#CCD6E6",
          200: "#99ADCC",
          300: "#6684B3",
          400: "#335B99",
          500: "#14213D",
          600: "#111C33",
          700: "#0D1628",
          800: "#090F1C",
          900: "#050911",
        },
      },
      fontFamily: {
        sans: ["Inter", "sans-serif"],
      },
      boxShadow: {
        card: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
      },
    },
  },
  plugins: [],
};
