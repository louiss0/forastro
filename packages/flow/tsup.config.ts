import { defineConfig } from 'tsup'

export default defineConfig((ctx) => ({
  entry:["src"],
  publicDir: true,
  format: "esm",
  minify: !ctx.watch,
  clean: !ctx.watch,
}))