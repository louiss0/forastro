import { defineConfig } from "astro/config";
import markdoc from '@astrojs/markdoc';
import uno from '@astrojs/uno';


export default defineConfig({
    integrations: [
        UnoCSS({ injectReset: true }),
        markdoc()
    ]
})
