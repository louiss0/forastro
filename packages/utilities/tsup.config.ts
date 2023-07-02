import { defineConfig } from 'tsup'

export default defineConfig((ctx) => ({
  entry: [
    'src/lib/index.ts',
  ],
  format: "esm",
  publicDir: true,
  dts: true,
  minify: !ctx.watch,
  clean: !ctx.watch,
}))