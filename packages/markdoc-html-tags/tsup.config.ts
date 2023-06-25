import { defineConfig } from 'tsup'

export default defineConfig((ctx) => ({
  entry: ['src/index.ts'],
  splitting: false,
  format: !ctx.watch ? ["cjs", "esm"] : "esm",
  dts: true,
  minify: !ctx.watch,
  clean: !ctx.watch,
}))