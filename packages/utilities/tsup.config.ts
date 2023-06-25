import { defineConfig } from 'tsup'

export default defineConfig((ctx) => ({
  entry: [
    'src',
  ],
  
  format: "esm",
  publicDir: true,
  dts: true,
  minify: !ctx.watch,
  clean: !ctx.watch,
}))