import { defineConfig } from "astro/config";
import tailwind from '@astrojs/tailwind';

export default defineConfig({
  outDir: '../../dist/packages/astro-framework-circle',
  integrations: [tailwind()],
});
