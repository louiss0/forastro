import { defineConfig } from 'tsup'

export default defineConfig((ctx) => ({
    entry: ['src/index.ts'],
    publicDir: "src/lib/components",
    splitting: false,
    format: ["cjs", "esm"],
    dts: true,
    minify: !ctx.watch,
    clean: !ctx.watch,
}))