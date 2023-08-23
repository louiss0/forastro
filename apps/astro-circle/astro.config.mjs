import { defineConfig } from "astro/config";
import tailwind from '@astrojs/tailwind';

export default defineConfig({
  vite: {
    ssr: {
      noExternal: ["svgo",]
    }
  },
  integrations: [tailwind()],
});
