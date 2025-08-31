import { defineConfig } from "astro/config";
import unocss from 'unocss/astro';
import icon from 'astro-icon';

export default defineConfig({
  integrations: [
    unocss({
      injectReset: false  // Handle reset manually to avoid package resolution issues
    }),
    icon()
  ],
});
