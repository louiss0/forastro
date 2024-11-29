import { defineConfig } from 'tsup'

export default defineConfig((ctx) => ({
    entry: ['packages/asciidoc/src/index.ts'],
    publicDir: true,
    splitting: false,
    format: "esm",
    dts: true,
    outDir: "dist/packages/asciidoc",
    async onSuccess() {

    },
    minify: !ctx.watch,
    clean: true,
}))