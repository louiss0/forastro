import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import { fileURLToPath } from 'node:url';
// https://astro.build/config
export default defineConfig({
  outDir: '../../dist/apps/asciidoc-loader-mock',
  experimental: {
    contentLayer: true,
    contentIntellisense: true,
  },
  integrations: [
    tailwind({
      configFile: fileURLToPath(
        new URL('./tailwind.config.cjs', import.meta.url),
      ),
    }),
  ],
});
