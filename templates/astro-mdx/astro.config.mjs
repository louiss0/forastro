import { defineConfig } from "astro/config";
import tailwind from "@astrojs/tailwind";
import remarkHTMLDirectivesIntegration from "@forastro/remark-html-directives-integration";

export default defineConfig({
  integrations: [tailwind(), remarkHTMLDirectivesIntegration()],
});
