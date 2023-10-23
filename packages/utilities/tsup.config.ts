import { defineConfig } from 'tsup'

export default defineConfig((ctx) => ({
    entry: ['src/index.ts'],
    publicDir: true,
    splitting: false,
    external: [
        "astro:content"
    ],
    format: "esm",
    dts: true,
    minify: !ctx.watch,
    clean: true,
}))