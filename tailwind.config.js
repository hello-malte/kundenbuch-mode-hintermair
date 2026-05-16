/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        bg: '#FFFFFF',
        surface: '#FFFFFF',
        surface2: '#F4F4F4',
        brand: '#9C0E5D',
        'brand-hover': '#AB0F76',
        ink: '#111111',
        muted: '#6E6E6E',
        whatsapp: '#25D366'
      },
      fontFamily: {
        sans: [
          '-apple-system', 'BlinkMacSystemFont', '"SF Pro Text"', '"SF Pro Display"',
          'system-ui', 'Segoe UI', 'Roboto', 'sans-serif'
        ]
      },
      transitionTimingFunction: {
        smooth: 'cubic-bezier(0.2, 0.8, 0.2, 1)'
      }
    }
  },
  plugins: []
};
