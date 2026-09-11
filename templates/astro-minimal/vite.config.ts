import { defineConfig } from 'vite';
import UnoCSS from 'unocss/vite';

export default defineConfig({
  plugins: [
    UnoCSS({
      // Use Vite plugin directly to avoid Astro integration issues with rolldown
      configFile: './uno.config.ts',
    }),
  ],
});
