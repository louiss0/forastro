import { defineConfig } from 'astro/config';
import Icons from 'unplugin-icons/vite'
import preact from "@astrojs/preact";
import tailwind from "@astrojs/tailwind";

// https://astro.build/config
export default defineConfig({
  experimental: {
    assets:true
  },
  integrations: [
    preact(),
    tailwind(),
    Icons({ compiler: 'jsx', jsx: 'preact' })
  ]
});