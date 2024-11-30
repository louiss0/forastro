import { defineConfig } from 'tsup'

export default defineConfig({
    entry: ['packages/utilities/src/index.ts'],
    publicDir: "packages/utilities/public",
    outDir: "dist/packages/utilities",
    splitting: false,
    dts: true,
    external: [
        "astro:content"
    ],
    format: "esm",
    clean: true,
    minify: true
})