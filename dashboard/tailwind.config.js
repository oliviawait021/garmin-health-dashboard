/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      fontFamily: {
        mono: ['JetBrains Mono', 'Fira Code', 'ui-monospace', 'monospace'],
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      colors: {
        surface: {
          DEFAULT: '#0f1117',
          card:    '#1a1d27',
          border:  '#2a2d3a',
        },
        accent: {
          green:  '#22c55e',
          yellow: '#eab308',
          red:    '#ef4444',
          blue:   '#3b82f6',
          purple: '#a855f7',
        },
      },
    },
  },
  plugins: [],
};
