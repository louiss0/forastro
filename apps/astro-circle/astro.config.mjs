import { defineConfig } from 'astro/config';
import icon from 'astro-icon';

export default defineConfig({
  integrations: [icon()],
  vite: {
    // UnoCSS is configured via vite.config.ts
  },
});
