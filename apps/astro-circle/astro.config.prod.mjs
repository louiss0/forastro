import { defineConfig } from "astro/config";

export default defineConfig({
    vite: {
        ssr: {
            noExternal: ["svgo"]
        }
    },
    integrations: [tailwind()],
})