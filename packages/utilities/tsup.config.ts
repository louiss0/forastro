import { defineConfig } from 'tsup'

export default defineConfig((ctx) => ({
  entry: ['src/index.ts'],
  format: "esm",
  publicDir: "src/components",
  dts: true,
  minify: !ctx.watch,
  clean: !ctx.watch,
}))