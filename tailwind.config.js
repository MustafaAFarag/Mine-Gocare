/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{html,ts}"],
  theme: {
    extend: {
      colors: {
        "hover-color": "#8446B0",
        "button-bg": "#412b9a",
        "special-gray": "#616161",
        "bg-color": "#fafaf2",
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
