import { defineConfig } from "astro/config";
import tailwind from "@astrojs/tailwind";
import mdx from "@astrojs/mdx";
import remarkDirective from 'remark-directive';
import remarkHtmlDirectives from 'remark-html-directives';
export default defineConfig({
  outDir: "../dist/demo",
  integrations: [tailwind(), mdx({
    remarkPlugins: [
      remarkDirective,
      remarkHtmlDirectives
    ]
  })],
});
