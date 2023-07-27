/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  safelist: [
    'hidden',
    'fixed',
    'translate-x-full',
    'translate-y-full',
    'opacity-0',
  ],
  plugins: [require('@tailwindcss/typography')],
};
