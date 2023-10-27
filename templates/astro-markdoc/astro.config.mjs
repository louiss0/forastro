import { defineConfig } from "astro/config";
import markdoc from '@astrojs/markdoc';
import UnoCSS from 'unocss/astro';


export default defineConfig({
    integrations: [
        UnoCSS({ injectReset: true }),
        markdoc()
    ]
})
