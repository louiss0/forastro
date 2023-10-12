import { defineConfig } from "astro/config";
// https://astro.build/config
import UnoCSS from 'unocss/astro'


export default defineConfig({
  integrations: [UnoCSS({ injectReset: true }),],
});
