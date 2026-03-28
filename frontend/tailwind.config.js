/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        bg:     '#0b0c10',
        bg1:    '#111318',
        bg2:    '#161920',
        bg3:    '#1c2028',
        line:   '#252932',
        line2:  '#2e3440',
        amber:  '#f0a500',
        amber2: '#ffc84a',
        mo:     '#3ecfb2',
        mat:    '#6c8fff',
        danger: '#ff6b6b',
        ok:     '#4cde8a',
        tx:     '#e2e6f0',
        tx2:    '#8892a4',
        tx3:    '#4a5166',
      },
      fontFamily: {
        condensed: ['"Barlow Condensed"', 'sans-serif'],
        mono:      ['"IBM Plex Mono"', 'monospace'],
        sans:      ['Barlow', 'sans-serif'],
      },
      animation: {
        'slide-in': 'slideIn .2s ease',
        'fade-in':  'fadeIn .15s ease',
      },
      keyframes: {
        slideIn: { from: { opacity: '0', transform: 'translateY(-6px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
        fadeIn:  { from: { opacity: '0' }, to: { opacity: '1' } },
      },
    },
  },
  plugins: [],
}
