// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';

import markdoc from '@astrojs/markdoc';

// https://astro.build/config
export default defineConfig({
  image: {
    service: { entrypoint: 'astro/assets/services/noop' },
  },
  site: "https://forastro-docs.onrender.com",
  integrations: [
    starlight({
      title: 'For Astro',
      social: [
        {
          icon: 'github',
          label: 'GitHub',
          href: 'https://github.com/louiss0/forastro'
        }
      ],
    }),
    markdoc(),
  ],
});
