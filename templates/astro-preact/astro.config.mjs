import { defineConfig } from 'astro/config';
import Icons from 'unplugin-icons/vite';
import preact from '@astrojs/preact';
import UnoCSS from 'unocss/astro';

// https://astro.build/config
export default defineConfig({
  integrations: [
    preact(),
    UnoCSS({ injectReset: true }),
    Icons({ compiler: 'jsx', jsx: 'preact' }),
  ],
});
