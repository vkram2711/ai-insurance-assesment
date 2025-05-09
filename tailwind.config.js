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
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'scale(0.98)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        slideIn: {
          '0%': { transform: 'translateY(20px) scale(0.98)', opacity: '0' },
          '100%': { transform: 'translateY(0) scale(1)', opacity: '1' },
        },
        slideOut: {
          '0%': { transform: 'translateY(0) scale(1)', opacity: '1' },
          '100%': { transform: 'translateY(-20px) scale(0.98)', opacity: '0' },
        },
        reposition: {
          '0%': { transform: 'translateY(0)' },
          '100%': { transform: 'translateY(0)' },
        }
      },
      animation: {
        fadeIn: 'fadeIn 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
        slideIn: 'slideIn 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
        slideOut: 'slideOut 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
        reposition: 'reposition 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
      },
    },
  },
  plugins: [],
} 