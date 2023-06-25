import  { defineConfig } from "astro/config";
import markdoc from '@astrojs/markdoc';
import tailwind from '@astrojs/tailwind';


export default defineConfig({
    experimental:{
        assets: true,
    },
    integrations:[
        tailwind(),
        markdoc()
    ]
})
