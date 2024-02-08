/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
 
    // Or if using `src` directory:
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    colors: {
      transparent: 'transparent',
      current: 'currentColor',
      'primary': '#B33C86', //Fandango
      'secondary': '#EFC7C2', //Tea rose (red)
      'third': '#FFE5D4',//Champange pink
      'forth': '#66666E',//Dim gray
      'fifth': '#000000',//Black
    },
    extend: {},
  },
  plugins: [],
}