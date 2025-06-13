/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{ts,tsx}", // App Router
    "./pages/**/*.{ts,tsx}", // Optional if Pages Router
    "./components/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}", // if using /src
  ],
  theme: {
    extend: {},
  },
  plugins: [require("tailwindcss-animate")],
};
