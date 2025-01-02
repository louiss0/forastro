import { defineConfig } from 'astro/config';

import UnoCSS from 'unocss/astro';

// https://astro.build/config
export default defineConfig({
  outDir: '../../dist/apps/asciidoc-loader-mock',
  integrations: [
    UnoCSS({
      injectReset: true,
    }),
  ],
});
