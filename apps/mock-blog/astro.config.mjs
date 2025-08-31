// @ts-check
import { defineConfig } from 'astro/config';
import { asciidocLoader } from '@forastro/asciidoc';

// https://astro.build/config
export default defineConfig({
  site: 'https://example.com',
  experimental: {
    contentLayer: true,
  },
  integrations: [
    asciidocLoader({
      // Configure asciidoc loader options here
    })
  ],
});
