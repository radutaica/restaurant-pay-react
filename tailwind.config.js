/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          green: '#167445',
          greenDark: '#0f5a33',
          greenLight: '#1a8f57',
        },
        text: {
          dark: '#333333',
          light: '#6c757d',
          lighter: '#9ca3af',
        },
        background: {
          light: '#f8f9fa',
          white: '#ffffff',
          offWhite: '#fafbfc',
        },
        border: {
          light: '#e5e7eb',
          medium: '#d1d5db',
        },
      },
      boxShadow: {
        'card': '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
      },
    },
  },
  plugins: [],
}

