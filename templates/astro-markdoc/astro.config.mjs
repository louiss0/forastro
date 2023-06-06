import { defineConfig } from "astro/config";
// https://astro.build/config

// https://astro.build/config
import tailwind from "@astrojs/tailwind";
import markdoc from "@astrojs/markdoc";

// https://astro.build/config

export default defineConfig({
  experimental: {
    assets: true,
  },
  integrations: [tailwind(), markdoc()],
});
