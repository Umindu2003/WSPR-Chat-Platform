export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}'
  ],
  theme: {
    extend: {
      colors: {
        // Main backgrounds
        'dark-bg': '#0F1115',
        'dark-card': '#161A22',
        'dark-elevated': '#1E2430',
        'dark-border': '#2A3142',
        // Text colors
        'dark-text': '#E6E8EC',
        'dark-text-secondary': '#A6ADBB',
        'dark-text-muted': '#7A8294',
        // Accent colors
        'accent-primary': '#4F7CFF',
        'accent-hover': '#3A63E6',
        'accent-success': '#3DDC97',
        'accent-warning': '#F6C177',
        'accent-error': '#F7768E',
      },
      borderRadius: {
        '2xl': '12px',
        '3xl': '16px',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}