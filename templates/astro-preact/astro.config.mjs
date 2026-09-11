import { defineConfig } from 'astro/config';
import Icons from 'unplugin-icons/vite';
import preact from '@astrojs/preact';

// https://astro.build/config
export default defineConfig({
  integrations: [preact(), Icons({ compiler: 'jsx', jsx: 'preact' })],
  vite: {
    // UnoCSS is configured via vite.config.ts
  },
});
