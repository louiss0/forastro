import { defineConfig } from 'astro/config';
import StarlightIntegration from '@astrojs/starlight';
// https://astro.build/config
export default defineConfig({
  outDir: '../../dist/apps/docs',
  integrations: [
    StarlightIntegration({
      title: 'For Astro',
    }),
  ],
});
