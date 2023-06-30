import { defineConfig } from 'tsup'

export default defineConfig((ctx) => ({
  entry: ['src/index.ts'],
  splitting: false,
  format: "esm",
  dts: true,
  minify: !ctx.watch,
  clean: !ctx.watch,
}))