import { defineConfig } from 'astro/config';
import { asciidocLoader } from '@forastro/asciidoc';

// https://astro.build/config
export default defineConfig({
  // Static site generation (default)
  output: 'static',

  // Configure integrations
  integrations: [
    asciidocLoader()
  ],

  // Configure Vite
  vite: {
    // Vite configuration options
  },
});
