import { defineConfig } from 'astro/config';
import unocss from 'unocss/astro';

export default defineConfig({
  vite: {
    ssr: {
      noExternal: ['svgo'],
    },
  },
  integrations: [unocss()],
});
