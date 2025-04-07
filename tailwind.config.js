/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{html,ts}"],
  theme: {
    extend: {
      colors: {
        "hover-color": "#a01a40",
      },
      maxWidth: {
        "8xl": "1400px", // Your custom max width
      },
      fontFamily: {
        sans: ["Montserrat", "sans-serif"], // Add Montserrat as the default font for 'sans'
      },
    },
  },
  plugins: [],
};
