/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          bg: "#FFFAF3",
          primary: "#A8C7F0",
          secondary: "#D8C9FF",
          text: "#382A3A",
        }
      }
    },
  },
  plugins: [],
};
