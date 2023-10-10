import  { defineConfig } from "astro/config";
import markdoc from '@astrojs/markdoc';
import tailwind from '@astrojs/tailwind';


export default defineConfig({
    integrations:[
        tailwind(),
        markdoc()
    ]
})
