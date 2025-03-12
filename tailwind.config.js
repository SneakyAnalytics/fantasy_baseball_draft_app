/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{vue,js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        mets: {
          blue: '#002D72',
          orange: '#FF5910',
          light: '#DFEBF6',
        },
        padres: {
          brown: '#2F241D',
          gold: '#FFC425',
          light: '#F5EEE9',
        }
      }
    },
  },
  plugins: [],
};
