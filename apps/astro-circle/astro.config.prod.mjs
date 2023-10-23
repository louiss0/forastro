import { defineConfig } from "astro/config";
import tailwind from 'unocss/astro';

export default defineConfig({
    vite: {
        ssr: {
            noExternal: ["svgo"]
        }
    },
    integrations: [unocss()],
})