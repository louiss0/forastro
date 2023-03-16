import { defineConfig } from "astro/config";
import tailwind from "@astrojs/tailwind";
import mdx from "@astrojs/mdx";

export default defineConfig({
  outDir: "../dist/demo",
  integrations: [tailwind(), mdx({})],
});
