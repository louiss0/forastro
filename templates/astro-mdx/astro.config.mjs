import { defineConfig } from "astro/config";
import tailwind from "@astrojs/tailwind";
import mdx from "@astrojs/mdx";
import forRemarkHtmlDirectivesIntegration from "@forastro/remark-html-directives-integration";

// https://astro.build/config
export default defineConfig({
  integrations: [tailwind(), mdx({ extendMarkdownConfig: true }), forRemarkHtmlDirectivesIntegration()],
});
