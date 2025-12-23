/** @type {import('tailwindcss').Config} */
const config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./context/**/*.{js,ts,jsx,tsx,mdx}",
    "./hooks/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#C59F59',
        'primary-hover': '#B48F4A',
        background: '#FAF8F5',
        surface: '#FFFFFF',
        'surface-alt': '#F5F2ED',
        border: '#E5E2DD',
        'text-main': '#141414',
        'text-secondary': '#666666',
        'text-muted': '#999999'
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'system-ui', 'sans-serif'],
        display: ['Playfair Display', 'serif']
      },
      boxShadow: {
        soft: '0 4px 20px rgba(0,0,0,0.08)',
      }
    },
  },
  plugins: [],
};

export default config;

