/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: {
          DEFAULT: '#172B3A',
          hover: '#0F1E29',
          light: 'rgba(23, 43, 58, 0.75)',
          muted: 'rgba(23, 43, 58, 0.55)',
          faint: 'rgba(23, 43, 58, 0.12)',
          ghost: 'rgba(23, 43, 58, 0.05)',
        },
        paper: {
          DEFAULT: '#F5F1E8',
          light: '#FAF8F4',
          dark: '#EAE4D5',
          border: 'rgba(23, 43, 58, 0.15)',
        }
      },
      fontFamily: {
        sans: ['Inter', 'Manrope', 'system-ui', 'sans-serif'],
        display: ['Manrope', 'Inter', 'sans-serif']
      },
      borderRadius: {
        'sm': '6px',
        'DEFAULT': '8px',
        'md': '8px',
        'lg': '10px',
        'xl': '12px',
        '2xl': '12px',
      }
    }
  },
  plugins: []
};
