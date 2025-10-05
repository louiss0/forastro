import { defineConfig } from 'astro/config';
import { asciidocLoader } from '@forastro/asciidoc';

// https://astro.build/config
export default defineConfig({
  // Site URL for canonical URLs and RSS feeds
  site: 'https://forastro-blog.example.com',
  
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
