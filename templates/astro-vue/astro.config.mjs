import { defineConfig } from "astro/config";
import tailwind from "@astrojs/tailwind";
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
    tailwind(),
    vue(),
  ],
});
