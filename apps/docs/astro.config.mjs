// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import { withStarlightAsciidoc } from '@forastro/starlight-asciidoc';

// https://astro.build/config
export default defineConfig(
  withStarlightAsciidoc({
    site: "https://forastro-docs.onrender.com",
    integrations: [
      starlight({
        title: 'For Astro',
        social: {
          github: 'https://github.com/louiss0/forastro',
        },
      }),
    ],
  })
);
