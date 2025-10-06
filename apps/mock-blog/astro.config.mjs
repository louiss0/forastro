import { defineConfig } from 'astro/config';
import { asciidocLoader } from '@forastro/asciidoc';

// https://docs.astro.build/en/reference/configuration-reference/
export default defineConfig({
  site: 'https://example.com',
  integrations: [
    asciidocLoader({
      // Configure asciidoc loader options here
    })
  ],
});
