/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'media', // Enable dark mode based on system preferences
  theme: {
    extend: {
      colors: {
        // You can add custom colors here if needed
      },
    },
  },
  plugins: [],
} 