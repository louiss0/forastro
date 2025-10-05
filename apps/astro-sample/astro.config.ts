import { defineConfig } from 'astro/config';
import { asciidocLoader } from '@forastro/asciidoc';

// https://docs.astro.build/en/reference/configuration-reference/
export default defineConfig({
<<<<<<<< HEAD:apps/mock-blog/astro.config.mjs
  site: 'https://example.com',
  integrations: [
    asciidocLoader({
      // Configure asciidoc loader options here
    })
  ],
========
  integrations: [],
>>>>>>>> origin/main:apps/astro-sample/astro.config.ts
});
