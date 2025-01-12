// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';

import markdoc from '@astrojs/markdoc';

// https://astro.build/config
export default defineConfig({
  outDir: "../../dist/apps/docs",
  site: "https://forastro-docs.onrender.com",
  integrations: [
    starlight({
      title: 'For Astro',
      social: {
        github: 'https://github.com/louiss0/forastro',
      },
    }),
    markdoc(),
  ],
});
