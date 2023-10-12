import { defineConfig } from "astro/config";
import UnoCSS from 'unocss/astro'
import Icons from 'unplugin-icons/vite'
import IconsResolver from 'unplugin-icons/resolver';
import VueComponents from 'unplugin-vue-components/vite'
import vue from "@astrojs/vue";

// https://astro.build/config
export default defineConfig({
  vite: {
    plugins: [
      Icons(),
      VueComponents({
        resolvers: [
          IconsResolver()
        ]
      })
    ],
  },
  integrations: [
    UnoCSS({ injectReset: true }),
    vue(),
  ],
});
