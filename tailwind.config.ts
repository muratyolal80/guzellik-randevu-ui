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
        primary: '#C59F59',          // brand gold — backgrounds, borders, icons on dark
        'primary-hover': '#B48F4A',
        'primary-dark': '#8A6A2F',   // gold for TEXT on light surfaces (5.0:1 on white, WCAG AA)
        background: '#FAF8F5',
        surface: '#FFFFFF',
        'surface-alt': '#F5F2ED',
        border: '#E5E2DD',
        'text-main': '#141414',
        'text-secondary': '#666666',
        'text-muted': '#6F6F6F'      // was #999999 (2.9:1, unreadable small text)
      },
      textColor: {
        // `text-primary` follows its surface: dark gold on light, brand gold on dark
        // (see --text-primary in app/globals.css)
        primary: 'rgb(var(--text-primary) / <alpha-value>)',
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'system-ui', 'sans-serif'],
        display: ['Playfair Display', 'serif']
      },
      boxShadow: {
        soft: '0 4px 20px rgba(0,0,0,0.08)',
        card: '0 1px 2px rgba(20,20,20,0.04), 0 4px 16px rgba(20,20,20,0.06)',
        premium: '0 10px 40px -10px rgba(197,159,89,0.35)',
      }
    },
  },
  plugins: [],
};

export default config;
