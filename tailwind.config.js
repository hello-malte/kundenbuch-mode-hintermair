/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        bg: '#FAF7F2',
        surface: '#FFFFFF',
        surface2: '#F2EDE3',
        gold: '#B8946A',
        ink: '#111111',
        muted: '#6E6A64',
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
